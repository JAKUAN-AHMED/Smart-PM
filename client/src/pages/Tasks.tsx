import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import {
  useDeleteTaskMutation,
  useListTasksQuery,
  useUpdateTaskStatusMutation,
} from '@/features/tasks/tasksApi';
import { useListProjectsQuery } from '@/features/projects/projectsApi';
import { useListUsersQuery } from '@/features/users/usersApi';
import { useAppSelector } from '@/app/hooks';
import Badge, { priorityVariant, statusVariant } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import PageHeader from '@/components/ui/PageHeader';
import TaskForm from '@/components/tasks/TaskForm';
import { formatDate, isOverdue } from '@/utils/format';
import { Task } from '@/types';
import { getErrorMessage } from '@/utils/errors';

const statusLabel = (s: string) => (s === 'InProgress' ? 'In Progress' : s);

export default function TasksPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canCreate = user?.role === 'Admin' || user?.role === 'ProjectManager';

  const [filters, setFilters] = useState({
    search: '',
    project: '',
    assignee: '',
    status: '',
    priority: '',
    deadlineStatus: '',
    sort: 'latest' as 'latest' | 'deadline' | 'priority' | 'updated',
  });
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const { data: projects } = useListProjectsQuery({ limit: 100 });
  const { data: users } = useListUsersQuery();
  const { data, isLoading } = useListTasksQuery({
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    page,
    limit: 10,
  } as Parameters<typeof useListTasksQuery>[0]);

  const [updateStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const change = <K extends keyof typeof filters>(k: K, v: (typeof filters)[K]) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const onStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Status: ${statusLabel(status)}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id).unwrap();
      toast.success('Task deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Tasks"
        description="Track every task from idea to ship across all of your projects."
        action={
          canCreate && (
            <button className="btn-primary" onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4" /> New Task
            </button>
          )
        }
      />

      <div className="card">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input pl-10"
              placeholder="Search task title or description"
              value={filters.search}
              onChange={(e) => change('search', e.target.value)}
            />
          </div>
          <select className="input" value={filters.project} onChange={(e) => change('project', e.target.value)}>
            <option value="">All projects</option>
            {(projects?.data ?? []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className="input" value={filters.assignee} onChange={(e) => change('assignee', e.target.value)}>
            <option value="">Any assignee</option>
            {(users?.data ?? []).map((u) => {
              const id = (u._id ?? u.id) as string;
              return (
                <option key={id} value={id}>
                  {u.name}
                </option>
              );
            })}
          </select>
          <select className="input" value={filters.status} onChange={(e) => change('status', e.target.value)}>
            <option value="">Any status</option>
            <option value="Todo">Todo</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="input" value={filters.priority} onChange={(e) => change('priority', e.target.value)}>
            <option value="">Any priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select className="input" value={filters.deadlineStatus} onChange={(e) => change('deadlineStatus', e.target.value)}>
            <option value="">Any deadline</option>
            <option value="upcoming">Upcoming (7d)</option>
            <option value="overdue">Overdue</option>
          </select>
          <select className="input" value={filters.sort} onChange={(e) => change('sort', e.target.value as typeof filters.sort)}>
            <option value="latest">Latest created</option>
            <option value="deadline">Nearest deadline</option>
            <option value="priority">Highest priority</option>
            <option value="updated">Recently updated</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card text-center text-sm text-ink-500">Loading tasks…</div>
      ) : !data?.data.length ? (
        <EmptyState title="No tasks found" description="Try adjusting your filters or create a new task." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:border-white/5 dark:bg-white/[0.02]">
              <tr>
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Assignee</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100/80 dark:divide-white/5">
              {data.data.map((t) => {
                const overdue = isOverdue(t.dueDate) && t.status !== 'Completed';
                const projectName = typeof t.project === 'object' ? t.project.name : '';
                const projectId = typeof t.project === 'object' ? t.project._id : t.project;
                return (
                  <tr
                    key={t._id}
                    className="transition hover:bg-brand-50/40 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-semibold">{t.title}</td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/projects/${projectId}`}
                        className="text-brand-600 hover:underline"
                      >
                        {projectName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {t.assignee ? (
                        <span className="inline-flex items-center gap-2">
                          <Avatar size="sm" name={t.assignee.name} color={t.assignee.avatarColor} />
                          {t.assignee.name}
                        </span>
                      ) : (
                        <span className="text-ink-400">Unassigned</span>
                      )}
                    </td>
                    <td className={`px-5 py-3.5 ${overdue ? 'font-semibold text-rose-600' : ''}`}>
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        className="rounded-lg border border-ink-200 bg-transparent px-2.5 py-1 text-xs font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10"
                        value={t.status}
                        onChange={(e) => onStatus(t._id, e.target.value)}
                      >
                        <option value="Todo">Todo</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          className="grid h-7 w-7 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
                          onClick={() => setEditing(t)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {canCreate && (
                          <button
                            className="grid h-7 w-7 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                            onClick={() => onDelete(t._id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <Badge variant={statusVariant(t.status)} className="ml-2">
                          {statusLabel(t.status)}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
      )}

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="New Task">
        <TaskForm onDone={() => setOpenCreate(false)} />
      </Modal>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Task">
        {editing && <TaskForm task={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
