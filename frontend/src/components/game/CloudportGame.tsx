import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, Play, SkipForward, ArrowLeft } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/glass';

import { Firefly as FireflyComponent } from './Firefly';
import { SeedGem } from './SeedGem';
import { SceneBg } from './SceneBg';
import level1Bg from '@/assets/level1.png';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

let fireflyIdCounter = 0;

interface FireflyData {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
}

interface CatchPopup {
  id: number;
  x: number;
  y: number;
}

export function CloudportGame() {
  const { state, dispatch } = useGame();
  const { playCollect, playSuccess, playSwoosh } = useSoundEffects();
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(45);
  const [fireflies, setFireflies] = useState<FireflyData[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [mindlingState, setMindlingState] = useState<'idle' | 'happy' | 'sad'>('idle');
  const [showReward, setShowReward] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [catchPopups, setCatchPopups] = useState<CatchPopup[]>([]);
  const [streak, setStreak] = useState(0);

  const TARGET_CATCHES = 10;
  const mindlingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caughtIdsRef = useRef<Set<number>>(new Set());
  const popupIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (mindlingTimeoutRef.current) clearTimeout(mindlingTimeoutRef.current);
    };
  }, []);

  // Spawn fireflies
  useEffect(() => {
    if (gameOver || isPaused || score >= TARGET_CATCHES) return;

    const spawnFirefly = () => {
      const newFirefly: FireflyData = {
        id: ++fireflyIdCounter,
        x: 8 + Math.random() * 75,
        y: 15 + Math.random() * 55,
        spawnTime: Date.now(),
      };
      setFireflies(prev => [...prev.slice(-3), newFirefly]);
    };

    const interval = setInterval(spawnFirefly, 1500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [gameOver, isPaused, score]);

  // Timer
  useEffect(() => {
    if (gameOver || isPaused) return;

    const timer = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isPaused]);

  // Auto-remove fireflies that weren't caught
  useEffect(() => {
    if (gameOver || isPaused) return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      setFireflies(prev => {
        const toRemove = prev.filter(f => now - f.spawnTime > 3500);
        if (toRemove.length > 0) {
          setMisses(m => m + toRemove.length);
          setStreak(0);
          setMindlingState('sad');
          setTimeout(() => setMindlingState('idle'), 500);
        }
        return prev.filter(f => now - f.spawnTime <= 3500);
      });
    }, 100);

    return () => clearInterval(cleanup);
  }, [gameOver, isPaused]);

  // Check for win
  useEffect(() => {
    if (score >= TARGET_CATCHES && !gameOver) {
      setGameOver(true);
      setShowReward(true);
      playSuccess();
    }
  }, [score, gameOver]);

  const catchFirefly = useCallback((firefly: FireflyData) => {
    if (caughtIdsRef.current.has(firefly.id)) return;
    caughtIdsRef.current.add(firefly.id);

    const reactionTime = Date.now() - firefly.spawnTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setScore(prev => prev + 1);
    setStreak(prev => prev + 1);
    setFireflies(prev => prev.filter(f => f.id !== firefly.id));
    playCollect();

    // Catch popup
    const popupId = ++popupIdRef.current;
    setCatchPopups(prev => [...prev, { id: popupId, x: firefly.x, y: firefly.y }]);
    setTimeout(() => setCatchPopups(prev => prev.filter(p => p.id !== popupId)), 900);

    setMindlingState('happy');
    if (mindlingTimeoutRef.current) clearTimeout(mindlingTimeoutRef.current);
    mindlingTimeoutRef.current = setTimeout(() => setMindlingState('idle'), 600);
  }, [playCollect]);

  const handleComplete = () => {
    const avgReaction = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'cloudport',
      stats: {
        totalTime: 45 - time,
        avgReactionTime: avgReaction,
        catches: score,
        misses,
      },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'spark' });
    dispatch({ type: 'COMPLETE_ISLAND', island: 'cloudport' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const handleSkip = () => {
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'cloudport',
      stats: { totalTime: 30, avgReactionTime: 350, catches: 25, misses: 15 },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'spark' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const handleRetry = () => {
    setScore(0);
    setTime(45);
    setFireflies([]);
    setReactionTimes([]);
    setMisses(0);
    setGameOver(false);
    setStreak(0);
    setCatchPopups([]);
    caughtIdsRef.current.clear();
  };

  const progressPercent = Math.min((score / TARGET_CATCHES) * 100, 100);
  const isTimeLow = time <= 10;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Background ─────────────────────────────────────── */}
      <SceneBg src={level1Bg} />

      {/* ── HUD ────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-start justify-between px-3 md:px-5 pt-3 md:pt-4">
        {/* Left: spacer */}
        <div className="flex-1" />

        {/* Center: Pause + Timer + Skip */}
        <motion.div
          initial={{ y: -20, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="flex items-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPaused(!isPaused)}
            className="glass-button glass-tint-sky w-10 h-10 grid place-items-center ink-deep"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="relative z-10 w-4 h-4" strokeWidth={2.5} />
            ) : (
              <Pause className="relative z-10 w-4 h-4" strokeWidth={2.5} />
            )}
            <span className="specular-sweep" aria-hidden="true" />
          </motion.button>

          <GlassCard
            tint={isTimeLow ? 'peach' : 'butter'}
            className="px-5 py-2"
            style={{
              boxShadow: isTimeLow
                ? '0 0 20px hsla(0,80%,60%,0.4)'
                : 'var(--glass-glow-butter)',
              transition: 'box-shadow 0.5s ease',
            }}
          >
            <span
              className="font-display font-bold text-xl md:text-2xl ink-deep tabular-nums"
              style={{
                color: isTimeLow ? 'hsl(0,65%,45%)' : undefined,
                transition: 'color 0.5s ease',
              }}
            >
              {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </span>
          </GlassCard>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSkip}
            className="glass-button glass-tint-peach h-10 px-3 flex items-center gap-1.5 ink-deep"
          >
            <SkipForward className="relative z-10 w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="relative z-10 font-display font-bold text-xs">Skip</span>
            <span className="specular-sweep" aria-hidden="true" />
          </motion.button>
        </motion.div>

        {/* Right: Score + Progress */}
        <motion.div
          initial={{ y: -20, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="flex flex-col items-end gap-1.5"
        >
          <GlassCard tint="mint" className="px-4 py-2 flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="font-display font-bold text-lg ink-deep tabular-nums">
              {score}/{TARGET_CATCHES}
            </span>
          </GlassCard>

          {/* Progress bar */}
          <div
            className="w-28 md:w-36 h-2.5 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, hsl(48,100%,65%) 0%, hsl(40,100%,55%) 100%)',
                boxShadow: '0 0 8px hsla(48,100%,55%,0.5)',
              }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>

          {/* Streak indicator */}
          <AnimatePresence>
            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0, y: -5 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: 'hsla(280,80%,65%,0.8)',
                  boxShadow: '0 0 12px hsla(280,80%,55%,0.5)',
                }}
              >
                <span className="font-display font-bold text-[10px] text-white">
                  🔥 {streak}x streak!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Game area ──────────────────────────────────────── */}
      <div className="absolute inset-0 z-10">
        {/* Fireflies */}
        <AnimatePresence>
          {fireflies.map(firefly => (
            <FireflyComponent
              key={firefly.id}
              onClick={() => catchFirefly(firefly)}
              x={firefly.x}
              y={firefly.y}
            />
          ))}
        </AnimatePresence>

        {/* Catch popups (+1 floating up) */}
        <AnimatePresence>
          {catchPopups.map(popup => (
            <motion.div
              key={popup.id}
              initial={{ scale: 0.5, y: 0 }}
              animate={{ scale: 1, y: -50 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute pointer-events-none z-30"
              style={{
                left: `${popup.x}%`,
                top: `${popup.y}%`,
              }}
            >
              <span
                className="font-display font-bold text-xl md:text-2xl"
                style={{
                  color: 'hsl(48,100%,80%)',
                  textShadow:
                    '0 0 12px hsla(48,100%,55%,0.9), 0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                +1 ✨
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Mindling avatar (bottom-left) ──────────────────── */}
      {state.selectedMindling && (
        <div className="fixed bottom-4 left-4 z-20">
          <motion.div
            animate={
              mindlingState === 'happy'
                ? { y: [0, -20, 0], rotate: [0, 8, -8, 0] }
                : mindlingState === 'sad'
                  ? { x: [-4, 4, -4, 4, 0] }
                  : { y: [0, -4, 0] }
            }
            transition={{
              duration: mindlingState === 'idle' ? 2.5 : 0.5,
              repeat: mindlingState === 'idle' ? Infinity : 0,
            }}
            className="flex flex-col items-center"
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full grid place-items-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 60%, hsla(48,80%,80%,0.25) 100%)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '2px solid rgba(255,255,255,0.45)',
                boxShadow:
                  mindlingState === 'happy'
                    ? '0 0 0 2px hsla(48,90%,65%,0.8), 0 0 24px hsla(48,100%,55%,0.5)'
                    : '0 0 0 2px hsla(48,90%,65%,0.5), 0 0 14px hsla(48,100%,55%,0.25)',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <img
                src={mindlingImages[state.selectedMindling.type]}
                alt={state.selectedMindling.name}
                className="w-[80%] h-[80%] object-contain drop-shadow-[0_4px_8px_rgba(80,30,140,0.35)]"
              />
            </div>
            <div
              className="mt-1 px-2.5 py-0.5 rounded-full"
              style={{
                background: 'hsla(48,100%,82%,0.85)',
                border: '1px solid hsla(48,90%,65%,0.7)',
              }}
            >
              <span className="font-display font-bold text-[10px] ink-deep">
                {state.mindlingName}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Pause overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {isPaused && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(232,60%,15%,0.5), hsla(232,70%,8%,0.72))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
            onClick={() => setIsPaused(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard
                tint="lilac"
                shimmer
                className="px-10 py-8 text-center"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
              >
                <h2
                  className="game-title text-3xl md:text-4xl ink-deep mb-6"
                  style={{ textShadow: '0 2px 0 rgba(255,255,255,0.55)' }}
                >
                  Paused
                </h2>
                <GlassButton
                  tint="butter"
                  size="lg"
                  onClick={() => setIsPaused(false)}
                  className="rounded-full"
                >
                  Resume
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reward overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(48,60%,15%,0.45), hsla(232,70%,8%,0.7))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="w-full max-w-md"
            >
              <GlassCard
                tint="butter"
                shimmer
                className="p-8 md:p-10 text-center"
                style={{ boxShadow: 'var(--glass-glow-butter)' }}
              >
                <motion.h2
                  className="game-title text-3xl md:text-4xl ink-deep mb-2"
                  style={{
                    textShadow:
                      '0 2px 0 rgba(255,255,255,0.6), 0 6px 18px hsla(48,100%,50%,0.35)',
                  }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: 2, duration: 0.35 }}
                >
                  Level Complete!
                </motion.h2>

                <p className="font-display font-semibold text-sm ink-soft mb-5">
                  You caught {score} fireflies in {45 - time}s
                </p>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 16 }}
                  className="flex justify-center mb-5"
                >
                  <SeedGem type="spark" size={80} animate />
                </motion.div>

                <GlassCard tint="sky" className="px-4 py-2 mb-5 inline-block">
                  <span className="font-display font-bold text-sm ink-deep">
                    🌱 Spark Seed collected! (1/4)
                  </span>
                </GlassCard>

                {state.selectedMindling && (
                  <motion.div
                    initial={{ y: 16 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="flex items-center justify-center gap-3 mb-6"
                  >
                    <img
                      src={mindlingImages[state.selectedMindling.type]}
                      alt={state.selectedMindling.name}
                      className="w-14 h-14 object-contain drop-shadow-[0_6px_12px_rgba(80,30,140,0.4)]"
                    />
                    <GlassCard tint="mint" className="px-4 py-2 rounded-2xl">
                      <p className="font-display font-semibold text-sm ink-deep">
                        Yay! We got it! 🎉
                      </p>
                    </GlassCard>
                  </motion.div>
                )}

                <GlassButton
                  tint="butter"
                  size="xl"
                  onClick={handleComplete}
                  className="rounded-full"
                >
                  Next Level →
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Game Over (failed) ─────────────────────────────── */}
      <AnimatePresence>
        {gameOver && !showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(232,60%,15%,0.5), hsla(232,70%,8%,0.72))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm"
            >
              <GlassCard
                tint="lilac"
                shimmer
                className="p-8 text-center"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
              >
                <h2
                  className="game-title text-3xl ink-deep mb-2"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.55)' }}
                >
                  Time's Up!
                </h2>
                <p className="font-body text-base ink-soft mb-6">
                  You caught <span className="font-bold ink-deep">{score}</span> fireflies.
                  Try again?
                </p>
                <div className="flex gap-3 justify-center">
                  <GlassButton
                    tint="butter"
                    size="lg"
                    onClick={handleRetry}
                    className="rounded-full"
                  >
                    Try Again
                  </GlassButton>
                  <GlassButton
                    tint="sky"
                    size="lg"
                    onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
                    className="rounded-full"
                  >
                    Back to Map
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
