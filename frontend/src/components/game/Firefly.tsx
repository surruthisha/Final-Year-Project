import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import fireflyImg from '@/assets/firefly.png';

interface FireflyProps {
  onClick: () => void;
  x: number;
  y: number;
}

export function Firefly({ onClick, x, y }: FireflyProps) {
  // Random drift offsets — stable per mount via useMemo with no deps
  const drift = useMemo(() => ({
    dx: (Math.random() - 0.5) * 60,
    dy: (Math.random() - 0.5) * 40,
    dur: 2.5 + Math.random() * 2,
  }), []);

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{
        scale: [0, 1.1, 1],
        x: [0, drift.dx * 0.5, drift.dx, drift.dx * 0.3, 0],
        y: [0, drift.dy * 0.3, drift.dy, drift.dy * 0.7, 0],
      }}
      exit={{ scale: 1.8, opacity: 0 }}
      transition={{
        scale: { duration: 0.3 },
        x: { duration: drift.dur, repeat: Infinity, ease: 'easeInOut' },
        y: { duration: drift.dur * 0.9, repeat: Infinity, ease: 'easeInOut' },
      }}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
      }}
      className="cursor-pointer outline-none border-none bg-transparent"
    >
      <div className="relative w-16 h-16 md:w-20 md:h-20">
        {/* Glow aura */}
        <div
          className="absolute -inset-3 rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsla(50,100%,70%,0.5) 0%, hsla(45,100%,55%,0.15) 50%, transparent 70%)',
            filter: 'blur(6px)',
            animation: 'fireflyGlow 1.4s ease-in-out infinite',
          }}
        />

        {/* Firefly image */}
        <img
          src={fireflyImg}
          alt="Firefly — tap to catch!"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_18px_rgba(255,220,120,0.9)] pointer-events-none select-none"
        />

        {/* "tap!" label */}
        <span
          className="absolute -bottom-3 left-1/2 font-display font-bold text-[10px] md:text-xs"
          style={{
            transform: 'translateX(-50%)',
            color: 'hsl(48,100%,85%)',
            textShadow: '0 0 8px hsla(48,100%,60%,0.9), 0 1px 2px rgba(0,0,0,0.3)',
            animation: 'fireflyGlow 1.4s ease-in-out infinite',
          }}
        >
          tap!
        </span>
      </div>
    </motion.button>
  );
}
