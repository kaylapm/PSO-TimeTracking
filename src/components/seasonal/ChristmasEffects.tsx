'use client';

import { useEffect, useState } from 'react';
import { getSeasonalTheme } from '@/lib/themeManager';

const SNOWFLAKES = [
  {
    top: '-2%',
    left: '5%',
    size: 10,
    duration: '8s',
    delay: '0s',
    drift: '30px',
  },
  {
    top: '-2%',
    left: '15%',
    size: 7,
    duration: '10s',
    delay: '1.5s',
    drift: '-20px',
  },
  {
    top: '-2%',
    left: '27%',
    size: 12,
    duration: '7s',
    delay: '3s',
    drift: '25px',
  },
  {
    top: '-2%',
    left: '38%',
    size: 6,
    duration: '11s',
    delay: '0.7s',
    drift: '-35px',
  },
  {
    top: '-2%',
    left: '50%',
    size: 9,
    duration: '9s',
    delay: '2s',
    drift: '20px',
  },
  {
    top: '-2%',
    left: '63%',
    size: 11,
    duration: '6.5s',
    delay: '4s',
    drift: '-25px',
  },
  {
    top: '-2%',
    left: '74%',
    size: 8,
    duration: '10.5s',
    delay: '1s',
    drift: '30px',
  },
  {
    top: '-2%',
    left: '85%',
    size: 13,
    duration: '8.5s',
    delay: '2.8s',
    drift: '-15px',
  },
  {
    top: '-2%',
    left: '92%',
    size: 7,
    duration: '7.5s',
    delay: '0.3s',
    drift: '20px',
  },
  {
    top: '-2%',
    left: '45%',
    size: 10,
    duration: '9.5s',
    delay: '5s',
    drift: '-30px',
  },
  {
    top: '-2%',
    left: '20%',
    size: 6,
    duration: '12s',
    delay: '1.2s',
    drift: '15px',
  },
  {
    top: '-2%',
    left: '70%',
    size: 8,
    duration: '8s',
    delay: '3.5s',
    drift: '-20px',
  },
] as const;

function SnowflakeIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <line
        x1="12"
        y1="2"
        x2="12"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="12"
        x2="22"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4.93"
        y1="4.93"
        x2="19.07"
        y2="19.07"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="19.07"
        y1="4.93"
        x2="4.93"
        y2="19.07"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function ChristmasEffects() {
  const active = getSeasonalTheme() === 'christmas';

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add('christmas');
    } else {
      root.classList.remove('christmas');
    }
    return () => root.classList.remove('christmas');
  }, [active]);

  if (!active) return null;

  return (
    <>
      {SNOWFLAKES.map((flake, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-40"
          style={{
            top: flake.top,
            left: flake.left,
            color: 'rgba(255, 255, 255, 0.85)',
            filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.6))',
            animation: `christmas-snow-fall ${flake.duration} ${flake.delay} linear infinite`,
            ['--snow-drift' as string]: flake.drift,
          }}
        >
          <SnowflakeIcon size={flake.size} />
        </div>
      ))}
    </>
  );
}

export function ChristmasBanner() {
  const active = getSeasonalTheme() === 'christmas';
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(
        sessionStorage.getItem('christmas_banner_dismissed') === 'true'
      );
    }
  }, [active]);

  if (!active || dismissed) return null;

  function handleDismiss() {
    sessionStorage.setItem('christmas_banner_dismissed', 'true');
    setDismissed(true);
  }

  return (
    <div
      role="banner"
      className="relative w-full flex flex-col items-center justify-center px-10 py-5 text-center"
      style={{
        background:
          'linear-gradient(135deg, #165B33 0%, #0D3B22 50%, #165B33 100%)',
        borderBottom: '3px solid #FFD700',
        boxShadow: '0 4px 24px rgba(255,215,0,0.25)',
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">🎄</span>
        <span
          className="text-2xl font-extrabold tracking-wide"
          style={{ color: '#FFD700' }}
        >
          Merry Christmas!
        </span>
        <span className="text-3xl">🎄</span>
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: 'rgba(255,255,255,0.85)' }}
      >
        🎄 Merry Christmas! Happy productive holiday!
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors text-xl leading-none p-2"
        aria-label="Dismiss Christmas banner"
      >
        ✕
      </button>
    </div>
  );
}
