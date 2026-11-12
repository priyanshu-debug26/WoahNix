import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function AuthRequiredCard({
  title,
  description,
  icon: Icon = Lock,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      <div className="w-11 h-11 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 text-[var(--accent-primary)]">
        <Icon className="w-5 h-5" />
      </div>

      <h2 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h2>

      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-md mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors"
        >
          Create account
        </Link>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Browse Home
        </Link>
      </div>
    </div>
  );
}

