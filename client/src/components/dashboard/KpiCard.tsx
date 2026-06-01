import clsx from 'clsx';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface Props {
  label: string;
  value: number;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  icon?: LucideIcon;
  hint?: string;
}

const tones: Record<NonNullable<Props['tone']>, { ring: string; bg: string; text: string }> = {
  brand: {
    ring: 'shadow-[0_10px_40px_-12px_rgba(122,75,255,0.4)]',
    bg: 'bg-gradient-to-br from-brand-500 to-brand-700',
    text: 'text-brand-600 dark:text-brand-300',
  },
  success: {
    ring: 'shadow-[0_10px_40px_-12px_rgba(16,185,129,0.4)]',
    bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    text: 'text-emerald-600 dark:text-emerald-300',
  },
  warning: {
    ring: 'shadow-[0_10px_40px_-12px_rgba(245,158,11,0.4)]',
    bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    text: 'text-amber-600 dark:text-amber-300',
  },
  danger: {
    ring: 'shadow-[0_10px_40px_-12px_rgba(244,63,94,0.4)]',
    bg: 'bg-gradient-to-br from-rose-400 to-rose-600',
    text: 'text-rose-600 dark:text-rose-300',
  },
  info: {
    ring: 'shadow-[0_10px_40px_-12px_rgba(56,189,248,0.4)]',
    bg: 'bg-gradient-to-br from-sky-400 to-sky-600',
    text: 'text-sky-600 dark:text-sky-300',
  },
};

export default function KpiCard({ label, value, tone = 'brand', icon: Icon = TrendingUp, hint }: Props) {
  const t = tones[tone];
  return (
    <div className={clsx('card relative overflow-hidden transition hover:-translate-y-0.5', t.ring)}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
            {label}
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight">{value}</div>
          {hint && <div className={clsx('mt-1 text-xs font-medium', t.text)}>{hint}</div>}
        </div>
        <div
          className={clsx(
            'grid h-11 w-11 place-items-center rounded-2xl text-white shadow-soft',
            t.bg,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
