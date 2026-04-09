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
        background: 'linear-gradient(180deg, hsl(209 60% 30%) 0%, hsl(210 50% 48%) 35%, hsl(210 42% 65%) 70%, hsl(210 38% 78%) 100%)',
      }}
    >
      {/* Crystal/geometric background pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          linear-gradient(120deg, transparent 30%, hsl(210 55% 65% / 0.2) 50%, transparent 70%),
          linear-gradient(240deg, transparent 30%, hsl(42 80% 70% / 0.06) 50%, transparent 70%),
          linear-gradient(60deg, transparent 40%, hsl(210 45% 75% / 0.15) 55%, transparent 65%)
        `,
      }} />


      {/* Mindlings Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="game-title text-3xl md:text-5xl text-center mb-8"
          style={{
            color: 'hsl(42 90% 72%)',
            textShadow: '0 2px 12px hsl(209 90% 15% / 0.6), 0 0 25px hsl(42 80% 60% / 0.2)',
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
                      ? 'linear-gradient(180deg, hsl(42 88% 65%) 0%, hsl(42 85% 52%) 100%)'
                      : 'linear-gradient(180deg, hsl(210 35% 78%) 0%, hsl(210 32% 68%) 100%)',
                    boxShadow: isSelected
                      ? '0 0 20px hsl(42 90% 55% / 0.55), 0 0 40px hsl(42 90% 55% / 0.25), inset 0 1px 0 hsl(42 100% 85% / 0.5)'
                      : '0 2px 12px hsl(209 55% 35% / 0.25), inset 0 1px 0 hsl(210 40% 88% / 0.4)',
                  }}
                >
                  {/* Inner white circle */}
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, hsl(210 38% 90%) 0%, hsl(210 32% 82%) 100%)',
                    }}
                  >
                    <motion.img
                      src={mindlingImages[type]}
                      alt={mindling.displayName}
                      className="w-[85%] h-[85%] object-contain"
                      style={{ filter: 'drop-shadow(0 2px 6px hsl(209 60% 35% / 0.35))' }}
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
                          background: 'linear-gradient(180deg, hsl(42 90% 62%) 0%, hsl(42 85% 48%) 100%)',
                          color: 'hsl(209 90% 15%)',
                          boxShadow: '0 2px 6px hsl(42 90% 40% / 0.45)',
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
                    color: isSelected ? 'hsl(42 90% 75%)' : 'hsl(210 35% 88%)',
                    textShadow: '0 1px 4px hsl(209 80% 12% / 0.5)',
                  }}
                >
                  {mindling.displayName}
                </motion.div>

                {/* Trait */}
                <span className="text-sm font-medium" style={{ color: 'hsl(210 30% 78%)' }}>
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
              background: 'hsl(210 35% 84% / 0.9)',
              boxShadow: 'inset 0 2px 6px hsl(209 50% 40% / 0.2), 0 1px 0 hsl(210 40% 90% / 0.4)',
              color: 'hsl(209 90% 18%)',
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
                background: 'hsl(210 32% 78% / 0.95)',
                boxShadow: '0 4px 16px hsl(209 60% 25% / 0.2)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'hsl(209 90% 18%)' }}>Pick one!</p>
              <div className="absolute -left-2 top-1/2 w-4 h-4 transform -translate-y-1/2 rotate-45"
                style={{ background: 'hsl(210 32% 78% / 0.95)' }}
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
              ? 'linear-gradient(180deg, hsl(42 90% 62%) 0%, hsl(38 85% 48%) 100%)'
              : 'hsl(210 25% 68%)',
            color: selectedType && name.trim() ? 'hsl(209 90% 15%)' : 'hsl(210 20% 45%)',
            boxShadow: selectedType && name.trim()
              ? '0 4px 16px hsl(42 90% 40% / 0.45), inset 0 1px 0 hsl(42 100% 80% / 0.4)'
              : '0 2px 8px hsl(209 40% 40% / 0.2)',
            cursor: selectedType && name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          ADOPT & START
        </motion.button>
      </div>
    </div>
  );
}
