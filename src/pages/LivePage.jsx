import { useMemo, useState } from 'react';
import { Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { useAuth } from '../context/AuthContext';
import { mediaService } from '../services/mediaService';
import { CategoryTabs } from '../components/CategoryTabs';
import { SectionHeader } from '../components/SectionHeader';
import { LiveCard } from '../components/LiveCard';
import { EmptyState } from '../components/EmptyState';
import { SubscriptionForm } from '../components/SubscriptionForm';

export function LivePage() {
  const { isAuthenticated } = useAuth();
  const {
    streams,
    categories,
    searchQuery,
    isLoading,
    pendingActions,
    addStreamer,
  } = useMedia();

  const [activeCategory, setActiveCategory] = useState('All');
  const [showOffline, setShowOffline] = useState(false);

  const filteredLive = useMemo(
    () =>
      mediaService.filterStreams(streams, {
        category: activeCategory,
        query: searchQuery,
        onlyLive: true,
      }),
    [streams, activeCategory, searchQuery]
  );

  const offlineStreams = useMemo(
    () =>
      mediaService.filterStreams(streams, {
        category: activeCategory,
        query: searchQuery,
        onlyLive: false,
      }).filter((st) => !st.isLive),
    [streams, activeCategory, searchQuery]
  );

  const handleQuickAdd = async (rawInput, category) => {
    const res = await addStreamer(rawInput, category);
    if (res.error) return { error: res.error };
    return {
      successMessage: `Added ${res.stream.displayName} (@${res.stream.streamerName}).`,
    };
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <div className="w-full xl:w-auto xl:min-w-[440px]">
          <SubscriptionForm
            onSubmit={handleQuickAdd}
            placeholder="Add twitch.tv/streamer"
            ariaLabel="Add Twitch streamer URL"
            submitLabel="Add"
            defaultCategory="Gaming"
            isPending={pendingActions.streams}
            compact
          />
        </div>
      </section>

      {/* Live Streams Section */}
      <section>
        <SectionHeader
          title="Live on Twitch"
          subtitle={
            isAuthenticated
              ? 'Your tracked streamers currently broadcasting'
              : 'Featured Twitch streams currently broadcasting'
          }
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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((slot) => (
              <div
                key={slot}
                className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-[var(--bg-elevated)]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[var(--bg-elevated)]" />
                  <div className="h-3 w-1/2 rounded bg-[var(--bg-elevated)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLive.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="Nobody is live right now"
            description="None of the Twitch streamers match your current filters or are broadcasting right now."
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
