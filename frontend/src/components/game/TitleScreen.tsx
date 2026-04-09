import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import floatingIslandsBg from '@/assets/floating-islands-bg.jpg';

export function TitleScreen() {
  const { dispatch } = useGame();
  const { playClick, playSwoosh } = useSoundEffects();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${floatingIslandsBg})` }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, hsla(209,60%,18%,0.15) 0%, transparent 30%, transparent 65%, hsla(209,70%,12%,0.25) 100%)',
      }} />
      
      {/* Floating clouds animation */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-16 bg-cloud-white/80 rounded-full blur-sm"
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-20 w-48 h-20 bg-cloud-white/60 rounded-full blur-sm"
        animate={{ x: [0, -30, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4">
        {/* Logo - positioned at top with breathing room */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="mt-10 md:mt-16 mb-3 text-center"
        >
          <h1 className="game-title text-4xl md:text-6xl lg:text-7xl drop-shadow-[0_3px_10px_hsl(var(--primary)/0.5)]"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Mindscape of
          </h1>
          <motion.h1 
            className="game-title text-5xl md:text-7xl lg:text-8xl text-center drop-shadow-[0_3px_10px_hsl(var(--primary)/0.5)]"
            style={{ color: 'hsl(var(--primary))' }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Mindlings
          </motion.h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 px-3 py-1 rounded-lg"
          style={{
            background: 'hsl(209 70% 18% / 0.18)',
            border: '1px solid hsl(210 40% 60% / 0.1)',
          }}
        >
          <p
            className="text-lg md:text-xl text-center font-display font-medium"
            style={{ color: 'hsl(210 35% 92%)', textShadow: '0 1px 6px hsl(209 90% 15% / 0.4)' }}
          >
            A journey of discovery awaits you...
          </p>
        </motion.div>

        {/* Spacer to push button toward bottom-center */}
        <div className="flex-1" />

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playSwoosh(); dispatch({ type: 'SET_SCREEN', screen: 'story-intro' }); }}
          className="mb-24 px-12 py-5 text-2xl font-display font-bold rounded-bubble
                     bg-gradient-to-b from-primary to-primary/80
                     text-primary-foreground shadow-glow-gold
                     hover:shadow-[0_0_40px_hsl(var(--primary)/0.7)]
                     transition-all duration-300 pulse-glow"
        >
          Start Journey
        </motion.button>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-star-gold rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
