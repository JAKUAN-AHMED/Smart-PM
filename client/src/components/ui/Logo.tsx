import clsx from 'clsx';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  withName?: boolean;
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-lg',
  lg: 'h-14 w-14 text-2xl',
};

export default function Logo({ size = 'md', withName = true, className }: Props) {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div
        className={clsx(
          'relative grid place-items-center rounded-2xl bg-brand-gradient font-display font-bold text-white shadow-glow',
          sizes[size],
        )}
      >
        <span className="relative z-10 leading-none">S</span>
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/40 to-transparent opacity-60" />
      </div>
      {withName && (
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight">Smart PM</div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
            Collaboration suite
          </div>
        </div>
      )}
    </div>
  );
}
