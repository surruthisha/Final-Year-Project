import { motion } from 'framer-motion';

interface SeedGemProps {
  type: 'spark' | 'logic' | 'memory' | 'harmony';
  size?: number;
  animate?: boolean;
  className?: string;
}

const gemConfigs = {
  spark: {
    primary: 'hsl(45, 100%, 55%)',
    secondary: 'hsl(35, 90%, 65%)',
    highlight: 'hsl(50, 100%, 80%)',
    glow: 'hsl(45, 100%, 60%)',
    shadow: 'hsl(40, 80%, 35%)',
  },
  logic: {
    primary: 'hsl(210, 80%, 55%)',
    secondary: 'hsl(200, 70%, 65%)',
    highlight: 'hsl(210, 90%, 80%)',
    glow: 'hsl(210, 100%, 60%)',
    shadow: 'hsl(220, 70%, 35%)',
  },
  memory: {
    primary: 'hsl(160, 65%, 45%)',
    secondary: 'hsl(170, 55%, 55%)',
    highlight: 'hsl(155, 70%, 78%)',
    glow: 'hsl(160, 80%, 55%)',
    shadow: 'hsl(165, 55%, 30%)',
  },
  harmony: {
    primary: 'hsl(280, 60%, 60%)',
    secondary: 'hsl(290, 50%, 70%)',
    highlight: 'hsl(280, 70%, 85%)',
    glow: 'hsl(280, 80%, 65%)',
    shadow: 'hsl(280, 50%, 35%)',
  },
};

export function SeedGem({ type, size = 64, animate = true, className = '' }: SeedGemProps) {
  const config = gemConfigs[type];
  const id = `gem-${type}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={animate ? { y: [0, -4, 0] } : {}}
      transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{
          background: `radial-gradient(circle, ${config.glow}80 0%, transparent 70%)`,
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-lg"
      >
        <defs>
          <linearGradient id={`${id}-main`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={config.highlight} />
            <stop offset="40%" stopColor={config.primary} />
            <stop offset="100%" stopColor={config.shadow} />
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="20" y1="10" x2="44" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main gem shape - hexagonal crystal */}
        <path
          d="M32 4 L52 18 L52 46 L32 60 L12 46 L12 18 Z"
          fill={`url(#${id}-main)`}
          filter={`url(#${id}-glow)`}
        />

        {/* Left facet */}
        <path
          d="M32 4 L12 18 L12 46 L32 32 Z"
          fill={config.primary}
          opacity="0.7"
        />

        {/* Right facet */}
        <path
          d="M32 4 L52 18 L52 46 L32 32 Z"
          fill={config.secondary}
          opacity="0.8"
        />

        {/* Bottom facet */}
        <path
          d="M12 46 L32 60 L52 46 L32 32 Z"
          fill={config.shadow}
          opacity="0.9"
        />

        {/* Inner shine */}
        <path
          d="M32 10 L46 20 L46 40 L32 50 L18 40 L18 20 Z"
          fill={`url(#${id}-shine)`}
        />

        {/* Top highlight sparkle */}
        <ellipse cx="26" cy="16" rx="6" ry="3" fill="white" opacity="0.5" transform="rotate(-20, 26, 16)" />

        {/* Center star sparkle */}
        <path
          d="M32 28 L33.5 31 L37 31.5 L34.5 34 L35 37.5 L32 36 L29 37.5 L29.5 34 L27 31.5 L30.5 31 Z"
          fill="white"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  );
}
