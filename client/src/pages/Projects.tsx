import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Calendar } from 'lucide-react';
import {
  useDeleteProjectMutation,
  useListProjectsQuery,
} from '@/features/projects/projectsApi';
import { useAppSelector } from '@/app/hooks';
import Badge, { statusVariant } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import PageHeader from '@/components/ui/PageHeader';
import ProjectForm from '@/components/projects/ProjectForm';
import { formatDate, isOverdue } from '@/utils/format';
import { Project } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export default function ProjectsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canManage = user?.role === 'Admin' || user?.role === 'ProjectManager';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'latest' | 'deadline' | 'updated' | 'name'>('latest');
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const { data, isLoading } = useListProjectsQuery({
    search: search || undefined,
    status: status || undefined,
    sort,
    page,
    limit: 9,
  });
  const [deleteProject] = useDeleteProjectMutation();

  const onDelete = async (id: string) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id).unwrap();
      toast.success('Project deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Plan, organize, and ship every initiative across your team."
        action={
          canManage && (
            <button className="btn-primary" onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4" /> New Project
            </button>
          )
        }
      />

      <div className="card flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="label">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input pl-10"
              placeholder="Search by name or description"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="OnHold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="label">Sort</label>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="latest">Latest created</option>
            <option value="updated">Recently updated</option>
            <option value="deadline">Nearest deadline</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card text-center text-sm text-ink-500">Loading projects…</div>
      ) : !data?.data.length ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started."
          action={
            canManage && (
              <button className="btn-primary" onClick={() => setOpenCreate(true)}>
                <Plus className="h-4 w-4" /> New Project
              </button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((p) => (
            <div
              key={p._id}
              className="card group relative overflow-hidden transition hover:-translate-y-1 hover:shadow-ring"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-gradient opacity-0 blur-2xl transition group-hover:opacity-20" />

              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/projects/${p._id}`}
                  className="font-display text-lg font-bold leading-tight hover:underline"
                >
                  {p.name}
                </Link>
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              </div>

              <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-ink-500 dark:text-ink-400">
                {p.description || 'No description provided yet.'}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-ink-400" />
                <span
                  className={
                    isOverdue(p.deadline) && p.status !== 'Completed'
                      ? 'font-semibold text-rose-600'
                      : 'text-ink-500'
                  }
                >
                  {formatDate(p.deadline)}
                </span>
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-ink-500">
                    {p.completedTasks ?? 0} / {p.totalTasks ?? 0} tasks
                  </span>
                  <span className="font-semibold gradient-text">{p.progress ?? 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-gradient transition-[width] duration-500"
                    style={{ width: `${p.progress ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 dark:border-white/5">
                <div className="flex -space-x-2">
                  {p.members.slice(0, 4).map((m) => (
                    <Avatar key={m._id} name={m.name} color={m.avatarColor} size="sm" />
                  ))}
                  {p.members.length > 4 && (
                    <span className="ml-2 text-xs text-ink-500">+{p.members.length - 4}</span>
                  )}
                  {p.members.length === 0 && (
                    <span className="text-xs text-ink-400">No members yet</span>
                  )}
                </div>
                {canManage && (
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      className="grid h-7 w-7 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={() => setEditing(p)}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="grid h-7 w-7 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      onClick={() => onDelete(p._id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
      )}

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="New Project"
        description="Spin up a new project and rally the team."
      >
        <ProjectForm onDone={() => setOpenCreate(false)} />
      </Modal>
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Project"
      >
        {editing && <ProjectForm project={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
