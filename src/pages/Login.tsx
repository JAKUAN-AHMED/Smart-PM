import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Mail, Sparkles, Zap } from 'lucide-react';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { getErrorMessage } from '@/utils/errors';
import Spinner from '@/components/ui/Spinner';
import Logo from '@/components/ui/Logo';

const DEMO = { email: 'admin@demo.com', password: 'demo1234' };

const highlights = [
  { icon: Sparkles, label: 'Beautifully designed dashboard' },
  { icon: Zap, label: 'Real-time validation & conflict handling' },
  { icon: Lock, label: 'Role-based access control' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const doLogin = async (creds: { email: string; password: string }) => {
    try {
      const res = await login(creds).unwrap();
      dispatch(setCredentials(res.data));
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    doLogin({ email, password });
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="app-mesh" />

      {/* Brand side */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 -z-10 bg-brand-gradient bg-[length:200%_200%] animate-gradient-shift" />
        <div className="absolute -left-24 -top-24 -z-10 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 -z-10 h-96 w-96 rounded-full bg-accent-rose/30 blur-3xl" />

        <div className="text-white">
          <Logo size="lg" />
        </div>

        <div className="text-white">
          <h1 className="font-display text-5xl font-bold leading-[1.05]">
            Where teams ship
            <br />
            <span className="bg-gradient-to-r from-white to-accent-amber bg-clip-text text-transparent">
              brilliant work.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
            A single workspace for projects, tasks, and the people who move them forward — with the
            polish your team deserves.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-white/90">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/60">© {new Date().getFullYear()} Smart PM · Crafted with care</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
          </div>
          <div className="auth-card">
            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300">
                Sign in to your workspace to continue.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-300" />
                  <input
                    className="input pl-10"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-300" />
                  <input
                    className="input pl-10"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button className="btn-primary mt-2 w-full" disabled={isLoading} type="submit">
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    Sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-300">
              <span className="h-px flex-1 bg-ink-200 dark:bg-white/15" />
              or
              <span className="h-px flex-1 bg-ink-200 dark:bg-white/15" />
            </div>

            <button
              className="btn-secondary w-full"
              type="button"
              disabled={isLoading}
              onClick={() => {
                setEmail(DEMO.email);
                setPassword(DEMO.password);
                void doLogin(DEMO);
              }}
            >
              <Sparkles className="h-4 w-4 text-brand-500" />
              Try the Demo (Admin)
            </button>

            <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-200">
              New here?{' '}
              <Link
                to="/signup"
                className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
