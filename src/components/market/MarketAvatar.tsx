import {
  Bitcoin,
  Car,
  Cpu,
  Film,
  Gamepad2,
  Landmark,
  Percent,
  Rocket,
  ThermometerSun,
  Trophy,
  Vote,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const iconMap: Record<string, LucideIcon> = {
  bitcoin: Bitcoin,
  car: Car,
  cpu: Cpu,
  film: Film,
  football: Volleyball,
  gamepad: Gamepad2,
  landmark: Landmark,
  percent: Percent,
  rocket: Rocket,
  thermometer: ThermometerSun,
  trophy: Trophy,
  vote: Vote,
};

export function MarketAvatar({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] ?? Trophy;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-brand-soft text-sm font-bold tracking-tight text-brand',
        className,
      )}
    >
      <Icon size="55%" strokeWidth={2} />
    </span>
  );
}
