import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import { WoahnixLogo } from '../assets/WoahnixLogo';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isBackendEnabled,
    login,
    continueWithGoogle,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setFormError(err?.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setFormError(null);
    const res = continueWithGoogle();
    if (res?.error) {
      setFormError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-center px-4 py-10">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Guest browsing</span>
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <WoahnixLogo className="w-6 h-6" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              WoahNix
            </span>
          </Link>
        </div>

        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-7 space-y-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Sign in to WoahNix
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Access your Watch Later queue, Following channels, and preferences.
            </p>
          </div>

          {!isBackendEnabled && (
            <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              Backend authentication is not connected yet. You can inspect the sign-in flow here or return to browse in Guest mode.
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg bg-[#D94E45]/10 border border-[#D94E45]/40 p-3 text-xs text-[#E57368]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/50 transition-colors cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-[var(--border-subtle)]" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
              or with email
            </span>
            <div className="flex-1 border-t border-[var(--border-subtle)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[var(--bg-main)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>

          <p className="text-xs text-center text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
            New to WoahNix?{' '}
            <Link
              to="/register"
              className="text-[var(--accent-primary)] font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

