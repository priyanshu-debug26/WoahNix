import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Radio,
  Compass,
  Bookmark,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { WoahnixLogo } from '../assets/WoahnixLogo';
import { useMedia } from '../context/MediaContext';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/following', label: 'Following', icon: Users },
  { to: '/live', label: 'Live', icon: Radio, badgeKey: 'live' },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/watch-later', label: 'Watch Later', icon: Bookmark, badgeKey: 'watchLater' },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { liveStreams, watchLaterVideos } = useMedia();

  const getBadgeCount = (key) => {
    if (key === 'live') return liveStreams.length;
    if (key === 'watchLater') return watchLaterVideos.length;
    return 0;
  };

  const renderNavLink = (item) => {
    const Icon = item.icon;
    const count = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onCloseMobile}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            collapsed ? 'justify-center px-2' : ''
          } ${
            isActive
              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/60'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[var(--accent-primary)]"
                aria-hidden="true"
              />
            )}
            <Icon
              className={`w-[18px] h-[18px] shrink-0 ${
                isActive ? 'text-[var(--accent-primary)]' : ''
              }`}
            />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${
                      item.badgeKey === 'live'
                        ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] select-none">
      {/* Brand header */}
      <div
        className={`h-16 flex items-center border-b border-[var(--border-subtle)] px-4 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <WoahnixLogo className="w-7 h-7 shrink-0" />
          {!collapsed && (
            <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              WoahNix
            </span>
          )}
        </NavLink>

        {/* Desktop collapse toggle */}
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="hidden lg:inline-flex p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expand button when collapsed on desktop */}
      {collapsed && (
        <div className="hidden lg:flex justify-center pt-3 pb-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary">
        {NAV_ITEMS.map(renderNavLink)}
      </nav>

      {/* Bottom Settings link */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        {renderNavLink({ to: '/settings', label: 'Settings', icon: Settings })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-out ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[80vw] h-full z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

