import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function MusicToggle({ isPlaying, onToggle }: MusicToggleProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      onClick={onToggle}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-card/90 shadow-soft 
                 hover:shadow-float transition-all border-2 border-border/50"
      title={isPlaying ? 'Mute music' : 'Play music'}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-primary" />
      ) : (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      )}
    </motion.button>
  );
}
