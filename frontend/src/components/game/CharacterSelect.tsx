import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MindlingType, MINDLINGS } from '@/types/game';
import { Input } from '@/components/ui/input';

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

export function CharacterSelect() {
  const { dispatch } = useGame();
  const { playClick, playSwoosh, playSuccess } = useSoundEffects();
  const [selectedType, setSelectedType] = useState<MindlingType | null>(null);
  const [name, setName] = useState('');
  const [hoveredType, setHoveredType] = useState<MindlingType | null>(null);

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

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(200 80% 75%) 0%, hsl(200 70% 82%) 40%, hsl(200 60% 88%) 100%)',
      }}
    >
      {/* Crystal/geometric background pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          linear-gradient(120deg, transparent 30%, hsl(200 80% 90% / 0.4) 50%, transparent 70%),
          linear-gradient(240deg, transparent 30%, hsl(200 80% 92% / 0.3) 50%, transparent 70%),
          linear-gradient(60deg, transparent 40%, hsl(200 60% 95% / 0.2) 55%, transparent 65%)
        `,
      }} />


      {/* Mindlings Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="game-title text-3xl md:text-5xl text-center mb-8"
          style={{
            color: 'hsl(210 50% 25%)',
            textShadow: '0 2px 4px hsl(200 60% 70% / 0.5)',
          }}
        >
          CHOOSE YOUR MINDLING!
        </motion.h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-8">
          {(Object.keys(MINDLINGS) as MindlingType[]).map((type, index) => {
            const mindling = MINDLINGS[type];
            const isSelected = selectedType === type;
            const isHovered = hoveredType === type;

            return (
              <motion.div
                key={type}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <motion.button
                  onClick={() => { playClick(); setSelectedType(type); }}
                  onMouseEnter={() => setHoveredType(type)}
                  onMouseLeave={() => setHoveredType(null)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isHovered ? { rotate: [0, -3, 3, -3, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(180deg, hsl(190 90% 70%) 0%, hsl(200 85% 60%) 100%)'
                      : 'linear-gradient(180deg, hsl(200 50% 85%) 0%, hsl(200 40% 75%) 100%)',
                    boxShadow: isSelected
                      ? '0 0 20px hsl(190 80% 60% / 0.6), 0 0 40px hsl(190 80% 60% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.4)'
                      : '0 2px 12px hsl(200 50% 50% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.3)',
                  }}
                >
                  {/* Inner white circle */}
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(200 20% 96%) 100%)',
                    }}
                  >
                    <motion.img
                      src={mindlingImages[type]}
                      alt={mindling.displayName}
                      className="w-[85%] h-[85%] object-contain"
                      style={{ filter: 'drop-shadow(0 2px 6px hsl(200 60% 50% / 0.3))' }}
                      animate={isSelected ? { y: [0, -4, 0] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </div>
                  
                  {/* Selection checkmark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: 'linear-gradient(180deg, hsl(45 90% 60%) 0%, hsl(40 85% 50%) 100%)',
                          color: 'hsl(0 0% 100%)',
                          boxShadow: '0 2px 6px hsl(45 90% 40% / 0.4)',
                        }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Name label */}
                <motion.div
                  className="mt-3 px-4 py-1 rounded-lg font-display text-lg font-bold"
                  style={{
                    color: isSelected ? 'hsl(200 80% 35%)' : 'hsl(210 30% 35%)',
                  }}
                >
                  {mindling.displayName}
                </motion.div>

                {/* Trait */}
                <span className="text-sm font-medium" style={{ color: 'hsl(210 20% 50%)' }}>
                  {mindling.trait}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Name Input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md mb-6"
        >
          <Input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="text-center text-xl py-6 rounded-full font-display border-0"
            style={{
              background: 'hsl(0 0% 100% / 0.8)',
              boxShadow: 'inset 0 2px 6px hsl(200 40% 70% / 0.3), 0 1px 0 hsl(0 0% 100% / 0.5)',
              color: 'hsl(210 30% 30%)',
            }}
          />
        </motion.div>

        {/* Luma helper */}
        <AnimatePresence>
          {!selectedType && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="fixed bottom-24 right-4 md:right-8 rounded-2xl px-4 py-2 max-w-[200px]"
              style={{
                background: 'hsl(0 0% 100% / 0.9)',
                boxShadow: '0 4px 16px hsl(200 50% 40% / 0.15)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'hsl(210 30% 30%)' }}>Pick one!</p>
              <div className="absolute -left-2 top-1/2 w-4 h-4 transform -translate-y-1/2 rotate-45"
                style={{ background: 'hsl(0 0% 100% / 0.9)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Adopt Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleAdopt}
          disabled={!selectedType || !name.trim()}
          whileHover={selectedType && name.trim() ? { scale: 1.05 } : {}}
          whileTap={selectedType && name.trim() ? { scale: 0.95 } : {}}
          className="mb-8 px-12 py-4 text-xl font-display font-bold rounded-2xl transition-all duration-300"
          style={{
            background: selectedType && name.trim()
              ? 'linear-gradient(180deg, hsl(260 40% 60%) 0%, hsl(260 35% 48%) 100%)'
              : 'hsl(200 20% 75%)',
            color: selectedType && name.trim() ? 'hsl(0 0% 100%)' : 'hsl(200 20% 50%)',
            boxShadow: selectedType && name.trim()
              ? '0 4px 16px hsl(260 40% 40% / 0.4), inset 0 1px 0 hsl(260 50% 75% / 0.3)'
              : '0 2px 8px hsl(200 30% 60% / 0.2)',
            cursor: selectedType && name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          ADOPT & START
        </motion.button>
      </div>
    </div>
  );
}
