import { SearchX } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Card } from './Card';

export function EmptyState({
  title,
  description,
  onReset,
  className,
}: {
  title: string;
  description: string;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'flex min-h-64 flex-col items-center justify-center p-8 text-center',
        className,
      )}
    >
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-surface-muted text-muted">
        <SearchX aria-hidden="true" size={20} />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {onReset ? (
        <Button className="mt-5" variant="outline" onClick={onReset}>
          清除筛选
        </Button>
      ) : null}
    </Card>
  );
}
