import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tint = 'sky' | 'mint' | 'peach' | 'lilac' | 'butter' | 'bubble';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const tintClass: Record<Tint, string> = {
  sky:    'glass-tint-sky',
  mint:   'glass-tint-mint',
  peach:  'glass-tint-peach',
  lilac:  'glass-tint-lilac',
  butter: 'glass-tint-butter',
  bubble: 'glass-tint-bubble',
};

const tintGlow: Record<Tint, string> = {
  sky:    '0 14px 40px -10px hsl(200 100% 60% / 0.55), 0 0 0 hsl(200 100% 70% / 0)',
  mint:   '0 14px 40px -10px hsl(158 80% 55% / 0.55), 0 0 0 hsl(158 80% 70% / 0)',
  peach:  '0 14px 40px -10px hsl(18 100% 60% / 0.6),  0 0 0 hsl(18 100% 70% / 0)',
  lilac:  '0 14px 40px -10px hsl(282 90% 65% / 0.55), 0 0 0 hsl(282 90% 75% / 0)',
  butter: '0 16px 44px -10px hsl(48 100% 55% / 0.7),  0 0 0 hsl(48 100% 70% / 0)',
  bubble: '0 14px 40px -10px hsl(330 90% 65% / 0.55), 0 0 0 hsl(330 90% 75% / 0)',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-5 py-2 text-sm',
  md: 'px-7 py-3 text-base',
  lg: 'px-10 py-4 text-xl',
  xl: 'px-14 py-5 text-2xl',
};

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  tint?: Tint;
  size?: Size;
  /** Show animated specular highlight sweep */
  shimmer?: boolean;
  children?: ReactNode;
}

/**
 * Chunky pastel glass button with bouncy hover, squish-on-tap, and a
 * specular highlight sweep. Mascot-friendly Moshi-meets-visionOS feel.
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, tint = 'butter', size = 'lg', shimmer = true, children, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.06, y: -3 }}
        whileTap={{ scale: 0.94, y: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        style={{ boxShadow: tintGlow[tint] }}
        className={cn(
          'glass-button font-display font-bold tracking-wide',
          'relative overflow-hidden select-none',
          tintClass[tint],
          sizeClass[size],
          'ink-deep',
          className
        )}
        {...rest}
      >
        <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
          {children}
        </span>
        {shimmer && <span className="specular-sweep" aria-hidden="true" />}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
