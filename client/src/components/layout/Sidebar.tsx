import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  Activity,
  CheckSquare,
  LayoutDashboard,
  Sparkles,
  Users,
  Users2,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import Logo from '@/components/ui/Logo';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Sparkles },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/activity', label: 'Activity', icon: Activity },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx('nav-link', isActive && 'nav-link-active');

export default function Sidebar() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const user = useAppSelector((s) => s.auth.user);

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-white/40 bg-white/60 px-4 py-6 backdrop-blur-xl dark:border-white/5 dark:bg-ink-950/60 md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="flex flex-col gap-1">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
          Workspace
        </div>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}

        {role === 'Admin' && (
          <>
            <div className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Admin
            </div>
            <NavLink to="/admin/users" className={linkClass}>
              <Users2 className="nav-icon" />
              <span>All Users</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto">
        <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-brand-500/10 via-accent-rose/10 to-accent-sky/10 p-4 dark:border-white/5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
            Signed in as
          </div>
          <div className="mt-1.5 text-sm font-semibold leading-tight">{user?.name}</div>
          <div className="text-xs text-ink-500 dark:text-ink-400">{user?.role}</div>
        </div>
      </div>
    </aside>
  );
}
