import { useId } from 'react';
import { cn } from '@/lib/cn';
function buildPath(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const step = width / Math.max(values.length - 1, 1);
  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}
export function Sparkline({
  values,
  className,
  tone = 'brand',
  fill = true,
}: {
  values: number[];
  className?: string;
  tone?: 'brand' | 'negative';
  fill?: boolean;
}) {
  const gradientId = useId();
  const width = 160;
  const height = 42;
  const line = buildPath(values, width, height);
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('h-11 w-full overflow-visible', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${gradientId})`} /> : null}
      <path
        d={line}
        fill="none"
        stroke={tone === 'brand' ? 'var(--color-brand)' : 'var(--color-negative)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
