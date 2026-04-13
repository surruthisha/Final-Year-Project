import { cn } from '@/lib/utils';

export interface CartoonCloudProps {
  /** Cloud width in rem (height auto from aspect ratio) */
  width?: number;
  /** Optional pastel hue bias (e.g. 200 sky, 282 lilac, 48 butter, 330 bubble). Omit for pure white. */
  hue?: number;
  /** 0..1 — overall opacity */
  opacity?: number;
  /** Variant gives a different bumpy silhouette so clouds don't all look identical */
  variant?: 1 | 2 | 3 | 4;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Moshi-style puffy cartoon cloud rendered as inline SVG.
 * Multiple variants give natural visual variety in the sky.
 */
export function CartoonCloud({
  width = 18,
  hue,
  opacity = 1,
  variant = 1,
  className,
  style,
}: CartoonCloudProps) {
  // Tinted highlight + shadow stops, or pure white
  const top = hue ? `hsl(${hue}, 100%, 99%)` : '#ffffff';
  const mid = hue ? `hsl(${hue}, 100%, 96%)` : '#fdfdff';
  const low = hue ? `hsl(${hue}, 60%, 88%)` : '#e8eef8';
  const rim = hue ? `hsl(${hue}, 80%, 78%)` : '#cdd6e6';

  // Hand-drawn bumpy cloud silhouettes — viewBox 200x100, designed to look puffy
  const paths: Record<1 | 2 | 3 | 4, string> = {
    1: 'M30,75 C12,75 4,60 14,48 C8,32 26,20 40,28 C46,12 70,8 82,22 C94,8 122,8 132,24 C148,16 172,28 168,46 C184,52 184,72 168,78 C156,90 130,90 116,80 C100,92 70,92 56,80 C44,86 30,84 30,75 Z',
    2: 'M28,72 C10,72 6,55 18,46 C14,28 38,18 52,30 C60,14 86,16 92,32 C108,22 132,32 130,50 C148,52 152,72 134,78 C124,90 96,90 84,80 C68,90 46,86 38,78 C32,82 28,80 28,72 Z',
    3: 'M34,76 C16,76 8,62 18,50 C14,32 34,22 48,30 C56,16 78,14 88,28 C100,16 124,18 130,34 C148,32 158,52 144,64 C150,80 124,90 110,80 C96,92 70,92 58,82 C46,86 34,84 34,76 Z',
    4: 'M26,74 C8,74 4,58 16,48 C12,30 32,18 48,28 C54,12 80,10 90,26 C104,14 130,18 134,36 C152,38 156,60 140,68 C132,84 104,86 92,76 C76,90 50,88 40,78 C32,84 26,82 26,74 Z',
  };

  const id = `cloud-grad-${variant}-${hue ?? 'w'}`;
  const shadowId = `cloud-shadow-${variant}-${hue ?? 'w'}`;

  return (
    <svg
      viewBox="0 0 200 100"
      className={cn('block', className)}
      style={{
        width: `${width}rem`,
        height: 'auto',
        opacity,
        filter: 'drop-shadow(0 14px 22px hsla(232, 60%, 30%, 0.18))',
        ...style,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={top} />
          <stop offset="55%" stopColor={mid} />
          <stop offset="100%" stopColor={low} />
        </linearGradient>
        <radialGradient id={shadowId} cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor={rim} stopOpacity="0.35" />
          <stop offset="100%" stopColor={rim} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Soft underbelly shadow */}
      <path d={paths[variant]} fill={`url(#${shadowId})`} transform="translate(0,4)" />
      {/* Main puffy body */}
      <path
        d={paths[variant]}
        fill={`url(#${id})`}
        stroke={rim}
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      {/* Top highlight ribbon */}
      <path
        d={paths[variant]}
        fill="white"
        opacity="0.45"
        transform="translate(0,-3) scale(0.97 0.55)"
        style={{ transformOrigin: 'center top' }}
      />
    </svg>
  );
}
