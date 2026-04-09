import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, Star, SkipForward } from 'lucide-react';

import { Firefly as FireflyComponent } from './Firefly';
import { SeedGem } from './SeedGem';
import floatingIslandsBg from '@/assets/floating-islands-bg.jpg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

let fireflyIdCounter = 0;

interface FireflyData {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
}

export function CloudportGame() {
  const { state, dispatch } = useGame();
  const { playCollect, playSuccess, playSwoosh } = useSoundEffects();
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(45);
  const [fireflies, setFireflies] = useState<FireflyData[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [mindlingState, setMindlingState] = useState<'idle' | 'happy' | 'sad'>('idle');
  const [showReward, setShowReward] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const TARGET_CATCHES = 10;
  const mindlingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caughtIdsRef = useRef<Set<number>>(new Set());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (mindlingTimeoutRef.current) clearTimeout(mindlingTimeoutRef.current);
    };
  }, []);

  // Spawn fireflies
  useEffect(() => {
    if (gameOver || isPaused || score >= TARGET_CATCHES) return;

    const spawnFirefly = () => {
      const newFirefly: FireflyData = {
        id: ++fireflyIdCounter,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 60,
        spawnTime: Date.now(),
      };
      setFireflies(prev => [...prev.slice(-3), newFirefly]);
    };

    const interval = setInterval(spawnFirefly, 1500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [gameOver, isPaused, score]);

  // Timer
  useEffect(() => {
    if (gameOver || isPaused) return;

    const timer = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isPaused]);

  // Auto-remove fireflies that weren't caught
  useEffect(() => {
    if (gameOver || isPaused) return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      setFireflies(prev => {
        const toRemove = prev.filter(f => now - f.spawnTime > 3000);
        if (toRemove.length > 0) {
          setMisses(m => m + toRemove.length);
          setMindlingState('sad');
          setTimeout(() => setMindlingState('idle'), 500);
        }
        return prev.filter(f => now - f.spawnTime <= 3000);
      });
    }, 100);

    return () => clearInterval(cleanup);
  }, [gameOver, isPaused]);

  // Check for win
  useEffect(() => {
    if (score >= TARGET_CATCHES && !gameOver) {
      setGameOver(true);
      setShowReward(true);
      playSuccess();
    }
  }, [score, gameOver]);

  const catchFirefly = useCallback((firefly: FireflyData) => {
    // Guard against duplicate clicks before the state update removes the firefly
    if (caughtIdsRef.current.has(firefly.id)) return;
    caughtIdsRef.current.add(firefly.id);

    const reactionTime = Date.now() - firefly.spawnTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setScore(prev => prev + 1);
    setFireflies(prev => prev.filter(f => f.id !== firefly.id));
    playCollect();
    setMindlingState('happy');
    if (mindlingTimeoutRef.current) clearTimeout(mindlingTimeoutRef.current);
    mindlingTimeoutRef.current = setTimeout(() => setMindlingState('idle'), 500);
  }, [playCollect]);

  const handleComplete = () => {
    const avgReaction = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'cloudport',
      stats: {
        totalTime: 45 - time,
        avgReactionTime: avgReaction,
        catches: score,
        misses,
      },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'spark' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const handleSkip = () => {
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'cloudport',
      stats: { totalTime: 30, avgReactionTime: 350, catches: 25, misses: 15 },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'spark' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${floatingIslandsBg})` }}
      />

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
            <SkipForward className="w-4 h-4" />
            Skip
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display text-lg">
            TIME: {formatTime(time)}
          </div>
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display text-lg flex items-center gap-2">
            SCORE: {score}/{TARGET_CATCHES}
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(score / 2) ? 'text-star-gold fill-star-gold' : 'text-muted'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game area */}
      <div className="relative z-10 w-full h-[calc(100vh-100px)]">
        {/* Fireflies */}
        <AnimatePresence>
          {fireflies.map(firefly => (
            <FireflyComponent
              key={firefly.id}
              onClick={() => catchFirefly(firefly)}
              x={firefly.x}
              y={firefly.y}
            />
          ))}
        </AnimatePresence>

        {/* Mindling */}
        {state.selectedMindling && (
          <motion.div
            animate={
              mindlingState === 'happy' 
                ? { y: [0, -30, 0], rotate: [0, 10, -10, 0] }
                : mindlingState === 'sad'
                ? { x: [-5, 5, -5, 5, 0] }
                : { y: [0, -5, 0] }
            }
            transition={{ duration: mindlingState === 'idle' ? 2 : 0.5, repeat: mindlingState === 'idle' ? Infinity : 0 }}
            className="fixed bottom-8 left-8 z-20"
          >
            <img 
              src={mindlingImages[state.selectedMindling.type]}
              alt={state.selectedMindling.name}
              className="w-24 h-24 md:w-32 md:h-32 object-contain mindling-img"
            />
          </motion.div>
        )}
      </div>

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
            className="fixed inset-0 z-50 bg-[hsla(209,50%,15%,0.6)] flex items-center justify-center"
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
                <SeedGem type="spark" size={96} animate={true} />
              </motion.div>
              
              <div className="bg-muted rounded-lg px-4 py-2 mb-4">
                <span className="font-display">Bag: 1/3 Seeds</span>
              </div>

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
                    <p className="font-medium">Yay! We got it!</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleComplete}
                className="px-8 py-4 bg-gradient-to-b from-primary to-primary/80 
                           text-primary-foreground rounded-game font-display font-bold 
                           text-xl btn-bounce shadow-glow-gold"
              >
                Next Level →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over (failed) */}
      <AnimatePresence>
        {gameOver && !showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[hsla(209,50%,15%,0.6)] flex items-center justify-center"
          >
            <div className="bg-card rounded-game p-8 text-center shadow-float">
              <h2 className="game-title text-3xl mb-4">Time's Up!</h2>
              <p className="text-lg mb-6">You caught {score} fireflies. Try again?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setScore(0);
                    setTime(45);
                    setFireflies([]);
                    setReactionTimes([]);
                    setMisses(0);
                    setGameOver(false);
                  }}
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
