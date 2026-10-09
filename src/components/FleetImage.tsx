'use client';

import { useEffect, useRef, useState } from 'react';
import { Ornament } from '@/components/Ornament';

interface Props {
  src: string;
  name: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

/**
 * Shows the photo, or a dark placeholder (charcoal gradient, gold hairline,
 * ornament and the item name) when the file is missing or fails to load.
 * Drop the real file into public/images and the photo appears with no code change.
 */
export function FleetImage({ src, name, className = '', imgClassName = '', priority = false }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Covers errors that fired before React hydrated.
  useEffect(() => {
    setFailed(false);
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${name} (photograph coming soon)`}
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#262626] via-[#1a1a1a] to-[#121212] ${className}`}
      >
        <div className="absolute inset-3 border border-gold/40" />
        <div className="relative flex flex-col items-center gap-3 px-6 text-center text-gold">
          <Ornament />
          <span className="font-serif text-xl text-ivory">{name}</span>
          <span className="text-xs text-ivory-dim">Photograph coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={name}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
