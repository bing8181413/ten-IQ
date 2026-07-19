import { CircleDot, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Market } from '@/types/market';
const statusLabel: Record<Market['status'], string> = {
  open: '开放中',
  live: '进行中',
  closing: '即将封盘',
  resolved: '已结算',
};
export function MarketMeta({
  status,
  volume,
  endDate,
  compact = false,
}: Pick<Market, 'status' | 'volume' | 'endDate'> & { compact?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
      <span className="inline-flex items-center gap-1.5">
        <CircleDot aria-hidden="true" size={13} />
        {formatCurrency(volume)} 交易量
      </span>
      {!compact ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock3 aria-hidden="true" size={13} />
          {formatDate(endDate)}
        </span>
      ) : null}
      <Badge
        variant={status === 'live' ? 'positive' : status === 'closing' ? 'warning' : 'neutral'}
      >
        {statusLabel[status]}
      </Badge>
    </div>
  );
}
