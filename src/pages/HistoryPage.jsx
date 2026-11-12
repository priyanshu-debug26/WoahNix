import { useMemo, useState } from 'react';
import { History, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { SectionHeader } from '../components/SectionHeader';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';

export function HistoryPage() {
  const {
    historyVideos,
    searchQuery,
    removeHistoryItem,
    clearHistory,
  } = useMedia();

  const [confirmClear, setConfirmClear] = useState(false);

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return historyVideos;
    return historyVideos.filter(
      (video) =>
        video.title.toLowerCase().includes(q) ||
        video.channelName.toLowerCase().includes(q) ||
        video.category.toLowerCase().includes(q)
    );
  }, [historyVideos, searchQuery]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Watch History"
        subtitle="Videos you recently opened or watched in WoahNix"
        badge={
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {historyVideos.length} watched
          </span>
        }
        rightSlot={
          historyVideos.length > 0 && !confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[#E57368] hover:border-[#E57368]/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear history
            </button>
          ) : null
        }
      />

      {/* Confirmation UI */}
      {confirmClear && historyVideos.length > 0 && (
        <div
          role="alertdialog"
          aria-labelledby="clear-history-title"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[#E57368]/40"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#E57368] shrink-0 mt-0.5" />
            <div>
              <p
                id="clear-history-title"
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Clear your entire watch history?
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                This removes all {historyVideos.length} entries from local browser storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearHistory();
                setConfirmClear(false);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#D94E45] text-white hover:bg-[#c2423a] transition-colors cursor-pointer"
            >
              Confirm clear
            </button>
          </div>
        </div>
      )}

      {historyVideos.length === 0 ? (
        <EmptyState
          icon={History}
          title="No watch history yet"
          description="Click any video across WoahNix to preview it and it will automatically appear here."
          action={
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
            >
              Discover Videos
            </Link>
          }
        />
      ) : filteredHistory.length === 0 ? (
        <EmptyState
          icon={History}
          title="No history items match your search"
          description="Try clearing the search bar to see your full watch history."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredHistory.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              watchedAt={video.watchedAt}
              progress={video.progress}
              onRemoveHistory={removeHistoryItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

