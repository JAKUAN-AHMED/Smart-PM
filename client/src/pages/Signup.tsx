import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Mail, User2, Shield } from 'lucide-react';
import { useSignupMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { getErrorMessage } from '@/utils/errors';
import Spinner from '@/components/ui/Spinner';
import Logo from '@/components/ui/Logo';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await signup(form).unwrap();
      dispatch(setCredentials(res.data));
      toast.success('Account created — welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center p-6">
      <div className="app-mesh" />
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" withName={false} />
        </div>
        <div className="auth-card">
          <h2 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300">
            Start collaborating with your team in under a minute.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-300" />
                <input
                  className="input pl-10"
                  placeholder="Jane Cooper"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-300" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="you@company.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-300" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-300" />
                <select
                  className="input pl-10"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Member">Team Member</option>
                  <option value="ProjectManager">Project Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <button className="btn-primary mt-2 w-full" disabled={isLoading} type="submit">
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-200">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
