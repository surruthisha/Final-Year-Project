import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { IslandType, ISLANDS } from '@/types/game';
import { Lock, Sparkles } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { SeedGem } from './SeedGem';
import { SceneBg } from './SceneBg';

import worldMapPng from '@/assets/world map.png';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

// Positions tuned to the world-map illustration landmarks
const islandPos: Record<IslandType, { x: number; y: number }> = {
  'cloudport':   { x: 22, y: 30 },   // castle / rainbow area (top-left)
  'star-bridge': { x: 52, y: 25 },   // mountains (top-center)
  'hidden-reef': { x: 35, y: 58 },   // coastal village (center-left)
  'echo-bay':    { x: 70, y: 44 },   // waterfall area (center-right)
  'heart-isle':  { x: 78, y: 72 },   // small island (bottom-right)
};

// Path connections between islands in order
const PATH_CONNECTIONS: [IslandType, IslandType][] = [
  ['cloudport', 'star-bridge'],
  ['star-bridge', 'hidden-reef'],
  ['hidden-reef', 'echo-bay'],
  ['echo-bay', 'heart-isle'],
];

// Which seed unlocks the glow for each path segment
const PATH_SEED: Record<string, 'spark' | 'logic' | 'memory' | 'harmony'> = {
  'cloudport->star-bridge': 'spark',
  'star-bridge->hidden-reef': 'logic',
  'hidden-reef->echo-bay': 'memory',
  'echo-bay->heart-isle': 'harmony',
};

// Per-island glass tint + hue for glow ring
const ISLAND_STYLE: Record<IslandType, { hue: number; tint: string; icon: string }> = {
  'cloudport':   { hue: 200, tint: 'sky',   icon: '☁️' },
  'star-bridge': { hue: 230, tint: 'lilac', icon: '⭐' },
  'hidden-reef': { hue: 170, tint: 'mint',  icon: '🫧' },
  'echo-bay':    { hue: 282, tint: 'lilac', icon: '🔮' },
  'heart-isle':  { hue: 340, tint: 'peach', icon: '💖' },
};

export function WorldMap() {
  const { state, dispatch, seedCount } = useGame();
  const { playClick, playSwoosh } = useSoundEffects();

  const handleIslandClick = (islandId: IslandType) => {
    if (!state.unlockedIslands.includes(islandId)) return;
    playSwoosh();
    dispatch({ type: 'SET_CURRENT_ISLAND', island: islandId });
    dispatch({ type: 'SET_SCREEN', screen: 'level-intro' });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── World map background ───────────────────────────── */}
      <SceneBg src={worldMapPng} />

      {/* Soft vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 40%, hsla(220,60%,10%,0.25) 100%)',
        }}
      />

      {/* ── SVG connection lines ───────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
        <defs>
          <filter id="wm-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base dotted lines */}
        {PATH_CONNECTIONS.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            x1={`${islandPos[from].x}%`}
            y1={`${islandPos[from].y}%`}
            x2={`${islandPos[to].x}%`}
            y2={`${islandPos[to].y}%`}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="3"
            strokeDasharray="8,6"
            strokeLinecap="round"
          />
        ))}

        {/* Glow lines for completed paths */}
        {PATH_CONNECTIONS.map(([from, to], i) => {
          const key = `${from}->${to}`;
          const seed = PATH_SEED[key];
          const isActive = seed
            ? state.seeds[seed]
            : state.seeds.spark && state.seeds.logic && state.seeds.harmony;
          if (!isActive) return null;
          return (
            <motion.line
              key={`glow-${from}-${to}`}
              x1={`${islandPos[from].x}%`}
              y1={`${islandPos[from].y}%`}
              x2={`${islandPos[to].x}%`}
              y2={`${islandPos[to].y}%`}
              stroke="hsla(48,100%,72%,0.85)"
              strokeWidth="4"
              strokeDasharray="8,6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: i * 0.3 }}
              filter="url(#wm-glow)"
            />
          );
        })}
      </svg>

      {/* ── Header bar ─────────────────────────────────────── */}
      <div className="relative z-10 flex items-start justify-center px-4 md:px-6 pt-4 md:pt-5">
        {/* Title plaque — centered */}
        <motion.div
          initial={{ y: -20, scale: 0.94 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
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
              World Map
            </h1>
          </GlassCard>
        </motion.div>

        {/* Seed bag — pinned to top-right */}
        <motion.div
          initial={{ y: -20, scale: 0.94 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
          className="absolute right-4 md:right-6 top-4 md:top-5"
        >
          <GlassCard tint="sky" className="px-4 md:px-5 py-2 md:py-2.5 flex items-center gap-2">
            <div className="flex -space-x-1">
              {state.seeds.spark && <SeedGem type="spark" size={22} animate={false} />}
              {state.seeds.logic && <SeedGem type="logic" size={22} animate={false} />}
              {state.seeds.memory && <SeedGem type="memory" size={22} animate={false} />}
              {state.seeds.harmony && <SeedGem type="harmony" size={22} animate={false} />}
            </div>
            <span className="font-display font-bold text-base md:text-lg ink-deep">
              {seedCount}/4
            </span>
            <Sparkles className="w-4 h-4 ink-deep" strokeWidth={2.4} />
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Island nodes ───────────────────────────────────── */}
      <div className="absolute inset-0 z-10">
        {ISLANDS.map((island, index) => {
          const isUnlocked = state.unlockedIslands.includes(island.id);
          const isProperlyCompleted = state.completedIslands.includes(island.id);
          const hasSeed = island.seedType ? state.seeds[island.seedType] : false;
          const isCompleted = hasSeed || isProperlyCompleted;
          const pos = islandPos[island.id];
          const style = ISLAND_STYLE[island.id];

          return (
            <div
              key={island.id}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translateX(-50%)',
                marginTop: '-1.5rem',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.3 + index * 0.12,
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <motion.button
                  onClick={() => handleIslandClick(island.id)}
                  disabled={!isUnlocked}
                  whileHover={isUnlocked ? { scale: 1.12, y: -4 } : {}}
                  whileTap={isUnlocked ? { scale: 0.92 } : {}}
                  className="relative flex flex-col items-center group"
                  style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                >
                  {/* Pulsing glow ring behind (unlocked only) */}
                  {isUnlocked && (
                    <div
                      className="absolute w-[4.5rem] h-[4.5rem] md:w-[6rem] md:h-[6rem] rounded-full island-pulse"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle, hsla(${style.hue},80%,65%,0.35) 0%, transparent 70%)`,
                        ['--pulse-hue' as never]: style.hue,
                      }}
                    />
                  )}

                  {/* Island node circle */}
                  <div
                    className="relative w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] rounded-full grid place-items-center"
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 50%, hsla(${style.hue},70%,80%,0.35) 100%)`
                        : 'linear-gradient(135deg, rgba(180,180,190,0.4) 0%, rgba(150,150,160,0.25) 100%)',
                      backdropFilter: 'blur(16px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                      border: isProperlyCompleted
                        ? `2.5px solid hsla(140,65%,50%,0.9)`
                        : isCompleted
                          ? `2.5px solid hsla(48,100%,65%,0.9)`
                          : isUnlocked
                            ? `2px solid rgba(255,255,255,0.55)`
                            : '2px solid rgba(200,200,210,0.35)',
                      boxShadow: isProperlyCompleted
                        ? `0 0 0 2px hsla(140,60%,45%,0.5), 0 0 20px hsla(140,65%,50%,0.4), 0 8px 24px -6px hsla(232,60%,18%,0.3)`
                        : isCompleted
                          ? `0 0 0 2px hsla(48,90%,60%,0.5), 0 0 20px hsla(48,100%,55%,0.4), 0 8px 24px -6px hsla(232,60%,18%,0.3)`
                          : isUnlocked
                            ? `0 0 18px hsla(${style.hue},80%,60%,0.3), inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 24px -6px hsla(232,60%,18%,0.3)`
                            : '0 4px 12px -4px hsla(232,60%,18%,0.2)',
                      filter: isUnlocked ? 'none' : 'grayscale(0.6)',
                      transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
                    }}
                  >
                    {!isUnlocked ? (
                      <Lock className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'hsl(232,30%,55%)' }} strokeWidth={2.5} />
                    ) : isProperlyCompleted ? (
                      <span className="text-xl md:text-2xl">✅</span>
                    ) : isCompleted ? (
                      <span className="text-xl md:text-2xl">✨</span>
                    ) : (
                      <span className="text-xl md:text-2xl">{style.icon}</span>
                    )}
                  </div>

                  {/* Island name label */}
                  <div
                    className="mt-1.5 px-3 py-1 rounded-full whitespace-nowrap"
                    style={{
                      background: isUnlocked
                        ? 'rgba(255,255,255,0.55)'
                        : 'rgba(200,200,210,0.4)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 4px 12px -4px hsla(232,60%,18%,0.2)',
                    }}
                  >
                    <span
                      className="font-display font-bold text-xs md:text-sm"
                      style={{
                        color: isUnlocked ? 'hsl(232,50%,22%)' : 'hsl(232,20%,50%)',
                        textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                      }}
                    >
                      {island.name}
                    </span>
                    {!isUnlocked && (
                      <span className="ml-1 text-[10px]" style={{ color: 'hsl(232,20%,55%)' }}>
                        🔒
                      </span>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* ── Mindling avatar (bottom-left) ──────────────────── */}
      {state.selectedMindling && (
        <div className="fixed bottom-5 left-5 z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <div
              className="relative w-16 h-16 md:w-20 md:h-20 rounded-full grid place-items-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.18) 60%, hsla(48,80%,80%,0.3) 100%)',
                backdropFilter: 'blur(20px) saturate(170%)',
                WebkitBackdropFilter: 'blur(20px) saturate(170%)',
                border: '2px solid rgba(255,255,255,0.5)',
                boxShadow:
                  '0 0 0 2px hsla(48,90%,65%,0.6), 0 0 20px hsla(48,100%,55%,0.35), 0 12px 28px -8px hsla(232,60%,18%,0.3)',
              }}
            >
              <img
                src={mindlingImages[state.selectedMindling.type]}
                alt={state.selectedMindling.name}
                className="w-[80%] h-[80%] object-contain drop-shadow-[0_4px_8px_rgba(80,30,140,0.35)] float-animation"
              />
            </div>

            <div
              className="mt-1 px-3 py-0.5 rounded-full"
              style={{
                background: 'hsla(48,100%,82%,0.85)',
                border: '1px solid hsla(48,90%,65%,0.7)',
                boxShadow: '0 4px 12px hsla(48,100%,55%,0.3)',
              }}
            >
              <span className="font-display font-bold text-xs ink-deep">
                {state.mindlingName}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
