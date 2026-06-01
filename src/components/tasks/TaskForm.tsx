import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useListUsersQuery } from '@/features/users/usersApi';
import { useListProjectsQuery } from '@/features/projects/projectsApi';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/features/tasks/tasksApi';
import { getErrorMessage } from '@/utils/errors';
import { Task } from '@/types';
import { toDateInput, todayInput } from '@/utils/format';
import Spinner from '@/components/ui/Spinner';

interface Props {
  task?: Task;
  defaultProjectId?: string;
  onDone: () => void;
}

export default function TaskForm({ task, defaultProjectId, onDone }: Props) {
  const isEdit = Boolean(task);
  const projectId =
    typeof task?.project === 'object' ? task?.project._id : (task?.project ?? defaultProjectId ?? '');

  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    project: projectId,
    assignee: task?.assignee?._id ?? '',
    dueDate: toDateInput(task?.dueDate) || todayInput(),
    priority: task?.priority ?? 'Medium',
    status: task?.status ?? 'Todo',
  });

  const { data: users } = useListUsersQuery();
  const { data: projects } = useListProjectsQuery({ limit: 100 });
  const [create, { isLoading: creating }] = useCreateTaskMutation();
  const [update, { isLoading: updating }] = useUpdateTaskMutation();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      project: form.project,
      assignee: form.assignee || null,
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
    };
    try {
      if (isEdit && task) {
        await update({ id: task._id, data: payload }).unwrap();
        toast.success('Task updated');
      } else {
        await create(payload).unwrap();
        toast.success('Task created');
      }
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Task Title</label>
        <input
          className="input"
          required
          minLength={2}
          placeholder="e.g. Setup design system tokens"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input min-h-[80px]"
          placeholder="What needs to happen?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Project</label>
          <select
            className="input"
            required
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
            disabled={Boolean(defaultProjectId) || isEdit}
          >
            <option value="">Select…</option>
            {(projects?.data ?? []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Assigned Member</label>
          <select
            className="input"
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
          >
            <option value="">Unassigned</option>
            {(users?.data ?? []).map((u) => {
              const id = (u._id ?? u.id) as string;
              return (
                <option key={id} value={id}>
                  {u.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input
            type="date"
            className="input"
            required
            min={todayInput()}
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Priority</label>
          <select
            className="input"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Todo', 'InProgress', 'Completed'] as const).map((s) => (
              <button
                type="button"
                key={s}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  form.status === s
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                    : 'border-ink-200 bg-white/40 text-ink-600 hover:border-ink-300 dark:border-white/10 dark:bg-white/[0.02] dark:text-ink-300'
                }`}
                onClick={() => setForm({ ...form, status: s })}
              >
                {s === 'InProgress' ? 'In Progress' : s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button className="btn-primary" type="submit" disabled={creating || updating}>
          {creating || updating ? <Spinner /> : isEdit ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
