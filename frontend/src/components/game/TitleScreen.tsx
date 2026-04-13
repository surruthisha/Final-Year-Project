import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { AnimatedBackground, GlassCard, GlassButton } from '@/components/ui/glass';
import backgroundPng from '@/assets/background.png';
import islandPng from '@/assets/island.png';
import firefly from '@/assets/firefly.png';

import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

export function TitleScreen() {
  const { dispatch } = useGame();
  const { playSwoosh } = useSoundEffects();

  const fireflies = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: `${15 + Math.random() * 70}%`,
        left: `${5 + Math.random() * 90}%`,
        size: 26 + Math.random() * 18,
        duration: 9 + Math.random() * 6,
        delay: i * 1.4,
      })),
    []
  );

  const handleStart = () => {
    playSwoosh();
    dispatch({ type: 'SET_SCREEN', screen: 'story-intro' });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Layered animated background ─────────────────────── */}
      <AnimatedBackground
        backgroundImage={backgroundPng}
        islandImage={islandPng}
        orbCount={18}
      />

      {/* ── Drifting fireflies (CSS-animated, compositor thread) ── */}
      {fireflies.map((f) => (
        <img
          key={f.id}
          src={firefly}
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none drop-shadow-[0_0_18px_rgba(255,220,120,0.9)] firefly-drift"
          style={{
            top: f.top,
            left: f.left,
            width: f.size,
            opacity: 0.85,
            ['--ff-dur' as never]: `${f.duration}s`,
            ['--ff-delay' as never]: `${f.delay}s`,
          }}
        />
      ))}

      {/* ── Foreground content ──────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center h-full px-4 pt-8 pb-12">

        {/* ── Logo plaque (no opacity fade — slide + spring only) ── */}
        <motion.div
          initial={{ y: -30, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
          className="mt-8 md:mt-14"
        >
          <GlassCard
            tint="butter"
            shimmer
            className="px-10 md:px-16 py-7 md:py-9 text-center breathe"
            style={{ boxShadow: 'var(--glass-glow-butter)' }}
          >
            <p className="font-display font-semibold text-base md:text-lg tracking-[0.35em] uppercase ink-soft mb-1">
              Mindscape of
            </p>
            <motion.h1
              className="game-title text-5xl md:text-7xl lg:text-8xl ink-deep leading-none"
              style={{
                textShadow:
                  '0 2px 0 rgba(255,255,255,0.7), 0 8px 24px hsla(48,100%,50%,0.45), 0 18px 40px hsla(282,80%,55%,0.25)',
              }}
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Mindlings
            </motion.h1>
          </GlassCard>
        </motion.div>

        {/* ── Tagline pill ────────────────────────────────── */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 20 }}
          className="mt-7"
        >
          <GlassCard tint="lilac" className="px-6 py-3 rounded-full">
            <p className="font-display font-semibold text-base md:text-lg ink-deep tracking-wide">
              ✨ A journey of discovery awaits you ✨
            </p>
          </GlassCard>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Start button ────────────────────────────────── */}
        <motion.div
          initial={{ y: 40, scale: 0.85 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 220, damping: 16 }}
          className="mb-10"
        >
          <GlassButton
            tint="butter"
            size="xl"
            onClick={handleStart}
            className="rounded-full"
          >
            Start Journey →
          </GlassButton>
        </motion.div>

        {/* Tiny footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-3 text-xs font-body ink-soft tracking-wider"
        >
          tap to begin your adventure
        </motion.p>
      </div>

      {/* ── Mascots — two pairs peeking from corners ───────── */}

      {/* Left pair: Mira (behind) + Pip (front) */}
      <img
        src={miraImage}
        alt="Mira the Mindling"
        className="absolute bottom-4 left-0 md:left-3 w-24 md:w-36 z-20 pointer-events-none select-none
                   drop-shadow-[0_14px_24px_rgba(60,120,100,0.45)]"
        style={{ animation: 'float 5s ease-in-out 0.5s infinite' }}
      />
      <img
        src={pipImage}
        alt="Pip the Mindling"
        className="absolute bottom-0 left-6 md:left-12 w-32 md:w-48 z-30 pointer-events-none select-none
                   drop-shadow-[0_18px_30px_rgba(80,30,140,0.45)]"
        style={{ animation: 'float 4s ease-in-out infinite' }}
      />

      {/* Right pair: Nuo (behind) + Vee (front) */}
      <img
        src={nuoImage}
        alt="Nuo the Mindling"
        className="absolute bottom-4 right-0 md:right-3 w-24 md:w-36 z-20 pointer-events-none select-none
                   drop-shadow-[0_14px_24px_rgba(100,50,140,0.45)]"
        style={{ animation: 'float 5.4s ease-in-out 1s infinite' }}
      />
      <img
        src={veeImage}
        alt="Vee the Mindling"
        className="absolute bottom-0 right-6 md:right-12 w-32 md:w-48 z-30 pointer-events-none select-none
                   drop-shadow-[0_18px_30px_rgba(180,100,40,0.45)]"
        style={{ animation: 'float 4.4s ease-in-out 0.3s infinite' }}
      />
    </div>
  );
}
