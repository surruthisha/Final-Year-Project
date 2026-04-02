import { motion } from 'framer-motion';

interface GemTreeProps {
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
}

export function GemTree({ size = 'md', glowing = true }: GemTreeProps) {
  const dims = size === 'sm' ? { w: 120, h: 160 } : size === 'md' ? { w: 180, h: 240 } : { w: 240, h: 320 };

  return (
    <div className="relative" style={{ width: dims.w, height: dims.h }}>
      {/* Ambient glow behind tree */}
      {glowing && (
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, hsla(45, 100%, 60%, 0.4) 0%, hsla(280, 60%, 60%, 0.2) 40%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <svg
        width={dims.w}
        height={dims.h}
        viewBox="0 0 180 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="trunk-grad" x1="90" y1="140" x2="90" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(30, 40%, 55%)" />
            <stop offset="100%" stopColor="hsl(25, 35%, 35%)" />
          </linearGradient>
          <radialGradient id="crown-glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.8" />
            <stop offset="60%" stopColor="hsl(280, 60%, 60%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="tree-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trunk */}
        <path
          d="M80 150 Q75 180 78 220 L82 240 L98 240 L102 220 Q105 180 100 150 Z"
          fill="url(#trunk-grad)"
        />
        {/* Trunk bark details */}
        <path d="M85 160 Q88 175 86 195" stroke="hsl(25, 30%, 30%)" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M95 155 Q92 170 94 190" stroke="hsl(25, 30%, 30%)" strokeWidth="1" opacity="0.3" fill="none" />

        {/* Crown glow background */}
        <ellipse cx="90" cy="85" rx="75" ry="70" fill="url(#crown-glow)" filter="tree-glow" />

        {/* Branch structure */}
        <path d="M90 150 Q60 120 40 90" stroke="hsl(30, 40%, 50%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M90 150 Q120 120 140 90" stroke="hsl(30, 40%, 50%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M90 145 Q70 100 50 60" stroke="hsl(30, 40%, 50%)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M90 145 Q110 100 130 60" stroke="hsl(30, 40%, 50%)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M90 140 Q90 100 90 40" stroke="hsl(30, 40%, 50%)" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Crystal leaves - Spark (gold) */}
        {[
          { cx: 50, cy: 60, r: -15 },
          { cx: 90, cy: 35, r: 10 },
          { cx: 130, cy: 55, r: 20 },
          { cx: 65, cy: 45, r: -5 },
          { cx: 115, cy: 40, r: 15 },
        ].map((leaf, i) => (
          <motion.g key={`spark-${i}`} animate={glowing ? { opacity: [0.7, 1, 0.7] } : {}} transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}>
            <polygon
              points={`${leaf.cx},${leaf.cy - 12} ${leaf.cx + 8},${leaf.cy} ${leaf.cx},${leaf.cy + 12} ${leaf.cx - 8},${leaf.cy}`}
              fill="hsl(45, 100%, 55%)"
              transform={`rotate(${leaf.r}, ${leaf.cx}, ${leaf.cy})`}
              filter="url(#tree-glow)"
            />
            <polygon
              points={`${leaf.cx},${leaf.cy - 12} ${leaf.cx + 8},${leaf.cy} ${leaf.cx},${leaf.cy + 12} ${leaf.cx - 8},${leaf.cy}`}
              fill="white"
              opacity="0.3"
              transform={`rotate(${leaf.r}, ${leaf.cx}, ${leaf.cy})`}
            />
          </motion.g>
        ))}

        {/* Crystal leaves - Logic (blue) */}
        {[
          { cx: 40, cy: 85, r: -20 },
          { cx: 70, cy: 70, r: 5 },
          { cx: 140, cy: 80, r: 25 },
          { cx: 110, cy: 68, r: -10 },
        ].map((leaf, i) => (
          <motion.g key={`logic-${i}`} animate={glowing ? { opacity: [0.7, 1, 0.7] } : {}} transition={{ duration: 2, delay: 0.5 + i * 0.3, repeat: Infinity }}>
            <polygon
              points={`${leaf.cx},${leaf.cy - 10} ${leaf.cx + 7},${leaf.cy} ${leaf.cx},${leaf.cy + 10} ${leaf.cx - 7},${leaf.cy}`}
              fill="hsl(210, 80%, 55%)"
              transform={`rotate(${leaf.r}, ${leaf.cx}, ${leaf.cy})`}
              filter="url(#tree-glow)"
            />
            <polygon
              points={`${leaf.cx},${leaf.cy - 10} ${leaf.cx + 7},${leaf.cy} ${leaf.cx},${leaf.cy + 10} ${leaf.cx - 7},${leaf.cy}`}
              fill="white"
              opacity="0.25"
              transform={`rotate(${leaf.r}, ${leaf.cx}, ${leaf.cy})`}
            />
          </motion.g>
        ))}

        {/* Crystal leaves - Harmony (purple) */}
        {[
          { cx: 55, cy: 100, r: -10 },
          { cx: 80, cy: 90, r: 8 },
          { cx: 125, cy: 95, r: 18 },
          { cx: 100, cy: 85, r: -8 },
        ].map((leaf, i) => (
          <motion.g key={`harmony-${i}`} animate={glowing ? { opacity: [0.7, 1, 0.7] } : {}} transition={{ duration: 2, delay: 1 + i * 0.3, repeat: Infinity }}>
            <polygon
              points={`${leaf.cx},${leaf.cy - 10} ${leaf.cx + 7},${leaf.cy} ${leaf.cx},${leaf.cy + 10} ${leaf.cx - 7},${leaf.cy}`}
              fill="hsl(280, 60%, 60%)"
              transform={`rotate(${leaf.r}, ${leaf.cx}, ${leaf.cy})`}
              filter="url(#tree-glow)"
            />
            <polygon
              points={`${leaf.cx},${leaf.cy - 10} ${leaf.cx + 7},${leaf.cy} ${leaf.cx},${leaf.cy + 10} ${leaf.cx - 7},${leaf.cy}`}
              fill="white"
              opacity="0.25"
              transform={`rotate(${leaf.r}, ${leaf.cx}, ${leaf.cy})`}
            />
          </motion.g>
        ))}
      </svg>

      {/* Floating sparkle particles */}
      {glowing && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${10 + Math.random() * 50}%`,
            background: i % 3 === 0 ? 'hsl(45, 100%, 70%)' : i % 3 === 1 ? 'hsl(210, 80%, 70%)' : 'hsl(280, 60%, 70%)',
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -15, -30],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.4,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
