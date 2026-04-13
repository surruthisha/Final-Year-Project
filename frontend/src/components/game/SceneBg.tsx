import { CSSProperties, useState } from 'react';

interface SceneBgProps {
  src: string;
  /** Extra Tailwind/CSS classes forwarded to the img */
  className?: string;
  /** Inline styles forwarded to the img (e.g. dynamic filter) */
  style?: CSSProperties;
}

/**
 * Full-screen background image that fades in smoothly once loaded.
 * When images are preloaded (via Index.tsx boot sequence) onLoad fires
 * immediately from cache, so the fade is nearly invisible in practice.
 * If the image hasn't been cached yet it appears gracefully instead of
 * popping in.
 */
export function SceneBg({ src, className = '', style }: SceneBgProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      onLoad={() => setLoaded(true)}
      style={style}
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none
        transition-opacity duration-500
        ${loaded ? 'opacity-100' : 'opacity-0'}
        ${className}`}
    />
  );
}
