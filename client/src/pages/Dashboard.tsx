import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListChecks,
  TrendingUp,
} from 'lucide-react';
import {
  useDashboardStatsQuery,
  useHighPriorityTasksQuery,
  useProgressTrendQuery,
  useProjectProgressQuery,
  useUpcomingDeadlinesQuery,
} from '@/features/dashboard/dashboardApi';
import { useListActivitiesQuery } from '@/features/activity/activityApi';
import { useWorkloadQuery } from '@/features/users/usersApi';
import { useAppSelector } from '@/app/hooks';
import KpiCard from '@/components/dashboard/KpiCard';
import Avatar from '@/components/ui/Avatar';
import Badge, { priorityVariant, statusVariant } from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { formatDate, fromNow, isOverdue } from '@/utils/format';

const PRIORITY_COLORS: Record<string, string> = {
  High: '#f43f5e',
  Medium: '#f59e0b',
  Low: '#10b981',
};
const STATUS_COLORS: Record<string, string> = {
  Todo: '#a78bfa',
  InProgress: '#38bdf8',
  Completed: '#10b981',
};

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: statsResp } = useDashboardStatsQuery();
  const { data: progressResp } = useProjectProgressQuery();
  const { data: trendResp } = useProgressTrendQuery();
  const { data: upcomingResp } = useUpcomingDeadlinesQuery();
  const { data: highPriorityResp } = useHighPriorityTasksQuery();
  const { data: activityResp } = useListActivitiesQuery({ limit: 8 });
  const { data: workloadResp } = useWorkloadQuery();

  const stats = statsResp?.data;
  const greeting =
    new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const priorityData = stats
    ? Object.entries(stats.tasksByPriority).map(([name, value]) => ({ name, value }))
    : [];
  const statusData = stats
    ? Object.entries(stats.tasksByStatus).map(([name, value]) => ({
        name: name === 'InProgress' ? 'In Progress' : name,
        value,
      }))
    : [];
  const progressData = (progressResp?.data ?? []).slice(0, 6).map((p) => ({
    name: p.name.length > 14 ? `${p.name.slice(0, 14)}…` : p.name,
    progress: p.progress,
  }));
  const trendData = (trendResp?.data ?? []).map((p) => ({
    date: p.date.slice(5),
    completed: p.count,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${greeting}, ${user?.name.split(' ')[0]}`}
        title="Your workspace at a glance"
        description="A live overview of your projects, tasks, and team productivity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total Projects" value={stats?.totals.projects ?? 0} tone="brand" icon={FolderKanban} />
        <KpiCard label="Total Tasks" value={stats?.totals.tasks ?? 0} tone="info" icon={ListChecks} />
        <KpiCard label="Completed" value={stats?.totals.completedTasks ?? 0} tone="success" icon={CheckCircle2} />
        <KpiCard label="Pending" value={stats?.totals.pendingTasks ?? 0} tone="warning" icon={Clock} />
        <KpiCard label="Overdue" value={stats?.totals.overdueTasks ?? 0} tone="danger" icon={AlertTriangle} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Project Progress</h2>
              <p className="text-xs text-ink-500">% of tasks completed per project</p>
            </div>
            <Badge variant="brand">Top 6</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={progressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="g-progress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7a4bff" />
                  <stop offset="100%" stopColor="#ff5d8f" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(122,75,255,0.08)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.25)',
                  backdropFilter: 'blur(10px)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="progress" fill="url(#g-progress)" radius={[10, 10, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-lg font-bold">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                label={(d) => `${d.name}: ${d.value}`}
              >
                {priorityData.map((d) => (
                  <Cell key={d.name} fill={PRIORITY_COLORS[d.name] ?? '#94a3b8'} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.25)',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Completion Trend</h2>
              <p className="text-xs text-ink-500">Tasks completed in the last 14 days</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="g-trend" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#5bb5ff" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.25)',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="url(#g-trend)"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-lg font-bold">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                paddingAngle={3}
              >
                {statusData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={STATUS_COLORS[d.name === 'In Progress' ? 'InProgress' : d.name] ?? '#94a3b8'}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
              />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Upcoming Deadlines</h2>
            <Badge variant="warning">7 days</Badge>
          </div>
          <ul className="space-y-3 text-sm">
            {(upcomingResp?.data ?? []).slice(0, 5).map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.title}</div>
                  <div className="truncate text-xs text-ink-500">
                    {typeof t.project === 'object' ? t.project.name : ''}
                  </div>
                </div>
                <span
                  className={
                    isOverdue(t.dueDate)
                      ? 'whitespace-nowrap text-xs font-semibold text-rose-600'
                      : 'whitespace-nowrap text-xs text-ink-500'
                  }
                >
                  {formatDate(t.dueDate)}
                </span>
              </li>
            ))}
            {!upcomingResp?.data.length && (
              <li className="text-xs text-ink-400">No upcoming deadlines.</li>
            )}
          </ul>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">High Priority</h2>
            <Badge variant="danger">Focus</Badge>
          </div>
          <ul className="space-y-3 text-sm">
            {(highPriorityResp?.data ?? []).slice(0, 5).map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.title}</div>
                  <div className="truncate text-xs text-ink-500">
                    {typeof t.project === 'object' ? t.project.name : ''} · {formatDate(t.dueDate)}
                  </div>
                </div>
                <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
              </li>
            ))}
            {!highPriorityResp?.data.length && (
              <li className="text-xs text-ink-400">Nothing urgent. Nice.</li>
            )}
          </ul>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent Activity</h2>
          </div>
          <ul className="space-y-3 text-sm">
            {(activityResp?.data ?? []).slice(0, 6).map((a) => (
              <li key={a._id} className="flex items-start gap-3">
                <Avatar size="sm" name={a.actor?.name} color={a.actor?.avatarColor} />
                <div className="min-w-0">
                  <div className="text-sm leading-snug">{a.message}</div>
                  <div className="text-xs text-ink-500">{fromNow(a.createdAt)}</div>
                </div>
              </li>
            ))}
            {!activityResp?.data.length && (
              <li className="text-xs text-ink-400">No recent activity.</li>
            )}
          </ul>
          <Link
            to="/activity"
            className="mt-4 inline-block text-xs font-semibold text-brand-600 hover:underline"
          >
            View all activity →
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Member Workload</h2>
          <Link to="/team" className="text-xs font-semibold text-brand-600 hover:underline">
            View full team →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(workloadResp?.data ?? []).slice(0, 6).map((r) => {
            const rate = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
            return (
              <div
                key={r.userId}
                className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-white/5 dark:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <Avatar size="lg" name={r.name} color={r.avatarColor} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{r.name}</div>
                    <div className="text-xs text-ink-500">{r.total} tasks</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-ink-500">
                    <span>{r.completed} done</span>
                    <span className="font-semibold text-emerald-600">{rate}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant={statusVariant('Todo')}>{r.todo} todo</Badge>
                  <Badge variant={statusVariant('InProgress')}>{r.inProgress} active</Badge>
                </div>
              </div>
            );
          })}
          {!workloadResp?.data.length && (
            <p className="text-xs text-ink-400">No workload data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
