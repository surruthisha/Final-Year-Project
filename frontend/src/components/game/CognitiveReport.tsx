import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { Play, RotateCcw, Lightbulb, Brain, Zap, Eye, Activity, Puzzle, Loader2, AlertTriangle, ShieldCheck, ShieldAlert, Download } from 'lucide-react';
import { SeedGem } from './SeedGem';
import { predictFromFrontendStats, type PredictionResult, type FrontendGameStats } from '@/lib/api';

import heartIsleBg from '@/assets/heart-isle-bg.jpg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

const DOMAIN_META: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  digit_symbol_coding:  { label: 'Processing Speed', icon: Zap,       color: 'text-seed-spark' },
  trail_making_A:       { label: 'Visual Attention',  icon: Eye,       color: 'text-sky-400' },
  trail_making_B:       { label: 'Cognitive Flexibility', icon: Puzzle, color: 'text-seed-logic' },
  forward_memory_span:  { label: 'Short-term Memory', icon: Brain,     color: 'text-seed-harmony' },
  reverse_memory_span:  { label: 'Working Memory',    icon: Activity,  color: 'text-secondary' },
  progressive_matrices: { label: 'Fluid Reasoning',   icon: Lightbulb, color: 'text-amber-400' },
};

function zToPercent(z: number): number {
  // Map z-score (-4 to +4) to a 0-100 bar width
  return Math.min(100, Math.max(5, ((z + 4) / 8) * 100));
}

function zLabel(z: number): { text: string; color: string } {
  if (z >= 1.5)  return { text: 'Well above norm', color: 'text-emerald-700' };
  if (z >= 0.5)  return { text: 'Above norm',      color: 'text-green-700' };
  if (z >= -0.5) return { text: 'Within norm',     color: 'text-blue-700' };
  if (z >= -1.5) return { text: 'Below norm',      color: 'text-amber-700' };
  return            { text: 'Well below norm',  color: 'text-red-600' };
}

function riskBadge(risk: string) {
  if (risk === 'Low') return { bg: 'bg-emerald-600/20', text: 'text-emerald-800', border: 'border-emerald-600/40' };
  if (risk === 'Moderate') return { bg: 'bg-amber-500/20', text: 'text-amber-800', border: 'border-amber-600/40' };
  return { bg: 'bg-red-500/20', text: 'text-red-700', border: 'border-red-600/40' };
}

function barColor(z: number): string {
  if (z >= 0.5) return 'bg-emerald-500';
  if (z >= -0.5) return 'bg-blue-500';
  if (z >= -1.5) return 'bg-amber-500';
  return 'bg-red-500';
}

export function CognitiveReport() {
  const { state, dispatch } = useGame();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch once when the report mounts — stats don't change after this point
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchPrediction = async () => {
      try {
        const stats: FrontendGameStats = {
          player_id: state.mindlingName || 'Player',
          player_age: 0,
          player_gender: 'Unknown',
          cloudport_totalTime: state.stats.cloudport?.totalTime ?? 60000,
          cloudport_avgReactionTime: state.stats.cloudport?.avgReactionTime ?? 400,
          cloudport_catches: state.stats.cloudport?.catches ?? 0,
          cloudport_misses: state.stats.cloudport?.misses ?? 0,
          starBridge_totalTime: state.stats.starBridge?.totalTime ?? 45000,
          starBridge_errors: state.stats.starBridge?.errors ?? 0,
          starBridge_completed: state.stats.starBridge?.completed ?? false,
          hiddenReef_totalMoves: state.stats.hiddenReef?.totalMoves ?? 0,
          hiddenReef_totalPairs: state.stats.hiddenReef?.totalPairs ?? 8,
          hiddenReef_efficiency: (state.stats.hiddenReef?.efficiency ?? 50) / 100,
          hiddenReef_roundsCompleted: state.stats.hiddenReef?.roundsCompleted ?? 0,
          echoBay_maxSequence: state.stats.echoBay?.maxSequence ?? 0,
          echoBay_totalRounds: state.stats.echoBay?.totalRounds ?? 0,
          echoBay_perfectRounds: state.stats.echoBay?.perfectRounds ?? 0,
        };
        const result = await predictFromFrontendStats(stats);
        setPrediction(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to assessment server');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const handleDownload = () => {
    if (!prediction) return;

    const domainRows = Object.entries(prediction.zscores).map(([key, z]) => {
      const meta = DOMAIN_META[key];
      if (!meta) return '';
      const lbl = zLabel(z);
      const flag = z >= -0.5 ? 'OK' : z >= -1.5 ? 'MONITOR' : 'CONCERN';
      const insight = z >= 0.5
        ? `Strong ${meta.label.toLowerCase()} skills. Above adult average.`
        : z >= -0.5
        ? `${meta.label} is within the normal range. Keep practising!`
        : z >= -1.5
        ? `${meta.label} is below average. Targeted practice recommended.`
        : `${meta.label} needs attention. Consider focused exercises.`;
      const flagColor = flag === 'OK' ? '#10b981' : flag === 'MONITOR' ? '#f59e0b' : '#ef4444';
      return `
        <tr>
          <td>${meta.label}</td>
          <td style="text-align:center">${z >= 0 ? '+' : ''}${z.toFixed(2)}</td>
          <td style="color:${lbl.color.includes('emerald') ? '#10b981' : lbl.color.includes('green') ? '#22c55e' : lbl.color.includes('blue') ? '#60a5fa' : lbl.color.includes('amber') ? '#f59e0b' : '#ef4444'}">${lbl.text}</td>
          <td style="color:${flagColor};font-weight:bold;text-align:center">${flag}</td>
          <td style="color:#9ca3af;font-size:12px">${insight}</td>
        </tr>`;
    }).join('');

    const probRows = Object.entries(prediction.probabilities).map(([cls, prob]) => {
      const isActive = (cls === 'High' && prediction.predicted_class === 0)
        || (cls === 'Average' && prediction.predicted_class === 1)
        || (cls === 'Below avg' && prediction.predicted_class === 2)
        || (cls === 'At-risk' && prediction.predicted_class === 3);
      return `<td style="text-align:center;${isActive ? 'font-weight:bold;color:#a78bfa' : 'color:#6b7280'}">${cls}<br/>${(prob * 100).toFixed(1)}%${isActive ? ' ✓' : ''}</td>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Cognitive Journey Report — ${state.mindlingName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:32px; }
    h1 { color:#a78bfa; letter-spacing:2px; font-size:26px; margin-bottom:4px; }
    h2 { color:#c4b5fd; font-size:15px; letter-spacing:1px; border-bottom:1px solid #334155; padding-bottom:6px; margin-top:32px; }
    .meta { color:#94a3b8; font-size:13px; margin-bottom:24px; }
    .badge { display:inline-block; padding:6px 14px; border-radius:8px; font-weight:bold; font-size:15px; margin-bottom:8px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#1e293b; color:#94a3b8; padding:8px 10px; text-align:left; font-weight:600; }
    td { padding:8px 10px; border-bottom:1px solid #1e293b; vertical-align:top; }
    tr:last-child td { border-bottom:none; }
    .rec { background:#1e293b; border-radius:8px; padding:14px 16px; font-size:13px; color:#cbd5e1; margin-top:8px; }
    .disclaimer { color:#475569; font-size:11px; margin-top:32px; border-top:1px solid #1e293b; padding-top:12px; }
    .powered { color:#4b5563; font-size:11px; margin-top:4px; }
  </style>
</head>
<body>
  <h1>COGNITIVE JOURNEY REPORT</h1>
  <div class="meta">
    Player: <strong>${state.mindlingName}</strong> &nbsp;|&nbsp;
    Date: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })} &nbsp;|&nbsp;
    Model: NCPT Ensemble v1.0
  </div>

  <h2>OVERALL RESULT</h2>
  <div class="badge" style="background:#312e81;color:#a78bfa;border:1px solid #4c1d95">
    ${prediction.performance_label} &nbsp;·&nbsp; Risk: ${prediction.risk_band} &nbsp;·&nbsp; Confidence: ${(prediction.confidence * 100).toFixed(1)}%
  </div>
  <p class="meta" style="margin-top:4px">Mean z-score vs adult norm: <strong>${prediction.mean_z_score >= 0 ? '+' : ''}${prediction.mean_z_score.toFixed(2)}</strong></p>
  <div class="rec">${prediction.recommendation}</div>

  <h2>COGNITIVE DOMAIN SCORES</h2>
  <table>
    <thead><tr><th>Domain</th><th>z-score</th><th>Standing</th><th>Flag</th><th>Insight</th></tr></thead>
    <tbody>${domainRows}</tbody>
  </table>

  <h2>PERFORMANCE CLASSIFICATION</h2>
  <table>
    <thead><tr>${Object.keys(prediction.probabilities).map(c => `<th style="text-align:center">${c}</th>`).join('')}</tr></thead>
    <tbody><tr>${probRows}</tr></tbody>
  </table>

  <div class="disclaimer">
    This report is generated by Mindscape of Mindlings using the GENIE.AI + XAI ensemble model. It is a
    cognitive screening tool only and does not constitute a clinical diagnosis. Please consult a qualified
    professional for any clinical concerns.
  </div>
  <div class="powered">Powered by GATv2 · LightGBM · Meta-learner stacking ensemble</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitive-report-${state.mindlingName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const risk = prediction ? riskBadge(prediction.risk_band) : null;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heartIsleBg})` }}
      />
      <div className="absolute inset-0" style={{ background: 'hsla(209, 50%, 15%, 0.6)' }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="game-title text-3xl md:text-5xl text-foreground mb-2">
            COGNITIVE JOURNEY REPORT
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayAgain}
              className="flex items-center gap-2 px-4 py-2 rounded-game
                         bg-card hover:bg-muted transition-colors"
            >
              <Play className="w-4 h-4" />
              Play Again
            </motion.button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Analytics Powered By: GENIE.AI + XAI
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground font-display">
              Analyzing cognitive performance...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-red-500/10 border border-red-500/30 rounded-game p-6 text-center"
          >
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-display font-bold mb-2">Assessment Server Unavailable</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">
              Make sure the backend is running: <code className="bg-muted px-2 py-1 rounded">python -m uvicorn main:app --port 8001</code>
            </p>
          </motion.div>
        )}

        {/* Results */}
        {prediction && (
          <>
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
              {/* Left side - Profile + Overall Result */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-game p-6 shadow-float"
              >
                <h2 className="font-display text-xl font-bold mb-4 text-foreground">
                  PROFILE SNAPSHOT
                </h2>

                {/* Garden scene */}
                <div
                  className="relative rounded-lg overflow-hidden min-h-[180px]"
                  style={{
                    backgroundImage: `url(${heartIsleBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(1.2) saturate(1.3)',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 50% 60%, hsla(45, 100%, 60%, 0.25) 0%, transparent 60%)',
                    }}
                  />
                  {state.selectedMindling && (
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    >
                      <svg className="w-10 h-7 mb-[-4px]" viewBox="0 0 40 32" fill="none">
                        <path d="M4 28L2 8L12 16L20 4L28 16L38 8L36 28Z" fill="hsl(45, 100%, 55%)" stroke="hsl(40, 90%, 45%)" strokeWidth="1.5" />
                        <circle cx="12" cy="14" r="2" fill="hsl(0, 80%, 60%)" />
                        <circle cx="20" cy="6" r="2" fill="hsl(210, 80%, 55%)" />
                        <circle cx="28" cy="14" r="2" fill="hsl(280, 60%, 60%)" />
                      </svg>
                      <img
                        src={mindlingImages[state.selectedMindling.type]}
                        alt={state.mindlingName}
                        className="w-20 h-20 object-contain mindling-img"
                      />
                      <div
                        className="w-16 h-3 rounded-[50%] blur-sm -mt-1"
                        style={{ background: 'radial-gradient(ellipse, hsla(0,0%,0%,0.4) 0%, transparent 70%)' }}
                      />
                    </motion.div>
                  )}
                  <div className="absolute bottom-3 right-3 flex gap-1.5">
                    <SeedGem type="spark" size={28} animate={false} />
                    <SeedGem type="logic" size={28} animate={false} />
                    <SeedGem type="harmony" size={28} animate={false} />
                  </div>
                </div>

                <p className="text-center text-muted-foreground text-sm mt-3">
                  {state.mindlingName}'s Garden — Journey Complete
                </p>

                {/* Overall result card */}
                <div className={`mt-4 p-4 rounded-lg border ${risk!.bg} ${risk!.border}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {prediction.risk_band === 'Low' ? (
                      <ShieldCheck className={`w-8 h-8 ${risk!.text}`} />
                    ) : (
                      <ShieldAlert className={`w-8 h-8 ${risk!.text}`} />
                    )}
                    <div>
                      <p className={`font-display font-bold text-lg ${risk!.text}`}>
                        {prediction.performance_label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Risk: {prediction.risk_band} | Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2">
                    {prediction.recommendation}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Mean z-score: {prediction.mean_z_score >= 0 ? '+' : ''}{prediction.mean_z_score.toFixed(2)} vs adult norm
                  </p>
                </div>
              </motion.div>

              {/* Right side - Domain Z-Scores */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-game p-6 shadow-float"
              >
                <h2 className="font-display text-xl font-bold mb-4 text-foreground">
                  COGNITIVE DOMAIN SCORES
                </h2>

                {Object.entries(prediction.zscores).map(([key, z], i) => {
                  const meta = DOMAIN_META[key];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  const label = zLabel(z);
                  return (
                    <div key={key} className="mb-5">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${meta.color}`} />
                          <span className="font-display font-bold text-sm">{meta.label}</span>
                        </div>
                        <span className={`text-xs font-medium ${label.color}`}>{label.text}</span>
                      </div>
                      <div className="h-3.5 bg-muted rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${zToPercent(z)}%` }}
                          transition={{ delay: 0.5 + i * 0.15, duration: 0.8 }}
                          className={`h-full rounded-full ${barColor(z)}`}
                        />
                        {/* Zero line (adult average) */}
                        <div
                          className="absolute top-0 bottom-0 w-px bg-foreground/30"
                          style={{ left: '50%' }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        z = {z >= 0 ? '+' : ''}{z.toFixed(2)}
                      </p>
                    </div>
                  );
                })}

                <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-3">
                  Center line = adult average (z=0). Scores to the right indicate stronger performance.
                </p>
              </motion.div>
            </div>

            {/* Class Probabilities */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-4xl mt-8 bg-card rounded-game p-6 shadow-float"
            >
              <h2 className="font-display text-xl font-bold mb-4 text-foreground">
                PERFORMANCE CLASSIFICATION
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(prediction.probabilities).map(([cls, prob]) => {
                  const isActive = cls === 'High' && prediction.predicted_class === 0
                    || cls === 'Average' && prediction.predicted_class === 1
                    || cls === 'Below avg' && prediction.predicted_class === 2
                    || cls === 'At-risk' && prediction.predicted_class === 3;
                  const colors: Record<string, string> = {
                    'High': 'border-emerald-600/50 bg-emerald-600/15',
                    'Average': 'border-blue-600/50 bg-blue-600/15',
                    'Below avg': 'border-amber-600/50 bg-amber-500/15',
                    'At-risk': 'border-red-600/50 bg-red-500/15',
                  };
                  const textColors: Record<string, string> = {
                    'High': 'text-emerald-800',
                    'Average': 'text-blue-800',
                    'Below avg': 'text-amber-800',
                    'At-risk': 'text-red-700',
                  };
                  return (
                    <div
                      key={cls}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        isActive ? colors[cls] + ' scale-105' : 'border-border/30 bg-muted/30 opacity-60'
                      }`}
                    >
                      <p className={`font-display font-bold text-sm ${isActive ? textColors[cls] : 'text-muted-foreground'}`}>
                        {cls}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${isActive ? textColors[cls] : 'text-muted-foreground'}`}>
                        {(prob * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* XAI Insights */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-4xl mt-8 bg-card rounded-game p-6 shadow-float"
            >
              <h2 className="font-display text-xl font-bold mb-4 text-foreground">
                EXPLAINABLE AI (XAI) INSIGHTS
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(prediction.zscores).map(([key, z]) => {
                  const meta = DOMAIN_META[key];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  const flag = z >= -0.5 ? 'OK' : z >= -1.5 ? 'MONITOR' : 'CONCERN';
                  const flagColor = flag === 'OK' ? 'text-emerald-700' : flag === 'MONITOR' ? 'text-amber-700' : 'text-red-600';
                  const insight = z >= 0.5
                    ? `Strong ${meta.label.toLowerCase()} skills. Above adult average.`
                    : z >= -0.5
                    ? `${meta.label} is within the normal range. Keep practicing!`
                    : z >= -1.5
                    ? `${meta.label} is below average. Targeted practice recommended.`
                    : `${meta.label} needs attention. Consider focused exercises.`;
                  return (
                    <div key={key} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${meta.color}`} />
                          <span className={`font-display font-bold text-xs ${meta.color}`}>{meta.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${flagColor}`}>[{flag}]</span>
                      </div>
                      <p className="text-sm text-foreground/80">{insight}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-muted-foreground text-sm"
        >
          <p>Report Generated: {new Date().toLocaleDateString()}</p>
          <p>Player: {state.mindlingName}'s Guardian | NCPT Ensemble Model v1.0</p>
          <p className="text-xs mt-1">This is a screening tool, not a clinical diagnosis.</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAgain}
            className="flex items-center gap-3 px-8 py-4
                       bg-gradient-to-b from-primary to-primary/80
                       text-primary-foreground rounded-game font-display font-bold
                       text-xl shadow-glow-gold"
          >
            <RotateCcw className="w-6 h-6" />
            Start New Journey
          </motion.button>

          {prediction && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center gap-3 px-8 py-4
                         bg-card hover:bg-muted border-2 border-border hover:border-primary
                         text-foreground rounded-game font-display font-bold
                         text-xl transition-all shadow-soft"
            >
              <Download className="w-6 h-6" />
              Download Report
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
