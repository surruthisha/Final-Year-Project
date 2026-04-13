import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tint = 'sky' | 'mint' | 'peach' | 'lilac' | 'butter' | 'bubble' | 'none';

const tintClass: Record<Tint, string> = {
  sky:    'glass-tint-sky',
  mint:   'glass-tint-mint',
  peach:  'glass-tint-peach',
  lilac:  'glass-tint-lilac',
  butter: 'glass-tint-butter',
  bubble: 'glass-tint-bubble',
  none:   '',
};

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  tint?: Tint;
  /** Show animated specular highlight sweep */
  shimmer?: boolean;
  children?: ReactNode;
}

/**
 * Frosted glass card with optional pastel tint and shimmer sweep.
 * Used for headline plaques, panels, dialogs, and content surfaces.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, tint = 'none', shimmer = false, children, ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass-card relative overflow-hidden',
          tintClass[tint],
          className
        )}
        {...rest}
      >
        {children}
        {shimmer && <span className="specular-sweep" aria-hidden="true" />}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
