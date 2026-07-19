import { useEffect, useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

interface ChartCompositionProps {
  values: number[];
  label: string;
  reducedMotion: boolean;
}

export function ProbabilityChart({ values, label }: { values: number[]; label: string }) {
  const current = values.at(-1) ?? 0;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const inputProps = useMemo(
    () => ({ values, label, reducedMotion }),
    [label, reducedMotion, values],
  );

  return (
    <section aria-label="概率走势" className="overflow-hidden border-b border-border bg-surface">
      <div className="h-[300px] w-full sm:h-[342px]">
        <Player
          acknowledgeRemotionLicense
          component={ProbabilityChartComposition}
          inputProps={inputProps}
          durationInFrames={72}
          compositionWidth={1000}
          compositionHeight={360}
          fps={30}
          autoPlay={!reducedMotion}
          controls={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="flex items-center justify-between px-1 py-3 text-xs text-muted">
        <span>30 天前</span>
        <span className="font-semibold text-foreground">
          {label} {current}%
        </span>
        <span>现在</span>
      </div>
    </section>
  );
}

function ProbabilityChartComposition({ values, label, reducedMotion }: ChartCompositionProps) {
  const frame = useCurrentFrame();
  const width = 1000;
  const height = 360;
  const padding = 42;
  const progress = reducedMotion
    ? 1
    : interpolate(frame, [0, 54], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
  const points = values.map((value, index) => ({
    x: padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2),
    y: height - padding - (value / 100) * (height - padding * 2),
  }));
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');
  const inversePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${height - point.y}`)
    .join(' ');
  const latest = points.at(-1) ?? { x: width - padding, y: height / 2 };

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--color-surface)' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label} 概率走势`}
      >
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={padding + ratio * (height - padding * 2)}
            y2={padding + ratio * (height - padding * 2)}
            stroke="var(--color-border)"
            strokeDasharray="4 6"
          />
        ))}
        <path
          d={inversePath}
          fill="none"
          stroke="var(--color-negative)"
          strokeWidth="3"
          opacity="0.38"
        />
        <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="4" opacity="0.48" />
        <defs>
          <clipPath id="chart-reveal">
            <rect x="0" y="0" width={width * progress} height={height} />
          </clipPath>
        </defs>
        <g clipPath="url(#chart-reveal)">
          <path
            d={inversePath}
            fill="none"
            stroke="var(--color-negative)"
            strokeWidth="3"
            opacity="0.42"
          />
          <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="4" />
        </g>
        <circle
          cx={latest.x}
          cy={latest.y}
          r="7"
          fill="var(--color-brand)"
          opacity={Math.max(0.58, progress)}
        />
        <text
          x={Math.min(latest.x + 14, width - 150)}
          y={latest.y - 12}
          fill="var(--color-brand)"
          fontSize="25"
          fontWeight="700"
          opacity={Math.max(0.62, progress)}
        >
          {label} {values.at(-1) ?? 0}%
        </text>
      </svg>
    </div>
  );
}
