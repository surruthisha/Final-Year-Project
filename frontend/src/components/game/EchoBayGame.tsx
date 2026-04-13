import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, SkipForward, Play, RotateCcw, Map } from 'lucide-react';

import echoBayBg from '@/assets/echo-bay-bg.jpg';
import { SeedGem } from './SeedGem';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

type CrystalColor = 'red' | 'blue' | 'green' | 'yellow';

const CRYSTAL_COLORS: CrystalColor[] = ['red', 'blue', 'green', 'yellow'];
const WIN_SEQUENCE_LENGTH = 5;

const CRYSTAL_STYLES: Record<CrystalColor, {
  gradient: string;
  glowActive: string;
  glowIdle: string;
  border: string;
  iconColor: string;
  label: string;
}> = {
  red: {
    gradient: 'linear-gradient(135deg, hsla(0, 75%, 65%, 0.45), hsla(340, 70%, 55%, 0.35))',
    glowActive: '0 0 40px hsla(0, 80%, 60%, 0.7), 0 0 80px hsla(0, 80%, 55%, 0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
    glowIdle: '0 4px 20px hsla(0, 60%, 40%, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
    border: '1.5px solid hsla(0, 70%, 75%, 0.5)',
    iconColor: 'hsl(0, 75%, 60%)',
    label: 'RED',
  },
  blue: {
    gradient: 'linear-gradient(135deg, hsla(210, 75%, 65%, 0.45), hsla(230, 70%, 55%, 0.35))',
    glowActive: '0 0 40px hsla(210, 80%, 60%, 0.7), 0 0 80px hsla(210, 80%, 55%, 0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
    glowIdle: '0 4px 20px hsla(210, 60%, 40%, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
    border: '1.5px solid hsla(210, 70%, 75%, 0.5)',
    iconColor: 'hsl(210, 75%, 60%)',
    label: 'BLUE',
  },
  green: {
    gradient: 'linear-gradient(135deg, hsla(140, 65%, 55%, 0.45), hsla(160, 60%, 50%, 0.35))',
    glowActive: '0 0 40px hsla(140, 70%, 50%, 0.7), 0 0 80px hsla(140, 70%, 45%, 0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
    glowIdle: '0 4px 20px hsla(140, 50%, 35%, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
    border: '1.5px solid hsla(140, 60%, 70%, 0.5)',
    iconColor: 'hsl(140, 65%, 50%)',
    label: 'GREEN',
  },
  yellow: {
    gradient: 'linear-gradient(135deg, hsla(48, 90%, 60%, 0.45), hsla(38, 85%, 55%, 0.35))',
    glowActive: '0 0 40px hsla(48, 90%, 55%, 0.7), 0 0 80px hsla(48, 90%, 50%, 0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
    glowIdle: '0 4px 20px hsla(48, 70%, 40%, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
    border: '1.5px solid hsla(48, 80%, 75%, 0.5)',
    iconColor: 'hsl(48, 90%, 55%)',
    label: 'YELLOW',
  },
};

/* Crystal icons — each crystal gets a unique faceted shape */
const CrystalIcon = ({ color, size = 48 }: { color: CrystalColor; size?: number }) => {
  const s = CRYSTAL_STYLES[color];
  switch (color) {
    case 'red':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 44,18 38,42 10,42 4,18" fill={s.iconColor} opacity="0.8" />
          <polygon points="24,4 44,18 24,28 4,18" fill="white" opacity="0.25" />
          <line x1="24" y1="28" x2="24" y2="42" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="24" y1="28" x2="10" y2="42" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <line x1="24" y1="28" x2="38" y2="42" stroke="white" strokeWidth="0.5" opacity="0.2" />
        </svg>
      );
    case 'blue':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="24,2 42,14 42,34 24,46 6,34 6,14" fill={s.iconColor} opacity="0.8" />
          <polygon points="24,2 42,14 24,24 6,14" fill="white" opacity="0.25" />
          <line x1="24" y1="24" x2="24" y2="46" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="24" y1="24" x2="6" y2="34" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <line x1="24" y1="24" x2="42" y2="34" stroke="white" strokeWidth="0.5" opacity="0.2" />
        </svg>
      );
    case 'green':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="24,3 46,24 24,45 2,24" fill={s.iconColor} opacity="0.8" />
          <polygon points="24,3 46,24 24,24" fill="white" opacity="0.25" />
          <polygon points="24,3 2,24 24,24" fill="white" opacity="0.15" />
          <line x1="24" y1="24" x2="24" y2="45" stroke="white" strokeWidth="0.5" opacity="0.3" />
        </svg>
      );
    case 'yellow':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="16,4 32,4 44,20 44,32 32,44 16,44 4,32 4,20" fill={s.iconColor} opacity="0.8" />
          <polygon points="16,4 32,4 44,20 4,20" fill="white" opacity="0.25" />
          <line x1="24" y1="24" x2="4" y2="32" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <line x1="24" y1="24" x2="44" y2="32" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <line x1="24" y1="24" x2="16" y2="44" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <line x1="24" y1="24" x2="32" y2="44" stroke="white" strokeWidth="0.5" opacity="0.2" />
        </svg>
      );
  }
};

const CRYSTAL_FREQUENCIES: Record<CrystalColor, number> = {
  red: 262,    // C4
  blue: 330,   // E4
  green: 392,  // G4
  yellow: 523, // C5
};

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioContext();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

const playTone = (color: CrystalColor) => {
  const ctx = getAudioCtx();
  const freq = CRYSTAL_FREQUENCIES[color];

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.frequency.value = freq;
  osc1.type = 'square';
  gain1.gain.setValueAtTime(0.5, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.6);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.frequency.value = freq * 2;
  osc2.type = 'sine';
  gain2.gain.setValueAtTime(0.35, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 0.4);

  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.frequency.value = freq / 2;
  osc3.type = 'sine';
  gain3.gain.setValueAtTime(0.25, ctx.currentTime);
  gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc3.start(ctx.currentTime);
  osc3.stop(ctx.currentTime + 0.5);
};

/* Floating crystal particles in the background */
const BackgroundParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 10,
        delay: Math.random() * 6,
        dur: 4 + Math.random() * 5,
        hue: [0, 140, 210, 280, 48][Math.floor(Math.random() * 5)],
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size * 1.4,
            background: `hsla(${p.hue}, 60%, 70%, 0.25)`,
            border: `1px solid hsla(${p.hue}, 50%, 80%, 0.3)`,
            backdropFilter: 'blur(4px)',
            transform: `rotate(${Math.random() * 45}deg)`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 30, 0],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 15, -10, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export function EchoBayGame() {
  const { state, dispatch } = useGame();
  const { playCollect, playSuccess, playSwoosh } = useSoundEffects();
  const [sequence, setSequence] = useState<CrystalColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<CrystalColor[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<CrystalColor | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [mindlingState, setMindlingState] = useState<'idle' | 'dancing' | 'sad'>('idle');
  const [showMessage, setShowMessage] = useState<string | null>('Listen closely...');
  const [roundResults, setRoundResults] = useState<('pass' | 'fail' | null)[]>(
    Array(WIN_SEQUENCE_LENGTH).fill(null)
  );

  // Start new round
  const startNewRound = useCallback(() => {
    const newColor = CRYSTAL_COLORS[Math.floor(Math.random() * CRYSTAL_COLORS.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    setIsPlayerTurn(false);
    setShowMessage('Listen closely...');

    // Show the sequence
    setIsShowingSequence(true);

    newSequence.forEach((color, index) => {
      setTimeout(() => {
        setActiveColor(color);
        playTone(color);
        setMindlingState('dancing');

        setTimeout(() => {
          setActiveColor(null);
          setMindlingState('idle');
        }, 500);
      }, (index + 1) * 800);
    });

    // After showing sequence, it's player's turn
    setTimeout(() => {
      setIsShowingSequence(false);
      setIsPlayerTurn(true);
      setShowMessage('Your turn!');
    }, newSequence.length * 800 + 500);
  }, [sequence]);

  // Start game
  useEffect(() => {
    if (sequence.length === 0) {
      setTimeout(() => {
        startNewRound();
      }, 1000);
    }
  }, []);

  const handleCrystalClick = useCallback(
    (color: CrystalColor) => {
      if (!isPlayerTurn || isShowingSequence || gameOver || isPaused) return;

      playTone(color);
      setActiveColor(color);
      setTimeout(() => setActiveColor(null), 200);

      const newPlayerSequence = [...playerSequence, color];
      setPlayerSequence(newPlayerSequence);

      const currentIndex = newPlayerSequence.length - 1;

      // Check if correct
      if (color !== sequence[currentIndex]) {
        // Wrong!
        setRoundResults((prev) => {
          const next = [...prev];
          next[sequence.length - 1] = 'fail';
          return next;
        });
        setMindlingState('sad');
        setShowMessage('Oops! Wrong crystal');
        setGameOver(true);
        setTimeout(() => {
          if (sequence.length >= WIN_SEQUENCE_LENGTH) {
            setShowReward(true);
            playSuccess();
          }
        }, 1000);
        return;
      }

      // Correct!
      setMindlingState('dancing');
      setTimeout(() => setMindlingState('idle'), 300);

      // Check if round complete
      if (newPlayerSequence.length === sequence.length) {
        setRoundResults((prev) => {
          const next = [...prev];
          next[sequence.length - 1] = 'pass';
          return next;
        });
        setStreak((s) => s + 1);

        if (sequence.length >= WIN_SEQUENCE_LENGTH) {
          // Win!
          setShowMessage('Perfect! You did it!');
          setGameOver(true);
          setTimeout(() => {
            setShowReward(true);
            playSuccess();
          }, 1000);
        } else {
          // Next round
          setCurrentRound((r) => r + 1);
          setShowMessage('Great! Next sequence...');
          setTimeout(() => startNewRound(), 1500);
        }
      }
    },
    [isPlayerTurn, isShowingSequence, gameOver, isPaused, playerSequence, sequence, startNewRound]
  );

  const handleComplete = () => {
    playSwoosh();
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'echoBay',
      stats: {
        maxSequence: sequence.length,
        totalRounds: currentRound,
        perfectRounds: streak,
      },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'harmony' });
    dispatch({ type: 'COMPLETE_ISLAND', island: 'echo-bay' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const handleSkip = () => {
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'echoBay',
      stats: { maxSequence: 5, totalRounds: 5, perfectRounds: 3 },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'harmony' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const resetGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setCurrentRound(1);
    setStreak(0);
    setRoundResults(Array(WIN_SEQUENCE_LENGTH).fill(null));
    setGameOver(false);
    setShowReward(false);
    setIsPlayerTurn(false);
    setShowMessage('Listen closely...');
    setTimeout(() => startNewRound(), 500);
  };

  /* Progress dots — show which step in current sequence the player is on */
  const progressDots = sequence.map((_, i) => {
    const filled = i < playerSequence.length;
    return (
      <div
        key={i}
        className="rounded-full transition-all duration-300"
        style={{
          width: 10,
          height: 10,
          background: filled
            ? 'linear-gradient(135deg, hsl(48,100%,65%), hsl(38,100%,55%))'
            : 'rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,255,255,0.45)',
          boxShadow: filled ? '0 0 8px hsla(48,100%,60%,0.6)' : 'none',
        }}
      />
    );
  });

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src={echoBayBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(0deg, hsla(280,40%,12%,0.3) 0%, transparent 40%, transparent 70%, hsla(280,40%,12%,0.15) 100%)',
        }}
      />

      {/* Background particles */}
      <BackgroundParticles />

      {/* ── HUD ── */}
      <div className="relative z-20 flex items-start justify-between px-4 md:px-6 pt-4 md:pt-5">
        {/* Left spacer */}
        <div className="flex-1" />

        {/* Center group: Pause + Round + Skip */}
        <div className="flex items-center gap-2">
          <motion.button
            initial={{ y: -20, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPaused(!isPaused)}
            className="glass-button glass-tint-sky w-11 h-11 grid place-items-center ink-deep"
            aria-label="Pause"
          >
            <Pause className="relative z-10 w-5 h-5" strokeWidth={2.5} />
            <span className="specular-sweep" aria-hidden="true" />
          </motion.button>

          <motion.div
            initial={{ y: -20, scale: 0.94 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.05 }}
          >
            <GlassCard
              tint="butter"
              shimmer
              className="px-5 py-2"
              style={{ boxShadow: 'var(--glass-glow-butter)' }}
            >
              <span className="font-display font-bold text-sm ink-deep whitespace-nowrap">
                Round {currentRound} / {WIN_SEQUENCE_LENGTH}
              </span>
            </GlassCard>
          </motion.div>

          <motion.button
            initial={{ y: -20, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSkip}
            className="glass-button glass-tint-peach w-11 h-11 grid place-items-center ink-deep"
            aria-label="Skip level"
          >
            <SkipForward className="relative z-10 w-5 h-5" strokeWidth={2.5} />
            <span className="specular-sweep" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Right stats: Round progress circles + Streak */}
        <div className="flex-1 flex justify-end gap-2">
          {/* 5 round result circles */}
          <motion.div
            initial={{ y: -20, scale: 0.94 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          >
            <GlassCard tint="sky" className="px-3 py-2 flex items-center gap-1.5">
              {roundResults.map((result, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  animate={
                    result !== null
                      ? { scale: [0, 1.3, 1] }
                      : i === sequence.length - (gameOver ? 0 : 1) && !gameOver
                        ? { scale: [1, 1.15, 1] }
                        : {}
                  }
                  transition={
                    result !== null
                      ? { duration: 0.35, ease: 'easeOut' }
                      : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    width: 14,
                    height: 14,
                    background:
                      result === 'pass'
                        ? 'linear-gradient(135deg, hsl(140,65%,50%), hsl(160,60%,45%))'
                        : result === 'fail'
                          ? 'linear-gradient(135deg, hsl(0,70%,55%), hsl(340,65%,50%))'
                          : 'rgba(255,255,255,0.2)',
                    border:
                      result === 'pass'
                        ? '1.5px solid hsla(140,60%,70%,0.7)'
                        : result === 'fail'
                          ? '1.5px solid hsla(0,60%,70%,0.7)'
                          : '1.5px solid rgba(255,255,255,0.4)',
                    boxShadow:
                      result === 'pass'
                        ? '0 0 8px hsla(140,65%,50%,0.6)'
                        : result === 'fail'
                          ? '0 0 8px hsla(0,70%,55%,0.6)'
                          : 'none',
                  }}
                />
              ))}
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ y: -20, scale: 0.94 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
          >
            <GlassCard tint="mint" className="px-4 py-2">
              <span className="font-display font-bold text-sm ink-deep whitespace-nowrap">
                Streak: {streak}
              </span>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* ── Message pill — absolutely positioned so it doesn't shift the grid ── */}
      <div className="absolute z-20 left-0 right-0 top-[70px] md:top-[76px] flex flex-col items-center pointer-events-none">
        <AnimatePresence mode="wait">
          {showMessage && (
            <motion.div
              key={showMessage}
              initial={{ y: -12, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <GlassCard
                tint={showMessage === 'Your turn!' ? 'butter' : 'lilac'}
                shimmer
                className="px-8 py-2.5 rounded-full"
              >
                <span
                  className="font-display font-bold text-lg ink-deep"
                  style={{
                    textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  {showMessage}
                </span>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {isPlayerTurn && sequence.length > 0 && (
          <div className="flex justify-center gap-2 mt-2">
            {progressDots}
          </div>
        )}
      </div>

      {/* ── Crystal grid — absolutely centered so it never shifts ── */}
      <div className="absolute inset-0 z-10 flex justify-center items-center">
        <div className="grid grid-cols-2 gap-5 md:gap-8">
          {CRYSTAL_COLORS.map((color) => {
            const style = CRYSTAL_STYLES[color];
            const isActive = activeColor === color;
            const canClick = isPlayerTurn && !isShowingSequence && !gameOver;

            return (
              <motion.button
                key={color}
                onClick={() => handleCrystalClick(color)}
                disabled={!canClick}
                whileHover={canClick ? { scale: 1.06, y: -4 } : {}}
                whileTap={canClick ? { scale: 0.94 } : {}}
                animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl flex flex-col items-center justify-center gap-2 select-none"
                style={{
                  background: style.gradient,
                  backdropFilter: 'blur(18px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                  border: style.border,
                  boxShadow: isActive ? style.glowActive : style.glowIdle,
                  cursor: canClick ? 'pointer' : 'not-allowed',
                  opacity: canClick || isActive ? 1 : 0.7,
                }}
              >
                {/* Specular highlight */}
                <div
                  className="absolute inset-x-3 top-2 h-1/3 rounded-t-xl pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />

                {/* Crystal icon */}
                <motion.div
                  animate={isActive ? { scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <CrystalIcon color={color} size={48} />
                </motion.div>

                {/* Label */}
                <span
                  className="font-display font-bold text-sm md:text-base select-none"
                  style={{
                    color: style.iconColor,
                    textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  {style.label}
                </span>

                {/* Active ring pulse */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      border: `2px solid ${style.iconColor}`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Mindling avatar ── */}
      {state.selectedMindling && (
        <motion.div
          animate={
            mindlingState === 'dancing'
              ? { y: [0, -10, 0], rotate: [0, 5, -5, 0] }
              : mindlingState === 'sad'
                ? { x: [-5, 5, -5, 5, 0] }
                : { y: [0, -3, 0] }
          }
          transition={{
            duration: mindlingState === 'idle' ? 2 : 0.3,
            repeat: mindlingState === 'idle' ? Infinity : 0,
          }}
          className="fixed bottom-6 left-6 z-20"
        >
          <div
            className="relative"
            style={{
              filter:
                mindlingState === 'dancing'
                  ? 'drop-shadow(0 0 14px hsla(280,60%,60%,0.5))'
                  : 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
            }}
          >
            <img
              src={mindlingImages[state.selectedMindling.type]}
              alt={state.selectedMindling.name}
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
            />
          </div>
          {/* Speech bubble */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute -right-14 -top-1"
          >
            <GlassCard tint="bubble" className="px-2.5 py-1.5">
              {mindlingState === 'dancing' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M6 4l4 2M6 8l4-2" stroke="hsl(45, 95%, 55%)" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="6" cy="10" r="1.5" fill="hsl(45, 95%, 55%)" />
                  <circle cx="10" cy="6" r="1.5" fill="hsl(45, 95%, 55%)" />
                </svg>
              )}
              {mindlingState === 'sad' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="hsl(210, 80%, 60%)" strokeWidth="1.5" fill="none" />
                  <circle cx="6" cy="7" r="1" fill="hsl(210, 80%, 60%)" />
                  <circle cx="10" cy="7" r="1" fill="hsl(210, 80%, 60%)" />
                  <path d="M5.5 11c1-1.5 4-1.5 5 0" stroke="hsl(210, 80%, 60%)" strokeWidth="1" strokeLinecap="round" transform="rotate(180 8 11)" />
                </svg>
              )}
              {mindlingState === 'idle' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="5" cy="8" r="2.5" stroke="hsl(280, 60%, 60%)" strokeWidth="1.5" fill="none" />
                  <circle cx="11" cy="8" r="2.5" stroke="hsl(280, 60%, 60%)" strokeWidth="1.5" fill="none" />
                  <circle cx="5" cy="8" r="1" fill="hsl(280, 60%, 60%)" />
                  <circle cx="11" cy="8" r="1" fill="hsl(280, 60%, 60%)" />
                </svg>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* ── Pause overlay ── */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(280,50%,25%,0.45) 0%, hsla(232,60%,15%,0.65) 100%)',
              backdropFilter: 'blur(14px) saturate(140%)',
              WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <GlassCard
                tint="lilac"
                shimmer
                className="p-10 text-center"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
              >
                <h2
                  className="game-title text-4xl ink-deep mb-6"
                  style={{ textShadow: '0 2px 0 rgba(255,255,255,0.5)' }}
                >
                  Paused
                </h2>

                <GlassButton tint="butter" size="lg" onClick={() => setIsPaused(false)} className="rounded-full">
                  <span className="inline-flex items-center gap-2">
                    <Play className="w-5 h-5" strokeWidth={2.5} />
                    Resume
                  </span>
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reward overlay ── */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(280,50%,25%,0.45) 0%, hsla(232,60%,15%,0.65) 100%)',
              backdropFilter: 'blur(14px) saturate(140%)',
              WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            }}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
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
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: 2, duration: 0.4 }}
                  style={{ textShadow: '0 2px 0 rgba(255,255,255,0.5)' }}
                >
                  Level Complete!
                </motion.h2>

                <p className="font-body text-sm ink-soft mb-4">
                  Sequence {sequence.length} reached &bull; {streak} perfect rounds
                </p>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="flex justify-center my-5"
                >
                  <SeedGem type="harmony" size={96} animate={true} />
                </motion.div>

                <motion.p
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-display font-bold text-lg mb-6"
                  style={{ color: 'hsl(280,60%,50%)' }}
                >
                  Harmony Seed collected! (4/4)
                </motion.p>

                {state.selectedMindling && (
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-3 mb-6"
                  >
                    <img
                      src={mindlingImages[state.selectedMindling.type]}
                      alt={state.selectedMindling.name}
                      className="w-14 h-14 object-contain"
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
                    />
                    <GlassCard tint="bubble" className="px-4 py-2">
                      <p className="font-display font-bold text-sm ink-deep">
                        Awesome! We did it!
                      </p>
                    </GlassCard>
                  </motion.div>
                )}

                <GlassButton tint="butter" size="lg" onClick={handleComplete} className="rounded-full">
                  <span className="inline-flex items-center gap-2">
                    To Heart Isle
                    <span className="text-lg">→</span>
                  </span>
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Game Over (failed before winning) ── */}
      <AnimatePresence>
        {gameOver && !showReward && sequence.length < WIN_SEQUENCE_LENGTH && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(280,50%,25%,0.45) 0%, hsla(232,60%,15%,0.65) 100%)',
              backdropFilter: 'blur(14px) saturate(140%)',
              WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full max-w-sm"
            >
              <GlassCard
                tint="peach"
                shimmer
                className="p-8 text-center"
                style={{ boxShadow: 'var(--glass-glow-peach)' }}
              >
                <h2
                  className="game-title text-3xl ink-deep mb-3"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                >
                  Oops!
                </h2>
                <p className="font-body ink-soft mb-6">
                  You reached sequence <span className="font-bold ink-deep">{sequence.length}</span>. Keep trying!
                </p>

                <div className="flex justify-center gap-3">
                  <GlassButton tint="butter" size="md" onClick={resetGame} className="rounded-full">
                    <span className="inline-flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                      Try Again
                    </span>
                  </GlassButton>
                  <GlassButton
                    tint="sky"
                    size="md"
                    onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
                    className="rounded-full"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Map className="w-4 h-4" strokeWidth={2.5} />
                      Map
                    </span>
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
