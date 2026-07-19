import { cn } from '@/lib/cn';
export function MarketAvatar({ icon, className }: { icon: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-brand-soft text-sm font-bold tracking-tight text-brand',
        className,
      )}
    >
      {icon}
    </span>
  );
}
