import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Volume2, Home } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, dispatch } = useGame();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(0 0% 0% / 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full max-w-sm rounded-game shadow-float"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="game-title text-xl text-foreground">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Toggles */}
            <div className="px-6 py-5 space-y-5">

              {/* Music */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(var(--primary) / 0.12)' }}>
                    <Music className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">Background Music</p>
                    <p className="text-xs text-muted-foreground">Ambient game soundtrack</p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_MUSIC' })}
                  className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                  style={{
                    background: state.settings.musicEnabled
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))',
                  }}
                >
                  <motion.div
                    animate={{ x: state.settings.musicEnabled ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* SFX */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(var(--primary) / 0.12)' }}>
                    <Volume2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">Sound Effects</p>
                    <p className="text-xs text-muted-foreground">Clicks, chimes & game sounds</p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_SFX' })}
                  className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                  style={{
                    background: state.settings.sfxEnabled
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))',
                  }}
                >
                  <motion.div
                    animate={{ x: state.settings.sfxEnabled ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  dispatch({ type: 'RESET_GAME' });
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-game font-display font-semibold
                           text-muted-foreground border-2 border-border hover:border-destructive
                           hover:text-destructive transition-all text-sm"
              >
                <Home className="w-4 h-4" />
                Home Page
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-game font-display font-bold text-primary-foreground
                           bg-gradient-to-b from-primary to-primary/80 transition-all hover:opacity-90"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
