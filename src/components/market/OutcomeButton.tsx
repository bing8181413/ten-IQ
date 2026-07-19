import { cn } from '@/lib/cn';
import { formatProbability } from '@/lib/format';
import type { Outcome } from '@/types/market';
export function OutcomeButton({
  outcome,
  selected = false,
  compact = false,
  onSelect,
}: {
  outcome: Outcome;
  selected?: boolean;
  compact?: boolean;
  onSelect?: (outcome: Outcome) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect?.(outcome)}
      className={cn(
        'group flex min-w-0 items-center justify-between gap-3 rounded-control border px-3 text-left transition-colors',
        compact ? 'min-h-9' : 'min-h-10',
        selected
          ? 'border-brand bg-brand text-white'
          : 'border-transparent bg-surface-muted text-foreground hover:border-border-strong hover:bg-surface-hover',
      )}
    >
      <span className="truncate text-xs font-semibold text-muted group-hover:text-foreground">
        {outcome.label}
      </span>
      <span className="shrink-0 text-sm font-bold text-brand tabular-nums group-aria-pressed:text-white">
        {formatProbability(outcome.probability)}
      </span>
    </button>
  );
}
