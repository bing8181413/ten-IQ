import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card
      className="flex min-h-64 flex-col items-center justify-center p-8 text-center"
      role="alert"
    >
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-negative-soft text-negative">
        <AlertCircle aria-hidden="true" size={20} />
      </span>
      <h3 className="text-base font-semibold">市场数据加载失败</h3>
      <p className="mt-2 text-sm text-muted">检查网络或 API 配置后重试。</p>
      {onRetry ? (
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          重新加载
        </Button>
      ) : null}
    </Card>
  );
}
