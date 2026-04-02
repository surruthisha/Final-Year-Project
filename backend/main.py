"""
MindScape NCPT Inference Backend
================================
FastAPI server that loads the 3 ML models (GATv2, LightGBM, Meta-learner)
and exposes endpoints for the React game frontend to get cognitive predictions.
"""

import os
import pickle
import warnings
from datetime import datetime
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from torch_geometric.nn import GATv2Conv

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
EXTRAS_DIR = Path(__file__).resolve().parent.parent / "extras"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── GATv2 Architecture (must match training exactly) ──────────────────────────
class NCPTGATv2(nn.Module):
    def __init__(self, in_ch, hidden=64, out_ch=4, heads=4, dropout=0.3):
        super().__init__()
        self.dropout = dropout
        self.input_proj = nn.Linear(in_ch, hidden)
        self.conv1 = GATv2Conv(hidden, hidden, heads=heads,
                               dropout=dropout, edge_dim=1, concat=True)
        self.conv2 = GATv2Conv(hidden * heads, hidden, heads=heads,
                               dropout=dropout, edge_dim=1, concat=True)
        self.conv3 = GATv2Conv(hidden * heads, hidden, heads=1,
                               dropout=dropout, edge_dim=1, concat=False)
        self.bn1 = nn.BatchNorm1d(hidden * heads)
        self.bn2 = nn.BatchNorm1d(hidden * heads)
        self.bn3 = nn.BatchNorm1d(hidden)
        self.res_proj = nn.Linear(hidden, hidden)
        self.classifier = nn.Sequential(
            nn.Linear(hidden, hidden // 2),
            nn.ELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden // 2, out_ch),
        )

    def forward(self, x, edge_index, edge_weight):
        ea = edge_weight.unsqueeze(-1)
        x = F.elu(self.input_proj(x))
        x = F.dropout(x, p=self.dropout, training=self.training)
        x1 = self.conv1(x, edge_index, edge_attr=ea)
        x1 = self.bn1(x1)
        x1 = F.elu(x1)
        x1 = F.dropout(x1, p=self.dropout, training=self.training)
        x2 = self.conv2(x1, edge_index, edge_attr=ea)
        x2 = self.bn2(x2)
        x2 = F.elu(x2)
        x2 = F.dropout(x2, p=self.dropout, training=self.training)
        x3 = self.conv3(x2, edge_index, edge_attr=ea)
        x3 = self.bn3(x3)
        res = self.res_proj(x)
        emb = F.elu(x3 + res)
        out = self.classifier(emb)
        return out, emb


# ── Global model holders ──────────────────────────────────────────────────────
gat_model = None
lgbm_model = None
imputer = None
scaler = None
meta_learner = None
NCPT_FEATURES = None
NCPT_NORMS = None

CLASS_INFO = {
    0: ("High performance", "Low", "Excellent - no concerns"),
    1: ("Average performance", "Low", "Normal range - continue monitoring"),
    2: ("Below average", "Moderate", "Some concern - follow up in 4-8 weeks"),
    3: ("Low / At-risk", "High", "Clinical assessment recommended"),
}

NORMS_LOOKUP = {
    "digit_symbol_coding":  {"mean": 52.51, "std": 10.30, "lower_better": False},
    "trail_making_A":       {"mean": 19.80, "std": 6.39,  "lower_better": True},
    "trail_making_B":       {"mean": 33.45, "std": 12.96, "lower_better": True},
    "forward_memory_span":  {"mean": 10.55, "std": 2.49,  "lower_better": False},
    "reverse_memory_span":  {"mean":  9.05, "std": 2.49,  "lower_better": False},
    "progressive_matrices": {"mean": 10.95, "std": 3.27,  "lower_better": False},
}


def load_models():
    global gat_model, lgbm_model, imputer, scaler, meta_learner
    global NCPT_FEATURES, NCPT_NORMS

    # 1. GATv2
    gat_model = NCPTGATv2(in_ch=7).to(DEVICE)
    gat_path = EXTRAS_DIR / "ncpt_gatv2.pt"
    gat_state = torch.load(str(gat_path), map_location=DEVICE, weights_only=True)
    gat_model.load_state_dict(gat_state)
    gat_model.eval()
    n_params = sum(p.numel() for p in gat_model.parameters())
    print(f"  GATv2 loaded — {n_params:,} parameters")

    # 2. LightGBM bundle
    with open(EXTRAS_DIR / "ncpt_lgbm.pkl", "rb") as f:
        lgbm_bundle = pickle.load(f)
    lgbm_model = lgbm_bundle["model"]
    imputer = lgbm_bundle["imputer"]
    scaler = lgbm_bundle["scaler"]
    NCPT_FEATURES = lgbm_bundle["features"]
    NCPT_NORMS = lgbm_bundle["norms"]
    print(f"  LightGBM loaded — best iteration: {lgbm_model.best_iteration}")

    # 3. Meta-learner
    with open(EXTRAS_DIR / "ncpt_meta_learner.pkl", "rb") as f:
        meta_learner = pickle.load(f)
    print(f"  Meta-learner loaded — {type(meta_learner).__name__}")


# ── Pydantic schemas ─────────────────────────────────────────────────────────

class GameScores(BaseModel):
    """Simplified game scores for quick prediction."""
    cloudport_items_per_sec: float = Field(..., description="Items caught per second in Cloudport")
    starbridge_A_time: float = Field(..., description="Seconds to complete Star Bridge part A")
    starbridge_B_time: float = Field(..., description="Seconds to complete Star Bridge part B")
    echobay_max_span: int = Field(..., description="Max sequence length recalled in Echo Bay")
    card_efficiency: float = Field(..., ge=0, le=1, description="Pairs matched / total attempts (0-1)")
    heartisle_correct: int = Field(..., description="Correct pattern matches in Heart Isle")
    gender: int = Field(0, ge=0, le=1, description="0=male, 1=female")


class GameSession(BaseModel):
    """Full game session data for detailed clinical report."""
    player_id: str = "UNKNOWN"
    player_age: int = 0
    player_gender: str = "Unknown"
    assessment_date: str = ""

    # Cloudport (Processing Speed)
    cloudport_items_caught: int = 0
    cloudport_total_items: int = 40
    cloudport_duration_s: float = 60
    cloudport_misses: int = 0
    cloudport_reaction_times: list[float] = []

    # Star Bridge (Visual Attention + Cognitive Flexibility)
    starbridge_A_time_s: float = 25
    starbridge_A_errors: int = 0
    starbridge_B_time_s: float = 45
    starbridge_B_errors: int = 0

    # Echo Bay (Short-term Memory)
    echobay_max_span: int = 6
    echobay_total_attempts: int = 0
    echobay_first_error_pos: int = 0
    echobay_recall_accuracy: float = 0.0

    # Hidden Reef / Memory Card (Working Memory)
    card_pairs_on_board: int = 8
    card_pairs_matched: int = 0
    card_total_attempts: int = 0
    card_consecutive_max: int = 0
    card_revisit_count: int = 0

    # Heart Isle (Fluid Reasoning)
    heartisle_correct: int = 0
    heartisle_total: int = 12
    heartisle_avg_time_s: float = 10.0


class FrontendGameStats(BaseModel):
    """
    Matches the GameStats shape from the React frontend's GameContext.
    This is what the frontend actually sends.
    Set is_child=True to activate the Pediatric Calibration Layer.
    """
    player_id: str = "UNKNOWN"
    player_age: int = 0
    player_gender: str = "Unknown"

    # Mode flag
    is_child: bool = False

    # Cloudport stats from frontend
    cloudport_totalTime: float = 60
    cloudport_avgReactionTime: float = 400
    cloudport_catches: int = 0
    cloudport_misses: int = 0

    # Star Bridge stats from frontend
    starBridge_totalTime: float = 45
    starBridge_errors: int = 0
    starBridge_completed: bool = False

    # Hidden Reef stats from frontend
    hiddenReef_totalMoves: int = 0
    hiddenReef_totalPairs: int = 8
    hiddenReef_efficiency: float = 0.5
    hiddenReef_roundsCompleted: int = 0

    # Echo Bay stats from frontend
    echoBay_maxSequence: int = 0
    echoBay_totalRounds: int = 0
    echoBay_perfectRounds: int = 0

    # Child-mode explicit fields (sent by frontend when is_child=True)
    # These map directly to the pediatric calibration inputs.
    starbridge_time: float = 0.0   # raw total Star Bridge time (seconds)
    echobay_span: int = 0          # raw max span recalled
    card_patterns: int = 0         # number of card patterns matched


# ── Inference functions ───────────────────────────────────────────────────────

def predict_from_game(game_scores: dict, is_child: bool = False) -> dict:
    """Convert game scores -> NCPT features -> LightGBM prediction.

    Parameters
    ----------
    game_scores : dict
        Adult mode  — keys: cloudport_items_per_sec, starbridge_A_time,
                            starbridge_B_time, echobay_max_span,
                            card_efficiency, heartisle_correct, gender
        Child mode  — keys: cloudport_catches, starbridge_time,
                            echobay_span, card_patterns, gender
    is_child : bool
        When True the Pediatric Calibration Layer rescales raw game
        metrics to the NCPT adult normative range before inference.
        Calibration references:
          Van der Elst (2012)  — processing speed 1.35× multiplier
          Tombaugh (2004)      — trail making 0.49 calibration factor
          Gathercole (2004)    — forward memory span mapping
          Logie & Pearson (1997) — visual span mapping
    """
    if is_child:
        # ── Pediatric Calibration Layer ─────────────────────────────────
        # Processing Speed: 1.35× speed multiplier (Van der Elst 2012)
        # Maps [0-10 catches] → NCPT digit-symbol [20-80]
        catches = float(game_scores.get("cloudport_catches", 0))
        dsc = 20 + ((catches / 10) * 1.35 * 44.4)
        dsc = float(np.clip(dsc, 20, 80))

        # Executive Switching: 0.49 calibration factor (Tombaugh 2004)
        # Child mean ~65 s → adult mean ~32 s
        raw_time = float(game_scores.get("starbridge_time", 70))
        tm_b = float(np.clip(raw_time * 0.49, 15, 150))
        tm_a = tm_b * 0.5

        # Forward Memory Span: maps [1-5 child span] → [4-14] (Gathercole 2004)
        span = float(game_scores.get("echobay_span", 0))
        fms = float(np.clip(4 + (span / 5) * 10, 4, 14))

        # Visual / Reverse Span: maps [1-5 patterns] → [5-16] (Logie & Pearson 1997)
        patterns = float(game_scores.get("card_patterns", 0))
        rms = float(np.clip(5 + (patterns / 5) * 11, 5, 16))

        # Fluid Reasoning: neutral median imputation for Heart Isle
        pm = 8.0
    else:
        # ── Adult mapping (unchanged) ────────────────────────────────────
        dsc = float(np.clip(game_scores.get("cloudport_items_per_sec", 0.5) * 60, 10, 80))
        tm_a = float(game_scores.get("starbridge_A_time", 25))
        tm_b = float(game_scores.get("starbridge_B_time", 45))
        fms = float(game_scores.get("echobay_max_span", 6))
        rms = float(5 + game_scores.get("card_efficiency", 0.5) * 11)
        pm = float(game_scores.get("heartisle_correct", 6))

    gen = float(game_scores.get("gender", 0))

    raw_features = {
        "digit_symbol_coding": dsc,
        "trail_making_A": tm_a,
        "trail_making_B": tm_b,
        "forward_memory_span": fms,
        "reverse_memory_span": rms,
        "progressive_matrices": pm,
        "gender": gen,
    }

    zscores = {}
    for feat, val in raw_features.items():
        if feat == "gender":
            continue
        norm = NCPT_NORMS[feat]
        z = (val - norm["mean"]) / norm["std"]
        if "trail" in feat:
            z = -z
        zscores[feat] = float(np.clip(z, -4, 4))

    fvec = np.array(
        [raw_features[f] for f in NCPT_FEATURES], dtype=np.float32
    ).reshape(1, -1)
    # Skip imputer — we always provide complete data (no NaN).
    # The pickled imputer may have sklearn version mismatches.
    try:
        fvec_imp = imputer.transform(fvec)
    except AttributeError:
        fvec_imp = fvec
    probs = lgbm_model.predict(fvec_imp)[0]
    pred_cls = int(probs.argmax())

    label, risk, rec = CLASS_INFO[pred_cls]
    mean_z = float(np.mean(list(zscores.values())))

    return {
        "predicted_class": pred_cls,
        "performance_label": label,
        "risk_band": risk,
        "recommendation": rec,
        "confidence": float(probs.max()),
        "mean_z_score": mean_z,
        "probabilities": {
            "High": float(probs[0]),
            "Average": float(probs[1]),
            "Below avg": float(probs[2]),
            "At-risk": float(probs[3]),
        },
        "zscores": zscores,
        "raw_features": raw_features,
    }


def frontend_stats_to_game_scores(stats: FrontendGameStats) -> tuple[dict, bool]:
    """Map the React frontend's GameStats to the model's expected input format.

    Returns
    -------
    (game_scores dict, is_child bool)
    """
    gender = 0 if stats.player_gender.lower().startswith("m") else 1

    if stats.is_child:
        # Child mode — pass raw game metrics; pediatric calibration
        # happens inside predict_from_game when is_child=True.
        # starbridge_time: use explicit field if provided, else derive from totalTime.
        star_total = stats.starBridge_totalTime / 1000 if stats.starBridge_totalTime > 100 else stats.starBridge_totalTime
        return {
            "cloudport_catches": stats.cloudport_catches,
            "starbridge_time":   stats.starbridge_time if stats.starbridge_time > 0 else star_total,
            "echobay_span":      stats.echobay_span if stats.echobay_span > 0 else stats.echoBay_maxSequence,
            "card_patterns":     stats.card_patterns if stats.card_patterns > 0 else stats.hiddenReef_roundsCompleted,
            "gender":            gender,
        }, True

    # Adult mode — existing mapping
    total_time_s = stats.cloudport_totalTime / 1000 if stats.cloudport_totalTime > 100 else stats.cloudport_totalTime
    items_per_sec = stats.cloudport_catches / max(total_time_s, 1)
    star_total = stats.starBridge_totalTime / 1000 if stats.starBridge_totalTime > 100 else stats.starBridge_totalTime
    return {
        "cloudport_items_per_sec": items_per_sec,
        "starbridge_A_time":       star_total * 0.4,
        "starbridge_B_time":       star_total * 0.6,
        "echobay_max_span":        stats.echoBay_maxSequence,
        "card_efficiency":         stats.hiddenReef_efficiency,
        "heartisle_correct":       6,  # Heart Isle doesn't track this yet
        "gender":                  gender,
    }, False


def _zscore(val: float, key: str) -> float:
    n = NORMS_LOOKUP[key]
    z = (val - n["mean"]) / n["std"]
    if n["lower_better"]:
        z = -z
    return round(z, 2)


def _norm_label(z: float) -> str:
    if z >= 1.5:
        return "Well above norm"
    elif z >= 0.5:
        return "Above norm"
    elif z >= -0.5:
        return "Within norm"
    elif z >= -1.5:
        return "Below norm"
    elif z >= -2.5:
        return "Well below norm"
    return "Significantly below norm"


def _risk_flag(z: float) -> str:
    if z >= -0.5:
        return "Low"
    elif z >= -1.5:
        return "Moderate"
    return "High"


def generate_clinical_report(s: dict) -> dict:
    """Generate structured clinical report from full session data."""
    dsc_raw = (s["cloudport_items_caught"] / max(s["cloudport_duration_s"], 1)) * 60
    dsc_z = _zscore(dsc_raw, "digit_symbol_coding")
    react_times = s.get("cloudport_reaction_times", [])
    avg_react = round(float(np.mean(react_times)), 1) if react_times else 0
    react_std = round(float(np.std(react_times)), 1) if react_times else 0

    tma_z = _zscore(s["starbridge_A_time_s"], "trail_making_A")
    tmb_z = _zscore(s["starbridge_B_time_s"], "trail_making_B")
    fms_z = _zscore(s["echobay_max_span"], "forward_memory_span")

    card_eff = s["card_pairs_matched"] / max(s["card_total_attempts"], 1)
    rms_raw = 5 + card_eff * 11
    rms_z = _zscore(rms_raw, "reverse_memory_span")
    bm_accuracy = round(card_eff, 2)
    bm_strategy = round(
        1 - min(s["card_revisit_count"] / max(s["card_total_attempts"], 1), 1), 2
    )
    bm_span = round(
        (s["card_consecutive_max"] / max(s["card_pairs_on_board"], 1)) * 20, 1
    )

    pm_z = _zscore(s["heartisle_correct"], "progressive_matrices")

    all_z = [dsc_z, tma_z, tmb_z, fms_z, rms_z, pm_z]
    mean_z = round(float(np.mean(all_z)), 2)
    overall = _risk_flag(mean_z)

    domains = [
        {"name": "Processing Speed", "z_score": dsc_z, "status": _norm_label(dsc_z), "risk": _risk_flag(dsc_z)},
        {"name": "Visual Attention", "z_score": tma_z, "status": _norm_label(tma_z), "risk": _risk_flag(tma_z)},
        {"name": "Cognitive Flexibility", "z_score": tmb_z, "status": _norm_label(tmb_z), "risk": _risk_flag(tmb_z)},
        {"name": "Short-term Memory", "z_score": fms_z, "status": _norm_label(fms_z), "risk": _risk_flag(fms_z)},
        {"name": "Working Memory", "z_score": rms_z, "status": _norm_label(rms_z), "risk": _risk_flag(rms_z)},
        {"name": "Fluid Reasoning", "z_score": pm_z, "status": _norm_label(pm_z), "risk": _risk_flag(pm_z)},
    ]

    high_risk = [d["name"] for d in domains if d["risk"] == "High"]
    mod_risk = [d["name"] for d in domains if d["risk"] == "Moderate"]

    if overall == "Low":
        recommendation = "No cognitive concerns identified. Next assessment: routine schedule."
    elif overall == "Moderate":
        areas = ", ".join(mod_risk) if mod_risk else "general"
        recommendation = f"Mild cognitive concerns noted. Areas to monitor: {areas}. Recommend follow-up within 8 weeks."
    else:
        areas = ", ".join(high_risk) if high_risk else "multiple domains"
        recommendation = f"Significant cognitive concerns identified. High concern: {areas}. Clinical assessment recommended within 4 weeks."

    return {
        "player_id": s.get("player_id", "N/A"),
        "player_age": s.get("player_age", "N/A"),
        "player_gender": s.get("player_gender", "N/A"),
        "assessment_date": s.get("assessment_date", datetime.now().strftime("%Y-%m-%d")),
        "overall_risk": overall,
        "mean_z_score": mean_z,
        "recommendation": recommendation,
        "domains": domains,
        "levels": {
            "cloudport": {
                "title": "Cloudport — Processing Speed",
                "items_caught": s["cloudport_items_caught"],
                "total_items": s["cloudport_total_items"],
                "items_per_min": round(dsc_raw, 1),
                "avg_reaction_ms": avg_react,
                "reaction_std_ms": react_std,
                "misses": s["cloudport_misses"],
                "z_score": dsc_z,
                "status": _norm_label(dsc_z),
                "risk": _risk_flag(dsc_z),
            },
            "starbridge_A": {
                "title": "Star Bridge A — Visual Attention",
                "time_s": s["starbridge_A_time_s"],
                "errors": s["starbridge_A_errors"],
                "z_score": tma_z,
                "status": _norm_label(tma_z),
                "risk": _risk_flag(tma_z),
            },
            "starbridge_B": {
                "title": "Star Bridge B — Cognitive Flexibility",
                "time_s": s["starbridge_B_time_s"],
                "errors": s["starbridge_B_errors"],
                "z_score": tmb_z,
                "status": _norm_label(tmb_z),
                "risk": _risk_flag(tmb_z),
            },
            "echo_bay": {
                "title": "Echo Bay — Short-term Memory",
                "max_span": s["echobay_max_span"],
                "recall_accuracy": s["echobay_recall_accuracy"],
                "first_error_pos": s["echobay_first_error_pos"],
                "z_score": fms_z,
                "status": _norm_label(fms_z),
                "risk": _risk_flag(fms_z),
            },
            "hidden_reef": {
                "title": "Hidden Reef — Working Memory",
                "pairs_matched": s["card_pairs_matched"],
                "pairs_on_board": s["card_pairs_on_board"],
                "total_attempts": s["card_total_attempts"],
                "accuracy": bm_accuracy,
                "strategy_score": bm_strategy,
                "best_streak": s["card_consecutive_max"],
                "memory_span": bm_span,
                "z_score": rms_z,
                "status": _norm_label(rms_z),
                "risk": _risk_flag(rms_z),
            },
            "heart_isle": {
                "title": "Heart Isle — Fluid Reasoning",
                "correct": s["heartisle_correct"],
                "total": s["heartisle_total"],
                "avg_time_s": round(s["heartisle_avg_time_s"], 1),
                "accuracy": round(s["heartisle_correct"] / max(s["heartisle_total"], 1), 2),
                "z_score": pm_z,
                "status": _norm_label(pm_z),
                "risk": _risk_flag(pm_z),
            },
        },
        "note": "This is a SCREENING TOOL, not a clinical diagnosis. All flagged cases must be reviewed by a qualified clinician.",
    }


# ── FastAPI app ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="MindScape NCPT Inference API",
    description="Cognitive assessment backend for the MindScape game",
    version="1.0.0",
)

_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:8080,http://localhost:5173,http://localhost:3000,http://localhost:8001",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    print("Loading models...")
    load_models()
    print("All models loaded. Server ready.")


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": all(v is not None for v in [gat_model, lgbm_model, meta_learner]),
        "device": str(DEVICE),
    }


@app.post("/api/predict")
async def predict(scores: GameScores):
    """Quick prediction from game scores."""
    if lgbm_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded yet")
    result = predict_from_game(scores.model_dump())
    return result


@app.post("/api/predict/frontend")
async def predict_frontend(stats: FrontendGameStats):
    """
    Predict from the React frontend's GameStats format.
    Automatically maps frontend stats to model input format.
    Pass is_child=true in the payload to activate the Pediatric
    Calibration Layer (Van der Elst 2012 / Tombaugh 2004 /
    Gathercole 2004 / Logie & Pearson 1997).
    """
    if lgbm_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded yet")
    game_scores, is_child = frontend_stats_to_game_scores(stats)
    result = predict_from_game(game_scores, is_child=is_child)
    result["input_mapping"] = game_scores
    result["is_child"] = is_child
    return result


@app.post("/api/report")
async def report(session: GameSession):
    """Generate a full structured clinical report from detailed session data."""
    if lgbm_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded yet")

    session_dict = session.model_dump()
    if not session_dict.get("assessment_date"):
        session_dict["assessment_date"] = datetime.now().strftime("%Y-%m-%d")

    clinical = generate_clinical_report(session_dict)

    # Also run the quick prediction for class probabilities
    items_per_sec = session.cloudport_items_caught / max(session.cloudport_duration_s, 1)
    card_eff = session.card_pairs_matched / max(session.card_total_attempts, 1)
    prediction = predict_from_game({
        "cloudport_items_per_sec": items_per_sec,
        "starbridge_A_time": session.starbridge_A_time_s,
        "starbridge_B_time": session.starbridge_B_time_s,
        "echobay_max_span": session.echobay_max_span,
        "card_efficiency": card_eff,
        "heartisle_correct": session.heartisle_correct,
        "gender": 0 if session.player_gender.lower().startswith("m") else 1,
    })

    clinical["prediction"] = prediction
    return clinical


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
