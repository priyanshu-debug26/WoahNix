import { useMemo, useState } from 'react';
import { Radio, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { CategoryTabs } from '../components/CategoryTabs';
import { SectionHeader } from '../components/SectionHeader';
import { LiveCard } from '../components/LiveCard';
import { EmptyState } from '../components/EmptyState';

export function LivePage() {
  const {
    streams,
    categories,
    searchQuery,
    addStreamer,
  } = useMedia();

  const [activeCategory, setActiveCategory] = useState('All');
  const [showOffline, setShowOffline] = useState(false);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickError, setQuickError] = useState('');

  const filteredLive = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return streams.filter((stream) => {
      if (!stream.isLive) return false;
      const catMatch =
        activeCategory === 'All' || stream.category === activeCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        stream.displayName.toLowerCase().includes(q) ||
        stream.streamerName.toLowerCase().includes(q) ||
        stream.title.toLowerCase().includes(q) ||
        stream.game.toLowerCase().includes(q)
      );
    });
  }, [streams, activeCategory, searchQuery]);

  const offlineStreams = useMemo(
    () => streams.filter((stream) => !stream.isLive),
    [streams]
  );

  const handleQuickAdd = (e) => {
    e.preventDefault();
    const res = addStreamer(quickUrl, activeCategory === 'All' ? 'Gaming' : activeCategory);
    if (res.error) {
      setQuickError(res.error);
      return;
    }
    setQuickUrl('');
    setQuickError('');
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <form onSubmit={handleQuickAdd} className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={quickUrl}
            onChange={(e) => {
              setQuickUrl(e.target.value);
              if (quickError) setQuickError('');
            }}
            placeholder="Add twitch.tv/streamer"
            aria-label="Add Twitch streamer URL"
            className="w-52 sm:w-60 bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm px-3 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>
      </section>

      {quickError && (
        <p className="text-xs text-[#E57368] -mt-5">{quickError}</p>
      )}

      {/* Live Streams Section */}
      <section>
        <SectionHeader
          title="Live on Twitch"
          subtitle="Followed streamers currently broadcasting"
          badge={
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
              {filteredLive.length} live
            </span>
          }
          rightSlot={
            offlineStreams.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOffline((prev) => !prev)}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                {showOffline
                  ? 'Hide offline channels'
                  : `Show offline (${offlineStreams.length})`}
              </button>
            )
          }
        />

        {filteredLive.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="Nobody is live right now"
            description="None of your tracked Twitch streamers match the current filters or are broadcasting right now. You can add streamers above or manage live status in Settings."
            action={
              <Link
                to="/settings"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors"
              >
                Manage Twitch Streamers
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLive.map((stream) => (
              <LiveCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </section>

      {/* Optional Offline Tracked Channels */}
      {showOffline && offlineStreams.length > 0 && (
        <section>
          <SectionHeader
            title="Offline Tracked Channels"
            subtitle="Streamers in your list who are currently offline"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {offlineStreams.map((stream) => (
              <LiveCard key={stream.id} stream={stream} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

