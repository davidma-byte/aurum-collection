'use client';

import { useEffect, useRef, useState } from 'react';

/** Logo image with a text wordmark fallback if the file fails to load. */
export function Logo({ size = 56, showWordmarkAlways = false }: { size?: number; showWordmarkAlways?: boolean }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed || showWordmarkAlways) {
    return (
      <span className="inline-flex flex-col items-center leading-none" style={{ minHeight: size }}>
        <span className="font-serif text-2xl tracking-[0.3em] text-gold">AURUM</span>
        <span className="mt-1 text-[0.6rem] tracking-[0.45em] text-gold-soft">COLLECTION</span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src="/images/logo.png"
      alt="Aurum Collection"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
