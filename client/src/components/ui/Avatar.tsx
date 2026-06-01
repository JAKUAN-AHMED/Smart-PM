import { initials } from '@/utils/format';
import clsx from 'clsx';

interface Props {
  name?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  ring?: boolean;
}

const sizes = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

export default function Avatar({ name, color = '#7a4bff', size = 'md', ring = true }: Props) {
  return (
    <span
      className={clsx(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold uppercase text-white',
        sizes[size],
        ring && 'ring-2 ring-white dark:ring-ink-900',
      )}
      style={{
        background: `linear-gradient(135deg, ${color}, ${shade(color, -20)})`,
      }}
      title={name}
    >
      <span className="relative z-10">{initials(name)}</span>
      <span className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
    </span>
  );
}

function shade(hex: string, amount: number): string {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map((c) => clamp(parseInt(c, 16) + amount));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
function clamp(n: number): number {
  return Math.max(0, Math.min(255, n));
}
