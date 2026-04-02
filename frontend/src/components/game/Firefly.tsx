import { motion } from 'framer-motion';

interface FireflyProps {
  onClick: () => void;
  x: number;
  y: number;
}

export function Firefly({ onClick, x, y }: FireflyProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0 }}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
      }}
      className="cursor-pointer transform -translate-x-1/2 -translate-y-1/2 outline-none border-none bg-transparent"
    >
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Outer ambient glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.4, 1],
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="absolute -inset-4 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(50 100% 70% / 0.5) 0%, hsl(45 100% 55% / 0.2) 40%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />

        {/* SVG firefly body - 3D bold cutout shape */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_hsl(50_100%_60%/0.9)]"
          style={{ filter: 'drop-shadow(0 0 8px hsl(50 100% 60% / 0.8))' }}
        >
          {/* Left wing */}
          <motion.ellipse
            cx="32" cy="38" rx="18" ry="28"
            fill="hsl(50 80% 75% / 0.6)"
            stroke="hsl(45 100% 65% / 0.8)"
            strokeWidth="1"
            style={{ filter: 'blur(0.5px)' }}
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 0.3, ease: 'easeInOut' }}
            transform-origin="42 50"
          />
          {/* Right wing */}
          <motion.ellipse
            cx="68" cy="38" rx="18" ry="28"
            fill="hsl(50 80% 75% / 0.6)"
            stroke="hsl(45 100% 65% / 0.8)"
            strokeWidth="1"
            style={{ filter: 'blur(0.5px)' }}
            animate={{ rotate: [8, -8, 8] }}
            transition={{ repeat: Infinity, duration: 0.3, ease: 'easeInOut' }}
            transform-origin="58 50"
          />
          {/* Wing veins */}
          <line x1="32" y1="18" x2="35" y2="55" stroke="hsl(45 60% 70% / 0.4)" strokeWidth="0.5" />
          <line x1="68" y1="18" x2="65" y2="55" stroke="hsl(45 60% 70% / 0.4)" strokeWidth="0.5" />

          {/* Body - 3D gradient */}
          <defs>
            <radialGradient id="bodyGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="hsl(45 100% 80%)" />
              <stop offset="50%" stopColor="hsl(40 90% 55%)" />
              <stop offset="100%" stopColor="hsl(35 80% 35%)" />
            </radialGradient>
            <radialGradient id="abdomenGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="hsl(55 100% 85%)" />
              <stop offset="40%" stopColor="hsl(50 100% 65%)" />
              <stop offset="100%" stopColor="hsl(45 90% 40%)" />
            </radialGradient>
          </defs>

          {/* Head */}
          <circle cx="50" cy="32" r="8" fill="url(#bodyGlow)" />
          {/* Eyes */}
          <circle cx="46" cy="30" r="2.5" fill="hsl(30 60% 15%)" />
          <circle cx="54" cy="30" r="2.5" fill="hsl(30 60% 15%)" />
          <circle cx="47" cy="29" r="1" fill="hsl(0 0% 95%)" />
          <circle cx="55" cy="29" r="1" fill="hsl(0 0% 95%)" />

          {/* Thorax */}
          <ellipse cx="50" cy="46" rx="10" ry="8" fill="url(#bodyGlow)" />

          {/* Abdomen - glowing bioluminescence */}
          <motion.ellipse
            cx="50" cy="62" rx="11" ry="14"
            fill="url(#abdomenGlow)"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          {/* Bioluminescent highlight */}
          <motion.ellipse
            cx="50" cy="58" rx="6" ry="8"
            fill="hsl(55 100% 90% / 0.7)"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />

          {/* Antennae */}
          <path d="M46 26 Q42 16 38 12" stroke="hsl(40 70% 50%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M54 26 Q58 16 62 12" stroke="hsl(40 70% 50%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="38" cy="12" r="2" fill="hsl(50 100% 70%)" />
          <circle cx="62" cy="12" r="2" fill="hsl(50 100% 70%)" />

          {/* Legs */}
          <line x1="42" y1="46" x2="34" y2="54" stroke="hsl(40 60% 45%)" strokeWidth="1" strokeLinecap="round" />
          <line x1="58" y1="46" x2="66" y2="54" stroke="hsl(40 60% 45%)" strokeWidth="1" strokeLinecap="round" />
          <line x1="42" y1="52" x2="34" y2="60" stroke="hsl(40 60% 45%)" strokeWidth="1" strokeLinecap="round" />
          <line x1="58" y1="52" x2="66" y2="60" stroke="hsl(40 60% 45%)" strokeWidth="1" strokeLinecap="round" />
        </svg>

        {/* "tap!" label */}
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 
                     font-display font-bold text-xs
                     drop-shadow-[0_0_6px_hsl(50_100%_60%/0.8)]"
          style={{ color: 'hsl(45 100% 70%)' }}
        >
          tap!
        </motion.span>
      </div>
    </motion.button>
  );
}
