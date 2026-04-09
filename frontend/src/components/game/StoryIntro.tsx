import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { X, Brain, Gamepad2, BarChart3, Sparkles } from 'lucide-react';

import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

export function StoryIntro() {
  const { dispatch } = useGame();
  const { playClick, playSwoosh } = useSoundEffects();
  const [showLearnMore, setShowLearnMore] = useState(false);

  const handleYes = () => {
    playSwoosh();
    dispatch({ type: 'SET_SCREEN', screen: 'character-select' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(209 65% 28%) 0%, hsl(210 55% 45%) 35%, hsl(210 45% 62%) 65%, hsl(210 40% 78%) 100%)',
      }}
    >
      {/* Crystal geometric background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          linear-gradient(120deg, transparent 30%, hsl(210 60% 70% / 0.2) 50%, transparent 70%),
          linear-gradient(240deg, transparent 30%, hsl(42 80% 70% / 0.08) 50%, transparent 70%),
          linear-gradient(60deg, transparent 40%, hsl(210 50% 80% / 0.15) 55%, transparent 65%)
        `,
      }} />

      {/* Sparkle particles on left side */}
      <div className="absolute left-0 top-0 bottom-0 w-1/4 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${5 + Math.random() * 90}%`,
              width: `${3 + Math.random() * 5}px`,
              height: `${3 + Math.random() * 5}px`,
              background: 'hsl(42 90% 80%)',
            }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.5, 1.2, 0.5],
              y: [0, -(10 + Math.random() * 20), 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="game-title text-3xl md:text-4xl lg:text-5xl mb-8"
          style={{
            color: 'hsl(42 90% 72%)',
            textShadow: '0 2px 12px hsl(209 90% 15% / 0.6), 0 0 30px hsl(42 80% 60% / 0.2)',
          }}
        >
          Welcome to the World of Mindlings
        </motion.h1>

        {/* Metallic card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            background: 'linear-gradient(180deg, hsl(210 35% 82%) 0%, hsl(210 32% 78%) 3%, hsl(210 30% 82%) 50%, hsl(210 28% 76%) 97%, hsl(210 30% 72%) 100%)',
            boxShadow: '0 4px 24px hsl(209 60% 25% / 0.3), 0 1px 4px hsl(209 80% 15% / 0.15), inset 0 1px 0 hsl(210 40% 90% / 0.5)',
            border: '2px solid hsl(210 30% 68%)',
            padding: '6px',
          }}
        >
          {/* Inner card content */}
          <div className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(210 38% 88%) 0%, hsl(210 32% 84%) 100%)',
            }}
          >
            {/* Purple banner with mindlings */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="relative py-4 px-6 flex justify-center gap-2"
              style={{
                background: 'linear-gradient(180deg, hsl(209 75% 32%) 0%, hsl(209 85% 22%) 100%)',
              }}
            >
              {[pipImage, miraImage, veeImage, nuoImage].map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.12 }}
                >
                  <motion.img
                    src={img}
                    alt=""
                    className="w-14 h-14 md:w-18 md:h-18 object-contain"
                    style={{ filter: 'drop-shadow(0 2px 8px hsl(209 60% 25% / 0.5))' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Story text */}
            <div className="px-6 py-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="font-display text-lg md:text-xl mb-4"
                style={{ color: 'hsl(209 80% 22%)' }}
              >
                The Mindlings have lost their precious memories...
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="font-display text-xl md:text-2xl font-bold"
                style={{ color: 'hsl(42 85% 42%)' }}
              >
                Would you like to help them restore their memories?
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="flex gap-5 justify-center"
        >
          {/* Gold "Adopt a Mindling!" button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleYes}
            className="group relative px-8 py-4 rounded-xl font-display font-bold text-lg md:text-xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(42 90% 65%) 0%, hsl(38 85% 48%) 100%)',
              color: 'hsl(209 90% 15%)',
              boxShadow: '0 4px 16px hsl(42 90% 45% / 0.45), 0 2px 4px hsl(209 80% 20% / 0.2), inset 0 1px 0 hsl(48 100% 80% / 0.5)',
              border: '1px solid hsl(42 70% 52%)',
            }}
          >
            <span className="relative z-10">Adopt a Mindling!</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, hsl(42 100% 82% / 0.4) 45%, transparent 50%)',
              }}
            />
          </motion.button>

          {/* Silver "Learn More" button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClick(); setShowLearnMore(true); }}
            className="px-8 py-4 rounded-xl font-display font-bold text-lg md:text-xl"
            style={{
              background: 'linear-gradient(180deg, hsl(210 35% 72%) 0%, hsl(210 38% 58%) 100%)',
              color: 'hsl(210 40% 96%)',
              boxShadow: '0 4px 12px hsl(209 60% 25% / 0.25), inset 0 1px 0 hsl(210 35% 82% / 0.4)',
              border: '1px solid hsl(210 30% 62%)',
              textShadow: '0 1px 2px hsl(209 80% 15% / 0.3)',
            }}
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Learn More Dialog */}
      <AnimatePresence>
        {showLearnMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'hsl(209 80% 10% / 0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowLearnMore(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-game shadow-float [&::-webkit-scrollbar]:hidden"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', scrollbarWidth: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border"
                style={{ background: 'hsl(var(--card))' }}>
                <h2 className="game-title text-2xl text-foreground">How It Works</h2>
                <button
                  onClick={() => setShowLearnMore(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-6">

                {/* Overview */}
                <p className="text-foreground/80 text-base leading-relaxed">
                  <span className="font-bold text-foreground">Mindscape of Mindlings</span> is a
                  research-backed cognitive assessment disguised as a fun adventure game. As you play
                  through five unique islands, an AI system silently measures your cognitive performance
                  across six domains and produces a personalised report at the end.
                </p>

                {/* The Game */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-display font-bold text-lg text-foreground">The Five Islands</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground/80">
                    {[
                      { name: 'Cloudport', desc: 'Catch fireflies — tests sustained attention & processing speed' },
                      { name: 'Star Bridge', desc: 'Connect numbered stars — tests working memory & task-switching' },
                      { name: 'Hidden Reef', desc: 'Match hidden bubbles — tests visual memory & recall' },
                      { name: 'Echo Bay', desc: 'Repeat crystal sequences — tests auditory & sequential memory' },
                      { name: 'Heart Isle', desc: 'Plant the three seeds you collected to evolve your Mindling' },
                    ].map(island => (
                      <div key={island.name} className="bg-muted/50 rounded-lg px-3 py-2">
                        <span className="font-semibold text-foreground">{island.name}: </span>
                        {island.desc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* The AI */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-display font-bold text-lg text-foreground">The AI Behind the Scenes</h3>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Your in-game actions are mapped to six neurocognitive scores — attention, processing speed,
                    working memory, visual memory, auditory memory, and cognitive flexibility. These scores are
                    normalised against adult population norms and fed into a three-layer ensemble model:
                  </p>
                  <div className="space-y-1 text-sm text-foreground/80 pl-2 border-l-2 border-primary/40">
                    <p><span className="font-semibold text-foreground">GATv2 (Graph Attention Network)</span> — captures relationships between cognitive domains</p>
                    <p><span className="font-semibold text-foreground">LightGBM</span> — gradient-boosted trees for tabular feature patterns</p>
                    <p><span className="font-semibold text-foreground">Meta-learner</span> — stacks both models for a final classification</p>
                  </div>
                  <p className="text-sm text-foreground/80">
                    The system classifies performance into four bands: <span className="font-semibold">High · Average · Below Average · At-Risk</span>.
                  </p>
                </div>

                {/* The Report */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-display font-bold text-lg text-foreground">Your Cognitive Report</h3>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    After completing all islands, you receive a personalised report showing your z-score
                    profile across every domain, confidence probabilities for each performance class, and
                    explainable AI insights that flag which areas are strong, need monitoring, or warrant
                    further attention.
                  </p>
                </div>

                {/* Mindling */}
                <div className="flex items-start gap-3 bg-primary/10 rounded-lg px-4 py-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    <span className="font-semibold text-foreground">Your Mindling</span> is your companion
                    throughout the journey. At Heart Isle it absorbs all three seeds you collected and evolves —
                    a visual metaphor for the cognitive growth you've demonstrated.
                  </p>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setShowLearnMore(false)}
                  className="px-6 py-2 rounded-game font-display font-bold text-primary-foreground
                             bg-gradient-to-b from-primary to-primary/80 transition-all hover:opacity-90"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
