import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ISLANDS, IslandType } from '@/types/game';
import { ArrowLeft, Play } from 'lucide-react';

import floatingIslandsBg from '@/assets/floating-islands-bg.jpg';
import starBridgeBg from '@/assets/star-bridge-bg.jpg';
import hiddenReefBg from '@/assets/hidden-reef-bg.jpg';
import echoBayBg from '@/assets/echo-bay-bg.jpg';
import heartIsleBg from '@/assets/heart-isle-bg.jpg';

const backgrounds: Record<IslandType, string> = {
  'cloudport': floatingIslandsBg,
  'star-bridge': starBridgeBg,
  'hidden-reef': hiddenReefBg,
  'echo-bay': echoBayBg,
  'heart-isle': heartIsleBg,
};

export function LevelIntro() {
  const { state, dispatch, seedCount } = useGame();
  const { playClick, playSwoosh } = useSoundEffects();
  const currentIsland = ISLANDS.find(i => i.id === state.currentIsland);

  if (!currentIsland || !state.currentIsland) {
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
    return null;
  }

  const handlePlay = () => {
    playSwoosh();
    // For heart-isle, check if all seeds are collected
    if (state.currentIsland === 'heart-isle') {
      if (seedCount < 3) {
        // Can't play without all seeds
        return;
      }
      dispatch({ type: 'SET_SCREEN', screen: 'heart-isle' });
      return;
    }
    
    dispatch({ type: 'SET_SCREEN', screen: state.currentIsland as any });
  };

  const getLevelNumber = () => {
    switch (state.currentIsland) {
      case 'cloudport': return 1;
      case 'star-bridge': return 2;
      case 'hidden-reef': return 3;
      case 'echo-bay': return 4;
      case 'heart-isle': return 'Final';
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgrounds[state.currentIsland]})` }}
      />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(0deg, hsla(209,70%,12%,0.35) 0%, hsla(209,60%,20%,0.15) 40%, transparent 100%)',
      }} />

      {/* Header */}
      <div className="relative z-10 flex items-center p-4">
        <div className="flex-1 pl-12">
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
            className="p-3 rounded-full bg-card/90 shadow-soft hover:shadow-float transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <h1
          className="game-title text-xl md:text-3xl drop-shadow-lg"
          style={{ color: 'hsl(42 90% 72%)', textShadow: '0 2px 12px hsl(209 90% 15% / 0.6)' }}
        >
          LEVEL {getLevelNumber()}
        </h1>

        <div className="flex-1 flex justify-end">
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display">
            Bag: {seedCount}/3 Seeds
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-card/95 rounded-game p-8 md:p-12 max-w-lg mx-4 shadow-float text-center"
        >
          {/* Level indicator */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="game-title text-3xl md:text-4xl text-foreground mb-2">
              LEVEL {getLevelNumber()}: {currentIsland.name.toUpperCase()}
            </h2>
          </motion.div>

          {/* Icon */}
          {/* Level icon - SVG based */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-6 flex justify-center"
          >
            {state.currentIsland === 'cloudport' && (
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <ellipse cx="28" cy="34" rx="14" ry="22" fill="hsla(50, 80%, 75%, 0.5)" stroke="hsla(45, 100%, 65%, 0.7)" strokeWidth="1"/>
                <ellipse cx="52" cy="34" rx="14" ry="22" fill="hsla(50, 80%, 75%, 0.5)" stroke="hsla(45, 100%, 65%, 0.7)" strokeWidth="1"/>
                <circle cx="40" cy="30" r="7" fill="hsl(45, 100%, 65%)"/>
                <circle cx="37" cy="28" r="2" fill="hsl(30, 60%, 20%)"/>
                <circle cx="43" cy="28" r="2" fill="hsl(30, 60%, 20%)"/>
                <ellipse cx="40" cy="50" rx="9" ry="12" fill="hsl(50, 100%, 65%)">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite"/>
                </ellipse>
                <path d="M36 24 Q32 14 28 10" stroke="hsl(40, 70%, 50%)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M44 24 Q48 14 52 10" stroke="hsl(40, 70%, 50%)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            )}
            {state.currentIsland === 'star-bridge' && (
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <defs>
                  <radialGradient id="starGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="hsl(45, 100%, 80%)"/><stop offset="100%" stopColor="hsl(45, 100%, 55%)"/></radialGradient>
                </defs>
                <polygon points="40,8 47,28 68,28 51,42 57,62 40,50 23,62 29,42 12,28 33,28" fill="url(#starGlow)" stroke="hsl(40, 90%, 45%)" strokeWidth="1.5"/>
                <polygon points="40,18 44,30 56,30 46,38 50,50 40,43 30,50 34,38 24,30 36,30" fill="hsl(50, 100%, 85%)" opacity="0.6"/>
                <circle cx="40" cy="36" r="4" fill="hsl(210, 80%, 55%)"/>
              </svg>
            )}
            {state.currentIsland === 'hidden-reef' && (
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="28" fill="hsla(190, 80%, 70%, 0.4)" stroke="hsla(190, 70%, 60%, 0.6)" strokeWidth="1.5"/>
                <circle cx="40" cy="40" r="20" fill="hsla(190, 80%, 80%, 0.6)" stroke="hsla(200, 70%, 70%, 0.5)" strokeWidth="1"/>
                <circle cx="34" cy="30" r="4" fill="hsla(0, 0%, 100%, 0.5)"/>
                <circle cx="30" cy="45" r="8" fill="hsla(190, 70%, 65%, 0.5)" stroke="hsla(200, 60%, 55%, 0.4)" strokeWidth="1"/>
                <circle cx="50" cy="38" r="6" fill="hsla(190, 70%, 65%, 0.5)" stroke="hsla(200, 60%, 55%, 0.4)" strokeWidth="1"/>
                <text x="40" y="44" textAnchor="middle" fontSize="16" fill="hsl(200, 80%, 40%)" fontWeight="bold">?</text>
              </svg>
            )}
            {state.currentIsland === 'echo-bay' && (
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <defs>
                  <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="hsl(280, 70%, 75%)"/><stop offset="100%" stopColor="hsl(280, 60%, 50%)"/></linearGradient>
                </defs>
                <polygon points="40,6 58,24 58,56 40,74 22,56 22,24" fill="url(#crystalGrad)" stroke="hsl(280, 50%, 40%)" strokeWidth="1.5"/>
                <polygon points="40,6 58,24 40,36 22,24" fill="hsl(280, 60%, 80%)" opacity="0.5"/>
                <line x1="40" y1="36" x2="40" y2="74" stroke="hsl(280, 40%, 55%)" strokeWidth="0.8" opacity="0.4"/>
                <line x1="40" y1="36" x2="22" y2="56" stroke="hsl(280, 40%, 55%)" strokeWidth="0.8" opacity="0.4"/>
                <line x1="40" y1="36" x2="58" y2="56" stroke="hsl(280, 40%, 55%)" strokeWidth="0.8" opacity="0.4"/>
                <ellipse cx="40" cy="32" rx="6" ry="8" fill="hsl(280, 80%, 90%)" opacity="0.4"/>
              </svg>
            )}
            {state.currentIsland === 'heart-isle' && (
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="36" y="50" width="8" height="22" rx="2" fill="hsl(25, 50%, 40%)"/>
                <ellipse cx="40" cy="34" rx="22" ry="20" fill="hsl(130, 50%, 55%)"/>
                <ellipse cx="34" cy="30" rx="8" ry="10" fill="hsl(130, 55%, 65%)" opacity="0.6"/>
                <circle cx="30" cy="28" r="3" fill="hsl(45, 100%, 55%)"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></circle>
                <circle cx="48" cy="32" r="3" fill="hsl(210, 80%, 55%)"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/></circle>
                <circle cx="40" cy="22" r="3" fill="hsl(280, 60%, 60%)"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></circle>
              </svg>
            )}
          </motion.div>

          {/* Mission description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-foreground/80 mb-8 font-medium"
          >
            <span className="font-bold text-foreground">Mission: </span>
            {currentIsland.description}
          </motion.p>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handlePlay}
              disabled={state.currentIsland === 'heart-isle' && seedCount < 3}
              className={`
                flex items-center justify-center gap-3 px-8 py-4 
                text-xl font-display font-bold rounded-game
                transition-all duration-300 btn-bounce
                ${state.currentIsland === 'heart-isle' && seedCount < 3
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-glow-gold'
                }
              `}
            >
              <Play className="w-6 h-6" />
              PLAY GAME
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
              className="px-6 py-3 text-lg font-display rounded-game 
                         border-2 border-border hover:border-primary
                         text-foreground transition-all"
            >
              RETURN TO MAP
            </motion.button>
          </div>

          {state.currentIsland === 'heart-isle' && seedCount < 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-destructive font-medium"
            >
              Collect all 3 seeds to unlock this level!
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
