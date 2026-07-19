import { cn } from '@/lib/cn';
export const marketCategories = [
  '全部',
  '特朗普',
  '2026年NHL选秀',
  '和平协议',
  '6月30日小学',
  '英国劳工领导力',
  '罗马尼亚政府',
  '美联储',
  'nba free agency',
  'GTA VI',
  'SpaceX',
  '足球转会',
  'Claude Mythos',
];
export function TopicChips({
  value,
  onChange,
  expanded = false,
}: {
  value: string;
  onChange: (value: string) => void;
  expanded?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex scrollbar-none gap-1.5 py-1',
        expanded ? 'flex-wrap overflow-visible' : 'overflow-x-auto',
      )}
      aria-label="市场分类"
      role="toolbar"
    >
      {marketCategories.map((category) => {
        const active = value === category;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category)}
            className={cn(
              'min-h-8 shrink-0 rounded-[6px] px-3 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-soft text-brand'
                : 'text-muted hover:bg-surface-muted hover:text-foreground',
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
