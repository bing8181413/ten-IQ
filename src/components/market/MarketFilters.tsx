import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
export type MarketSort = 'trending' | 'volume' | 'newest';
const options: { value: MarketSort; label: string }[] = [
  { value: 'trending', label: '趋势' },
  { value: 'volume', label: '交易量' },
  { value: 'newest', label: '最新' },
];
export function MarketFilters({
  value,
  onChange,
}: {
  value: MarketSort;
  onChange: (value: MarketSort) => void;
}) {
  return (
    <div className="flex items-center gap-2" aria-label="市场排序">
      <SlidersHorizontal aria-hidden="true" size={16} className="text-subtle" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-8 rounded-control px-3 text-xs font-semibold transition-colors',
            option.value === value
              ? 'bg-surface-muted text-foreground'
              : 'text-muted hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
