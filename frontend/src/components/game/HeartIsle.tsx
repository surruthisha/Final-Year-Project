import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { SkipForward } from 'lucide-react';
import { SeedGem } from './SeedGem';
import { GlassCard, GlassButton } from '@/components/ui/glass';

import heartIsleBg from '@/assets/heart-isle-bg.jpg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

const SEED_TYPES: Array<'spark' | 'logic' | 'memory' | 'harmony'> = [
  'spark',
  'logic',
  'memory',
  'harmony',
];

const SEED_LABELS: Record<string, string> = {
  spark: 'Spark',
  logic: 'Logic',
  memory: 'Memory',
  harmony: 'Harmony',
};

/* Floating sparkle particles */
const FloatingSparkles = ({ active }: { active: boolean }) => {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 4,
        hue: [45, 210, 160, 280][i % 4],
        delay: Math.random() * 3,
        dur: 2.5 + Math.random() * 2.5,
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: `hsl(${s.hue}, 80%, 65%)`,
            boxShadow: `0 0 6px hsla(${s.hue}, 80%, 65%, 0.6)`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1.3, 0.5],
            y: [0, -30, 0],
          }}
          transition={{
            duration: s.dur,
            repeat: Infinity,
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
};

export function HeartIsle() {
  const { state, dispatch } = useGame();
  const { playCollect, playSuccess, playSwoosh } = useSoundEffects();
  const [phase, setPhase] = useState<'intro' | 'planting' | 'growing' | 'evolved' | 'complete'>(
    'intro'
  );
  const [plantedSeeds, setPlantedSeeds] = useState<string[]>([]);
  const [treeSize, setTreeSize] = useState(0);

  useEffect(() => {
    if (phase === 'intro') {
      setTimeout(() => setPhase('planting'), 2000);
    }
  }, [phase]);

  // Transition to growing when all 4 seeds are planted
  useEffect(() => {
    if (plantedSeeds.length === 4 && phase === 'planting') {
      setPhase('growing');
    }
  }, [plantedSeeds, phase]);

  // Run growth animation when phase becomes 'growing'
  useEffect(() => {
    if (phase !== 'growing') return;
    let size = 0;
    const growInterval = setInterval(() => {
      size += 10;
      setTreeSize(size);
      if (size >= 100) {
        clearInterval(growInterval);
        setTimeout(() => {
          dispatch({ type: 'EVOLVE_MINDLING' });
          setPhase('evolved');
        }, 1000);
      }
    }, 100);
    return () => clearInterval(growInterval);
  }, [phase, dispatch]);

  const handlePlantSeed = (seedType: string) => {
    if (!plantedSeeds.includes(seedType)) {
      playCollect();
      setPlantedSeeds([...plantedSeeds, seedType]);
    }
  };

  const handleComplete = () => {
    playSwoosh();
    dispatch({ type: 'SET_SCREEN', screen: 'report' });
  };

  const handleSkip = () => {
    dispatch({ type: 'EVOLVE_MINDLING' });
    dispatch({ type: 'SET_SCREEN', screen: 'report' });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src={heartIsleBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-all duration-1000"
        style={{
          filter:
            phase === 'evolved' || phase === 'complete'
              ? 'brightness(1.15) saturate(1.25)'
              : 'none',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(0deg, hsla(140,30%,10%,0.3) 0%, transparent 40%, transparent 75%, hsla(280,30%,12%,0.15) 100%)',
        }}
      />

      {/* Floating sparkles */}
      <FloatingSparkles active={phase === 'evolved' || phase === 'complete' || phase === 'growing'} />

      {/* ── HUD ── */}
      <div className="relative z-20 flex items-start justify-between px-4 md:px-6 pt-4 md:pt-5">
        {/* Left spacer */}
        <div className="flex-1" />

        {/* Center title */}
        <motion.div
          initial={{ y: -20, scale: 0.94 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <GlassCard
            tint="butter"
            shimmer
            className="px-8 md:px-12 py-2.5 md:py-3"
            style={{ boxShadow: 'var(--glass-glow-butter)' }}
          >
            <h1
              className="game-title text-xl md:text-3xl ink-deep leading-tight"
              style={{
                textShadow:
                  '0 2px 0 rgba(255,255,255,0.6), 0 6px 16px hsla(48,100%,50%,0.35)',
              }}
            >
              The Garden
            </h1>
          </GlassCard>
        </motion.div>

        {/* Right: Skip */}
        <div className="flex-1 flex justify-end">
          <motion.button
            initial={{ y: -20, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSkip}
            className="glass-button glass-tint-peach w-11 h-11 grid place-items-center ink-deep"
            aria-label="Skip"
          >
            <SkipForward className="relative z-10 w-5 h-5" strokeWidth={2.5} />
            <span className="specular-sweep" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      {/* ── Growing subtitle ── */}
      <AnimatePresence>
        {phase === 'growing' && (
          <motion.div
            initial={{ y: -12, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.95 }}
            className="absolute z-20 left-0 right-0 top-[70px] md:top-[76px] flex justify-center pointer-events-none"
          >
            <GlassCard tint="mint" shimmer className="px-6 py-2 rounded-full">
              <span className="font-display font-bold text-base ink-deep">
                The Memory Tree is growing!
              </span>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Intro phase */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md mx-4"
            >
              <GlassCard
                tint="lilac"
                shimmer
                className="p-8 md:p-10 text-center"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
              >
                <h2
                  className="game-title text-2xl md:text-3xl ink-deep mb-3"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                >
                  Welcome to Heart Isle
                </h2>
                <p className="font-body text-base ink-soft leading-relaxed">
                  Plant your seeds to grow the Memory Tree!
                </p>

                {/* Seed preview row */}
                <div className="flex justify-center gap-3 mt-5">
                  {SEED_TYPES.map((type, i) => (
                    <motion.div
                      key={type}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.12, type: 'spring' }}
                    >
                      <SeedGem type={type} size={40} animate={true} />
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Planting phase */}
          {phase === 'planting' && (
            <motion.div
              key="planting"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Planting area */}
              <div className="relative w-64 h-36 mb-6 flex items-end justify-center">
                {/* Planted seeds landing area */}
                <div className="flex gap-3 mb-6">
                  {plantedSeeds.map((seedType) => (
                    <motion.div
                      key={seedType}
                      initial={{ y: -80, scale: 0.3 }}
                      animate={{ y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <SeedGem
                        type={seedType as 'spark' | 'logic' | 'memory' | 'harmony'}
                        size={44}
                        animate={false}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Ground mound */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-6 rounded-full blur-sm"
                  style={{
                    background:
                      'radial-gradient(ellipse, hsla(30, 40%, 40%, 0.6) 0%, transparent 70%)',
                  }}
                />
              </div>

              {/* Seeds to plant */}
              <div className="flex gap-4 md:gap-5 mb-6">
                {SEED_TYPES.map((type) => {
                  const isPlanted = plantedSeeds.includes(type);

                  return (
                    <motion.button
                      key={type}
                      onClick={() => handlePlantSeed(type)}
                      disabled={isPlanted}
                      whileHover={!isPlanted ? { scale: 1.12, y: -6 } : {}}
                      whileTap={!isPlanted ? { scale: 0.9 } : {}}
                      className="relative flex flex-col items-center gap-1.5"
                      style={{
                        opacity: isPlanted ? 0.3 : 1,
                        cursor: isPlanted ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div
                        className="relative rounded-2xl p-3"
                        style={{
                          background: isPlanted
                            ? 'transparent'
                            : 'rgba(255,255,255,0.08)',
                          backdropFilter: isPlanted ? 'none' : 'blur(8px)',
                          border: isPlanted
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <SeedGem type={type} size={64} animate={!isPlanted} />

                        {isPlanted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div
                              className="w-8 h-8 rounded-full grid place-items-center"
                              style={{
                                background:
                                  'linear-gradient(135deg, hsl(140,65%,50%), hsl(160,60%,45%))',
                                boxShadow: '0 0 10px hsla(140,65%,50%,0.5)',
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                  d="M3 8L7 12L13 4"
                                  stroke="white"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <span
                        className="font-display font-bold text-xs"
                        style={{
                          color: 'rgba(255,255,255,0.85)',
                          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        }}
                      >
                        {SEED_LABELS[type]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Planting progress */}
              <GlassCard tint="mint" shimmer className="px-6 py-2.5 rounded-full">
                <span className="font-display font-bold text-base ink-deep">
                  Tap to plant! ({plantedSeeds.length}/4)
                </span>
              </GlassCard>
            </motion.div>
          )}

          {/* Growing phase */}
          {phase === 'growing' && (
            <motion.div
              key="growing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Growing glow */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: treeSize / 100 }}
                className="w-48 h-48 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, hsla(45, 100%, 60%, 0.5) 0%, hsla(280, 60%, 60%, 0.2) 50%, transparent 70%)',
                }}
              />

              {/* Rising sparkles during growth */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background:
                      i % 4 === 0
                        ? 'hsl(45, 100%, 65%)'
                        : i % 4 === 1
                          ? 'hsl(210, 80%, 65%)'
                          : i % 4 === 2
                            ? 'hsl(160, 70%, 55%)'
                            : 'hsl(280, 60%, 65%)',
                    left: `${30 + Math.random() * 40}%`,
                    bottom: '30%',
                    boxShadow: `0 0 6px currentColor`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -80 - Math.random() * 60],
                    x: [0, (Math.random() - 0.5) * 60],
                    scale: [0.5, 1.2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                />
              ))}

              {/* Growth progress bar */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <GlassCard tint="butter" className="px-5 py-2.5 flex items-center gap-3">
                  <span className="font-display font-bold text-sm ink-deep">Growing</span>
                  <div
                    className="w-32 h-3 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.35)',
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          'linear-gradient(90deg, hsl(140,60%,50%), hsl(48,100%,60%))',
                        width: `${treeSize}%`,
                      }}
                    />
                  </div>
                  <span className="font-display font-bold text-sm ink-deep">{treeSize}%</span>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}

          {/* Evolved phase */}
          {(phase === 'evolved' || phase === 'complete') && state.selectedMindling && (
            <motion.div
              key="evolved"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="flex flex-col items-center"
            >
              {/* Mindling scene */}
              <div className="relative flex flex-col items-center">
                {/* Large ambient glow */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -top-16 w-72 h-72 md:w-96 md:h-96 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, hsla(45, 100%, 60%, 0.35) 0%, hsla(280, 60%, 60%, 0.15) 40%, transparent 70%)',
                  }}
                />

                {/* Mindling */}
                <motion.div
                  initial={{ scale: 0, y: 80 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 80 }}
                  className="relative z-10"
                >
                  {/* SVG crown */}
                  <motion.svg
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-10"
                    viewBox="0 0 40 32"
                    fill="none"
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    <path
                      d="M4 28L2 8L12 16L20 4L28 16L38 8L36 28Z"
                      fill="hsl(45, 100%, 55%)"
                      stroke="hsl(40, 90%, 45%)"
                      strokeWidth="1.5"
                    />
                    <circle cx="12" cy="14" r="2" fill="hsl(0, 80%, 60%)" />
                    <circle cx="20" cy="6" r="2.5" fill="hsl(210, 80%, 55%)" />
                    <circle cx="28" cy="14" r="2" fill="hsl(280, 60%, 60%)" />
                  </motion.svg>

                  {/* Wings */}
                  <motion.svg
                    className="absolute -left-14 top-6 w-14 h-20 -z-10"
                    viewBox="0 0 40 56"
                    fill="none"
                    animate={{ rotate: [-8, 8, -8] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <path
                      d="M38 28C38 12 28 2 10 2C6 10 4 20 8 28C12 36 20 42 38 28Z"
                      fill="hsla(45, 100%, 70%, 0.5)"
                      stroke="hsla(45, 100%, 60%, 0.6)"
                      strokeWidth="1"
                    />
                    <path
                      d="M36 30C30 40 20 48 10 52C14 42 16 34 36 30Z"
                      fill="hsla(280, 60%, 70%, 0.4)"
                      stroke="hsla(280, 60%, 60%, 0.5)"
                      strokeWidth="1"
                    />
                  </motion.svg>
                  <motion.svg
                    className="absolute -right-14 top-6 w-14 h-20 -z-10 scale-x-[-1]"
                    viewBox="0 0 40 56"
                    fill="none"
                    animate={{ rotate: [8, -8, 8] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <path
                      d="M38 28C38 12 28 2 10 2C6 10 4 20 8 28C12 36 20 42 38 28Z"
                      fill="hsla(45, 100%, 70%, 0.5)"
                      stroke="hsla(45, 100%, 60%, 0.6)"
                      strokeWidth="1"
                    />
                    <path
                      d="M36 30C30 40 20 48 10 52C14 42 16 34 36 30Z"
                      fill="hsla(280, 60%, 70%, 0.4)"
                      stroke="hsla(280, 60%, 60%, 0.5)"
                      strokeWidth="1"
                    />
                  </motion.svg>

                  {/* Mindling image */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <img
                      src={mindlingImages[state.selectedMindling.type]}
                      alt={state.selectedMindling.name}
                      className="w-40 h-40 md:w-52 md:h-52 object-contain"
                      style={{
                        filter:
                          'drop-shadow(0 8px 24px hsla(45, 100%, 60%, 0.5)) drop-shadow(0 2px 4px hsla(0,0%,0%,0.3))',
                      }}
                    />
                  </motion.div>

                  {/* Ground shadow */}
                  <div
                    className="mx-auto -mt-4 w-36 md:w-44 h-6 rounded-[50%] blur-md"
                    style={{
                      background:
                        'radial-gradient(ellipse, hsla(0,0%,0%,0.35) 0%, transparent 70%)',
                    }}
                  />
                </motion.div>

                {/* Seed gems at base */}
                <motion.div
                  className="flex gap-3 mt-2"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  {SEED_TYPES.map((type, i) => (
                    <motion.div
                      key={type}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.12, type: 'spring' }}
                    >
                      <SeedGem type={type} size={32} animate={true} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Speech bubble */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2, type: 'spring', stiffness: 200, damping: 18 }}
                className="mt-6"
              >
                <GlassCard
                  tint="bubble"
                  shimmer
                  className="px-6 py-4 text-center max-w-sm"
                  style={{ boxShadow: 'var(--glass-glow-bubble)' }}
                >
                  <p className="font-display text-lg ink-deep leading-relaxed">
                    "Yippee! I remember! My name is{' '}
                    <strong>{state.mindlingName}</strong> and we did it!"
                  </p>
                </GlassCard>
              </motion.div>

              {/* Thank you + button */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 2.5 }}
                className="mt-5 flex flex-col items-center gap-4"
              >
                <p
                  className="font-display font-bold text-lg"
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  Thank you for helping me grow!
                </p>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 3, type: 'spring' }}
                >
                  <GlassButton
                    tint="butter"
                    size="xl"
                    onClick={handleComplete}
                    className="rounded-full"
                  >
                    <span className="inline-flex items-center gap-2">
                      See Your Journey Report
                      <span className="text-lg">→</span>
                    </span>
                  </GlassButton>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
