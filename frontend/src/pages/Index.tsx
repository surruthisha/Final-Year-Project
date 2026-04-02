import { useEffect, useState } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { GameController } from '@/components/game/GameController';
import { SettingsModal } from '@/components/game/SettingsModal';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

function GameApp() {
  const { state } = useGame();
  const { isPlaying, start, stop } = useBackgroundMusic();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (state.settings.musicEnabled && !isPlaying) start();
    else if (!state.settings.musicEnabled && isPlaying) stop();
  }, [state.settings.musicEnabled]);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => setShowSettings(true)}
        className="fixed top-4 left-4 z-50 p-3 rounded-full bg-card/90 shadow-soft
                   hover:shadow-float transition-all border-2 border-border/50"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-foreground" />
      </motion.button>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <GameController />
    </div>
  );
}

const Index = () => {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
};

export default Index;
