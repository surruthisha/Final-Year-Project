import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Volume2, Home } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { GlassCard, GlassButton } from '@/components/ui/glass';

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
          style={{
            background:
              'radial-gradient(ellipse at center, hsla(282,60%,30%,0.45) 0%, hsla(232,70%,18%,0.65) 100%)',
            backdropFilter: 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            <GlassCard
              tint="lilac"
              shimmer
              className="overflow-hidden"
              style={{ boxShadow: 'var(--glass-glow-lilac)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
                <h2 className="game-title text-2xl ink-deep drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                  Settings
                </h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="glass-button glass-tint-peach w-9 h-9 grid place-items-center"
                  aria-label="Close"
                >
                  <X className="relative z-10 w-4 h-4 ink-deep" />
                </motion.button>
              </div>

              {/* Toggles */}
              <div className="px-6 py-6 space-y-5">
                {/* Music */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="glass-button glass-tint-sky w-10 h-10 grid place-items-center"
                      style={{ borderRadius: '14px' }}
                    >
                      <Music className="relative z-10 w-4 h-4 ink-deep" />
                    </div>
                    <div>
                      <p className="font-display font-bold ink-deep">Background Music</p>
                      <p className="text-xs ink-soft">Ambient game soundtrack</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={state.settings.musicEnabled}
                    onClick={() => dispatch({ type: 'TOGGLE_MUSIC' })}
                  />
                </div>

                {/* SFX */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="glass-button glass-tint-mint w-10 h-10 grid place-items-center"
                      style={{ borderRadius: '14px' }}
                    >
                      <Volume2 className="relative z-10 w-4 h-4 ink-deep" />
                    </div>
                    <div>
                      <p className="font-display font-bold ink-deep">Sound Effects</p>
                      <p className="text-xs ink-soft">Clicks, chimes &amp; game sounds</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={state.settings.sfxEnabled}
                    onClick={() => dispatch({ type: 'TOGGLE_SFX' })}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/30 flex items-center justify-between gap-3">
                <GlassButton
                  tint="bubble"
                  size="sm"
                  shimmer={false}
                  onClick={() => {
                    dispatch({ type: 'RESET_GAME' });
                    onClose();
                  }}
                  className="rounded-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <Home className="w-4 h-4" strokeWidth={2.5} />
                    Home Page
                  </span>
                </GlassButton>
                <GlassButton tint="butter" size="sm" onClick={onClose} className="rounded-full">
                  Done
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onClick: () => void;
}

function ToggleSwitch({ enabled, onClick }: ToggleSwitchProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-14 h-7 rounded-full focus:outline-none transition-all duration-300"
      style={{
        background: enabled
          ? 'linear-gradient(135deg, hsl(48 100% 70%), hsl(18 100% 72%))'
          : 'rgba(255,255,255,0.25)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: enabled
          ? '0 0 18px hsla(48,100%,60%,0.6), inset 0 1px 0 rgba(255,255,255,0.6)'
          : 'inset 0 1px 0 rgba(255,255,255,0.45)',
        backdropFilter: 'blur(10px)',
      }}
      aria-pressed={enabled}
    >
      <motion.div
        animate={{ x: enabled ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, #ffffff, #f0f4ff 60%, #d8e0f0 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      />
    </button>
  );
}
