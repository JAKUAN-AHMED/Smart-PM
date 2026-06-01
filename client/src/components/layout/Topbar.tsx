import { LogOut, Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleTheme } from '@/features/ui/uiSlice';
import { logout } from '@/features/auth/authSlice';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';

export default function Topbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.ui.theme);

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/5 dark:bg-ink-950/60">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <Logo withName={false} />
        </div>

        <div className="hidden md:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-ink-200/80 bg-white/70 text-ink-600 transition hover:border-ink-300 hover:text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 py-1 pl-1 pr-3 backdrop-blur dark:border-white/5 dark:bg-white/5">
              <Avatar name={user.name} color={user.avatarColor} />
              <div className="hidden text-left text-sm leading-tight sm:block">
                <div className="font-semibold">{user.name}</div>
                <div className="text-[10px] uppercase tracking-wide text-ink-500">{user.role}</div>
              </div>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                onClick={() => dispatch(logout())}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
