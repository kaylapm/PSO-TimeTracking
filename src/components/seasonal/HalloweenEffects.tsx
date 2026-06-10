'use client';

import { useEffect, useState } from 'react';
import { getSeasonalTheme } from '@/lib/themeManager';

const BATS = [
  { top: '8%', left: '4%', size: 28, duration: '4s', delay: '0s' },
  { top: '14%', left: '82%', size: 22, duration: '5s', delay: '1.5s' },
  { top: '38%', left: '94%', size: 18, duration: '3.5s', delay: '0.8s' },
  { top: '62%', left: '2%', size: 24, duration: '4.5s', delay: '2.2s' },
  { top: '76%', left: '72%', size: 20, duration: '6s', delay: '0.4s' },
  { top: '22%', left: '52%', size: 16, duration: '3s', delay: '3s' },
  { top: '88%', left: '28%', size: 26, duration: '5.5s', delay: '1s' },
  { top: '50%', left: '62%', size: 14, duration: '4s', delay: '2.5s' },
] as const;

function BatIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.6)}
      viewBox="0 0 100 60"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M 40,32 C 22,12 2,18 0,30 C 2,42 22,44 40,37" />
      <path d="M 60,32 C 78,12 98,18 100,30 C 98,42 78,44 60,37" />
      <ellipse cx="50" cy="33" rx="11" ry="8" />
      <polygon points="44,26 41,14 49,24" />
      <polygon points="56,26 59,14 51,24" />
    </svg>
  );
}

function CobwebCorner({ position }: { position: 'top-left' | 'top-right' }) {
  const isRight = position === 'top-right';
  const size = 170;
  const origin = { x: isRight ? size : 0, y: 0 };

  const angles = [0, 15, 30, 45, 60, 75, 90].map(
    (deg) => ((isRight ? 90 + deg : deg) * Math.PI) / 180
  );
  const radii = [40, 80, 120, 160];

  const pt = (r: number, a: number) => ({
    x: parseFloat((origin.x + r * Math.cos(a)).toFixed(1)),
    y: parseFloat((origin.y + r * Math.sin(a)).toFixed(1)),
  });

  return (
    <div
      className={`fixed top-0 w-40 h-40 pointer-events-none z-10 ${isRight ? 'right-0' : 'left-0'}`}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ color: 'rgba(255,255,255,0.25)' }}
        aria-hidden="true"
      >
        {angles.map((angle, i) => {
          const end = pt(size * 1.2, angle);
          return (
            <line
              key={i}
              x1={origin.x}
              y1={origin.y}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              strokeWidth="1"
            />
          );
        })}
        {radii.map((r) => {
          const pts = angles.map((a) => pt(r, a));
          const d = pts
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
            .join(' ');
          return (
            <path
              key={r}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
}

export function HalloweenEffects() {
  const active = getSeasonalTheme() === 'halloween';

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add('halloween');
    } else {
      root.classList.remove('halloween');
    }
    return () => root.classList.remove('halloween');
  }, [active]);

  if (!active) return null;

  return (
    <>
      {BATS.map((bat, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-40"
          style={{
            top: bat.top,
            left: bat.left,
            color: '#FF6B00',
            filter: 'drop-shadow(0 0 5px rgba(107,45,139,0.9))',
            animation: `halloween-bat-float ${bat.duration} ${bat.delay} ease-in-out infinite`,
          }}
        >
          <BatIcon size={bat.size} />
        </div>
      ))}
      <CobwebCorner position="top-left" />
      <CobwebCorner position="top-right" />
    </>
  );
}

export function HalloweenBanner() {
  const active = getSeasonalTheme() === 'halloween';
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(
        sessionStorage.getItem('halloween_banner_dismissed') === 'true'
      );
    }
  }, [active]);

  if (!active || dismissed) return null;

  function handleDismiss() {
    sessionStorage.setItem('halloween_banner_dismissed', 'true');
    setDismissed(true);
  }

  return (
    <div
      role="banner"
      className="relative w-full flex flex-col items-center justify-center px-10 py-5 text-center"
      style={{
        background:
          'linear-gradient(135deg, #1A1A1A 0%, #3D1060 50%, #1A1A1A 100%)',
        borderBottom: '3px solid #FF6B00',
        boxShadow: '0 4px 24px rgba(255,107,0,0.25)',
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">🎃</span>
        <span
          className="text-2xl font-extrabold tracking-wide"
          style={{ color: '#FF6B00' }}
        >
          Happy Halloween!
        </span>
        <span className="text-3xl">🦇</span>
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: 'rgba(255,255,255,0.8)' }}
      >
        Spooky time tracking is now active. Beware of the bats! 👻
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors text-xl leading-none p-2"
        aria-label="Dismiss Halloween banner"
      >
        ✕
      </button>
    </div>
  );
}
