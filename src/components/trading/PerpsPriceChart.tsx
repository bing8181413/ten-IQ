import { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

export function PerpsPriceChart({ values }: { values: number[] }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return (
    <div className="h-[300px] w-full" aria-label="资产价格走势" role="region">
      <Player
        acknowledgeRemotionLicense
        component={PriceComposition}
        inputProps={{ values, reducedMotion }}
        durationInFrames={64}
        compositionWidth={1000}
        compositionHeight={320}
        fps={30}
        autoPlay={!reducedMotion}
        controls={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

function PriceComposition({ values, reducedMotion }: { values: number[]; reducedMotion: boolean }) {
  const frame = useCurrentFrame();
  const width = 1000;
  const height = 320;
  const padding = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);
  const progress = reducedMotion
    ? 1
    : interpolate(frame, [0, 48], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
  const points = values.map((value, index) => ({
    x: padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2),
    y: height - padding - ((value - min) / spread) * (height - padding * 2),
  }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  const area = `${path} L${width - padding},${height - padding} L${padding},${height - padding} Z`;
  const latest = points.at(-1) ?? { x: width - padding, y: height / 2 };
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--color-surface)' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={padding + ratio * (height - padding * 2)}
            y2={padding + ratio * (height - padding * 2)}
            stroke="var(--color-border)"
            strokeDasharray="4 7"
          />
        ))}
        <path d={area} fill="var(--color-brand-soft)" opacity="0.72" />
        <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="4" opacity="0.72" />
        <defs>
          <linearGradient id="perps-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-brand)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="perps-reveal">
            <rect width={width * progress} height={height} />
          </clipPath>
        </defs>
        <g clipPath="url(#perps-reveal)">
          <path d={area} fill="url(#perps-area)" />
          <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="4" />
        </g>
        <circle
          cx={latest.x}
          cy={latest.y}
          r="6"
          fill="var(--color-brand)"
          opacity={interpolate(progress, [0.88, 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
        />
      </svg>
    </div>
  );
}
