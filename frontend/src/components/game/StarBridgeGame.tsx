import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Pause, SkipForward } from 'lucide-react';

import starBridgeBg from '@/assets/star-bridge-bg.jpg';
import { SeedGem } from './SeedGem';
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
      { id: '1', value: '1', type: 'number', x: 20, y: 25 },
      { id: 'A', value: 'A', type: 'letter', x: 50, y: 15 },
      { id: '2', value: '2', type: 'number', x: 80, y: 30 },
      { id: 'B', value: 'B', type: 'letter', x: 70, y: 55 },
      { id: '3', value: '3', type: 'number', x: 35, y: 70 },
      { id: 'C', value: 'C', type: 'letter', x: 55, y: 85 },
    ],
  },
  {
    sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D'],
    instruction: 'Connect: 1 → A → 2 → B → 3 → C → 4 → D',
    nodes: [
      { id: '1', value: '1', type: 'number', x: 15, y: 20 },
      { id: 'A', value: 'A', type: 'letter', x: 40, y: 10 },
      { id: '2', value: '2', type: 'number', x: 70, y: 20 },
      { id: 'B', value: 'B', type: 'letter', x: 85, y: 45 },
      { id: '3', value: '3', type: 'number', x: 60, y: 60 },
      { id: 'C', value: 'C', type: 'letter', x: 30, y: 50 },
      { id: '4', value: '4', type: 'number', x: 20, y: 75 },
      { id: 'D', value: 'D', type: 'letter', x: 50, y: 85 },
    ],
  },
  {
    sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'],
    instruction: 'Connect: 1 → A → 2 → B → 3 → C → 4 → D → 5 → E',
    nodes: [
      { id: '1', value: '1', type: 'number', x: 10, y: 15 },
      { id: 'A', value: 'A', type: 'letter', x: 35, y: 10 },
      { id: '2', value: '2', type: 'number', x: 60, y: 18 },
      { id: 'B', value: 'B', type: 'letter', x: 85, y: 25 },
      { id: '3', value: '3', type: 'number', x: 75, y: 50 },
      { id: 'C', value: 'C', type: 'letter', x: 50, y: 40 },
      { id: '4', value: '4', type: 'number', x: 25, y: 55 },
      { id: 'D', value: 'D', type: 'letter', x: 15, y: 80 },
      { id: '5', value: '5', type: 'number', x: 45, y: 75 },
      { id: 'E', value: 'E', type: 'letter', x: 70, y: 82 },
    ],
  },
  {
    sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E', '6', 'F'],
    instruction: 'Connect: 1→A→2→B→3→C→4→D→5→E→6→F',
    nodes: [
      { id: '1', value: '1', type: 'number', x: 12, y: 12 },
      { id: 'A', value: 'A', type: 'letter', x: 30, y: 8 },
      { id: '2', value: '2', type: 'number', x: 55, y: 15 },
      { id: 'B', value: 'B', type: 'letter', x: 80, y: 12 },
      { id: '3', value: '3', type: 'number', x: 88, y: 35 },
      { id: 'C', value: 'C', type: 'letter', x: 70, y: 48 },
      { id: '4', value: '4', type: 'number', x: 45, y: 42 },
      { id: 'D', value: 'D', type: 'letter', x: 20, y: 50 },
      { id: '5', value: '5', type: 'number', x: 15, y: 72 },
      { id: 'E', value: 'E', type: 'letter', x: 40, y: 80 },
      { id: '6', value: '6', type: 'number', x: 65, y: 75 },
      { id: 'F', value: 'F', type: 'letter', x: 85, y: 82 },
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

  const getNodeColor = (nodeId: string) => {
    const isCurrent = currentNode === nodeId;
    const isConnected = connections.includes(nodeId);
    if (isCurrent) return 'bg-primary shadow-glow-gold';
    if (isConnected) return 'bg-seed-logic shadow-glow-blue';
    return 'bg-card hover:bg-muted';
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${starBridgeBg})` }} />

      {/* HUD */}
      <div className="relative z-20 flex justify-between items-center p-4">
        <div className="flex gap-2 pl-12">
          <button onClick={() => setIsPaused(!isPaused)} className="p-3 rounded-full bg-card/90 shadow-soft hover:shadow-float transition-all">
            <Pause className="w-6 h-6 text-foreground" />
          </button>
          <button onClick={handleSkip} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/90 shadow-soft hover:shadow-float transition-all text-sm font-display">
            <SkipForward className="w-4 h-4" /> Skip
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display">
            ROUND: {round + 1}/{TOTAL_ROUNDS}
          </div>
          <div className="bg-card/90 px-4 py-2 rounded-game shadow-soft font-display">
            SIGNAL: {connections.length}/{currentPuzzle.sequence.length}
          </div>
          <div className={`bg-card/90 px-4 py-2 rounded-game shadow-soft font-display ${errors >= MAX_ERRORS - 1 ? 'text-destructive' : ''}`}>
            ERRORS: {errors}/{MAX_ERRORS}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key={round} className="relative z-10 text-center py-2">
        <p className="text-card font-display text-lg drop-shadow-lg">{currentPuzzle.instruction}</p>
      </motion.div>

      {/* Game area */}
      <div className="relative z-10 w-full h-[calc(100vh-160px)]">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((nodeId, index) => {
            if (index === 0) return null;
            const prevNode = currentPuzzle.nodes.find(n => n.id === connections[index - 1]);
            const currNode = currentPuzzle.nodes.find(n => n.id === nodeId);
            if (!prevNode || !currNode) return null;
            return (
              <motion.line
                key={`${prevNode.id}-${currNode.id}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                x1={`${prevNode.x}%`} y1={`${prevNode.y}%`}
                x2={`${currNode.x}%`} y2={`${currNode.y}%`}
                stroke="hsl(210 80% 60%)" strokeWidth="4" className="drop-shadow-lg"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        <AnimatePresence mode="wait">
          <motion.div key={round} className="absolute inset-0">
            {currentPuzzle.nodes.map((node, index) => {
              const isConnected = connections.includes(node.id);
              return (
                <motion.button
                  key={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring" }}
                  onClick={() => handleNodeClick(node.id)}
                  style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%` }}
                  className={`transform -translate-x-1/2 -translate-y-1/2
                    w-14 h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center
                    font-display font-bold text-xl md:text-2xl
                    border-4 border-card/50 transition-all duration-300
                    ${getNodeColor(node.id)} ${isConnected ? 'text-card' : 'text-foreground'}`}
                >
                  {node.value}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Error indicator */}
        <AnimatePresence>
          {showError && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1, x: [-10, 10, -10, 10, 0] }} exit={{ opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground px-6 py-3 rounded-game font-display text-xl z-30">
              Wrong! ✗
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mindling */}
        {state.selectedMindling && (
          <motion.div
            animate={mindlingState === 'happy' ? { y: [0, -20, 0] } : mindlingState === 'sad' ? { x: [-5, 5, -5, 5, 0] } : { y: [0, -5, 0] }}
            transition={{ duration: mindlingState === 'idle' ? 2 : 0.3, repeat: mindlingState === 'idle' ? Infinity : 0 }}
            className="fixed bottom-8 left-8 z-20"
          >
            <img src={mindlingImages[state.selectedMindling.type]} alt={state.selectedMindling.name} 
              className="w-24 h-24 object-contain mindling-img" />
          </motion.div>
        )}
      </div>

      {/* Round Complete overlay */}
      <AnimatePresence>
        {showRoundComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="bg-card rounded-game p-8 md:p-10 text-center shadow-float max-w-sm mx-4">
              <motion.h2 className="game-title text-3xl mb-2" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 2, duration: 0.3 }}>
                Round {round + 1} Clear!
              </motion.h2>
              <p className="font-display text-lg text-muted-foreground mb-6">
                {TOTAL_ROUNDS - round - 1} more to go!
              </p>
              <button onClick={handleNextRound}
                className="px-8 py-4 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground rounded-game font-display font-bold text-xl btn-bounce shadow-glow-gold">
                Next Round →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
            <div className="bg-card rounded-game p-8 text-center shadow-float">
              <h2 className="game-title text-3xl mb-6">PAUSED</h2>
              <button onClick={() => setIsPaused(false)}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-game font-display font-bold btn-bounce">
                Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Reward overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="bg-card rounded-game p-8 md:p-12 text-center shadow-float max-w-md mx-4">
              <motion.h2 className="game-title text-4xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }}>
                LEVEL COMPLETE!
              </motion.h2>
              <motion.div
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }} className="mx-auto my-6 flex justify-center">
                <SeedGem type="logic" size={96} animate={true} />
              </motion.div>
              {state.selectedMindling && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-3 mb-6">
                  <img src={mindlingImages[state.selectedMindling.type]} alt={state.selectedMindling.name} className="w-16 h-16 mindling-img" />
                  <div className="bg-card border border-border rounded-bubble px-4 py-2">
                    <p className="font-medium">All bridges connected!</p>
                  </div>
                </motion.div>
              )}
              <button onClick={handleComplete}
                className="px-8 py-4 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground rounded-game font-display font-bold text-xl btn-bounce shadow-glow-gold">
                Next Level →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over (failed) */}
      <AnimatePresence>
        {gameOver && !showReward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
            <div className="bg-card rounded-game p-8 text-center shadow-float">
              <h2 className="game-title text-3xl mb-4">Too Many Errors!</h2>
              <p className="text-lg mb-6">Let's try again!</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-game font-display font-bold btn-bounce">
                  Try Again
                </button>
                <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'world-map' })}
                  className="px-6 py-3 border-2 border-border rounded-game font-display btn-bounce">
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
