# MindScape — Cognitive Assessment Game

MindScape is a browser-based educational game that measures cognitive performance across five domains through a series of mini-games. At the end of the session, a machine learning ensemble analyses the player's gameplay data and generates a structured cognitive screening report.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Game Flow](#game-flow)
- [Cognitive Domains](#cognitive-domains)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [Pediatric Calibration Layer](#pediatric-calibration-layer)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)

---

## Overview

Players adopt a companion creature (Mindling) and travel through five islands, each hosting a different cognitive mini-game. Performance data is collected silently throughout the journey and sent to a FastAPI backend, where a three-model ensemble predicts cognitive performance class and produces domain z-scores, risk flags, and a plain-language recommendation.

The application is designed for screening purposes only. All outputs carry a clinical disclaimer and are intended for review by a qualified practitioner.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                   │
│                                                         │
│  TitleScreen → StoryIntro → CharacterSelect             │
│       ↓                                                 │
│  WorldMap → LevelIntro → [5 Mini-games] → CognitiveReport │
│                                                         │
│  GameContext (useReducer) — global state across screens │
│  useBackgroundMusic — Web Audio API ambient synthesis   │
│  useSoundEffects   — contextual SFX per game event      │
│  SettingsModal     — music / SFX toggles                │
└────────────────────────┬────────────────────────────────┘
                         │ POST /api/predict/frontend
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 FastAPI Backend (Python)                  │
│                                                         │
│  FrontendGameStats schema (Pydantic)                    │
│  frontend_stats_to_game_scores()  — input mapping       │
│  predict_from_game()              — inference           │
│       ↓                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │   GATv2     │   │  LightGBM   │   │ Meta-learner │  │
│  │(graph attn) │   │(gradient    │   │ (stacking    │  │
│  │             │   │ boosting)   │   │  ensemble)   │  │
│  └─────────────┘   └─────────────┘   └──────────────┘  │
│                                                         │
│  NCPT normative norms → z-scores → risk bands           │
└─────────────────────────────────────────────────────────┘
```

---

## Game Flow

```
Title Screen
    │
    ▼
Story Intro  (Learn More dialog explains the project)
    │
    ▼
Character Select  (choose a Mindling, enter its name)
    │
    ▼
World Map  (five islands, unlocked sequentially)
    │
    ├── Cloudport Isle   → Processing Speed test   → Spark Seed
    ├── Star Bridge      → Cognitive Flexibility    → Logic Seed
    ├── Hidden Reef      → Working Memory           → (no seed)
    ├── Echo Bay         → Short-term Memory        → Harmony Seed
    └── Heart Isle       → Fluid Reasoning          → (Mindling evolves)
    │
    ▼
Cognitive Journey Report  (ML prediction + domain breakdown + download)
```

Each island is accessed via a Level Intro screen that explains the mechanics. The Mindling companion reacts to hits and misses throughout each game.

---

## Cognitive Domains

| Island | Game | Cognitive Domain | NCPT Analogue |
|--------|------|-----------------|---------------|
| Cloudport Isle | Catch fireflies | Processing Speed | Digit Symbol Coding |
| Star Bridge | Number-to-letter sequencing | Cognitive Flexibility / Visual Attention | Trail Making A & B |
| Hidden Reef | Memory card matching | Working Memory | Reverse Memory Span |
| Echo Bay | Recall crystal sequences | Short-term Memory | Forward Memory Span |
| Heart Isle | Pattern recognition | Fluid Reasoning | Progressive Matrices |

---

## Machine Learning Pipeline

The backend loads three pre-trained models from the `extras/` directory at startup.

### Models

| Model | File | Role |
|-------|------|------|
| GATv2 (Graph Attention Network v2) | `ncpt_gatv2.pt` | Graph-structured cognitive pattern recognition |
| LightGBM | `ncpt_lgbm.pkl` | Gradient boosting on tabular NCPT features |
| Meta-learner | `ncpt_meta_learner.pkl` | Stacking ensemble combining both base models |

### Inference Pipeline

1. Raw game metrics are mapped to six NCPT feature dimensions:
   - `digit_symbol_coding` (processing speed)
   - `trail_making_A` (visual attention)
   - `trail_making_B` (cognitive flexibility)
   - `forward_memory_span` (short-term memory)
   - `reverse_memory_span` (working memory)
   - `progressive_matrices` (fluid reasoning)

2. Each feature is z-scored against NCPT adult normative values (mean ± SD from `battery50_norms.csv`).

3. Trail making features are sign-flipped — lower time is better, so a fast player gets a positive z-score.

4. LightGBM predicts class probabilities across four performance classes:

| Class | Label | Risk Band |
|-------|-------|-----------|
| 0 | High performance | Low |
| 1 | Average performance | Low |
| 2 | Below average | Moderate |
| 3 | Low / At-risk | High |

### Normative Reference Values

| Feature | Mean | SD |
|---------|------|----|
| Digit Symbol Coding | 52.51 | 10.30 |
| Trail Making A (s) | 19.80 | 6.39 |
| Trail Making B (s) | 33.45 | 12.96 |
| Forward Memory Span | 10.55 | 2.49 |
| Reverse Memory Span | 9.05 | 2.49 |
| Progressive Matrices | 10.95 | 3.27 |

---

## Pediatric Calibration Layer

When `is_child: true` is passed in the prediction request, raw game scores are rescaled to the adult NCPT normative range before inference, using age-appropriate reference norms.

| Domain | Game Metric | Formula | Reference |
|--------|------------|---------|-----------|
| Processing Speed | Firefly catches (0–10) | `DSC = clip(20 + (catches/10) × 1.35 × 44.4, 20, 80)` | Van der Elst et al. (2012) |
| Executive Switching | Raw Star Bridge time (s) | `TM-B = clip(time × 0.49, 15, 150)` | Tombaugh (2004) |
| Forward Memory | Echo Bay span (0–5) | `FMS = clip(4 + (span/5) × 10, 4, 14)` | Gathercole et al. (2004) |
| Visual/Reverse Span | Card patterns matched (0–5) | `RMS = clip(5 + (patterns/5) × 11, 5, 16)` | Logie & Pearson (1997) |
| Fluid Reasoning | — | Fixed neutral median (8.0) | — |

The 1.35× speed multiplier for processing speed accounts for the developmental gap between child and adult baseline reaction times. The 0.49 calibration factor for trail making reflects that children take roughly twice as long as adults on timed sequencing tasks.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Model files in `extras/` (`ncpt_gatv2.pt`, `ncpt_lgbm.pkl`, `ncpt_meta_learner.pkl`)

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:8080
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py     # http://localhost:8000
```

The backend binds to port 8000 by default. The frontend API client points to `http://localhost:8001` — adjust `frontend/src/lib/api.ts` if your port differs.

### Running Tests

See [TESTING.md](./TESTING.md) for the full testing guide.

```bash
# Frontend
cd frontend && npx vitest run

# Backend
cd backend && python -m pytest tests/ -v
```

---

## Project Structure

```
pixel-perfect-play-main/
├── README.md
├── TESTING.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Index.tsx               # Root page — GameProvider + global settings button
│   │   ├── components/
│   │   │   └── game/
│   │   │       ├── GameController.tsx  # Screen router
│   │   │       ├── TitleScreen.tsx
│   │   │       ├── StoryIntro.tsx
│   │   │       ├── CharacterSelect.tsx
│   │   │       ├── WorldMap.tsx
│   │   │       ├── LevelIntro.tsx
│   │   │       ├── CloudportGame.tsx   # Processing Speed
│   │   │       ├── StarBridgeGame.tsx  # Cognitive Flexibility
│   │   │       ├── HiddenReefGame.tsx  # Working Memory
│   │   │       ├── EchoBayGame.tsx     # Short-term Memory
│   │   │       ├── HeartIsle.tsx       # Fluid Reasoning
│   │   │       ├── CognitiveReport.tsx # Results + download
│   │   │       └── SettingsModal.tsx   # Audio settings
│   │   ├── contexts/
│   │   │   └── GameContext.tsx         # Global state + reducer
│   │   ├── hooks/
│   │   │   ├── useBackgroundMusic.ts   # Ambient music synthesis
│   │   │   └── useSoundEffects.ts      # Game SFX
│   │   ├── types/
│   │   │   └── game.ts                 # All TypeScript types
│   │   └── lib/
│   │       └── api.ts                  # Backend API client
│   ├── vitest.config.ts
│   └── package.json
│
├── backend/
│   ├── main.py                         # FastAPI app + inference logic
│   ├── requirements.txt
│   └── tests/
│       ├── test_calibration.py
│       ├── test_predict.py
│       └── test_api.py
│
└── extras/
    ├── ncpt_gatv2.pt                   # GATv2 weights
    ├── ncpt_lgbm.pkl                   # LightGBM bundle
    ├── ncpt_meta_learner.pkl           # Ensemble weights
    ├── battery50_df.csv                # NCPT normative dataset
    ├── battery50_norms.csv             # Feature normalization params
    └── children_50_validation.csv      # Pediatric validation data
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool (SWC compiler) |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Framer Motion | 12.31.0 | Animations |
| React Context + useReducer | — | Global game state |
| Web Audio API | — | Background music + SFX synthesis |
| Lucide React | 0.462.0 | Icons |
| shadcn/ui | — | Accessible UI primitives |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115.0 | REST API framework |
| Pydantic | 2.x | Request/response validation |
| PyTorch | 2.x | GATv2 inference |
| torch-geometric | 2.4.x | Graph neural network layers |
| LightGBM | 4.x | Gradient boosting prediction |
| scikit-learn | 1.3.x | Preprocessing (imputer, scaler) |
| NumPy | 1.24.x | Numerical operations |
| Uvicorn | 0.30.0 | ASGI server |

---

## API Reference

### `GET /api/health`

Returns server status and model load state.

```json
{
  "status": "ok",
  "models_loaded": true,
  "device": "cpu"
}
```

---

### `POST /api/predict/frontend`

Primary endpoint. Accepts the React frontend's `GameStats` format.

**Request body** (`FrontendGameStats`):

```json
{
  "player_id": "player-001",
  "player_age": 28,
  "player_gender": "female",
  "is_child": false,
  "cloudport_totalTime": 30,
  "cloudport_avgReactionTime": 340,
  "cloudport_catches": 8,
  "cloudport_misses": 2,
  "starBridge_totalTime": 45,
  "starBridge_errors": 1,
  "starBridge_completed": true,
  "hiddenReef_efficiency": 0.65,
  "hiddenReef_roundsCompleted": 3,
  "echoBay_maxSequence": 5,
  "echoBay_perfectRounds": 2
}
```

Set `"is_child": true` to activate the Pediatric Calibration Layer. Also pass `starbridge_time`, `echobay_span`, and `card_patterns` explicitly for more accurate child-mode mapping.

**Response**:

```json
{
  "predicted_class": 1,
  "performance_label": "Average performance",
  "risk_band": "Low",
  "recommendation": "Normal range - continue monitoring",
  "confidence": 0.72,
  "mean_z_score": 0.08,
  "probabilities": {
    "High": 0.21,
    "Average": 0.72,
    "Below avg": 0.05,
    "At-risk": 0.02
  },
  "zscores": {
    "digit_symbol_coding": 0.34,
    "trail_making_A": 0.12,
    "trail_making_B": -0.08,
    "forward_memory_span": 0.21,
    "reverse_memory_span": 0.05,
    "progressive_matrices": -0.10
  },
  "raw_features": { ... },
  "input_mapping": { ... },
  "is_child": false
}
```

---

### `POST /api/predict`

Simplified endpoint accepting pre-mapped `GameScores`. Useful for direct integration or testing without the frontend mapping layer.

```json
{
  "cloudport_items_per_sec": 0.5,
  "starbridge_A_time": 20.0,
  "starbridge_B_time": 40.0,
  "echobay_max_span": 6,
  "card_efficiency": 0.65,
  "heartisle_correct": 7,
  "gender": 1
}
```

---

### `POST /api/report`

Full clinical report from a detailed `GameSession` payload. Returns domain-level breakdowns with z-scores, risk flags, and the ML prediction embedded in a single response object.

---

## Disclaimer

MindScape is a **screening tool**, not a diagnostic instrument. No output from this application constitutes a clinical diagnosis. All flagged results must be reviewed by a qualified clinician before any action is taken.
