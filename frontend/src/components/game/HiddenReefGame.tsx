import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, Play, SkipForward } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { SeedGem } from './SeedGem';

import hiddenReefBg from '@/assets/hidden-reef-bg.jpg';
import { SceneBg } from './SceneBg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

type ReefIcon = 'spark' | 'logic' | 'harmony' | 'pip' | 'mira' | 'vee' | 'star' | 'shell';

interface BubbleCard {
  id: number;
  icon: ReefIcon;
  isFlipped: boolean;
  isMatched: boolean;
}

interface RoundConfig {
  cols: number;
  rows: number;
  label: string;
}

const ROUNDS: RoundConfig[] = [
  { cols: 2, rows: 2, label: 'Warm-up' },
  { cols: 4, rows: 3, label: 'Baseline' },
  { cols: 4, rows: 4, label: 'Challenge' },
];

const ALL_ICONS: ReefIcon[] = ['spark', 'logic', 'harmony', 'pip', 'mira', 'vee', 'star', 'shell'];

const ReefIconSVG = React.memo(function ReefIconSVG({ icon, size = 40 }: { icon: ReefIcon; size?: number }) {
  switch (icon) {
    case 'spark':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="24,2 30,18 46,18 33,28 38,46 24,35 10,46 15,28 2,18 18,18" fill="hsl(45, 100%, 55%)" stroke="hsl(40, 90%, 45%)" strokeWidth="1.5"/>
          <polygon points="24,10 28,20 38,20 30,26 33,38 24,31 15,38 18,26 10,20 20,20" fill="hsl(50, 100%, 75%)" opacity="0.6"/>
        </svg>
      );
    case 'logic':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 42,16 42,32 24,44 6,32 6,16" fill="hsl(210, 80%, 55%)" stroke="hsl(210, 70%, 40%)" strokeWidth="1.5"/>
          <polygon points="24,4 42,16 24,24 6,16" fill="hsl(210, 80%, 75%)" opacity="0.5"/>
          <circle cx="24" cy="24" r="6" fill="hsl(210, 90%, 85%)" opacity="0.6"/>
        </svg>
      );
    case 'harmony':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 42,16 42,32 24,44 6,32 6,16" fill="hsl(280, 60%, 60%)" stroke="hsl(280, 50%, 40%)" strokeWidth="1.5"/>
          <polygon points="24,4 42,16 24,24 6,16" fill="hsl(280, 60%, 80%)" opacity="0.5"/>
          <circle cx="24" cy="24" r="6" fill="hsl(280, 80%, 90%)" opacity="0.6"/>
        </svg>
      );
    case 'pip':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" fill="hsl(210, 70%, 65%)"/>
          <circle cx="24" cy="24" r="14" fill="hsl(210, 70%, 75%)"/>
          <circle cx="19" cy="21" r="3" fill="hsl(0, 0%, 20%)"/>
          <circle cx="29" cy="21" r="3" fill="hsl(0, 0%, 20%)"/>
          <circle cx="20" cy="20" r="1" fill="white"/>
          <circle cx="30" cy="20" r="1" fill="white"/>
          <path d="M18 29 Q24 35 30 29" stroke="hsl(0, 0%, 20%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case 'mira':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" fill="hsl(160, 50%, 60%)"/>
          <circle cx="24" cy="24" r="14" fill="hsl(160, 50%, 70%)"/>
          <circle cx="19" cy="21" r="3" fill="hsl(0, 0%, 20%)"/>
          <circle cx="29" cy="21" r="3" fill="hsl(0, 0%, 20%)"/>
          <circle cx="20" cy="20" r="1" fill="white"/>
          <circle cx="30" cy="20" r="1" fill="white"/>
          <ellipse cx="24" cy="30" rx="5" ry="3" fill="hsl(0, 0%, 20%)" opacity="0.8"/>
        </svg>
      );
    case 'vee':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" fill="hsl(30, 80%, 60%)"/>
          <circle cx="24" cy="24" r="14" fill="hsl(30, 80%, 70%)"/>
          <circle cx="19" cy="21" r="3" fill="hsl(0, 0%, 20%)"/>
          <circle cx="29" cy="21" r="3" fill="hsl(0, 0%, 20%)"/>
          <circle cx="20" cy="20" r="1" fill="white"/>
          <circle cx="30" cy="20" r="1" fill="white"/>
          <path d="M20 28 L24 32 L28 28" stroke="hsl(0, 0%, 20%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M24 6L28.9 17.5H41L31 25.3L34.8 37.5L24 30L13.2 37.5L17 25.3L7 17.5H19.1Z" fill="hsl(45, 100%, 60%)" stroke="hsl(40, 85%, 50%)" strokeWidth="1"/>
          <path d="M24 12L27 19.5H35L29 24.5L31.5 33L24 28L16.5 33L19 24.5L13 19.5H21Z" fill="hsl(50, 100%, 80%)" opacity="0.6"/>
        </svg>
      );
    case 'shell':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="28" rx="16" ry="14" fill="hsl(340, 60%, 75%)"/>
          <ellipse cx="24" cy="28" rx="12" ry="10" fill="hsl(340, 65%, 82%)"/>
          <path d="M12 28 Q16 14 24 10 Q32 14 36 28" stroke="hsl(340, 50%, 65%)" strokeWidth="1.5" fill="none"/>
          <path d="M16 28 Q19 18 24 14 Q29 18 32 28" stroke="hsl(340, 50%, 65%)" strokeWidth="1" fill="none"/>
          <path d="M20 28 Q22 22 24 18 Q26 22 28 28" stroke="hsl(340, 50%, 65%)" strokeWidth="0.8" fill="none"/>
          <circle cx="24" cy="26" r="2" fill="hsl(0, 0%, 100%)" opacity="0.6"/>
        </svg>
      );
  }
});

let bubbleAudioCtx: AudioContext | null = null;

function getBubbleCtx(): AudioContext {
  if (!bubbleAudioCtx || bubbleAudioCtx.state === 'closed') {
    bubbleAudioCtx = new AudioContext();
  }
  if (bubbleAudioCtx.state === 'suspended') {
    bubbleAudioCtx.resume();
  }
  return bubbleAudioCtx;
}

function playBubblePop(match: boolean) {
  try {
    const ctx = getBubbleCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = match ? 600 : 300;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    if (match) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 900;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.4);
    }
  } catch {}
}

function createDeck(pairCount: number): BubbleCard[] {
  const icons = ALL_ICONS.slice(0, pairCount);
  const cards: BubbleCard[] = [];
  icons.forEach((icon, i) => {
    cards.push({ id: i * 2, icon, isFlipped: false, isMatched: false });
    cards.push({ id: i * 2 + 1, icon, isFlipped: false, isMatched: false });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

const BUBBLE_CONFIGS = Array.from({ length: 8 }, (_, i) => ({
  size: 8 + ((i * 7 + 3) % 20),
  left: `${(i * 13 + 5) % 100}%`,
  xDrift: ((i % 3) - 1) * 15,
  duration: 6 + (i % 4) * 2,
  delay: i * 1.2,
}));

const BackgroundBubbles = React.memo(function BackgroundBubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {BUBBLE_CONFIGS.map((cfg, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: cfg.size,
            height: cfg.size,
            left: cfg.left,
            bottom: -20,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          animate={{ y: [0, -1200], x: [0, cfg.xDrift] }}
          transition={{ duration: cfg.duration, repeat: Infinity, delay: cfg.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
});

export function HiddenReefGame() {
  const { state, dispatch } = useGame();
  const { playClick, playCollect, playSuccess, playSwoosh } = useSoundEffects();
  const [roundIndex, setRoundIndex] = useState(0);
  const [cards, setCards] = useState<BubbleCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showRoundIntro, setShowRoundIntro] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [mindlingState, setMindlingState] = useState<'idle' | 'happy' | 'confused'>('idle');
  const [roundStats, setRoundStats] = useState<{ moves: number; pairs: number }[]>([]);
  const [shuffleWarning, setShuffleWarning] = useState(false);
  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const round = ROUNDS[roundIndex];

  const startRound = useCallback(() => {
    const pairCount = (round.cols * round.rows) / 2;
    setCards(createDeck(pairCount));
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
    setShuffleWarning(false);
    setShowRoundIntro(false);
  }, [round]);

  // Shuffle mechanic for round 3
  useEffect(() => {
    if (roundIndex === 2 && !showRoundIntro && !showReward && !isPaused) {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      shuffleTimerRef.current = setTimeout(() => {
        setShuffleWarning(true);
        setTimeout(() => {
          setCards(prev => {
            const unmatched = prev.filter(c => !c.isMatched);
            const positions = prev.map((c, i) => (!c.isMatched ? i : -1)).filter(i => i >= 0);
            const shuffled = [...unmatched];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            const newCards = [...prev];
            let si = 0;
            positions.forEach(pos => {
              newCards[pos] = { ...shuffled[si], isFlipped: false };
              si++;
            });
            return newCards;
          });
          setFlippedIndices([]);
          setShuffleWarning(false);
        }, 1000);
      }, 30000);
    }
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    };
  }, [roundIndex, matches, showRoundIntro, showReward, isPaused]);

  const handleCardClick = useCallback((index: number) => {
    if (isLocked || isPaused || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      if (newCards[first].icon === newCards[second].icon) {
        playBubblePop(true);
        setMindlingState('happy');
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isMatched: true } : c
          ));
          setMatches(m => {
            const newM = m + 1;
            const totalPairs = (round.cols * round.rows) / 2;
            if (newM >= totalPairs) {
              setTimeout(() => handleRoundComplete(), 600);
            }
            return newM;
          });
          setFlippedIndices([]);
          setIsLocked(false);
          setMindlingState('idle');
        }, 500);
      } else {
        playBubblePop(false);
        setMindlingState('confused');
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
          setIsLocked(false);
          setMindlingState('idle');
        }, 800);
      }
    }
  }, [cards, flippedIndices, isLocked, isPaused, round]);

  const handleRoundComplete = () => {
    setRoundStats(prev => [...prev, { moves: moves + 1, pairs: (round.cols * round.rows) / 2 }]);
    if (roundIndex < ROUNDS.length - 1) {
      setRoundIndex(r => r + 1);
      setShowRoundIntro(true);
      playCollect();
    } else {
      setShowReward(true);
      playSuccess();
    }
  };

  const handleComplete = () => {
    playSwoosh();
    const totalMoves = roundStats.reduce((s, r) => s + r.moves, 0) + moves;
    const totalPairs = roundStats.reduce((s, r) => s + r.pairs, 0) + (round.cols * round.rows) / 2;
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'hiddenReef',
      stats: {
        totalMoves,
        totalPairs,
        efficiency: Math.round((totalPairs / totalMoves) * 100),
        roundsCompleted: ROUNDS.length,
      },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'memory' });
    dispatch({ type: 'COMPLETE_ISLAND', island: 'hidden-reef' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const handleSkip = () => {
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'hiddenReef',
      stats: { totalMoves: 20, totalPairs: 16, efficiency: 60, roundsCompleted: 3 },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'memory' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const { bubbleSize, iconSize } = useMemo(() => {
    if (round.cols <= 2) return { bubbleSize: 'w-28 h-28 md:w-32 md:h-32', iconSize: 48 };
    if (round.cols <= 3) return { bubbleSize: 'w-20 h-20 md:w-24 md:h-24', iconSize: 36 };
    return { bubbleSize: 'w-16 h-16 md:w-20 md:h-20', iconSize: 28 };
  }, [round.cols]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Background ─────────────────────────────────────── */}
      <SceneBg src={hiddenReefBg} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, hsla(200,80%,15%,0.2) 0%, transparent 30%, transparent 70%, hsla(220,60%,10%,0.3) 100%)',
        }}
      />

      <BackgroundBubbles />

      {/* ── HUD ────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-start justify-between px-3 md:px-5 pt-3 md:pt-4">
        {/* Left: spacer */}
        <div className="flex-1" />

        {/* Center: Pause + Round + Skip */}
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

          <GlassCard tint="butter" className="px-4 py-2">
            <span className="font-display font-bold text-base md:text-lg ink-deep tabular-nums">
              Round {roundIndex + 1}/{ROUNDS.length}
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

        {/* Right: Moves + Matches */}
        <motion.div
          initial={{ y: -20, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="flex-1 flex justify-end gap-2"
        >
          <GlassCard tint="mint" className="px-3 py-2">
            <span className="font-display font-bold text-sm ink-deep tabular-nums">
              🫧 {matches}/{(round.cols * round.rows) / 2}
            </span>
          </GlassCard>
          <GlassCard tint="sky" className="px-3 py-2">
            <span className="font-display font-bold text-sm ink-deep tabular-nums">
              Moves: {moves}
            </span>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Round intro overlay ────────────────────────────── */}
      <AnimatePresence>
        {showRoundIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(200,60%,12%,0.5), hsla(220,70%,8%,0.72))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-md"
            >
              <GlassCard
                tint="sky"
                shimmer
                className="p-8 md:p-10 text-center"
                style={{ boxShadow: 'var(--glass-glow-sky)' }}
              >
                <h2
                  className="game-title text-3xl ink-deep mb-2"
                  style={{ textShadow: '0 2px 0 rgba(255,255,255,0.55)' }}
                >
                  Round {roundIndex + 1}
                </h2>
                <p className="font-display font-bold text-lg ink-deep mb-1">{round.label}</p>
                <p className="font-body text-sm ink-soft mb-2">
                  {round.cols * round.rows / 2} pairs in a {round.cols}×{round.rows} grid
                </p>
                {roundIndex === 2 && (
                  <GlassCard tint="peach" className="px-4 py-2 mb-3 inline-block rounded-full">
                    <span className="font-display font-bold text-xs ink-deep">
                      Watch out — bubbles shuffle if you're too slow!
                    </span>
                  </GlassCard>
                )}
                <p className="font-body text-sm ink-soft mb-6">
                  Find matching pairs by tapping the bubbles!
                </p>
                <GlassButton
                  tint="butter"
                  size="lg"
                  onClick={startRound}
                  className="rounded-full"
                >
                  Dive In!
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Game grid ──────────────────────────────────────── */}
      {!showRoundIntro && !showReward && (
        <div className="relative z-10 flex justify-center items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div
            className="grid gap-3 md:gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${round.cols}, 1fr)` }}
          >
            {cards.map((card, index) => (
              <motion.button
                key={`${roundIndex}-${card.id}`}
                onClick={() => handleCardClick(index)}
                disabled={card.isFlipped || card.isMatched || isLocked}
                whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.08 } : {}}
                whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.92 } : {}}
                className={`${bubbleSize} rounded-full relative transition-all duration-300 ${card.isMatched ? 'pointer-events-none' : 'cursor-pointer'}`}
              >
                <AnimatePresence mode="wait">
                  {/* Bubble back (unflipped) */}
                  {!card.isFlipped && !card.isMatched && (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: 90 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 50%, hsla(200,70%,60%,0.2) 100%)',
                        backdropFilter: 'blur(14px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(14px) saturate(150%)',
                        border: '2px solid rgba(255,255,255,0.4)',
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 24px -6px hsla(200,60%,20%,0.3)',
                      }}
                    >
                      <div
                        className="absolute rounded-full"
                        style={{
                          top: '15%',
                          left: '20%',
                          width: '35%',
                          height: '25%',
                          background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 100%)',
                        }}
                      />
                      <span
                        className="font-display font-bold text-xl"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        ?
                      </span>
                    </motion.div>
                  )}

                  {/* Bubble front (flipped / matched) */}
                  {(card.isFlipped || card.isMatched) && (
                    <motion.div
                      key="front"
                      initial={{ rotateY: -90, scale: 0.8 }}
                      animate={{ rotateY: 0, scale: 1 }}
                      exit={{ rotateY: -90 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{
                        background: card.isMatched
                          ? 'linear-gradient(135deg, hsla(48,100%,82%,0.7) 0%, hsla(48,90%,60%,0.5) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 50%, hsla(190,70%,70%,0.3) 100%)',
                        backdropFilter: 'blur(16px) saturate(170%)',
                        WebkitBackdropFilter: 'blur(16px) saturate(170%)',
                        border: card.isMatched
                          ? '2.5px solid hsla(48,100%,65%,0.9)'
                          : '2px solid rgba(255,255,255,0.5)',
                        boxShadow: card.isMatched
                          ? '0 0 0 2px hsla(48,90%,60%,0.5), 0 0 24px hsla(48,100%,55%,0.5), 0 8px 20px -6px hsla(200,60%,15%,0.3)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 20px -6px hsla(200,60%,15%,0.25)',
                      }}
                    >
                      {card.isMatched && (
                        <>
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <motion.div
                              key={i}
                              className="absolute w-1.5 h-1.5 rounded-full"
                              style={{ background: 'hsl(48,100%,65%)' }}
                              initial={{ scale: 0, x: 0, y: 0 }}
                              animate={{
                                scale: [0, 1, 0],
                                x: [0, Math.cos((i / 6) * Math.PI * 2) * 30],
                                y: [0, Math.sin((i / 6) * Math.PI * 2) * 30],
                              }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                          ))}
                        </>
                      )}
                      <ReefIconSVG icon={card.icon} size={iconSize} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Shuffle warning ────────────────────────────────── */}
      <AnimatePresence>
        {shuffleWarning && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <GlassCard
              tint="peach"
              className="px-8 py-4"
              style={{ boxShadow: '0 0 28px hsla(18,100%,55%,0.5)' }}
            >
              <span className="font-display font-bold text-xl ink-deep">
                Shuffling bubbles! 🫧
              </span>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mindling avatar (bottom-left) ──────────────────── */}
      {state.selectedMindling && !showRoundIntro && (
        <div className="fixed bottom-4 left-4 z-20">
          <motion.div
            animate={
              mindlingState === 'happy'
                ? { y: [0, -14, 0], rotate: [0, 8, -8, 0] }
                : mindlingState === 'confused'
                  ? { x: [-4, 4, -4, 4, 0] }
                  : { y: [0, -4, 0] }
            }
            transition={{
              duration: mindlingState === 'idle' ? 2.5 : 0.4,
              repeat: mindlingState === 'idle' ? Infinity : 0,
            }}
            className="flex flex-col items-center"
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full grid place-items-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 60%, hsla(190,70%,75%,0.25) 100%)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '2px solid rgba(255,255,255,0.45)',
                boxShadow:
                  mindlingState === 'happy'
                    ? '0 0 0 2px hsla(48,90%,65%,0.8), 0 0 24px hsla(48,100%,55%,0.5)'
                    : '0 0 0 2px hsla(190,70%,65%,0.5), 0 0 14px hsla(190,80%,55%,0.25)',
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
                background: 'hsla(190,80%,85%,0.85)',
                border: '1px solid hsla(190,70%,70%,0.7)',
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
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(200,60%,12%,0.5), hsla(220,70%,8%,0.72))',
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
                tint="sky"
                shimmer
                className="px-10 py-8 text-center"
                style={{ boxShadow: 'var(--glass-glow-sky)' }}
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
                'radial-gradient(ellipse at center, hsla(190,60%,12%,0.45), hsla(220,70%,8%,0.7))',
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
                  Reef Cleared!
                </motion.h2>

                <p className="font-display font-semibold text-sm ink-soft mb-1">
                  All 3 rounds complete!
                </p>
                <p className="font-body text-xs ink-soft mb-4">
                  Total moves: {roundStats.reduce((s, r) => s + r.moves, 0) + moves}
                </p>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="flex justify-center mb-2"
                >
                  <SeedGem type="memory" size={80} animate={true} />
                </motion.div>

                <GlassCard tint="sky" className="px-4 py-2 mb-5 inline-block">
                  <span className="font-display font-bold text-sm ink-deep">
                    🧠 Memory Seed collected! (3/4)
                  </span>
                </GlassCard>

                {state.selectedMindling && (
                  <motion.div
                    initial={{ y: 16 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="flex items-center justify-center gap-3 mb-6"
                  >
                    <img
                      src={mindlingImages[state.selectedMindling.type]}
                      alt={state.selectedMindling.name}
                      className="w-14 h-14 object-contain drop-shadow-[0_6px_12px_rgba(80,30,140,0.4)]"
                    />
                    <GlassCard tint="mint" className="px-4 py-2 rounded-2xl">
                      <p className="font-display font-semibold text-sm ink-deep">
                        Great memory! 🫧
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
                  Next: Echo Bay →
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
