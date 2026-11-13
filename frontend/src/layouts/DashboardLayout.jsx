import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MediaPreviewModal } from '../components/MediaPreviewModal';
import { AuthPromptModal } from '../components/AuthPromptModal';
import { useMedia } from '../context/MediaContext';

const PAGE_TITLES = {
  '/': 'Home',
  '/following': 'Following',
  '/live': 'Live',
  '/explore': 'Explore',
  '/watch-later': 'Watch Later',
  '/settings': 'Settings',
  '/watch': 'Watch',
};

export function DashboardLayout() {
  const location = useLocation();
  const { loadError, retryLoad, actionError, clearActionError } = useMedia();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || 'WoahNix';

  return (
    <div className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={pageTitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-6">
          {loadError && (
            <div
              role="alert"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[var(--bg-card)] border border-[#D94E45]/40 p-4 text-sm"
            >
              <div className="flex items-center gap-2.5 text-[#E57368]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loadError}</span>
              </div>
              <button
                type="button"
                onClick={retryLoad}
                className="self-start sm:self-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {actionError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-card)] border border-[#D94E45]/40 px-4 py-3 text-xs text-[#E57368]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                type="button"
                onClick={clearActionError}
                aria-label="Dismiss error"
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Outlet />
        </main>
      </div>

      <MediaPreviewModal />
      <AuthPromptModal />
    </div>
  );
}
