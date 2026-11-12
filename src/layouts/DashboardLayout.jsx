import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MediaPreviewModal } from '../components/MediaPreviewModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PAGE_TITLES = {
  '/': 'Home',
  '/following': 'Following',
  '/live': 'Live',
  '/explore': 'Explore',
  '/watch-later': 'Watch Later',
  '/history': 'History',
  '/settings': 'Settings',
};

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
    'sidebarCollapsed',
    false
  );
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

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <MediaPreviewModal />
    </div>
  );
}

