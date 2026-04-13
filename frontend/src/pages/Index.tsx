import { useCallback, useEffect, useState } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { GameController } from '@/components/game/GameController';
import { SettingsModal } from '@/components/game/SettingsModal';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

import backgroundPng from '@/assets/background.png';
import islandPng from '@/assets/island.png';
import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';
import fireflyImage from '@/assets/firefly.png';

/** Preload an image and resolve when it's decoded (or reject on error). */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/** Dismiss the inline HTML loader (in index.html) with a CSS fade-out. */
function dismissHtmlLoader() {
  const el = document.getElementById('app-loader');
  if (!el) return;
  el.classList.add('loader-exit');
  // Remove from DOM after the CSS transition finishes
  el.addEventListener('transitionend', () => el.remove(), { once: true });
  // Safety net — remove after 600ms even if transitionend never fires
  setTimeout(() => el.remove(), 600);
}

function GameApp() {
  const { state } = useGame();
  const { isPlaying, start, stop } = useBackgroundMusic();
  const [showSettings, setShowSettings] = useState(false);
  const [ready, setReady] = useState(false);

  const boot = useCallback(async () => {
    try {
      // Preload all title-screen images in parallel
      await Promise.all([
        preloadImage(backgroundPng),
        preloadImage(islandPng),
        preloadImage(pipImage),
        preloadImage(miraImage),
        preloadImage(veeImage),
        preloadImage(nuoImage),
        preloadImage(fireflyImage),
      ]);
    } catch {
      // If an image fails, proceed anyway after a short grace period
    }
    // Small extra pause so fonts finish rendering
    await new Promise((r) => setTimeout(r, 120));
    setReady(true);
    dismissHtmlLoader();
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  // Hard timeout — never block the user for more than 4 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      if (!ready) {
        setReady(true);
        dismissHtmlLoader();
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (state.settings.musicEnabled && !isPlaying) start();
    else if (!state.settings.musicEnabled && isPlaying) stop();
  }, [state.settings.musicEnabled]);

  // Toggle scroll on html element for the report page
  useEffect(() => {
    if (state.screen === 'report') {
      document.documentElement.classList.add('allow-scroll');
    } else {
      document.documentElement.classList.remove('allow-scroll');
    }
    return () => document.documentElement.classList.remove('allow-scroll');
  }, [state.screen]);

  return (
    <div className={`w-screen ${state.screen === 'report' ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
      {ready && (
        <>
          <GameController />

          <motion.button
            initial={{ opacity: 0, scale: 0, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 220, damping: 16 }}
            whileHover={{ scale: 1.12, rotate: 35 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)}
            className="glass-button glass-tint-sky fixed top-5 left-5 z-50
                       w-14 h-14 grid place-items-center ink-deep"
            style={{
              boxShadow:
                '0 12px 36px -8px hsl(200 100% 60% / 0.55), 0 6px 18px -6px hsl(232 60% 18% / 0.35)',
            }}
            title="Settings"
            aria-label="Settings"
          >
            <Settings
              className="relative z-10 w-6 h-6 drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]"
              strokeWidth={2.6}
            />
            <span className="specular-sweep" aria-hidden="true" />
          </motion.button>
        </>
      )}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
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
