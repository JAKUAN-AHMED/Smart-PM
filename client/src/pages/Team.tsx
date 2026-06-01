import { useWorkloadQuery } from '@/features/users/usersApi';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';

export default function TeamPage() {
  const { data, isLoading } = useWorkloadQuery();
  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Team Workload"
        description="See who's swamped, who's ready for more, and how the team is doing overall."
      />

      {isLoading ? (
        <div className="card text-sm text-ink-500">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Assign tasks to members and their workload appears here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const rate = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
            return (
              <div key={r.userId} className="card group transition hover:-translate-y-0.5 hover:shadow-ring">
                <div className="flex items-center gap-3">
                  <Avatar size="lg" name={r.name} color={r.avatarColor} />
                  <div className="min-w-0">
                    <div className="truncate font-display text-base font-bold">{r.name}</div>
                    <div className="truncate text-xs text-ink-500">{r.email}</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-violet-50 py-2.5 dark:bg-violet-500/10">
                    <div className="text-lg font-bold text-violet-700 dark:text-violet-300">
                      {r.todo}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-600/80">
                      Todo
                    </div>
                  </div>
                  <div className="rounded-xl bg-sky-50 py-2.5 dark:bg-sky-500/10">
                    <div className="text-lg font-bold text-sky-700 dark:text-sky-300">
                      {r.inProgress}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-600/80">
                      Active
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 py-2.5 dark:bg-emerald-500/10">
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {r.completed}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/80">
                      Done
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-ink-500">Completion rate</span>
                    <span className="font-semibold text-emerald-600">{rate}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-[width] duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-ink-500">
                    <span className="font-semibold text-ink-900 dark:text-ink-100">{r.total}</span>{' '}
                    total
                  </span>
                  <Badge variant="warning">{r.pending} pending</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
