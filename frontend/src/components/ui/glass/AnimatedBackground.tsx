import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { CartoonCloud } from './CartoonCloud';

export interface AnimatedBackgroundProps {
  /**
   * Full-bleed background image (e.g. background.png).
   * Covers the whole viewport behind the clouds with gentle parallax.
   */
  backgroundImage?: string;
  /** Far-distance background image with a soft radial mask (legacy JPG art). */
  sceneImage?: string;
  /**
   * Optional transparent foreground PNG (e.g. an extracted island).
   * Gets the strongest parallax + a gentle bobbing float.
   */
  islandImage?: string;
  /**
   * Optional PNG cloud assets. If provided, replaces the default CSS clouds.
   * Each entry is rendered as its own slow-drifting layer.
   */
  cloudImages?: string[];
  /** How much the scene parallaxes with the cursor. 0 disables. */
  parallaxStrength?: number;
  /** Number of floating orb particles drawn over the scene. */
  orbCount?: number;
  /** Render slow-drifting cloud blobs in the upper sky. */
  showClouds?: boolean;
  className?: string;
}

interface Orb {
  id: number;
  top: string;
  left: string;
  size: number;
  hue: number;
  delay: number;
  duration: number;
}

type CloudDepth = 'back' | 'mid' | 'front';

interface PuffyCloud {
  top: string;
  left: string;
  width: number;          // rem
  variant: 1 | 2 | 3 | 4;
  hue?: number;
  opacity: number;
  depth: CloudDepth;
  /** Independent slow bob amount in pixels */
  bobAmplitude: number;
  bobDuration: number;
  bobDelay: number;
}

// Hand-positioned puffy clouds — back/mid/front depths for parallax
const DEFAULT_CLOUDS: PuffyCloud[] = [
  // ── Back layer (largest, palest, slowest) ──────────────
  { top: '4%',  left: '2%',  width: 26, variant: 1, opacity: 0.95, depth: 'back', bobAmplitude: 6, bobDuration: 14, bobDelay: 0 },
  { top: '8%',  left: '62%', width: 24, variant: 3, opacity: 0.9,  depth: 'back', bobAmplitude: 5, bobDuration: 16, bobDelay: 1.5, hue: 200 },
  { top: '20%', left: '32%', width: 22, variant: 2, opacity: 0.85, depth: 'back', bobAmplitude: 7, bobDuration: 18, bobDelay: 3 },

  // ── Mid layer ──────────────────────────────────────────
  { top: '14%', left: '12%', width: 16, variant: 4, opacity: 0.95, depth: 'mid',  bobAmplitude: 8, bobDuration: 11, bobDelay: 0.5, hue: 282 },
  { top: '26%', left: '78%', width: 18, variant: 1, opacity: 0.9,  depth: 'mid',  bobAmplitude: 9, bobDuration: 12, bobDelay: 2 },
  { top: '32%', left: '46%', width: 14, variant: 2, opacity: 0.92, depth: 'mid',  bobAmplitude: 7, bobDuration: 13, bobDelay: 1, hue: 48 },

  // ── Front layer (smaller, brighter, fastest) ───────────
  { top: '40%', left: '6%',  width: 12, variant: 3, opacity: 1.0,  depth: 'front', bobAmplitude: 11, bobDuration: 9, bobDelay: 0, hue: 200 },
  { top: '46%', left: '70%', width: 13, variant: 4, opacity: 1.0,  depth: 'front', bobAmplitude: 12, bobDuration: 10, bobDelay: 1.8, hue: 330 },
  { top: '52%', left: '38%', width: 11, variant: 1, opacity: 0.95, depth: 'front', bobAmplitude: 10, bobDuration: 8,  bobDelay: 2.6 },
];

// Per-depth horizontal drift distance (matches the old Framer animate x ranges)
const CLOUD_X_TRAVEL: Record<CloudDepth, number> = {
  back:  30,
  mid:   40,
  front: 50,
};

// Per-depth duration multiplier (matches old Framer transitions)
const CLOUD_DURATION_MULT: Record<CloudDepth, number> = {
  back:  1.6,
  mid:   1.3,
  front: 1.0,
};

/**
 * Layered parallax background built from:
 *   1. A base pastel sky gradient
 *   2. Slow-drifting cloud blobs (or PNG clouds)
 *   3. (Optional) far scene image (the existing JPG art)
 *   4. (Optional) foreground island PNG with strongest parallax + bob
 *   5. Floating glass orbs / pollen particles
 *   6. Soft vignette
 *
 * The whole stack reacts gently to the cursor for a sense of depth.
 */
export function AnimatedBackground({
  backgroundImage,
  sceneImage,
  islandImage,
  cloudImages,
  parallaxStrength = 18,
  orbCount = 14,
  showClouds = true,
  className,
}: AnimatedBackgroundProps) {
  // Mouse-driven parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  // Per-layer parallax intensities. The island moves WITH the background
  // (same depth) so they feel like one cohesive scene, while clouds and
  // orbs swim in the foreground at progressively faster rates.
  const sceneX  = useTransform(sx, [-1, 1], [parallaxStrength * 0.55, -parallaxStrength * 0.55]);
  const sceneY  = useTransform(sy, [-1, 1], [parallaxStrength * 0.55, -parallaxStrength * 0.55]);
  const islandX = useTransform(sx, [-1, 1], [parallaxStrength * 0.6, -parallaxStrength * 0.6]);
  const islandY = useTransform(sy, [-1, 1], [parallaxStrength * 0.5, -parallaxStrength * 0.5]);
  const cloudsBackX = useTransform(sx, [-1, 1], [parallaxStrength * 1.1, -parallaxStrength * 1.1]);
  const cloudsMidX  = useTransform(sx, [-1, 1], [parallaxStrength * 1.9, -parallaxStrength * 1.9]);
  const cloudsFrontX = useTransform(sx, [-1, 1], [parallaxStrength * 2.8, -parallaxStrength * 2.8]);
  const orbsX   = useTransform(sx, [-1, 1], [parallaxStrength * 3.4, -parallaxStrength * 3.4]);
  const orbsY   = useTransform(sy, [-1, 1], [parallaxStrength * 3.4, -parallaxStrength * 3.4]);

  // rAF-throttled mousemove — mousemove can fire at >200Hz on some hardware.
  // Coalescing to 1 update per frame keeps Framer's spring work bounded.
  useEffect(() => {
    let nextX = 0;
    let nextY = 0;
    let queued = false;

    function flush() {
      mx.set(nextX);
      my.set(nextY);
      queued = false;
    }

    function onMove(e: MouseEvent) {
      nextX = (e.clientX / window.innerWidth) * 2 - 1;
      nextY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!queued) {
        queued = true;
        requestAnimationFrame(flush);
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my]);

  // Stable randomized orb positions
  const orbs = useMemo<Orb[]>(() => {
    const palette = [200, 158, 18, 282, 48, 330];
    return Array.from({ length: orbCount }, (_, i) => ({
      id: i,
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 95}%`,
      size: 6 + Math.random() * 18,
      hue: palette[i % palette.length],
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 8,
    }));
  }, [orbCount]);

  // Memoize the per-depth cloud buckets so we don't re-filter on every render
  const { backClouds, midClouds, frontClouds } = useMemo(
    () => ({
      backClouds:  DEFAULT_CLOUDS.filter((c) => c.depth === 'back'),
      midClouds:   DEFAULT_CLOUDS.filter((c) => c.depth === 'mid'),
      frontClouds: DEFAULT_CLOUDS.filter((c) => c.depth === 'front'),
    }),
    []
  );

  // Helper that turns a cloud spec into the CSS-var style the keyframes read.
  const cloudStyle = (c: PuffyCloud): CSSProperties => ({
    top: c.top,
    left: c.left,
    ['--cx' as never]: `${CLOUD_X_TRAVEL[c.depth]}px`,
    ['--cy' as never]: `-${c.bobAmplitude}px`,
    ['--drift-dur' as never]: `${c.bobDuration * CLOUD_DURATION_MULT[c.depth]}s`,
    ['--drift-delay' as never]: `${c.bobDelay}s`,
  });

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* ── Layer 1 — pastel sky base, gentle hue-shift ───── */}
      <div className="absolute inset-0 pastel-sky sky-shift" />

      {/* ── Layer 1b — full-bleed background image (background.png) ── */}
      {backgroundImage && (
        <motion.div
          className="absolute -inset-6 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            x: sceneX,
            y: sceneY,
            filter: 'saturate(1.1) brightness(1.02)',
            willChange: 'transform',
          }}
        />
      )}

      {/* ── Layer 2 — far scene image (existing JPG art, masked) ──── */}
      {sceneImage && (
        <motion.div
          className="absolute -inset-8 bg-cover bg-center"
          style={{
            backgroundImage: `url(${sceneImage})`,
            filter: 'saturate(1.15) brightness(1.05) contrast(0.98)',
            x: sceneX,
            y: sceneY,
            willChange: 'transform',
            maskImage:
              'radial-gradient(ellipse at 50% 65%, #000 35%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 85%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at 50% 65%, #000 35%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 85%, transparent 100%)',
          }}
        />
      )}

      {/* ── Layer 3a — back clouds (largest, palest, slowest parallax) ── */}
      {showClouds && !cloudImages && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ x: cloudsBackX, willChange: 'transform' }}
        >
          {backClouds.map((c, i) => (
            <div
              key={`bc-${i}`}
              className="absolute cloud-drift"
              style={cloudStyle(c)}
            >
              <CartoonCloud
                width={c.width}
                variant={c.variant}
                hue={c.hue}
                opacity={c.opacity}
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Layer 3b — mid clouds ─────────────────────────── */}
      {showClouds && !cloudImages && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ x: cloudsMidX, willChange: 'transform' }}
        >
          {midClouds.map((c, i) => (
            <div
              key={`mc-${i}`}
              className="absolute cloud-drift"
              style={cloudStyle(c)}
            >
              <CartoonCloud
                width={c.width}
                variant={c.variant}
                hue={c.hue}
                opacity={c.opacity}
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Layer 3c — front clouds (smallest, brightest, fastest) ── */}
      {showClouds && !cloudImages && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ x: cloudsFrontX, willChange: 'transform' }}
        >
          {frontClouds.map((c, i) => (
            <div
              key={`fc-${i}`}
              className="absolute cloud-drift"
              style={cloudStyle(c)}
            >
              <CartoonCloud
                width={c.width}
                variant={c.variant}
                hue={c.hue}
                opacity={c.opacity}
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Layer 3d — optional PNG clouds (if you supply your own art) ── */}
      {cloudImages && cloudImages.length > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ x: cloudsMidX, willChange: 'transform' }}
        >
          {cloudImages.map((src, i) => {
            const top = `${4 + (i * 13) % 55}%`;
            const left = `${(i * 27) % 80}%`;
            const width = 18 + (i % 3) * 6;
            const drift = i % 3 === 0 ? 'drift-slow' : i % 3 === 1 ? 'drift-medium' : 'drift-fast';
            return (
              <img
                key={`pc-${i}`}
                src={src}
                alt=""
                aria-hidden="true"
                className={cn('absolute select-none', drift)}
                style={{
                  top,
                  left,
                  width: `${width}rem`,
                  opacity: 0.85,
                  filter: 'drop-shadow(0 12px 30px hsla(232,60%,30%,0.18))',
                }}
              />
            );
          })}
        </motion.div>
      )}

      {/* ── Layer 4 — wash overlay glues scene + sky to the pastel palette ── */}
      <div
        className="absolute inset-0 mix-blend-soft-light pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, hsla(48,100%,85%,0.35) 0%, hsla(282,80%,80%,0.25) 60%, hsla(330,90%,80%,0.25) 100%)',
        }}
      />

      {/* ── Layer 5 — hero island PNG (centered) ─────────── */}
      {islandImage && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ x: islandX, y: islandY, willChange: 'transform' }}
        >
          <img
            src={islandImage}
            alt=""
            aria-hidden="true"
            className="w-[88%] md:w-[78%] lg:w-[68%] max-w-[1400px] select-none island-bob"
            style={{
              filter:
                'drop-shadow(0 40px 70px hsla(232,60%,18%,0.5)) drop-shadow(0 0 100px hsla(48,100%,70%,0.3))',
            }}
          />
        </motion.div>
      )}

      {/* ── Layer 6 — floating glass orbs (foreground particles) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: orbsX, y: orbsY, willChange: 'transform' }}
      >
        {orbs.map((o) => (
          <span
            key={o.id}
            className="absolute rounded-full orb-float"
            style={{
              top: o.top,
              left: o.left,
              width: o.size,
              height: o.size,
              background: `radial-gradient(circle at 30% 30%, hsla(${o.hue},100%,90%,0.95), hsla(${o.hue},100%,70%,0.55) 55%, hsla(${o.hue},100%,60%,0) 75%)`,
              boxShadow: `0 0 ${o.size * 1.4}px hsla(${o.hue},100%,75%,0.55)`,
              filter: 'blur(0.4px)',
              ['--orb-dur' as never]: `${o.duration}s`,
              ['--orb-delay' as never]: `${o.delay}s`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Layer 7 — top + bottom vignette ───────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, hsla(232,60%,15%,0.18) 0%, transparent 22%, transparent 70%, hsla(232,60%,15%,0.28) 100%)',
        }}
      />
    </div>
  );
}
