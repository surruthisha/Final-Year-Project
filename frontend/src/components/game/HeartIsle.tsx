import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { SkipForward } from 'lucide-react';
import { SeedGem } from './SeedGem';

import heartIsleBg from '@/assets/heart-isle-bg.jpg';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mindlingImages = { pip: pipImage, mira: miraImage, vee: veeImage, nuo: nuoImage };

export function HeartIsle() {
  const { state, dispatch } = useGame();
  const { playCollect, playSuccess, playSwoosh } = useSoundEffects();
  const [phase, setPhase] = useState<'intro' | 'planting' | 'growing' | 'evolved' | 'complete'>('intro');
  const [plantedSeeds, setPlantedSeeds] = useState<string[]>([]);
  const [treeSize, setTreeSize] = useState(0);

  useEffect(() => {
    if (phase === 'intro') {
      setTimeout(() => setPhase('planting'), 2000);
    }
  }, [phase]);

  // Transition to growing when all 3 seeds are planted
  useEffect(() => {
    if (plantedSeeds.length === 3 && phase === 'planting') {
      setPhase('growing');
    }
  }, [plantedSeeds, phase]);

  // Run growth animation when phase becomes 'growing'
  useEffect(() => {
    if (phase !== 'growing') return;
    let size = 0;
    const growInterval = setInterval(() => {
      size += 10;
      setTreeSize(size);
      if (size >= 100) {
        clearInterval(growInterval);
        setTimeout(() => {
          dispatch({ type: 'EVOLVE_MINDLING' });
          setPhase('evolved');
        }, 1000);
      }
    }, 100);
    return () => clearInterval(growInterval);
  }, [phase, dispatch]);

  const handlePlantSeed = (seedType: string) => {
    if (!plantedSeeds.includes(seedType)) {
      playCollect();
      setPlantedSeeds([...plantedSeeds, seedType]);
    }
  };

  const handleComplete = () => {
    playSwoosh();
    dispatch({ type: 'SET_SCREEN', screen: 'report' });
  };

  const handleSkip = () => {
    dispatch({ type: 'EVOLVE_MINDLING' });
    dispatch({ type: 'SET_SCREEN', screen: 'report' });
  };

  const seedTypes: Array<'spark' | 'logic' | 'harmony'> = ['spark', 'logic', 'harmony'];

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: `url(${heartIsleBg})`,
          filter: phase === 'evolved' || phase === 'complete' ? 'brightness(1.2) saturate(1.3)' : 'none'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

      {/* Skip button */}
      <div className="relative z-20 flex justify-start p-4 pl-16">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/90 shadow-soft hover:shadow-float transition-all text-sm font-display"
        >
          <SkipForward className="w-4 h-4" /> Skip
        </button>
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 text-center"
      >
        <h1 className="game-title text-4xl md:text-5xl text-card drop-shadow-lg">
          THE GARDEN
        </h1>
        {phase === 'growing' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-card font-display text-xl mt-2"
          >
            The Memory Tree is growing!
          </motion.p>
        )}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        
        {/* Intro phase */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-card font-display text-2xl drop-shadow-lg">
                Welcome to Heart Isle...
              </p>
              <p className="text-card/80 font-display text-lg mt-2">
                Plant your seeds to grow the Memory Tree!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Planting phase */}
        <AnimatePresence>
          {phase === 'planting' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              {/* Planting ground with planted seeds */}
              <motion.div className="relative w-56 h-40 mb-8 flex items-end justify-center">
                {/* Planted seeds landing area */}
                <div className="flex gap-3 mb-6">
                  {plantedSeeds.map((seedType) => (
                    <motion.div
                      key={seedType}
                      initial={{ y: -80, opacity: 0, scale: 0.3 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <SeedGem type={seedType as 'spark' | 'logic' | 'harmony'} size={48} animate={false} />
                    </motion.div>
                  ))}
                </div>
                
                {/* Ground mound */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 
                                w-40 h-6 rounded-full blur-sm"
                  style={{ background: 'radial-gradient(ellipse, hsl(30, 40%, 40%) 0%, transparent 70%)' }}
                />
              </motion.div>

              {/* Seeds to plant */}
              <div className="flex gap-6 mb-8">
                {seedTypes.map((type) => {
                  const isPlanted = plantedSeeds.includes(type);
                  
                  return (
                    <motion.button
                      key={type}
                      onClick={() => handlePlantSeed(type)}
                      disabled={isPlanted}
                      whileHover={!isPlanted ? { scale: 1.15, y: -8 } : {}}
                      whileTap={!isPlanted ? { scale: 0.9 } : {}}
                      className={`
                        relative p-3 rounded-full transition-all
                        ${isPlanted 
                          ? 'opacity-25 cursor-not-allowed' 
                          : 'cursor-pointer'}
                      `}
                      style={!isPlanted ? {
                        background: 'radial-gradient(circle, hsla(0,0%,100%,0.15) 0%, transparent 70%)',
                      } : {}}
                    >
                      <SeedGem type={type} size={72} animate={!isPlanted} />
                      {isPlanted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-island-green/80 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <p className="text-card font-display text-lg drop-shadow-lg">
                Tap the gems to plant them! ({plantedSeeds.length}/3)
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Growing phase */}
        <AnimatePresence>
          {phase === 'growing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              {/* Growing glow effect (tree is in the background image) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: treeSize / 100, opacity: 1 }}
                className="w-48 h-48 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsla(45, 100%, 60%, 0.5) 0%, hsla(280, 60%, 60%, 0.2) 50%, transparent 70%)',
                }}
              />

              {/* Rising sparkles during growth */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 3 === 0 ? 'hsl(45, 100%, 65%)' : i % 3 === 1 ? 'hsl(210, 80%, 65%)' : 'hsl(280, 60%, 65%)',
                    left: `${30 + Math.random() * 40}%`,
                    bottom: '30%',
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -80 - Math.random() * 60],
                    x: [0, (Math.random() - 0.5) * 60],
                    scale: [0.5, 1.2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Evolved phase */}
        <AnimatePresence>
          {(phase === 'evolved' || phase === 'complete') && state.selectedMindling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="flex flex-col items-center"
            >
              {/* Mindling scene - big, grounded, 3D-ish */}
              <div className="relative flex flex-col items-center">
                {/* Large ambient glow behind mindling */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -top-16 w-72 h-72 md:w-96 md:h-96 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, hsla(45, 100%, 60%, 0.35) 0%, hsla(280, 60%, 60%, 0.15) 40%, transparent 70%)',
                  }}
                />

                {/* Mindling - large and grounded */}
                <motion.div
                  initial={{ scale: 0, y: 80 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
                  className="relative z-10"
                >
                  {/* SVG crown */}
                  <motion.svg
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-10"
                    viewBox="0 0 40 32"
                    fill="none"
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    <path d="M4 28L2 8L12 16L20 4L28 16L38 8L36 28Z" fill="hsl(45, 100%, 55%)" stroke="hsl(40, 90%, 45%)" strokeWidth="1.5" />
                    <circle cx="12" cy="14" r="2" fill="hsl(0, 80%, 60%)" />
                    <circle cx="20" cy="6" r="2.5" fill="hsl(210, 80%, 55%)" />
                    <circle cx="28" cy="14" r="2" fill="hsl(280, 60%, 60%)" />
                  </motion.svg>

                  {/* Wings */}
                  <motion.svg className="absolute -left-14 top-6 w-14 h-20 -z-10" viewBox="0 0 40 56" fill="none"
                    animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 0.6, repeat: Infinity }}>
                    <path d="M38 28C38 12 28 2 10 2C6 10 4 20 8 28C12 36 20 42 38 28Z" fill="hsla(45, 100%, 70%, 0.5)" stroke="hsla(45, 100%, 60%, 0.6)" strokeWidth="1" />
                    <path d="M36 30C30 40 20 48 10 52C14 42 16 34 36 30Z" fill="hsla(280, 60%, 70%, 0.4)" stroke="hsla(280, 60%, 60%, 0.5)" strokeWidth="1" />
                  </motion.svg>
                  <motion.svg className="absolute -right-14 top-6 w-14 h-20 -z-10 scale-x-[-1]" viewBox="0 0 40 56" fill="none"
                    animate={{ rotate: [8, -8, 8] }} transition={{ duration: 0.6, repeat: Infinity }}>
                    <path d="M38 28C38 12 28 2 10 2C6 10 4 20 8 28C12 36 20 42 38 28Z" fill="hsla(45, 100%, 70%, 0.5)" stroke="hsla(45, 100%, 60%, 0.6)" strokeWidth="1" />
                    <path d="M36 30C30 40 20 48 10 52C14 42 16 34 36 30Z" fill="hsla(280, 60%, 70%, 0.4)" stroke="hsla(280, 60%, 60%, 0.5)" strokeWidth="1" />
                  </motion.svg>

                  {/* Mindling image - BIG, no white bg */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <img 
                      src={mindlingImages[state.selectedMindling.type]}
                      alt={state.selectedMindling.name}
                      className="w-40 h-40 md:w-52 md:h-52 object-contain mindling-img"
                      style={{
                        filter: 'drop-shadow(0 8px 24px hsla(45, 100%, 60%, 0.5)) drop-shadow(0 2px 4px hsla(0,0%,0%,0.3))',
                      }}
                    />
                  </motion.div>

                  {/* Ground shadow - 3D effect */}
                  <div className="mx-auto -mt-4 w-36 md:w-44 h-6 rounded-[50%] blur-md"
                    style={{ background: 'radial-gradient(ellipse, hsla(0,0%,0%,0.35) 0%, transparent 70%)' }}
                  />
                </motion.div>

                {/* Seed gems at base */}
                <motion.div
                  className="flex gap-4 mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  {seedTypes.map((type, i) => (
                    <motion.div key={type} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.15, type: 'spring' }}>
                      <SeedGem type={type} size={36} animate={true} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 }}
                className="mt-8 bg-card/90 backdrop-blur-sm rounded-bubble px-6 py-4 shadow-float max-w-sm text-center"
              >
                <p className="font-display text-xl text-foreground">
                  "Yippee! I remember! My name is <strong>{state.mindlingName}</strong> and we did it!"
                </p>
              </motion.div>

              {/* Bottom message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="mt-6 text-center"
              >
                <p className="text-card font-display text-xl drop-shadow-lg mb-4">
                  Thank you for helping me grow! We did it!
                </p>
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                  onClick={handleComplete}
                  className="px-8 py-4 bg-gradient-to-b from-primary to-primary/80 
                             text-primary-foreground rounded-game font-display font-bold 
                             text-xl btn-bounce shadow-glow-gold"
                >
                  See Your Journey Report →
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating sparkles throughout for evolved phase */}
      {(phase === 'evolved' || phase === 'complete') && (
        [...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? 'hsl(45, 100%, 65%)' : i % 3 === 1 ? 'hsl(210, 80%, 65%)' : 'hsl(280, 60%, 65%)',
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.2, 0.5],
              y: [0, -25, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))
      )}
    </div>
  );
}
