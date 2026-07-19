import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function FreshnessNotice({
  stale,
  updatedAt,
  onRefresh,
}: {
  stale: boolean;
  updatedAt: string;
  onRefresh: () => void;
}) {
  if (!stale) return null;
  return (
    <div
      role="status"
      className="my-3 flex flex-wrap items-center justify-between gap-3 rounded-control border border-warning bg-warning-soft p-3 text-sm text-foreground"
    >
      <span className="flex items-center gap-2">
        <AlertTriangle aria-hidden="true" size={16} className="text-warning" />
        当前显示陈旧演示数据（更新于 {new Date(updatedAt).toLocaleString('zh-CN')}）。
      </span>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw aria-hidden="true" size={14} /> 刷新
      </Button>
    </div>
  );
}
