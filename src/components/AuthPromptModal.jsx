import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPromptModal() {
  const { authPrompt, closeAuthPrompt } = useAuth();

  useEffect(() => {
    if (!authPrompt) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeAuthPrompt();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authPrompt, closeAuthPrompt]);

  if (!authPrompt) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={closeAuthPrompt}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="auth-prompt-title"
                className="text-base font-semibold text-[var(--text-primary)]"
              >
                Account required
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                You are currently browsing in Guest mode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthPrompt}
            aria-label="Close sign in prompt"
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {authPrompt.reason}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={closeAuthPrompt}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
          >
            Continue as guest
          </button>

          <Link
            to="/register"
            onClick={closeAuthPrompt}
            className="px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors"
          >
            Create account
          </Link>

          <Link
            to="/login"
            onClick={closeAuthPrompt}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

