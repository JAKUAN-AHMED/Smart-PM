import { Inbox } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300/70 bg-white/40 p-12 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div className="font-display text-base font-bold text-ink-800 dark:text-ink-100">{title}</div>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-500 dark:text-ink-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
