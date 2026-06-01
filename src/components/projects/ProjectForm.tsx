import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useListUsersQuery } from '@/features/users/usersApi';
import { useCreateProjectMutation, useUpdateProjectMutation } from '@/features/projects/projectsApi';
import { getErrorMessage } from '@/utils/errors';
import { Project } from '@/types';
import { toDateInput, todayInput } from '@/utils/format';
import Spinner from '@/components/ui/Spinner';
import Avatar from '@/components/ui/Avatar';

interface Props {
  project?: Project;
  onDone: () => void;
}

export default function ProjectForm({ project, onDone }: Props) {
  const isEdit = Boolean(project);
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [deadline, setDeadline] = useState(toDateInput(project?.deadline) || todayInput());
  const [status, setStatus] = useState(project?.status ?? 'Active');
  const [members, setMembers] = useState<string[]>(project?.members?.map((m) => m._id ?? '') ?? []);

  const { data: usersResp } = useListUsersQuery();
  const [create, { isLoading: creating }] = useCreateProjectMutation();
  const [update, { isLoading: updating }] = useUpdateProjectMutation();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && project) {
        await update({
          id: project._id,
          data: { name, description, deadline, status, members },
        }).unwrap();
        toast.success('Project updated');
      } else {
        await create({ name, description, deadline, status, members }).unwrap();
        toast.success('Project created');
      }
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleMember = (id: string) => {
    setMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Project Name</label>
        <input
          className="input"
          required
          placeholder="e.g. Website Redesign"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input min-h-[90px]"
          placeholder="Brief context about the project…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Deadline</label>
          <input
            type="date"
            className="input"
            required
            min={todayInput()}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="Active">Active</option>
            <option value="OnHold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Team Members</label>
        <div className="max-h-44 space-y-1 overflow-auto rounded-xl border border-ink-200 bg-white/40 p-2 dark:border-white/10 dark:bg-white/[0.02]">
          {(usersResp?.data ?? []).map((u) => {
            const id = (u._id ?? u.id) as string;
            const checked = members.includes(id);
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition ${
                  checked ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-ink-50 dark:hover:bg-white/5'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-300 accent-brand-600"
                  checked={checked}
                  onChange={() => toggleMember(id)}
                />
                <Avatar size="sm" name={u.name} color={u.avatarColor} ring={false} />
                <span className="font-medium">{u.name}</span>
                <span className="ml-auto text-xs text-ink-500">{u.role}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button className="btn-primary" type="submit" disabled={creating || updating}>
          {creating || updating ? <Spinner /> : isEdit ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  );
}
