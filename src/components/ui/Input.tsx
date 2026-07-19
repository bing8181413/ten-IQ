import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground transition-colors placeholder:text-subtle hover:border-border-strong focus:border-brand focus:outline-none',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
