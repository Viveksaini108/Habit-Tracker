'use client';

import { useEffect, useMemo, useState } from 'react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f97316'];

/**
 * Celebratory confetti burst — absolutely positioned; mount it inside a
 * relatively-positioned container when `fire` is true.
 */
export default function ConfettiBurst({ fire, pieces = 26 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fire) return undefined;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2100);
    return () => clearTimeout(t);
  }, [fire]);

  const parts = useMemo(() => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    return Array.from({ length: pieces }, (_, i) => ({
      id: i,
      left: 8 + rand() * 84,
      color: COLORS[Math.floor(rand() * COLORS.length)],
      drift: Math.round((rand() - 0.5) * 160),
      spin: Math.round(360 + rand() * 540),
      delay: rand() * 0.25,
      size: 6 + Math.round(rand() * 5),
      round: rand() > 0.5,
    }));
  }, [pieces]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0 overflow-visible" aria-hidden="true">
      {parts.map((p) => (
        <span
          key={p.id}
          className="hf-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
