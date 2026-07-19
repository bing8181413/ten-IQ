import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-strong',
        secondary: 'bg-surface-muted text-foreground hover:bg-surface-hover',
        outline: 'border border-border bg-surface text-foreground hover:border-border-strong',
        ghost: 'text-muted hover:bg-surface-muted hover:text-foreground',
        yes: 'bg-brand-soft text-brand hover:bg-brand hover:text-white',
        no: 'bg-surface-muted text-muted hover:bg-border hover:text-foreground',
        danger: 'bg-negative-soft text-negative hover:bg-negative hover:text-white',
      },
      size: {
        sm: 'min-h-8 px-3 text-xs',
        md: 'min-h-10 px-4 text-sm',
        lg: 'min-h-11 px-5 text-sm',
        icon: 'size-10 px-0',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
