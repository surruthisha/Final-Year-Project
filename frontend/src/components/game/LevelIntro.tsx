import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ISLANDS, IslandType } from '@/types/game';
import { ArrowLeft, Play } from 'lucide-react';

import { GlassCard, GlassButton } from '@/components/ui/glass';

import level1Bg from '@/assets/level1.png';
import starBridgeBg from '@/assets/star-bridge-bg.jpg';
import hiddenReefBg from '@/assets/hidden-reef-bg.jpg';
import echoBayBg from '@/assets/echo-bay-bg.jpg';
import heartIsleBg from '@/assets/heart-isle-bg.jpg';

const backgrounds: Record<IslandType, string> = {
  'cloudport': level1Bg,
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
      if (seedCount < 4) {
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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src={backgrounds[state.currentIsland]}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(0deg, hsla(232,60%,10%,0.35) 0%, transparent 40%, transparent 70%, hsla(232,60%,10%,0.15) 100%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-center px-4 md:px-6 pt-4 md:pt-5">
        {/* Back button — pinned left */}
        <motion.button
          initial={{ y: -20, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
          className="glass-button glass-tint-sky absolute left-4 md:left-6 top-4 md:top-5
                     w-11 h-11 grid place-items-center ink-deep"
          aria-label="Back to map"
        >
          <ArrowLeft className="relative z-10 w-5 h-5" strokeWidth={2.5} />
          <span className="specular-sweep" aria-hidden="true" />
        </motion.button>

        {/* Level title — centered */}
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
              Level {getLevelNumber()}
            </h1>
          </GlassCard>
        </motion.div>

        {/* Seed bag — pinned right */}
        <motion.div
          initial={{ y: -20, scale: 0.94 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
          className="absolute right-4 md:right-6 top-4 md:top-5"
        >
          <GlassCard tint="sky" className="px-4 py-2 flex items-center gap-2">
            <span className="font-display font-bold text-sm ink-deep">
              {seedCount}/4 Seeds
            </span>
          </GlassCard>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-[calc(100vh-80px)]">
        <motion.div
          initial={{ y: 30, scale: 0.94 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.25 }}
          className="w-full max-w-lg mx-4"
        >
          <GlassCard
            tint="lilac"
            shimmer
            className="p-8 md:p-10 text-center"
            style={{ boxShadow: 'var(--glass-glow-lilac)' }}
          >
            {/* Level name */}
            <h2
              className="game-title text-2xl md:text-3xl ink-deep mb-5"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.55)' }}
            >
              {currentIsland.name}
            </h2>

            {/* Level icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
              className="mb-5 flex justify-center"
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
                  <polygon points="40,10 62,22 62,58 40,70 18,58 18,22" fill="url(#crystalGrad)" stroke="hsl(280, 50%, 40%)" strokeWidth="1.5"/>
                  <polygon points="40,10 62,22 40,38 18,22" fill="hsl(280, 60%, 80%)" opacity="0.5"/>
                  <line x1="40" y1="38" x2="40" y2="70" stroke="hsl(280, 40%, 55%)" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="40" y1="38" x2="18" y2="58" stroke="hsl(280, 40%, 55%)" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="40" y1="38" x2="62" y2="58" stroke="hsl(280, 40%, 55%)" strokeWidth="0.8" opacity="0.4"/>
                  <ellipse cx="40" cy="30" rx="7" ry="6" fill="hsl(280, 80%, 90%)" opacity="0.4"/>
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
            <p className="font-body text-base md:text-lg ink-soft mb-6 leading-relaxed">
              <span className="font-bold ink-deep">Mission: </span>
              {currentIsland.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-3">
              <GlassButton
                tint="butter"
                size="xl"
                onClick={handlePlay}
                disabled={state.currentIsland === 'heart-isle' && seedCount < 4}
                className="rounded-full"
                style={{
                  opacity:
                    state.currentIsland === 'heart-isle' && seedCount < 4 ? 0.5 : 1,
                  cursor:
                    state.currentIsland === 'heart-isle' && seedCount < 4
                      ? 'not-allowed'
                      : 'pointer',
                  filter:
                    state.currentIsland === 'heart-isle' && seedCount < 4
                      ? 'grayscale(0.4)'
                      : 'none',
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Play className="w-5 h-5" strokeWidth={2.5} />
                  Play Game
                </span>
              </GlassButton>

              <GlassButton
                tint="sky"
                size="md"
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
                className="rounded-full"
              >
                Return to Map
              </GlassButton>
            </div>

            {state.currentIsland === 'heart-isle' && seedCount < 4 && (
              <p className="mt-4 font-display font-semibold text-sm" style={{ color: 'hsl(0,70%,55%)' }}>
                Collect all 4 seeds to unlock this level!
              </p>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
