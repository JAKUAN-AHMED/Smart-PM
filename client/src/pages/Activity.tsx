import { useListActivitiesQuery } from '@/features/activity/activityApi';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { fromNow } from '@/utils/format';

const actionTone: Record<string, 'brand' | 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  created: 'brand',
  updated: 'info',
  deleted: 'danger',
  completed: 'success',
  status_changed: 'warning',
  commented: 'neutral',
  assigned: 'info',
};

export default function ActivityPage() {
  const { data, isLoading } = useListActivitiesQuery({ limit: 50 });
  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Activity Log"
        description="The recent pulse of your workspace — every action, in chronological order."
      />

      {isLoading ? (
        <div className="card text-sm text-ink-500">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Actions across projects and tasks will appear here as they happen."
        />
      ) : (
        <div className="card">
          <ol className="relative space-y-1 pl-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-200 via-ink-200 to-transparent dark:from-brand-700/40 dark:via-white/10" />
            {items.map((a) => (
              <li key={a._id} className="relative py-3">
                <div className="absolute -left-[18px] top-4 grid h-4 w-4 place-items-center rounded-full bg-brand-gradient ring-4 ring-white dark:ring-ink-900" />
                <div className="flex items-start gap-3">
                  <Avatar size="sm" name={a.actor?.name} color={a.actor?.avatarColor} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{a.actor?.name}</span>
                      <Badge variant={actionTone[a.action] ?? 'default'}>
                        {a.action.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-sm text-ink-600 dark:text-ink-300">{a.message}</div>
                    <div className="mt-1 text-xs text-ink-500">
                      {a.project?.name && <>in {a.project.name} · </>}
                      {fromNow(a.createdAt)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
