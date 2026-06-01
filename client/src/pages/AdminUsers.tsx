import { useState } from 'react';
import { Search } from 'lucide-react';
import { useListUsersQuery } from '@/features/users/usersApi';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useListUsersQuery({ search: search || undefined });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="All Users"
        description="Every person registered in your workspace."
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input w-72 pl-10"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="card text-sm text-ink-500">Loading…</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:border-white/5 dark:bg-white/[0.02]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100/80 dark:divide-white/5">
              {(data?.data ?? []).map((u) => (
                <tr key={u._id ?? u.id} className="transition hover:bg-brand-50/40 dark:hover:bg-white/[0.02]">
                  <td className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={u.name} color={u.avatarColor} />
                    <span className="font-semibold">{u.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        u.role === 'Admin' ? 'danger' : u.role === 'ProjectManager' ? 'info' : 'default'
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
