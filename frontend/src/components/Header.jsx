import { Link } from 'react-router-dom';
import { Menu, User, LogIn } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { useMedia } from '../context/MediaContext';
import { useAuth } from '../context/AuthContext';

export function Header({ title, onOpenMobileMenu }) {
  const { searchQuery, setSearchQuery } = useMedia();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--bg-main)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--text-primary)] truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end max-w-xl">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search videos, channels, streams..."
          className="w-full max-w-xs sm:max-w-sm"
        />

        {!isAuthenticated && (
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Sign in</span>
          </Link>
        )}

        <Link
          to="/settings"
          title={
            isAuthenticated
              ? `${user?.username || user?.name || user?.email || 'Account'} · Settings`
              : 'Settings & Preferences'
          }
          aria-label="Open settings and preferences"
          className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/50 transition-colors duration-150 shrink-0"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
