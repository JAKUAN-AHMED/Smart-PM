import clsx from 'clsx';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

const variants: Record<Variant, string> = {
  default:
    'bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200/60 dark:bg-white/5 dark:text-ink-200 dark:ring-white/10',
  success:
    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  warning:
    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  danger:
    'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/60 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  info:
    'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/60 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  neutral:
    'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  brand:
    'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/60 dark:bg-brand-500/15 dark:text-brand-200 dark:ring-brand-400/20',
};

export default function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return <span className={clsx('badge', variants[variant], className)}>{children}</span>;
}

export const statusVariant = (status: string): Variant => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'InProgress':
    case 'Active':
      return 'info';
    case 'OnHold':
      return 'warning';
    case 'Todo':
      return 'neutral';
    default:
      return 'default';
  }
};

export const priorityVariant = (p: string): Variant =>
  p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'success';
