import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, SkipForward } from 'lucide-react';

import hiddenReefBg from '@/assets/hidden-reef-bg.jpg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

// Icon types for the memory bubbles
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

// Render an SVG icon for each type (memoized to avoid re-renders)
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

// Shared AudioContext for bubble sounds
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
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

// Pre-generate stable bubble configs so they don't change on re-render
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
          className="absolute rounded-full bg-card/10 border border-card/20"
          style={{ width: cfg.size, height: cfg.size, left: cfg.left, bottom: -20 }}
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

  // Shuffle mechanic for round 3 — shuffle after 30s of no match
  useEffect(() => {
    if (roundIndex === 2 && !showRoundIntro && !showReward && !isPaused) {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      shuffleTimerRef.current = setTimeout(() => {
        setShuffleWarning(true);
        setTimeout(() => {
          setCards(prev => {
            const unmatched = prev.filter(c => !c.isMatched);
            const matched = prev.filter(c => c.isMatched);
            // Shuffle unmatched positions
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
        // Match!
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
              // Round complete
              setTimeout(() => handleRoundComplete(), 600);
            }
            return newM;
          });
          setFlippedIndices([]);
          setIsLocked(false);
          setMindlingState('idle');
        }, 500);
      } else {
        // Mismatch
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
    dispatch({ type: 'UNLOCK_ISLAND', island: 'echo-bay' });
    dispatch({ type: 'SET_CURRENT_ISLAND', island: 'echo-bay' });
    dispatch({ type: 'SET_SCREEN', screen: 'level-intro' });
  };

  const handleSkip = () => {
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'hiddenReef',
      stats: { totalMoves: 20, totalPairs: 16, efficiency: 60, roundsCompleted: 3 },
    });
    dispatch({ type: 'UNLOCK_ISLAND', island: 'echo-bay' });
    dispatch({ type: 'SET_CURRENT_ISLAND', island: 'echo-bay' });
    dispatch({ type: 'SET_SCREEN', screen: 'level-intro' });
  };

  // Bubble size based on grid (memoized)
  const { bubbleSize, iconSize } = useMemo(() => {
    if (round.cols <= 2) return { bubbleSize: 'w-28 h-28 md:w-32 md:h-32', iconSize: 48 };
    if (round.cols <= 3) return { bubbleSize: 'w-20 h-20 md:w-24 md:h-24', iconSize: 36 };
    return { bubbleSize: 'w-16 h-16 md:w-20 md:h-20', iconSize: 28 };
  }, [round.cols]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hiddenReefBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsla(200,80%,30%,0.3)] via-transparent to-[hsla(220,60%,20%,0.5)]" />

      {/* Animated bubbles background (memoized to prevent re-creation) */}
      <BackgroundBubbles />

      {/* HUD */}
      <div className="relative z-20 flex justify-between items-center p-4">
        <div className="flex gap-2 pl-12">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-3 rounded-full bg-card/90 shadow-soft hover:shadow-float transition-all"
          >
            <Pause className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/90 shadow-soft hover:shadow-float transition-all text-sm font-display"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>
        </div>

        <div className="bg-card/90 px-5 py-2 rounded-game shadow-soft font-display font-bold text-lg">
          Hidden Reef
        </div>

        <div className="flex gap-3 items-center">
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display">
            Round {roundIndex + 1}
          </div>
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display">
            Moves: <span className="text-primary font-bold">{moves}</span>
          </div>
        </div>
      </div>

      {/* Round intro overlay */}
      <AnimatePresence>
        {showRoundIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[hsla(209,50%,15%,0.6)] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-card rounded-game p-8 md:p-12 text-center shadow-float max-w-md mx-4"
            >
              <h2 className="game-title text-3xl mb-2">Round {roundIndex + 1}</h2>
              <p className="text-xl font-display text-primary mb-2">{round.label}</p>
              <p className="text-foreground/70 mb-2">
                {round.cols * round.rows / 2} pairs in a {round.cols}×{round.rows} grid
              </p>
              {roundIndex === 2 && (
                <p className="text-accent text-sm font-bold mb-4">
                  Watch out — bubbles shuffle if you're too slow!
                </p>
              )}
              <p className="text-muted-foreground text-sm mb-6">
                Find matching pairs by tapping the bubbles!
              </p>
              <button
                onClick={startRound}
                className="px-8 py-4 bg-gradient-to-b from-primary to-primary/80
                           text-primary-foreground rounded-game font-display font-bold
                           text-xl btn-bounce shadow-glow-gold"
              >
                Dive In!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game grid */}
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
                {/* Bubble back (unflipped) */}
                <AnimatePresence mode="wait">
                  {!card.isFlipped && !card.isMatched && (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: 90 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(ellipse at 35% 25%, hsla(190, 80%, 85%, 0.9) 0%, hsla(200, 70%, 60%, 0.7) 50%, hsla(210, 60%, 45%, 0.8) 100%)',
                        boxShadow: '0 4px 20px hsla(200, 80%, 50%, 0.3), inset 0 -4px 8px hsla(200, 60%, 40%, 0.3)',
                        border: '2px solid hsla(200, 80%, 80%, 0.5)',
                      }}
                    >
                      {/* Bubble highlight */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          top: '15%',
                          left: '20%',
                          width: '35%',
                          height: '25%',
                          background: 'radial-gradient(ellipse, hsla(0, 0%, 100%, 0.7) 0%, transparent 100%)',
                        }}
                      />
                      <span className="text-card/50 text-xl font-bold">?</span>
                    </motion.div>
                  )}

                  {/* Bubble front (flipped) */}
                  {(card.isFlipped || card.isMatched) && (
                    <motion.div
                      key="front"
                      initial={{ rotateY: -90, scale: 0.8 }}
                      animate={{ rotateY: 0, scale: 1 }}
                      exit={{ rotateY: -90 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`absolute inset-0 rounded-full flex items-center justify-center ${card.isMatched ? '' : ''}`}
                      style={{
                        background: card.isMatched
                          ? 'radial-gradient(ellipse at 40% 30%, hsla(45, 100%, 80%, 0.95) 0%, hsla(45, 90%, 55%, 0.85) 100%)'
                          : 'radial-gradient(ellipse at 35% 25%, hsla(190, 80%, 90%, 0.95) 0%, hsla(200, 70%, 75%, 0.9) 100%)',
                        boxShadow: card.isMatched
                          ? '0 0 24px hsla(45, 100%, 55%, 0.6), 0 4px 12px hsla(45, 90%, 40%, 0.3)'
                          : '0 4px 16px hsla(200, 60%, 50%, 0.3)',
                        border: card.isMatched
                          ? '2px solid hsla(45, 90%, 60%, 0.8)'
                          : '2px solid hsla(200, 70%, 80%, 0.6)',
                      }}
                    >
                      {/* Match sparkles */}
                      {card.isMatched && (
                        <>
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <motion.div
                              key={i}
                              className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                              initial={{ scale: 0, x: 0, y: 0 }}
                              animate={{
                                scale: [0, 1, 0],
                                x: [0, (Math.cos((i / 6) * Math.PI * 2) * 30)],
                                y: [0, (Math.sin((i / 6) * Math.PI * 2) * 30)],
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

      {/* Shuffle warning */}
      <AnimatePresence>
        {shuffleWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-accent/90 text-accent-foreground px-8 py-4 rounded-game font-display font-bold text-2xl shadow-float">
              Shuffling bubbles!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mindling */}
      {state.selectedMindling && !showRoundIntro && (
        <motion.div
          animate={
            mindlingState === 'happy'
              ? { y: [0, -12, 0], rotate: [0, 8, -8, 0] }
              : mindlingState === 'confused'
              ? { x: [-4, 4, -4, 4, 0] }
              : { y: [0, -3, 0] }
          }
          transition={{ duration: mindlingState === 'idle' ? 2 : 0.4, repeat: mindlingState === 'idle' ? Infinity : 0 }}
          className="fixed bottom-6 left-6 z-20"
        >
          <img
            src={mindlingImages[state.selectedMindling.type]}
            alt={state.selectedMindling.name}
            className="w-20 h-20 md:w-24 md:h-24 object-contain mindling-img"
          />
          {/* Speech indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -left-14 -top-1 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-soft"
          >
            {mindlingState === 'happy' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M6 4l4 2M6 8l4-2" stroke="hsl(45, 95%, 55%)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="6" cy="10" r="1.5" fill="hsl(45, 95%, 55%)"/>
                <circle cx="10" cy="6" r="1.5" fill="hsl(45, 95%, 55%)"/>
              </svg>
            )}
            {mindlingState === 'confused' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="hsl(210, 80%, 60%)" strokeWidth="1.5" fill="none"/>
                <text x="8" y="11" textAnchor="middle" fontSize="8" fill="hsl(210, 80%, 60%)" fontWeight="bold">?</text>
              </svg>
            )}
            {mindlingState === 'idle' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="5" cy="8" r="2.5" stroke="hsl(280, 60%, 60%)" strokeWidth="1.5" fill="none"/>
                <circle cx="11" cy="8" r="2.5" stroke="hsl(280, 60%, 60%)" strokeWidth="1.5" fill="none"/>
                <circle cx="5" cy="8" r="1" fill="hsl(280, 60%, 60%)"/>
                <circle cx="11" cy="8" r="1" fill="hsl(280, 60%, 60%)"/>
              </svg>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[hsla(209,50%,15%,0.6)] flex items-center justify-center"
          >
            <div className="bg-card rounded-game p-8 text-center shadow-float">
              <h2 className="game-title text-3xl mb-6">PAUSED</h2>
              <button
                onClick={() => setIsPaused(false)}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-game font-display font-bold btn-bounce"
              >
                Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[hsla(209,50%,15%,0.6)] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-card rounded-game p-8 md:p-12 text-center shadow-float max-w-md mx-4"
            >
              <motion.h2
                className="game-title text-4xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 3, duration: 0.3 }}
              >
                REEF CLEARED!
              </motion.h2>

              <p className="text-foreground/70 font-display text-lg mb-2">
                All 3 rounds complete!
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                Total moves: {roundStats.reduce((s, r) => s + r.moves, 0) + moves}
              </p>

              {state.selectedMindling && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <img
                    src={mindlingImages[state.selectedMindling.type]}
                    alt={state.selectedMindling.name}
                    className="w-16 h-16 object-contain mindling-img"
                  />
                  <div className="bg-card border border-border rounded-full px-4 py-2">
                    <p className="font-medium">Great memory!</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleComplete}
                className="px-8 py-4 bg-gradient-to-b from-primary to-primary/80
                           text-primary-foreground rounded-game font-display font-bold
                           text-xl btn-bounce shadow-glow-gold"
              >
                Next: Echo Bay →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
