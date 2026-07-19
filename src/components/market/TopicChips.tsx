import { cn } from '@/lib/cn';
export const marketCategories = [
  '全部',
  '特朗普',
  '伊朗',
  '空气质量',
  '以色列选举',
  'Moonshot',
  '奥德赛号',
  'NBA休赛期',
  '古巴',
  'AI',
  '美联储',
  '和平协议',
  '7月21日小学',
  'Tweet Markets',
  '每日温度',
  '油',
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
              'min-h-8 shrink-0 rounded-control px-3 text-sm font-medium transition-colors',
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
