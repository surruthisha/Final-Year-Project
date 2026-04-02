const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

export interface PredictionResult {
  predicted_class: number;
  performance_label: string;
  risk_band: string;
  recommendation: string;
  confidence: number;
  mean_z_score: number;
  probabilities: {
    High: number;
    Average: number;
    "Below avg": number;
    "At-risk": number;
  };
  zscores: Record<string, number>;
  raw_features: Record<string, number>;
  input_mapping?: Record<string, number>;
}

export interface FrontendGameStats {
  player_id?: string;
  player_age?: number;
  player_gender?: string;
  cloudport_totalTime: number;
  cloudport_avgReactionTime: number;
  cloudport_catches: number;
  cloudport_misses: number;
  starBridge_totalTime: number;
  starBridge_errors: number;
  starBridge_completed: boolean;
  hiddenReef_totalMoves: number;
  hiddenReef_totalPairs: number;
  hiddenReef_efficiency: number;
  hiddenReef_roundsCompleted: number;
  echoBay_maxSequence: number;
  echoBay_totalRounds: number;
  echoBay_perfectRounds: number;
}

export async function predictFromFrontendStats(
  stats: FrontendGameStats
): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/api/predict/frontend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stats),
  });
  if (!res.ok) {
    throw new Error(`Prediction failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    return data.status === "ok" && data.models_loaded;
  } catch {
    return false;
  }
}
