import { useParams } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Plus, UserPlus2, X } from 'lucide-react';
import {
  useAddProjectMembersMutation,
  useGetProjectQuery,
  useRemoveProjectMemberMutation,
} from '@/features/projects/projectsApi';
import { useListTasksQuery } from '@/features/tasks/tasksApi';
import { useListUsersQuery } from '@/features/users/usersApi';
import { useAppSelector } from '@/app/hooks';
import Avatar from '@/components/ui/Avatar';
import Badge, { priorityVariant, statusVariant } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import TaskForm from '@/components/tasks/TaskForm';
import { formatDate, isOverdue } from '@/utils/format';
import { getErrorMessage } from '@/utils/errors';

export default function ProjectDetailPage() {
  const { id = '' } = useParams();
  const user = useAppSelector((s) => s.auth.user);
  const canManage = user?.role === 'Admin' || user?.role === 'ProjectManager';

  const { data: projectResp, isLoading } = useGetProjectQuery(id);
  const project = projectResp?.data;
  const { data: tasksResp } = useListTasksQuery({ project: id, limit: 100 });
  const { data: usersResp } = useListUsersQuery();
  const [addMembers] = useAddProjectMembersMutation();
  const [removeMember] = useRemoveProjectMemberMutation();

  const [openTask, setOpenTask] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');

  if (isLoading || !project) {
    return <div className="card text-sm text-ink-500">Loading project…</div>;
  }

  const memberIds = new Set(project.members.map((m) => m._id));
  const candidates = (usersResp?.data ?? []).filter(
    (u) => !memberIds.has((u._id ?? u.id) as string),
  );

  const onAddMember = async () => {
    if (!memberToAdd) return;
    try {
      await addMembers({ id: project._id, members: [memberToAdd] }).unwrap();
      toast.success('Member added');
      setMemberToAdd('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onRemoveMember = async (memberId: string) => {
    try {
      await removeMember({ id: project._id, memberId }).unwrap();
      toast.success('Member removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const tasksByStatus = {
    Todo: tasksResp?.data.filter((t) => t.status === 'Todo') ?? [],
    InProgress: tasksResp?.data.filter((t) => t.status === 'InProgress') ?? [],
    Completed: tasksResp?.data.filter((t) => t.status === 'Completed') ?? [],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.description || 'No description yet.'}
        action={
          canManage && (
            <button className="btn-primary" onClick={() => setOpenTask(true)}>
              <Plus className="h-4 w-4" /> Add Task
            </button>
          )
        }
      />

      <div className="card flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-ink-500">
            <Calendar className="h-4 w-4" />
            <span
              className={
                isOverdue(project.deadline) && project.status !== 'Completed'
                  ? 'font-semibold text-rose-600'
                  : ''
              }
            >
              {formatDate(project.deadline)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar size="sm" name={project.owner.name} color={project.owner.avatarColor} />
            <span className="text-ink-600 dark:text-ink-300">{project.owner.name}</span>
            <Badge variant="brand">Owner</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-ink-500">
            <span className="font-semibold text-ink-900 dark:text-ink-100">
              {project.completedTasks}
            </span>{' '}
            / {project.totalTasks} tasks
          </div>
          <div className="flex h-12 w-24 items-center">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-brand-gradient"
                style={{ width: `${project.progress ?? 0}%` }}
              />
            </div>
            <span className="ml-2 font-semibold gradient-text">{project.progress ?? 0}%</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Team Members</h2>
          {canManage && candidates.length > 0 && (
            <div className="flex gap-2">
              <select
                className="input max-w-[220px]"
                value={memberToAdd}
                onChange={(e) => setMemberToAdd(e.target.value)}
              >
                <option value="">Add a member…</option>
                {candidates.map((u) => {
                  const cid = (u._id ?? u.id) as string;
                  return (
                    <option key={cid} value={cid}>
                      {u.name} ({u.role})
                    </option>
                  );
                })}
              </select>
              <button className="btn-secondary" onClick={onAddMember} disabled={!memberToAdd}>
                <UserPlus2 className="h-4 w-4" /> Add
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {project.members.map((m) => (
            <span key={m._id} className="chip">
              <Avatar size="xs" name={m.name} color={m.avatarColor} ring={false} />
              {m.name}
              {canManage && (
                <button
                  className="ml-1 grid h-4 w-4 place-items-center rounded-full text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => onRemoveMember(m._id!)}
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {project.members.length === 0 && (
            <span className="text-sm text-ink-500">No members yet</span>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {(['Todo', 'InProgress', 'Completed'] as const).map((col) => (
          <div key={col} className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-bold">
                {col === 'InProgress' ? 'In Progress' : col}
              </h3>
              <Badge variant={statusVariant(col)}>{tasksByStatus[col].length}</Badge>
            </div>
            <div className="space-y-2.5">
              {tasksByStatus[col].map((t) => (
                <div
                  key={t._id}
                  className="rounded-xl border border-ink-100 bg-white/60 p-3 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft dark:border-white/5 dark:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">{t.title}</span>
                    <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span
                      className={
                        isOverdue(t.dueDate) && t.status !== 'Completed'
                          ? 'font-semibold text-rose-600'
                          : 'text-ink-500'
                      }
                    >
                      {formatDate(t.dueDate)}
                    </span>
                    {t.assignee && (
                      <Avatar size="sm" name={t.assignee.name} color={t.assignee.avatarColor} />
                    )}
                  </div>
                </div>
              ))}
              {tasksByStatus[col].length === 0 && (
                <p className="rounded-xl border border-dashed border-ink-200 px-3 py-6 text-center text-xs text-ink-400 dark:border-white/5">
                  Nothing here yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={openTask} onClose={() => setOpenTask(false)} title="New Task">
        <TaskForm defaultProjectId={project._id} onDone={() => setOpenTask(false)} />
      </Modal>
    </div>
  );
}
