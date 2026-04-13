import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, Play, SkipForward } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/glass';

import starBridgeBg from '@/assets/star-bridge-bg.jpg';
import { SeedGem } from './SeedGem';
import { SceneBg } from './SceneBg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

interface Node {
  id: string;
  value: string;
  type: 'number' | 'letter';
  x: number;
  y: number;
}

interface Puzzle {
  sequence: string[];
  nodes: Node[];
  instruction: string;
}

const PUZZLES: Puzzle[] = [
  {
    sequence: ['1', 'A', '2', 'B', '3', 'C'],
    instruction: 'Connect: 1 → A → 2 → B → 3 → C',
    nodes: [
      { id: '1', value: '1', type: 'number', x: 20, y: 32 },
      { id: 'A', value: 'A', type: 'letter', x: 50, y: 24 },
      { id: '2', value: '2', type: 'number', x: 80, y: 38 },
      { id: 'B', value: 'B', type: 'letter', x: 70, y: 58 },
      { id: '3', value: '3', type: 'number', x: 35, y: 72 },
      { id: 'C', value: 'C', type: 'letter', x: 55, y: 86 },
    ],
  },
  {
    sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D'],
    instruction: 'Connect: 1 → A → 2 → B → 3 → C → 4 → D',
    nodes: [
      { id: '1', value: '1', type: 'number', x: 15, y: 28 },
      { id: 'A', value: 'A', type: 'letter', x: 40, y: 20 },
      { id: '2', value: '2', type: 'number', x: 70, y: 28 },
      { id: 'B', value: 'B', type: 'letter', x: 85, y: 48 },
      { id: '3', value: '3', type: 'number', x: 60, y: 62 },
      { id: 'C', value: 'C', type: 'letter', x: 30, y: 54 },
      { id: '4', value: '4', type: 'number', x: 20, y: 76 },
      { id: 'D', value: 'D', type: 'letter', x: 50, y: 87 },
    ],
  },
  {
    sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'],
    instruction: 'Connect: 1 → A → 2 → B → 3 → C → 4 → D → 5 → E',
    nodes: [
      { id: '1', value: '1', type: 'number', x: 10, y: 24 },
      { id: 'A', value: 'A', type: 'letter', x: 35, y: 20 },
      { id: '2', value: '2', type: 'number', x: 60, y: 26 },
      { id: 'B', value: 'B', type: 'letter', x: 85, y: 33 },
      { id: '3', value: '3', type: 'number', x: 75, y: 52 },
      { id: 'C', value: 'C', type: 'letter', x: 50, y: 45 },
      { id: '4', value: '4', type: 'number', x: 25, y: 58 },
      { id: 'D', value: 'D', type: 'letter', x: 15, y: 78 },
      { id: '5', value: '5', type: 'number', x: 45, y: 76 },
      { id: 'E', value: 'E', type: 'letter', x: 70, y: 84 },
    ],
  },
  {
    sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E', '6', 'F'],
    instruction: 'Connect: 1→A→2→B→3→C→4→D→5→E→6→F',
    nodes: [
      { id: '1', value: '1', type: 'number', x: 12, y: 22 },
      { id: 'A', value: 'A', type: 'letter', x: 30, y: 18 },
      { id: '2', value: '2', type: 'number', x: 55, y: 24 },
      { id: 'B', value: 'B', type: 'letter', x: 80, y: 22 },
      { id: '3', value: '3', type: 'number', x: 88, y: 40 },
      { id: 'C', value: 'C', type: 'letter', x: 70, y: 52 },
      { id: '4', value: '4', type: 'number', x: 45, y: 47 },
      { id: 'D', value: 'D', type: 'letter', x: 20, y: 55 },
      { id: '5', value: '5', type: 'number', x: 15, y: 74 },
      { id: 'E', value: 'E', type: 'letter', x: 40, y: 82 },
      { id: '6', value: '6', type: 'number', x: 65, y: 77 },
      { id: 'F', value: 'F', type: 'letter', x: 85, y: 84 },
    ],
  },
];

export function StarBridgeGame() {
  const { state, dispatch } = useGame();
  const { playClick, playCollect, playSuccess, playSwoosh } = useSoundEffects();
  const [round, setRound] = useState(0);
  const [connections, setConnections] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [showError, setShowError] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showRoundComplete, setShowRoundComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(Date.now());
  const [mindlingState, setMindlingState] = useState<'idle' | 'happy' | 'sad'>('idle');

  const MAX_ERRORS = 3;
  const currentPuzzle = PUZZLES[round];
  const TOTAL_ROUNDS = PUZZLES.length;
  const mindlingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (mindlingTimeoutRef.current) clearTimeout(mindlingTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (gameOver || isPaused || showRoundComplete) return;

    const expectedIndex = connections.length;
    const expectedNode = currentPuzzle.sequence[expectedIndex];

    if (currentNode === null) {
      if (nodeId === '1') {
        setCurrentNode(nodeId);
        setConnections([nodeId]);
        setMindlingState('happy');
        if (mindlingTimeoutRef.current) clearTimeout(mindlingTimeoutRef.current);
        mindlingTimeoutRef.current = setTimeout(() => setMindlingState('idle'), 300);
      } else {
        setErrors(e => e + 1);
        setTotalErrors(e => e + 1);
        setShowError(true);
        setMindlingState('sad');
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => { setShowError(false); setMindlingState('idle'); }, 500);
      }
    } else {
      if (nodeId === expectedNode) {
        const newConnections = [...connections, nodeId];
        setConnections(newConnections);
        setCurrentNode(nodeId);
        setMindlingState('happy');
        if (mindlingTimeoutRef.current) clearTimeout(mindlingTimeoutRef.current);
        mindlingTimeoutRef.current = setTimeout(() => setMindlingState('idle'), 300);

        if (newConnections.length === currentPuzzle.sequence.length) {
          if (round >= TOTAL_ROUNDS - 1) {
            setGameOver(true);
            setShowReward(true);
            playSuccess();
          } else {
            setShowRoundComplete(true);
            playCollect();
          }
        }
      } else if (nodeId !== currentNode) {
        const newErrors = errors + 1;
        setErrors(newErrors);
        setTotalErrors(e => e + 1);
        setShowError(true);
        setMindlingState('sad');
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => { setShowError(false); setMindlingState('idle'); }, 500);

        if (newErrors >= MAX_ERRORS) {
          setGameOver(true);
        }
      }
    }
  }, [currentNode, connections, errors, gameOver, isPaused, showRoundComplete, round, currentPuzzle]);

  const handleNextRound = () => {
    setRound(r => r + 1);
    setConnections([]);
    setCurrentNode(null);
    setErrors(0);
    setShowRoundComplete(false);
  };

  const handleComplete = () => {
    playSwoosh();
    const totalTime = (Date.now() - startTime) / 1000;
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'starBridge',
      stats: { totalTime, errors: totalErrors, completed: true },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'logic' });
    dispatch({ type: 'COMPLETE_ISLAND', island: 'star-bridge' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const handleSkip = () => {
    dispatch({
      type: 'UPDATE_STATS',
      statsType: 'starBridge',
      stats: { totalTime: 35, errors: 2, completed: true },
    });
    dispatch({ type: 'COLLECT_SEED', seedType: 'logic' });
    dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
  };

  const resetGame = () => {
    setRound(0);
    setConnections([]);
    setCurrentNode(null);
    setErrors(0);
    setTotalErrors(0);
    setGameOver(false);
    setShowReward(false);
    setShowRoundComplete(false);
  };

  const isErrorDanger = errors >= MAX_ERRORS - 1;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Background ─────────────────────────────────────── */}
      <SceneBg src={starBridgeBg} />

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
              Round {round + 1}/{TOTAL_ROUNDS}
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

        {/* Right: Signal + Errors */}
        <motion.div
          initial={{ y: -20, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="flex-1 flex justify-end gap-2"
        >
          <GlassCard tint="mint" className="px-3 py-2">
            <span className="font-display font-bold text-sm ink-deep tabular-nums">
              ⭐ {connections.length}/{currentPuzzle.sequence.length}
            </span>
          </GlassCard>

          <GlassCard
            tint={isErrorDanger ? 'peach' : 'sky'}
            className="px-3 py-2"
            style={{
              boxShadow: isErrorDanger
                ? '0 0 16px hsla(0,80%,60%,0.4)'
                : undefined,
              transition: 'box-shadow 0.4s ease',
            }}
          >
            <span
              className="font-display font-bold text-sm tabular-nums"
              style={{
                color: isErrorDanger ? 'hsl(0,65%,45%)' : undefined,
                transition: 'color 0.4s ease',
              }}
            >
              ✗ {errors}/{MAX_ERRORS}
            </span>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Instruction bar ────────────────────────────────── */}
      <motion.div
        initial={{ y: -20, scale: 0.94 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
        key={round}
        className="relative z-20 flex justify-center mt-2"
      >
        <GlassCard tint="lilac" className="px-5 py-2 rounded-full">
          <p className="font-display font-semibold text-sm md:text-base ink-deep tracking-wide">
            {currentPuzzle.instruction}
          </p>
        </GlassCard>
      </motion.div>

      {/* ── Game area ──────────────────────────────────────── */}
      <div className="absolute inset-0 z-10">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(210 80% 60%)" />
              <stop offset="50%" stopColor="hsl(250 80% 70%)" />
              <stop offset="100%" stopColor="hsl(210 80% 60%)" />
            </linearGradient>
            <filter id="bridgeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {connections.map((nodeId, index) => {
            if (index === 0) return null;
            const prevNode = currentPuzzle.nodes.find(n => n.id === connections[index - 1]);
            const currNode = currentPuzzle.nodes.find(n => n.id === nodeId);
            if (!prevNode || !currNode) return null;
            return (
              <g key={`${prevNode.id}-${currNode.id}`}>
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  x1={`${prevNode.x}%`} y1={`${prevNode.y}%`}
                  x2={`${currNode.x}%`} y2={`${currNode.y}%`}
                  stroke="hsl(210 80% 60%)" strokeWidth="10"
                  strokeLinecap="round" filter="url(#bridgeGlow)"
                />
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  x1={`${prevNode.x}%`} y1={`${prevNode.y}%`}
                  x2={`${currNode.x}%`} y2={`${currNode.y}%`}
                  stroke="url(#bridgeGradient)" strokeWidth="4"
                  strokeDasharray="8,4" strokeLinecap="round"
                />
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0.6, 1, 0.6] }}
                  transition={{
                    pathLength: { duration: 0.4, ease: 'easeOut' },
                    opacity: { duration: 1.5, repeat: Infinity },
                  }}
                  x1={`${prevNode.x}%`} y1={`${prevNode.y}%`}
                  x2={`${currNode.x}%`} y2={`${currNode.y}%`}
                  stroke="hsl(0 0% 100%)" strokeWidth="1.5"
                  strokeDasharray="8,4" strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {/* Star nodes */}
        <AnimatePresence mode="wait">
          <motion.div key={round} className="absolute inset-0">
            {currentPuzzle.nodes.map((node, index) => {
              const isCurrent = currentNode === node.id;
              const isConnected = connections.includes(node.id);
              const isNumber = node.type === 'number';
              const hue = isNumber ? 48 : 230;

              return (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                    onClick={() => handleNodeClick(node.id)}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full grid place-items-center cursor-pointer"
                    style={{
                      background: isCurrent
                        ? `linear-gradient(135deg, hsla(48,100%,80%,0.7) 0%, hsla(48,100%,60%,0.5) 100%)`
                        : isConnected
                          ? `linear-gradient(135deg, hsla(${hue},80%,75%,0.55) 0%, hsla(${hue},70%,55%,0.35) 100%)`
                          : `linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 100%)`,
                      backdropFilter: 'blur(14px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                      border: isCurrent
                        ? '2.5px solid hsla(48,100%,70%,0.9)'
                        : isConnected
                          ? `2px solid hsla(${hue},70%,65%,0.7)`
                          : '2px solid rgba(255,255,255,0.4)',
                      boxShadow: isCurrent
                        ? '0 0 0 3px hsla(48,100%,65%,0.6), 0 0 28px hsla(48,100%,55%,0.5), 0 8px 20px -6px hsla(232,60%,10%,0.3)'
                        : isConnected
                          ? `0 0 18px hsla(${hue},80%,55%,0.4), 0 6px 16px -6px hsla(232,60%,10%,0.3)`
                          : 'inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px -6px hsla(232,60%,10%,0.25)',
                      transition: 'box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
                    }}
                  >
                    <span
                      className="font-display font-bold text-lg md:text-xl"
                      style={{
                        color: isCurrent
                          ? 'hsl(30,60%,18%)'
                          : isConnected
                            ? 'hsl(0,0%,100%)'
                            : 'hsl(0,0%,95%)',
                        textShadow: isCurrent
                          ? '0 1px 0 rgba(255,255,255,0.5)'
                          : '0 1px 3px rgba(0,0,0,0.4)',
                      }}
                    >
                      {node.value}
                    </span>
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Error indicator */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1, x: [-8, 8, -8, 8, 0] }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed top-1/2 left-1/2 z-30"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <GlassCard
                tint="peach"
                className="px-6 py-3"
                style={{ boxShadow: '0 0 24px hsla(0,80%,55%,0.5)' }}
              >
                <span className="font-display font-bold text-lg ink-deep">
                  Wrong! ✗
                </span>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mindling avatar (bottom-left) ──────────────────── */}
      {state.selectedMindling && (
        <div className="fixed bottom-4 left-4 z-20">
          <motion.div
            animate={
              mindlingState === 'happy'
                ? { y: [0, -20, 0] }
                : mindlingState === 'sad'
                  ? { x: [-4, 4, -4, 4, 0] }
                  : { y: [0, -4, 0] }
            }
            transition={{
              duration: mindlingState === 'idle' ? 2.5 : 0.3,
              repeat: mindlingState === 'idle' ? Infinity : 0,
            }}
            className="flex flex-col items-center"
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full grid place-items-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 60%, hsla(230,80%,80%,0.25) 100%)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '2px solid rgba(255,255,255,0.45)',
                boxShadow:
                  mindlingState === 'happy'
                    ? '0 0 0 2px hsla(48,90%,65%,0.8), 0 0 24px hsla(48,100%,55%,0.5)'
                    : '0 0 0 2px hsla(230,70%,65%,0.5), 0 0 14px hsla(230,80%,55%,0.25)',
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
                background: 'hsla(230,80%,85%,0.85)',
                border: '1px solid hsla(230,70%,70%,0.7)',
              }}
            >
              <span className="font-display font-bold text-[10px] ink-deep">
                {state.mindlingName}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Round Complete overlay ──────────────────────────── */}
      <AnimatePresence>
        {showRoundComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(250,60%,15%,0.5), hsla(232,70%,8%,0.72))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <GlassCard
                tint="lilac"
                shimmer
                className="px-10 py-8 text-center"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
              >
                <motion.h2
                  className="game-title text-3xl ink-deep mb-2"
                  style={{ textShadow: '0 2px 0 rgba(255,255,255,0.55)' }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: 2, duration: 0.3 }}
                >
                  Round {round + 1} Clear!
                </motion.h2>
                <p className="font-display font-semibold text-sm ink-soft mb-6">
                  {TOTAL_ROUNDS - round - 1} more to go!
                </p>
                <GlassButton
                  tint="butter"
                  size="lg"
                  onClick={handleNextRound}
                  className="rounded-full"
                >
                  Next Round →
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pause overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {isPaused && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(232,60%,15%,0.5), hsla(232,70%,8%,0.72))',
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
                tint="lilac"
                shimmer
                className="px-10 py-8 text-center"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
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
                'radial-gradient(ellipse at center, hsla(230,60%,15%,0.45), hsla(232,70%,8%,0.7))',
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
                  Level Complete!
                </motion.h2>

                <p className="font-display font-semibold text-sm ink-soft mb-5">
                  All star bridges connected!
                </p>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 16 }}
                  className="flex justify-center mb-5"
                >
                  <SeedGem type="logic" size={80} animate />
                </motion.div>

                <GlassCard tint="sky" className="px-4 py-2 mb-5 inline-block">
                  <span className="font-display font-bold text-sm ink-deep">
                    💎 Logic Seed collected! (2/4)
                  </span>
                </GlassCard>

                {state.selectedMindling && (
                  <motion.div
                    initial={{ y: 16 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="flex items-center justify-center gap-3 mb-6"
                  >
                    <img
                      src={mindlingImages[state.selectedMindling.type]}
                      alt={state.selectedMindling.name}
                      className="w-14 h-14 object-contain drop-shadow-[0_6px_12px_rgba(80,30,140,0.4)]"
                    />
                    <GlassCard tint="mint" className="px-4 py-2 rounded-2xl">
                      <p className="font-display font-semibold text-sm ink-deep">
                        All bridges connected! ✨
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
                  Next Level →
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Game Over (failed) ─────────────────────────────── */}
      <AnimatePresence>
        {gameOver && !showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background:
                'radial-gradient(ellipse at center, hsla(232,60%,15%,0.5), hsla(232,70%,8%,0.72))',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm"
            >
              <GlassCard
                tint="lilac"
                shimmer
                className="p-8 text-center"
                style={{ boxShadow: 'var(--glass-glow-lilac)' }}
              >
                <h2
                  className="game-title text-3xl ink-deep mb-2"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.55)' }}
                >
                  Too Many Errors!
                </h2>
                <p className="font-body text-base ink-soft mb-6">
                  Let's try again!
                </p>
                <div className="flex gap-3 justify-center">
                  <GlassButton
                    tint="butter"
                    size="lg"
                    onClick={resetGame}
                    className="rounded-full"
                  >
                    Try Again
                  </GlassButton>
                  <GlassButton
                    tint="sky"
                    size="lg"
                    onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
                    className="rounded-full"
                  >
                    Back to Map
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
