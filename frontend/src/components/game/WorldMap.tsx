import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { IslandType, ISLANDS } from '@/types/game';
import { Lock, Sparkles } from 'lucide-react';
import floatingIslandsBg from '@/assets/floating-islands-bg.jpg';

import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

import { SeedGem } from './SeedGem';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

// Single source of truth for island positions (numeric for both CSS and SVG)
const islandPos: Record<IslandType, { x: number; y: number }> = {
  'cloudport': { x: 20, y: 18 },
  'star-bridge': { x: 70, y: 22 },
  'hidden-reef': { x: 50, y: 42 },
  'echo-bay': { x: 25, y: 62 },
  'heart-isle': { x: 70, y: 72 },
};

// Path connections between islands in order
const PATH_CONNECTIONS: [IslandType, IslandType][] = [
  ['cloudport', 'star-bridge'],
  ['star-bridge', 'hidden-reef'],
  ['hidden-reef', 'echo-bay'],
  ['echo-bay', 'heart-isle'],
];

// Which seed unlocks the glow for each path segment (seed earned at the "from" island)
const PATH_SEED: Record<string, 'spark' | 'logic' | 'harmony'> = {
  'cloudport->star-bridge': 'spark',
  'star-bridge->hidden-reef': 'logic',
  'hidden-reef->echo-bay': 'harmony',
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

  const getIslandColor = (islandId: IslandType) => {
    switch (islandId) {
      case 'cloudport': return 'from-sky-medium to-sky-light';
      case 'star-bridge': return 'from-seed-logic to-blue-400';
      case 'hidden-reef': return 'from-cyan-400 to-teal-500';
      case 'echo-bay': return 'from-seed-harmony to-purple-400';
      case 'heart-isle': return 'from-seed-spark to-amber-300';
      default: return 'from-muted to-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${floatingIslandsBg})` }}
      />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, hsla(209,60%,18%,0.25) 0%, transparent 30%, transparent 65%, hsla(209,65%,15%,0.4) 100%)',
      }} />

      {/* Header */}
      <div className="relative z-10 flex items-center p-4 md:p-6">
        <div className="flex-1" />

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="game-title text-2xl md:text-4xl drop-shadow-lg"
          style={{ color: 'hsl(42 90% 72%)', textShadow: '0 2px 12px hsl(209 90% 15% / 0.6)' }}
        >
          WORLD MAP
        </motion.h1>

        {/* Seed Bag */}
        <div className="flex-1 flex justify-end">
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-game shadow-soft"
            style={{
              background: 'hsl(210 31% 76% / 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid hsl(210 30% 68% / 0.5)',
            }}
            animate={{ scale: seedCount > 0 ? [1, 1.1, 1] : 1 }}
          >
            <div className="flex -space-x-1">
              {state.seeds.spark && <SeedGem type="spark" size={22} animate={false} />}
              {state.seeds.logic && <SeedGem type="logic" size={22} animate={false} />}
              {state.seeds.harmony && <SeedGem type="harmony" size={22} animate={false} />}
            </div>
            <span className="font-display font-bold text-lg text-foreground">{seedCount}/3 Seeds</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
        </div>
      </div>

      {/* Islands */}
      <div className="relative z-10 w-full h-[calc(100vh-80px)]">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="lineGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base dotted lines between islands */}
          {PATH_CONNECTIONS.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={`${islandPos[from].x}%`} y1={`${islandPos[from].y}%`}
              x2={`${islandPos[to].x}%`} y2={`${islandPos[to].y}%`}
              stroke="url(#lineGradient)" strokeWidth="3" strokeDasharray="10,5"
            />
          ))}

          {/* Animated glow lines for completed paths */}
          {PATH_CONNECTIONS.map(([from, to], i) => {
            const key = `${from}->${to}`;
            const seed = PATH_SEED[key];
            // Last path (echo-bay -> heart-isle) glows when all 3 seeds collected
            const isActive = seed ? state.seeds[seed] : (state.seeds.spark && state.seeds.logic && state.seeds.harmony);
            if (!isActive) return null;
            return (
              <motion.line
                key={`glow-${from}-${to}`}
                x1={`${islandPos[from].x}%`} y1={`${islandPos[from].y}%`}
                x2={`${islandPos[to].x}%`} y2={`${islandPos[to].y}%`}
                stroke="url(#lineGradientActive)" strokeWidth="4" strokeDasharray="10,5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0.4, 1, 0.4] }}
                transition={{
                  pathLength: { duration: 1.5, ease: "easeInOut", delay: i * 0.3 },
                  opacity: { duration: 2, repeat: Infinity },
                }}
                filter="url(#glow)"
              />
            );
          })}
        </svg>

        {ISLANDS.map((island, index) => {
          const isUnlocked = state.unlockedIslands.includes(island.id);
          const isCompleted = island.seedType ? state.seeds[island.seedType] : false;
          const pos = islandPos[island.id];

          return (
            <div
              key={island.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-10 md:-translate-y-14"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, type: "spring" }}
              >
                <motion.button
                  onClick={() => handleIslandClick(island.id)}
                  disabled={!isUnlocked}
                  whileHover={isUnlocked ? { scale: 1.1, y: -5 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  animate={isUnlocked ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`
                    relative flex flex-col items-center
                    ${!isUnlocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                  `}
                >
                {/* Island shape */}
                <div className={`
                  w-20 h-20 md:w-28 md:h-28 rounded-full 
                  bg-gradient-to-br ${getIslandColor(island.id)}
                  shadow-float flex items-center justify-center
                  border-4 ${isCompleted ? 'border-primary' : 'border-card/50'}
                  ${isUnlocked ? '' : 'grayscale'}
                `}>
                  {!isUnlocked ? (
                    <Lock className="w-8 h-8 text-foreground/60" />
                  ) : isCompleted ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <div className="w-3 h-3 bg-card rounded-full" />
                  )}
                </div>

                {/* Island name */}
                <div className={`
                  mt-2 px-3 py-1 rounded-lg font-display text-sm md:text-base
                  ${isUnlocked ? 'bg-card text-foreground' : 'bg-muted text-muted-foreground'}
                  shadow-soft whitespace-nowrap
                `}>
                  {island.name}
                  {!isUnlocked && <span className="ml-1 text-xs">[Locked]</span>}
                </div>
                </motion.button>
              </motion.div>
            </div>
          );
        })}

        {/* Mindling Avatar */}
        {state.selectedMindling && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-6 left-6 z-20"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative flex flex-col items-center"
            >
              <div className="rounded-full p-1" style={{
                background: 'linear-gradient(180deg, hsl(42 90% 68%) 0%, hsl(42 85% 52%) 100%)',
                boxShadow: '0 4px 16px hsl(42 90% 50% / 0.45)',
              }}>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, hsl(210 38% 88%) 0%, hsl(210 32% 80%) 100%)' }}
                >
                  <img 
                    src={mindlingImages[state.selectedMindling.type]}
                    alt={state.selectedMindling.name}
                    className="w-[85%] h-[85%] object-contain"
                    style={{ filter: 'drop-shadow(0 2px 4px hsl(200 50% 50% / 0.3))' }}
                  />
                </div>
              </div>
              <div className="mt-1 bg-primary text-primary-foreground px-3 py-0.5 
                              rounded-full text-xs font-display font-bold whitespace-nowrap shadow-soft">
                {state.mindlingName}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
