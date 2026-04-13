import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MindlingType, MINDLINGS } from '@/types/game';
import { GlassCard, GlassButton } from '@/components/ui/glass';

import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages: Record<MindlingType, string> = {
  pip: pipImage,
  mira: miraImage,
  vee: veeImage,
  nuo: nuoImage,
};

type GlassTint = 'sky' | 'mint' | 'peach' | 'lilac';

interface MindlingTheme {
  hue: number;
  tint: GlassTint;
}

const MINDLING_THEMES: Record<MindlingType, MindlingTheme> = {
  pip:  { hue: 200, tint: 'sky' },
  mira: { hue: 158, tint: 'mint' },
  vee:  { hue: 28,  tint: 'peach' },
  nuo:  { hue: 282, tint: 'lilac' },
};

const TYPES = Object.keys(MINDLINGS) as MindlingType[];

// Pre-built gradient strings so we don't allocate on every render
const NEUTRAL_BG =
  'linear-gradient(180deg, hsl(220 80% 78%) 0%, hsl(240 70% 82%) 35%, hsl(282 60% 84%) 70%, hsl(320 55% 86%) 100%)';

const BG_MAP: Record<MindlingType, string> = {
  pip:  'linear-gradient(180deg, hsl(200 80% 78%) 0%, hsl(220 70% 80%) 35%, hsl(240 60% 82%) 70%, hsl(260 55% 85%) 100%)',
  mira: 'linear-gradient(180deg, hsl(158 80% 78%) 0%, hsl(178 70% 80%) 35%, hsl(198 60% 82%) 70%, hsl(218 55% 85%) 100%)',
  vee:  'linear-gradient(180deg, hsl(28 80% 78%) 0%, hsl(48 70% 80%) 35%, hsl(68 60% 82%) 70%, hsl(88 55% 85%) 100%)',
  nuo:  'linear-gradient(180deg, hsl(282 80% 78%) 0%, hsl(302 70% 80%) 35%, hsl(322 60% 82%) 70%, hsl(342 55% 85%) 100%)',
};

const GLOW_MAP: Record<MindlingType, string> = {
  pip:  'radial-gradient(ellipse at 50% 45%, hsla(200,80%,70%,0.35) 0%, transparent 60%)',
  mira: 'radial-gradient(ellipse at 50% 45%, hsla(158,80%,70%,0.35) 0%, transparent 60%)',
  vee:  'radial-gradient(ellipse at 50% 45%, hsla(28,80%,70%,0.35) 0%, transparent 60%)',
  nuo:  'radial-gradient(ellipse at 50% 45%, hsla(282,80%,70%,0.35) 0%, transparent 60%)',
};

export function CharacterSelect() {
  const { dispatch } = useGame();
  const { playClick, playSuccess } = useSoundEffects();
  const [selectedType, setSelectedType] = useState<MindlingType | null>(null);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = selectedType ? MINDLING_THEMES[selectedType] : null;

  const handleSelect = (type: MindlingType) => {
    playClick();
    setSelectedType(type);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleAdopt = () => {
    if (!selectedType || !name.trim()) return;
    playSuccess();
    const mindlingData = MINDLINGS[selectedType];
    dispatch({
      type: 'SELECT_MINDLING',
      mindling: { ...mindlingData, name: name.trim() },
    });
    dispatch({ type: 'SET_MINDLING_NAME', name: name.trim() });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const canAdopt = !!selectedType && !!name.trim();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Crossfade gradient layers ──────────────────────── */}
      {/* Neutral base (visible when nothing selected) */}
      <div
        className="absolute inset-0"
        style={{
          background: NEUTRAL_BG,
          opacity: selectedType ? 0 : 1,
          transition: 'opacity 1.5s ease',
          willChange: 'opacity',
        }}
      />
      {/* One layer per mindling — only the selected one fades in */}
      {TYPES.map((type) => (
        <div
          key={type}
          className="absolute inset-0"
          style={{
            background: BG_MAP[type],
            opacity: selectedType === type ? 1 : 0,
            transition: 'opacity 1.5s ease',
            willChange: 'opacity',
          }}
        />
      ))}

      {/* Radial glow — same crossfade approach */}
      {TYPES.map((type) => (
        <div
          key={`glow-${type}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: GLOW_MAP[type],
            opacity: selectedType === type ? 1 : 0,
            transition: 'opacity 1.5s ease',
          }}
        />
      ))}

      {/* Subtle floating particles (reduced count for perf) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute rounded-full orb-float"
            style={{
              top: `${12 + i * 18}%`,
              left: `${8 + (i * 21) % 85}%`,
              width: 8 + (i % 3) * 4,
              height: 8 + (i % 3) * 4,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.3) 60%, transparent 80%)`,
              boxShadow: `0 0 ${10 + i * 2}px rgba(255,255,255,0.25)`,
              ['--orb-dur' as never]: `${9 + i * 2}s`,
              ['--orb-delay' as never]: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* ── Foreground content ─────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col items-center px-4 py-6 overflow-y-auto">

        {/* ── Title ──────────────────────────────────────── */}
        <motion.div
          initial={{ y: -20, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          className="mt-4 md:mt-8 mb-6 md:mb-8"
        >
          <GlassCard
            tint="butter"
            shimmer
            className="px-8 md:px-14 py-4 md:py-5 text-center"
            style={{ boxShadow: 'var(--glass-glow-butter)' }}
          >
            <h1
              className="game-title text-2xl md:text-4xl lg:text-5xl ink-deep leading-tight"
              style={{
                textShadow:
                  '0 2px 0 rgba(255,255,255,0.6), 0 6px 18px hsla(48,100%,50%,0.35)',
              }}
            >
              Choose Your Mindling!
            </h1>
          </GlassCard>
        </motion.div>

        {/* ── Mindling grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 w-full max-w-3xl">
          {TYPES.map((type, i) => {
            const mindling = MINDLINGS[type];
            const isSelected = selectedType === type;
            const mt = MINDLING_THEMES[type];

            return (
              <motion.div
                key={type}
                initial={{ y: 30, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 18 }}
                className="flex flex-col items-center"
              >
                {/* Card wrapper — tick positioned relative to this */}
                <div className="relative w-full max-w-[10rem]">
                  <motion.button
                    onClick={() => handleSelect(type)}
                    whileHover={{ scale: 1.06, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-full aspect-square rounded-[1.8rem] cursor-pointer"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.18) 60%, hsla(${mt.hue},70%,85%,0.3) 100%)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.14) 60%, rgba(255,255,255,0.08) 100%)',
                      border: '1px solid rgba(255,255,255,0.45)',
                      borderRadius: '1.8rem',
                      boxShadow: isSelected
                        ? `0 0 0 2.5px hsla(${mt.hue},85%,72%,0.9),
                           0 0 24px hsla(${mt.hue},85%,65%,0.5),
                           0 0 56px hsla(${mt.hue},80%,60%,0.2),
                           inset 0 1px 0 rgba(255,255,255,0.5),
                           0 14px 30px -14px hsl(232 60% 18% / 0.3)`
                        : `inset 0 1px 0 rgba(255,255,255,0.5),
                           0 12px 28px -12px hsl(232 60% 18% / 0.25)`,
                      transition: 'box-shadow 0.4s ease, background 0.4s ease',
                    }}
                  >
                    <img
                      src={mindlingImages[type]}
                      alt={mindling.displayName}
                      className={`w-[80%] h-[80%] object-contain mx-auto mt-[10%] drop-shadow-[0_8px_16px_rgba(80,30,140,0.35)] ${isSelected ? 'float-animation' : ''}`}
                    />
                  </motion.button>

                  {/* Tick badge — perfectly centered at bottom of the glow stroke */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="absolute z-10"
                        style={{
                          bottom: -14,
                          left: '50%',
                          width: 30,
                          height: 30,
                          marginLeft: -15,
                          borderRadius: '50%',
                          background: `linear-gradient(180deg, hsla(48,100%,82%,0.95) 0%, hsla(48,90%,65%,0.9) 100%)`,
                          border: `2.5px solid hsla(${mt.hue},85%,72%,0.9)`,
                          boxShadow: `0 4px 14px hsla(48,100%,55%,0.5), 0 0 12px hsla(${mt.hue},80%,65%,0.35)`,
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'hsl(232 60% 22%)',
                        }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Name + trait */}
                <p
                  className="mt-4 font-display font-bold text-lg"
                  style={{
                    color: isSelected
                      ? `hsl(${mt.hue} 70% 25%)`
                      : 'hsl(232 40% 30%)',
                    textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                    transition: 'color 0.4s ease',
                  }}
                >
                  {mindling.displayName}
                </p>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isSelected
                      ? `hsl(${mt.hue} 50% 35%)`
                      : 'hsl(232 30% 45%)',
                    transition: 'color 0.4s ease',
                  }}
                >
                  {mindling.trait}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* ── Name input (slides in once a mindling is picked) ── */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ y: 16, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 16, scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-md mb-5"
            >
              <GlassCard
                tint={theme?.tint ?? 'sky'}
                className="flex items-center px-5 py-2 rounded-full"
                style={{
                  boxShadow: theme
                    ? `0 12px 30px -10px hsla(${theme.hue},80%,55%,0.35)`
                    : undefined,
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Name your Mindling..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdopt();
                  }}
                  maxLength={20}
                  className="w-full bg-transparent text-center text-xl py-3 font-display font-semibold
                             ink-deep placeholder:ink-soft/60 outline-none"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.45)' }}
                />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Helper hint ────────────────────────────────── */}
        <AnimatePresence>
          {!selectedType && (
            <motion.div
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="mb-5"
            >
              <GlassCard tint="butter" className="px-6 py-2.5 rounded-full">
                <p className="font-display font-semibold text-sm md:text-base ink-deep tracking-wide">
                  ✨ Pick a Mindling to adopt! ✨
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Adopt button ───────────────────────────────── */}
        <motion.div
          initial={{ y: 20, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 220, damping: 18 }}
          className="mb-8"
        >
          <GlassButton
            tint={canAdopt ? (theme?.tint ?? 'butter') : 'butter'}
            size="xl"
            onClick={handleAdopt}
            disabled={!canAdopt}
            className="rounded-full"
            style={{
              opacity: canAdopt ? 1 : 0.5,
              cursor: canAdopt ? 'pointer' : 'not-allowed',
              filter: canAdopt ? 'none' : 'grayscale(0.4)',
            }}
          >
            Adopt & Start →
          </GlassButton>
        </motion.div>
      </div>
    </div>
  );
}
