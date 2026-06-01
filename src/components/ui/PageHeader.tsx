interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, description, action }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-ink-500 dark:text-ink-400">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
