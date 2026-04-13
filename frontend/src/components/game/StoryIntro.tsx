import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { X, Brain, Gamepad2, BarChart3, Sparkles } from 'lucide-react';
import { AnimatedBackground, GlassCard, GlassButton } from '@/components/ui/glass';

import backgroundPng from '@/assets/background.png';
import firefly from '@/assets/firefly.png';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const MINDLINGS = [
  { img: pipImage, name: 'Pip' },
  { img: miraImage, name: 'Mira' },
  { img: veeImage, name: 'Vee' },
  { img: nuoImage, name: 'Nuo' },
];

export function StoryIntro() {
  const { dispatch } = useGame();
  const { playClick, playSwoosh } = useSoundEffects();
  const [showLearnMore, setShowLearnMore] = useState(false);

  // Stable firefly positions / timings — memoized so toggling the Learn
  // More modal doesn't reshuffle them and trigger layout thrash.
  const fireflies = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: `${15 + Math.random() * 70}%`,
        left: `${5 + Math.random() * 90}%`,
        size: 22 + Math.random() * 16,
        duration: 9 + Math.random() * 6,
        delay: i * 1.4,
      })),
    []
  );

  const handleYes = () => {
    playSwoosh();
    dispatch({ type: 'SET_SCREEN', screen: 'character-select' });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Layered animated background (matches TitleScreen) ── */}
      <AnimatedBackground backgroundImage={backgroundPng} orbCount={14} />

      {/* ── Drifting fireflies (CSS-animated) ─────────────── */}
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
            opacity: 0.8,
            ['--ff-dur' as never]: `${f.duration}s`,
            ['--ff-delay' as never]: `${f.delay}s`,
          }}
        />
      ))}

      {/* ── Foreground content ─────────────────────────────── */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col items-center gap-5 md:gap-6">
          {/* ── Title plaque (slide + spring, no opacity) ──── */}
          <motion.div
            initial={{ y: -18, scale: 0.94 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
          >
            <GlassCard
              tint="butter"
              shimmer
              className="px-8 md:px-12 py-5 md:py-6 text-center breathe"
              style={{ boxShadow: 'var(--glass-glow-butter)' }}
            >
              <h1
                className="game-title text-2xl md:text-4xl lg:text-5xl ink-deep leading-tight"
                style={{
                  textShadow:
                    '0 2px 0 rgba(255,255,255,0.6), 0 8px 22px hsla(48,100%,50%,0.35), 0 16px 36px hsla(282,80%,55%,0.22)',
                }}
              >
                Welcome to the World of Mindlings
              </h1>
            </GlassCard>
          </motion.div>

          {/* ── Story card with mindling lineup ──────────── */}
          <motion.div
            initial={{ y: 30, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 170, damping: 20, delay: 0.35 }}
            className="w-full"
          >
            <GlassCard
              tint="lilac"
              shimmer
              className="w-full p-6 md:p-8 text-center"
              style={{ boxShadow: 'var(--glass-glow-lilac)' }}
            >
              {/* Mindling lineup */}
              <div className="flex justify-center gap-3 md:gap-5 mb-5">
                {MINDLINGS.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, y: 18, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 14,
                      delay: 0.6 + i * 0.1,
                    }}
                  >
                    <motion.img
                      src={m.img}
                      alt={m.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_10px_18px_rgba(80,30,140,0.45)]"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.4,
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05 }}
                className="font-display text-base md:text-lg ink-soft mb-3 leading-relaxed"
              >
                The Mindlings have lost their precious memories...
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.25 }}
                className="font-display text-lg md:text-xl font-semibold ink-deep leading-snug"
                style={{ textShadow: '0 1px 0 rgba(255,255,255,0.55)' }}
              >
                Would you like to help them restore their memories?
              </motion.p>
            </GlassCard>
          </motion.div>

          {/* ── CTA buttons ──────────────────────────────── */}
          <motion.div
            initial={{ y: 20, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ delay: 1.55, type: 'spring', stiffness: 220, damping: 18 }}
            className="flex flex-wrap gap-4 md:gap-5 justify-center"
          >
            <GlassButton
              tint="butter"
              size="lg"
              onClick={handleYes}
              className="rounded-full"
            >
              Adopt a Mindling!
            </GlassButton>
            <GlassButton
              tint="sky"
              size="lg"
              onClick={() => {
                playClick();
                setShowLearnMore(true);
              }}
              className="rounded-full"
            >
              Learn More
            </GlassButton>
          </motion.div>
        </div>
      </div>

      {/* ── Learn More dialog (glassified) ─────────────────── */}
      <AnimatePresence>
        {showLearnMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(232,60%,15%,0.55), hsla(232,70%,8%,0.78))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
            onClick={() => setShowLearnMore(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh]"
            >
              <GlassCard
                tint="lilac"
                shimmer
                className="flex flex-col max-h-[85vh]"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
                  <h2 className="game-title text-2xl ink-deep"
                    style={{ textShadow: '0 1px 0 rgba(255,255,255,0.55)' }}
                  >
                    How It Works
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setShowLearnMore(false)}
                    className="glass-button glass-tint-peach w-10 h-10 grid place-items-center"
                    style={{
                      boxShadow:
                        '0 10px 24px -8px hsl(18 100% 62% / 0.55), 0 4px 10px -6px hsl(232 60% 18% / 0.3)',
                    }}
                    aria-label="Close"
                  >
                    <X className="relative z-10 w-4 h-4 ink-deep" strokeWidth={3} />
                    <span className="specular-sweep" aria-hidden="true" />
                  </motion.button>
                </div>

                {/* Body */}
                <div
                  className="px-6 py-5 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {/* Overview */}
                  <p className="font-body text-sm md:text-base ink-soft leading-relaxed">
                    <span className="font-bold ink-deep">Mindscape of Mindlings</span> is a
                    research-backed cognitive assessment disguised as a fun adventure game. As you
                    play through five unique islands, an AI system silently measures your cognitive
                    performance across six domains and produces a personalised report at the end.
                  </p>

                  {/* The Five Islands */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 ink-deep shrink-0" strokeWidth={2.4} />
                      <h3 className="font-display font-bold text-lg ink-deep">The Five Islands</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ink-soft">
                      {[
                        { name: 'Cloudport', desc: 'Catch fireflies — sustained attention & processing speed' },
                        { name: 'Star Bridge', desc: 'Connect numbered stars — working memory & task-switching' },
                        { name: 'Hidden Reef', desc: 'Match hidden bubbles — visual memory & recall' },
                        { name: 'Echo Bay', desc: 'Repeat crystal sequences — auditory & sequential memory' },
                        { name: 'Heart Isle', desc: 'Plant the three seeds to evolve your Mindling' },
                      ].map((island) => (
                        <div
                          key={island.name}
                          className="rounded-xl px-3 py-2"
                          style={{
                            background: 'rgba(255,255,255,0.34)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                          }}
                        >
                          <span className="font-semibold ink-deep">{island.name}: </span>
                          {island.desc}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* The AI */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 ink-deep shrink-0" strokeWidth={2.4} />
                      <h3 className="font-display font-bold text-lg ink-deep">
                        The AI Behind the Scenes
                      </h3>
                    </div>
                    <p className="text-sm ink-soft leading-relaxed">
                      Your in-game actions map to six neurocognitive scores — attention, processing
                      speed, working memory, visual memory, auditory memory, and cognitive
                      flexibility. These scores are normalised against adult population norms and
                      fed into a three-layer ensemble model:
                    </p>
                    <div
                      className="space-y-1.5 text-sm ink-soft pl-3 border-l-2"
                      style={{ borderColor: 'hsl(var(--glass-tint-butter) / 0.95)' }}
                    >
                      <p>
                        <span className="font-semibold ink-deep">GATv2 (Graph Attention Network)</span> —
                        captures relationships between cognitive domains
                      </p>
                      <p>
                        <span className="font-semibold ink-deep">LightGBM</span> — gradient-boosted
                        trees for tabular feature patterns
                      </p>
                      <p>
                        <span className="font-semibold ink-deep">Meta-learner</span> — stacks both
                        models for a final classification
                      </p>
                    </div>
                    <p className="text-sm ink-soft">
                      The system classifies performance into four bands:{' '}
                      <span className="font-semibold ink-deep">
                        High · Average · Below Average · At-Risk
                      </span>
                      .
                    </p>
                  </div>

                  {/* The Report */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 ink-deep shrink-0" strokeWidth={2.4} />
                      <h3 className="font-display font-bold text-lg ink-deep">
                        Your Cognitive Report
                      </h3>
                    </div>
                    <p className="text-sm ink-soft leading-relaxed">
                      After completing all islands, you receive a personalised report showing your
                      z-score profile across every domain, confidence probabilities for each
                      performance class, and explainable AI insights that flag which areas are
                      strong, need monitoring, or warrant further attention.
                    </p>
                  </div>

                  {/* Mindling callout */}
                  <div
                    className="flex items-start gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: 'hsl(var(--glass-tint-butter) / 0.38)',
                      border: '1px solid rgba(255,255,255,0.55)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <Sparkles className="w-5 h-5 ink-deep shrink-0 mt-0.5" strokeWidth={2.4} />
                    <p className="text-sm ink-soft leading-relaxed">
                      <span className="font-semibold ink-deep">Your Mindling</span> is your companion
                      throughout the journey. At Heart Isle it absorbs all three seeds you collected
                      and evolves — a visual metaphor for the cognitive growth you've demonstrated.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/30 flex justify-end">
                  <GlassButton
                    tint="butter"
                    size="md"
                    onClick={() => setShowLearnMore(false)}
                    className="rounded-full"
                  >
                    Got it!
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
