import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, SkipForward } from 'lucide-react';

import echoBayBg from '@/assets/echo-bay-bg.jpg';
import { SeedGem } from './SeedGem';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

type CrystalColor = 'red' | 'blue' | 'green' | 'yellow';

const CRYSTAL_COLORS: CrystalColor[] = ['red', 'blue', 'green', 'yellow'];
const WIN_SEQUENCE_LENGTH = 5;

const CRYSTAL_STYLES: Record<CrystalColor, { bg: string; glow: string; text: string }> = {
  red: { 
    bg: 'bg-crystal-red', 
    glow: '0 0 30px hsl(0 80% 60% / 0.8)', 
    text: 'RED' 
  },
  blue: { 
    bg: 'bg-crystal-blue', 
    glow: '0 0 30px hsl(210 80% 60% / 0.8)', 
    text: 'BLUE' 
  },
  green: { 
    bg: 'bg-crystal-green', 
    glow: '0 0 30px hsl(140 70% 50% / 0.8)', 
    text: 'GREEN' 
  },
  yellow: { 
    bg: 'bg-crystal-yellow', 
    glow: '0 0 30px hsl(50 90% 55% / 0.8)', 
    text: 'YELLOW' 
  },
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

  const handleCrystalClick = useCallback((color: CrystalColor) => {
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
      setStreak(s => s + 1);
      
      if (sequence.length >= WIN_SEQUENCE_LENGTH) {
        // Win!
        setShowMessage('Perfect! You did it!');
        setGameOver(true);
        setTimeout(() => { setShowReward(true); playSuccess(); }, 1000);
      } else {
        // Next round
        setCurrentRound(r => r + 1);
        setShowMessage('Great! Next sequence...');
        setTimeout(() => startNewRound(), 1500);
      }
    }
  }, [isPlayerTurn, isShowingSequence, gameOver, isPaused, playerSequence, sequence, startNewRound]);

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
    setGameOver(false);
    setShowReward(false);
    setIsPlayerTurn(false);
    setShowMessage('Listen closely...');
    setTimeout(() => startNewRound(), 500);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${echoBayBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/60" />

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

        <div className="flex gap-4 items-center">
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display">
            SEQUENCE: {sequence.length}
          </div>
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display">
            STREAK: {streak}
          </div>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        {showMessage && (
          <motion.div
            key={showMessage}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 text-center py-4"
          >
            <p className="text-card font-display text-2xl drop-shadow-lg">
              {showMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crystals */}
      <div className="relative z-10 flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {CRYSTAL_COLORS.map((color) => {
            const style = CRYSTAL_STYLES[color];
            const isActive = activeColor === color;
            
            return (
              <motion.button
                key={color}
                onClick={() => handleCrystalClick(color)}
                disabled={!isPlayerTurn || isShowingSequence || gameOver}
                whileHover={isPlayerTurn ? { scale: 1.05 } : {}}
                whileTap={isPlayerTurn ? { scale: 0.95 } : {}}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                className={`
                  w-32 h-40 md:w-40 md:h-48 rounded-2xl
                  ${style.bg} transition-all duration-200
                  flex items-center justify-center
                  font-display font-bold text-2xl text-card
                  border-4 border-card/40
                  ${!isPlayerTurn ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                `}
                style={{
                  boxShadow: isActive 
                    ? `${style.glow}, inset 0 2px 4px hsl(0 0% 100% / 0.3)` 
                    : '0 4px 12px hsl(0 0% 0% / 0.15), inset 0 2px 4px hsl(0 0% 100% / 0.15)',
                }}
              >
                <motion.span
                  animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                  className="drop-shadow-lg select-none"
                >
                  {style.text}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mindling */}
      {state.selectedMindling && (
        <motion.div
          animate={
            mindlingState === 'dancing' 
              ? { y: [0, -10, 0], rotate: [0, 5, -5, 0] }
              : mindlingState === 'sad'
              ? { x: [-5, 5, -5, 5, 0] }
              : { y: [0, -3, 0] }
          }
          transition={{ duration: mindlingState === 'idle' ? 2 : 0.3, repeat: mindlingState === 'idle' ? Infinity : 0 }}
          className="fixed bottom-8 left-8 z-20"
        >
          <img 
            src={mindlingImages[state.selectedMindling.type]}
            alt={state.selectedMindling.name}
            className="w-24 h-24 object-contain mindling-img"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -right-16 -top-2 bg-card/90 backdrop-blur-sm rounded-bubble px-3 py-1.5 
                       text-sm font-display font-bold shadow-soft"
          >
            {mindlingState === 'dancing' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M6 4l4 2M6 8l4-2" stroke="hsl(45, 95%, 55%)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="10" r="1.5" fill="hsl(45, 95%, 55%)"/><circle cx="10" cy="6" r="1.5" fill="hsl(45, 95%, 55%)"/></svg>
            )}
            {mindlingState === 'sad' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="hsl(210, 80%, 60%)" strokeWidth="1.5" fill="none"/><circle cx="6" cy="7" r="1" fill="hsl(210, 80%, 60%)"/><circle cx="10" cy="7" r="1" fill="hsl(210, 80%, 60%)"/><path d="M5.5 11c1-1.5 4-1.5 5 0" stroke="hsl(210, 80%, 60%)" strokeWidth="1" strokeLinecap="round" transform="rotate(180 8 11)"/></svg>
            )}
            {mindlingState === 'idle' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="8" r="2.5" stroke="hsl(280, 60%, 60%)" strokeWidth="1.5" fill="none"/><circle cx="11" cy="8" r="2.5" stroke="hsl(280, 60%, 60%)" strokeWidth="1.5" fill="none"/><circle cx="5" cy="8" r="1" fill="hsl(280, 60%, 60%)"/><circle cx="11" cy="8" r="1" fill="hsl(280, 60%, 60%)"/></svg>
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
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center"
          >
            <div className="bg-card rounded-game p-8 text-center shadow-float">
              <h2 className="game-title text-3xl mb-6">PAUSED</h2>
              <button
                onClick={() => setIsPaused(false)}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-game 
                           font-display font-bold btn-bounce"
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
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-card rounded-game p-8 md:p-12 text-center shadow-float max-w-md mx-4"
            >
              <motion.h2 
                className="game-title text-4xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 3, duration: 0.3 }}
              >
                LEVEL COMPLETE!
              </motion.h2>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mx-auto my-6 flex justify-center"
              >
                <SeedGem type="harmony" size={96} animate={true} />
              </motion.div>

              {state.selectedMindling && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <img 
                    src={mindlingImages[state.selectedMindling.type]}
                    alt={state.selectedMindling.name}
                    className="w-16 h-16 mindling-img"
                  />
                  <div className="bg-card border border-border rounded-bubble px-4 py-2">
                    <p className="font-medium">Awesome! We did it!</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleComplete}
                className="px-8 py-4 bg-gradient-to-b from-primary to-primary/80 
                           text-primary-foreground rounded-game font-display font-bold 
                           text-xl btn-bounce shadow-glow-gold"
              >
                To Heart Isle →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over (failed before winning) */}
      <AnimatePresence>
        {gameOver && !showReward && sequence.length < WIN_SEQUENCE_LENGTH && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center"
          >
            <div className="bg-card rounded-game p-8 text-center shadow-float">
              <h2 className="game-title text-3xl mb-4">Oops!</h2>
              <p className="text-lg mb-6">You reached sequence {sequence.length}. Keep trying!</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-game 
                             font-display font-bold btn-bounce"
                >
                  Try Again
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
                  className="px-6 py-3 border-2 border-border rounded-game 
                             font-display btn-bounce"
                >
                  Back to Map
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
