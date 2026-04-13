import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import {
  RotateCcw,
  Lightbulb,
  Brain,
  Zap,
  Eye,
  Activity,
  Puzzle,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { SeedGem } from './SeedGem';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import {
  predictFromFrontendStats,
  type PredictionResult,
  type FrontendGameStats,
} from '@/lib/api';

import heartIsleBg from '@/assets/heart-isle-bg.jpg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

const DOMAIN_META: Record<string, { label: string; icon: typeof Zap; color: string; hue: number }> =
  {
    digit_symbol_coding: {
      label: 'Processing Speed',
      icon: Zap,
      color: 'hsl(45,100%,55%)',
      hue: 45,
    },
    trail_making_A: {
      label: 'Visual Attention',
      icon: Eye,
      color: 'hsl(200,80%,55%)',
      hue: 200,
    },
    trail_making_B: {
      label: 'Cognitive Flexibility',
      icon: Puzzle,
      color: 'hsl(210,80%,55%)',
      hue: 210,
    },
    forward_memory_span: {
      label: 'Short-term Memory',
      icon: Brain,
      color: 'hsl(160,65%,45%)',
      hue: 160,
    },
    reverse_memory_span: {
      label: 'Working Memory',
      icon: Activity,
      color: 'hsl(280,60%,60%)',
      hue: 280,
    },
    progressive_matrices: {
      label: 'Fluid Reasoning',
      icon: Lightbulb,
      color: 'hsl(38,90%,55%)',
      hue: 38,
    },
  };

function zToPercent(z: number): number {
  return Math.min(100, Math.max(5, ((z + 4) / 8) * 100));
}

function zLabel(z: number): { text: string; tint: 'mint' | 'sky' | 'butter' | 'peach' } {
  if (z >= 1.5) return { text: 'Well above norm', tint: 'mint' };
  if (z >= 0.5) return { text: 'Above norm', tint: 'mint' };
  if (z >= -0.5) return { text: 'Within norm', tint: 'sky' };
  if (z >= -1.5) return { text: 'Below norm', tint: 'butter' };
  return { text: 'Well below norm', tint: 'peach' };
}

function barGradient(z: number): string {
  if (z >= 0.5)
    return 'linear-gradient(90deg, hsl(140,60%,50%), hsl(160,55%,45%))';
  if (z >= -0.5)
    return 'linear-gradient(90deg, hsl(200,70%,55%), hsl(210,65%,50%))';
  if (z >= -1.5)
    return 'linear-gradient(90deg, hsl(45,90%,55%), hsl(38,85%,50%))';
  return 'linear-gradient(90deg, hsl(0,65%,55%), hsl(340,60%,50%))';
}

function riskTint(risk: string): 'mint' | 'butter' | 'peach' {
  if (risk === 'Low') return 'mint';
  if (risk === 'Moderate') return 'butter';
  return 'peach';
}

function classTint(cls: string): 'mint' | 'sky' | 'butter' | 'peach' {
  if (cls === 'High') return 'mint';
  if (cls === 'Average') return 'sky';
  if (cls === 'Below avg') return 'butter';
  return 'peach';
}

export function CognitiveReport() {
  const { state, dispatch } = useGame();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
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
        setError(
          err instanceof Error ? err.message : 'Failed to connect to assessment server'
        );
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

    const domainRows = Object.entries(prediction.zscores)
      .map(([key, z]) => {
        const meta = DOMAIN_META[key];
        if (!meta) return '';
        const lbl = zLabel(z);
        const flag = z >= -0.5 ? 'OK' : z >= -1.5 ? 'MONITOR' : 'CONCERN';
        const insight =
          z >= 0.5
            ? `Strong ${meta.label.toLowerCase()} skills. Above adult average.`
            : z >= -0.5
              ? `${meta.label} is within the normal range. Keep practising!`
              : z >= -1.5
                ? `${meta.label} is below average. Targeted practice recommended.`
                : `${meta.label} needs attention. Consider focused exercises.`;
        const flagColor =
          flag === 'OK' ? '#10b981' : flag === 'MONITOR' ? '#f59e0b' : '#ef4444';
        return `
        <tr>
          <td>${meta.label}</td>
          <td style="text-align:center">${z >= 0 ? '+' : ''}${z.toFixed(2)}</td>
          <td>${lbl.text}</td>
          <td style="color:${flagColor};font-weight:bold;text-align:center">${flag}</td>
          <td style="color:#9ca3af;font-size:12px">${insight}</td>
        </tr>`;
      })
      .join('');

    const probRows = Object.entries(prediction.probabilities)
      .map(([cls, prob]) => {
        const isActive =
          (cls === 'High' && prediction.predicted_class === 0) ||
          (cls === 'Average' && prediction.predicted_class === 1) ||
          (cls === 'Below avg' && prediction.predicted_class === 2) ||
          (cls === 'At-risk' && prediction.predicted_class === 3);
        return `<td style="text-align:center;${isActive ? 'font-weight:bold;color:#a78bfa' : 'color:#6b7280'}">${cls}<br/>${(prob * 100).toFixed(1)}%${isActive ? ' ✓' : ''}</td>`;
      })
      .join('');

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
    Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;|&nbsp;
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
    <thead><tr>${Object.keys(prediction.probabilities).map((c) => `<th style="text-align:center">${c}</th>`).join('')}</tr></thead>
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

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: `url(${heartIsleBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, hsla(232,60%,12%,0.6) 0%, hsla(280,40%,15%,0.55) 50%, hsla(232,60%,12%,0.65) 100%)',
        }}
      />

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-col items-center py-8 px-4 pb-16">
        {/* ── Header ── */}
        <motion.div
          initial={{ y: -30, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mb-6"
        >
          <GlassCard
            tint="lilac"
            shimmer
            className="px-8 md:px-14 py-4 md:py-5 text-center"
            style={{ boxShadow: 'var(--glass-glow-lilac)' }}
          >
            <h1
              className="game-title text-2xl md:text-4xl ink-deep leading-tight mb-1"
              style={{
                textShadow:
                  '0 2px 0 rgba(255,255,255,0.6), 0 6px 16px hsla(282,80%,60%,0.3)',
              }}
            >
              Cognitive Journey Report
            </h1>
            <p
              className="font-body text-xs ink-soft"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
            >
              Analytics Powered By: GENIE.AI + XAI
            </p>
          </GlassCard>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-12"
          >
            <GlassCard tint="sky" shimmer className="px-10 py-12 text-center">
              <Loader2 className="w-12 h-12 ink-deep animate-spin mx-auto mb-4" />
              <p className="font-display font-bold text-lg ink-deep">
                Analyzing cognitive performance...
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Error ── */}
        {error && (
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="w-full max-w-lg mt-8"
          >
            <GlassCard
              tint="peach"
              shimmer
              className="p-6 text-center"
              style={{ boxShadow: 'var(--glass-glow-peach)' }}
            >
              <AlertTriangle className="w-10 h-10 ink-deep mx-auto mb-3" />
              <p className="font-display font-bold ink-deep mb-2">
                Assessment Server Unavailable
              </p>
              <p className="text-sm ink-soft mb-4">{error}</p>
              <p className="text-xs ink-soft">
                Make sure the backend is running:{' '}
                <code
                  className="px-2 py-1 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  python -m uvicorn main:app --port 8001
                </code>
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Results ── */}
        {prediction && (
          <>
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
              {/* ── Left: Profile + Overall ── */}
              <motion.div
                initial={{ x: -40 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 20 }}
              >
                <GlassCard
                  tint="lilac"
                  shimmer
                  className="p-6 h-full"
                  style={{ boxShadow: 'var(--glass-glow-lilac)' }}
                >
                  <h2
                    className="font-display font-bold text-lg ink-deep mb-4"
                    style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                  >
                    Profile Snapshot
                  </h2>

                  {/* Garden scene */}
                  <div
                    className="relative rounded-2xl overflow-hidden min-h-[180px]"
                    style={{
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <img
                      src={heartIsleBg}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: 'brightness(1.2) saturate(1.3)' }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 60%, hsla(45, 100%, 60%, 0.25) 0%, transparent 60%)',
                      }}
                    />
                    {state.selectedMindling && (
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
                      >
                        <svg
                          className="w-10 h-7 mb-[-4px]"
                          viewBox="0 0 40 32"
                          fill="none"
                        >
                          <path
                            d="M4 28L2 8L12 16L20 4L28 16L38 8L36 28Z"
                            fill="hsl(45, 100%, 55%)"
                            stroke="hsl(40, 90%, 45%)"
                            strokeWidth="1.5"
                          />
                          <circle cx="12" cy="14" r="2" fill="hsl(0, 80%, 60%)" />
                          <circle cx="20" cy="6" r="2" fill="hsl(210, 80%, 55%)" />
                          <circle cx="28" cy="14" r="2" fill="hsl(280, 60%, 60%)" />
                        </svg>
                        <img
                          src={mindlingImages[state.selectedMindling.type]}
                          alt={state.mindlingName}
                          className="w-20 h-20 object-contain"
                          style={{
                            filter:
                              'drop-shadow(0 4px 12px hsla(45,100%,55%,0.4))',
                          }}
                        />
                        <div
                          className="w-16 h-3 rounded-[50%] blur-sm -mt-1"
                          style={{
                            background:
                              'radial-gradient(ellipse, hsla(0,0%,0%,0.4) 0%, transparent 70%)',
                          }}
                        />
                      </motion.div>
                    )}
                    <div className="absolute bottom-3 right-3 flex gap-1.5">
                      <SeedGem type="spark" size={24} animate={false} />
                      <SeedGem type="logic" size={24} animate={false} />
                      <SeedGem type="memory" size={24} animate={false} />
                      <SeedGem type="harmony" size={24} animate={false} />
                    </div>
                  </div>

                  <p
                    className="text-center font-display font-bold text-sm ink-soft mt-3"
                    style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
                  >
                    {state.mindlingName}'s Garden — Journey Complete
                  </p>

                  {/* Overall result */}
                  <div className="mt-4">
                    <GlassCard
                      tint={riskTint(prediction.risk_band)}
                      className="p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {prediction.risk_band === 'Low' ? (
                          <ShieldCheck className="w-7 h-7 ink-deep" />
                        ) : (
                          <ShieldAlert className="w-7 h-7 ink-deep" />
                        )}
                        <div>
                          <p className="font-display font-bold text-base ink-deep">
                            {prediction.performance_label}
                          </p>
                          <p className="text-xs ink-soft">
                            Risk: {prediction.risk_band} | Confidence:{' '}
                            {(prediction.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-sm ink-deep leading-relaxed mt-2"
                        style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
                      >
                        {prediction.recommendation}
                      </p>
                      <p className="text-xs ink-soft mt-2">
                        Mean z-score: {prediction.mean_z_score >= 0 ? '+' : ''}
                        {prediction.mean_z_score.toFixed(2)} vs adult norm
                      </p>
                    </GlassCard>
                  </div>
                </GlassCard>
              </motion.div>

              {/* ── Right: Domain Z-Scores ── */}
              <motion.div
                initial={{ x: 40 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 20 }}
              >
                <GlassCard
                  tint="sky"
                  shimmer
                  className="p-6 h-full"
                  style={{ boxShadow: 'var(--glass-glow-sky)' }}
                >
                  <h2
                    className="font-display font-bold text-lg ink-deep mb-4"
                    style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                  >
                    Cognitive Domain Scores
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
                            <Icon
                              className="w-4 h-4"
                              style={{ color: meta.color }}
                            />
                            <span
                              className="font-display font-bold text-sm ink-deep"
                              style={{
                                textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                              }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <span
                            className="text-xs font-display font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(255,255,255,0.15)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              color: meta.color,
                            }}
                          >
                            {label.text}
                          </span>
                        </div>
                        {/* Bar */}
                        <div
                          className="h-3.5 rounded-full overflow-hidden relative"
                          style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.25)',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${zToPercent(z)}%` }}
                            transition={{ delay: 0.5 + i * 0.12, duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{
                              background: barGradient(z),
                              boxShadow: `0 0 8px hsla(${meta.hue},60%,50%,0.4)`,
                            }}
                          />
                          {/* Center line (adult average) */}
                          <div
                            className="absolute top-0 bottom-0 w-px"
                            style={{
                              left: '50%',
                              background: 'rgba(255,255,255,0.4)',
                            }}
                          />
                        </div>
                        <p className="text-xs ink-soft mt-1">
                          z = {z >= 0 ? '+' : ''}
                          {z.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}

                  <p
                    className="text-xs ink-soft mt-2 pt-3"
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    Center line = adult average (z=0). Right = stronger performance.
                  </p>
                </GlassCard>
              </motion.div>
            </div>

            {/* ── Classification ── */}
            <motion.div
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 20 }}
              className="w-full max-w-4xl mt-6"
            >
              <GlassCard
                tint="butter"
                shimmer
                className="p-6"
                style={{ boxShadow: 'var(--glass-glow-butter)' }}
              >
                <h2
                  className="font-display font-bold text-lg ink-deep mb-4"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                >
                  Performance Classification
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(prediction.probabilities).map(([cls, prob]) => {
                    const isActive =
                      (cls === 'High' && prediction.predicted_class === 0) ||
                      (cls === 'Average' && prediction.predicted_class === 1) ||
                      (cls === 'Below avg' && prediction.predicted_class === 2) ||
                      (cls === 'At-risk' && prediction.predicted_class === 3);
                    return (
                      <GlassCard
                        key={cls}
                        tint={isActive ? classTint(cls) : 'bubble'}
                        shimmer={isActive}
                        className="p-4 text-center"
                        style={{
                          opacity: isActive ? 1 : 0.55,
                          transform: isActive ? 'scale(1.04)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <p className="font-display font-bold text-sm ink-deep">
                          {cls}
                        </p>
                        <p className="font-display font-bold text-2xl ink-deep mt-1">
                          {(prob * 100).toFixed(1)}%
                        </p>
                        {isActive && (
                          <span className="text-xs font-display font-bold ink-deep">
                            Current
                          </span>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>

            {/* ── XAI Insights ── */}
            <motion.div
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 20 }}
              className="w-full max-w-4xl mt-6"
            >
              <GlassCard
                tint="mint"
                shimmer
                className="p-6"
                style={{ boxShadow: 'var(--glass-glow-mint)' }}
              >
                <h2
                  className="font-display font-bold text-lg ink-deep mb-4"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                >
                  Explainable AI (XAI) Insights
                </h2>

                <div className="grid md:grid-cols-3 gap-3">
                  {Object.entries(prediction.zscores).map(([key, z]) => {
                    const meta = DOMAIN_META[key];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    const flag =
                      z >= -0.5 ? 'OK' : z >= -1.5 ? 'MONITOR' : 'CONCERN';
                    const flagTint: 'mint' | 'butter' | 'peach' =
                      flag === 'OK' ? 'mint' : flag === 'MONITOR' ? 'butter' : 'peach';
                    const insight =
                      z >= 0.5
                        ? `Strong ${meta.label.toLowerCase()} skills. Above adult average.`
                        : z >= -0.5
                          ? `${meta.label} is within the normal range. Keep practicing!`
                          : z >= -1.5
                            ? `${meta.label} is below average. Targeted practice recommended.`
                            : `${meta.label} needs attention. Consider focused exercises.`;
                    return (
                      <GlassCard key={key} tint={flagTint} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon
                              className="w-4 h-4"
                              style={{ color: meta.color }}
                            />
                            <span
                              className="font-display font-bold text-xs"
                              style={{ color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <span
                            className="text-xs font-display font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: 'rgba(255,255,255,0.2)',
                              border: '1px solid rgba(255,255,255,0.3)',
                            }}
                          >
                            {flag}
                          </span>
                        </div>
                        <p
                          className="text-sm ink-deep leading-relaxed"
                          style={{
                            textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                          }}
                        >
                          {insight}
                        </p>
                      </GlassCard>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}

        {/* ── Footer ── */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p
            className="text-sm font-display"
            style={{
              color: 'rgba(255,255,255,0.6)',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            Report Generated: {new Date().toLocaleDateString()} | Player:{' '}
            {state.mindlingName}'s Guardian
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            This is a screening tool, not a clinical diagnosis.
          </p>
        </motion.div>

        {/* ── Action buttons ── */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 pb-8"
        >
          <GlassButton
            tint="butter"
            size="lg"
            onClick={handlePlayAgain}
            className="rounded-full"
          >
            <span className="inline-flex items-center gap-2">
              <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
              Start New Journey
            </span>
          </GlassButton>

          {prediction && (
            <GlassButton
              tint="sky"
              size="lg"
              onClick={handleDownload}
              className="rounded-full"
            >
              <span className="inline-flex items-center gap-2">
                <Download className="w-5 h-5" strokeWidth={2.5} />
                Download Report
              </span>
            </GlassButton>
          )}
        </motion.div>
      </div>
    </div>
  );
}
