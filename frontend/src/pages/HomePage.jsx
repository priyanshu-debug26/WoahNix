import { useMemo, useState } from 'react';
import { Radio, Sparkles, Tv, SearchX } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { useAuth } from '../context/AuthContext';
import { mediaService } from '../services/mediaService';
import { CategoryTabs } from '../components/CategoryTabs';
import { SectionHeader } from '../components/SectionHeader';
import { LiveCard } from '../components/LiveCard';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const {
    videos,
    categories,
    liveStreams,
    channels,
    interests,
    isLoading,
    searchQuery,
    setSearchQuery,
  } = useMedia();

  const [activeCategory, setActiveCategory] = useState('All');

  const subscribedIds = useMemo(
    () => new Set(channels.map((ch) => ch.id)),
    [channels]
  );

  const filteredLiveStreams = useMemo(
    () =>
      mediaService.filterStreams(liveStreams, {
        category: activeCategory,
        query: searchQuery,
        onlyLive: true,
      }),
    [liveStreams, activeCategory, searchQuery]
  );

  const recommendedVideos = useMemo(() => {
    const recommended = videos.filter((video) => video.isRecommended);
    return mediaService.filterVideos(recommended, {
      category: activeCategory,
      query: searchQuery,
      allowedInterests: isAuthenticated ? interests : null,
    });
  }, [videos, activeCategory, interests, searchQuery, isAuthenticated]);

  const latestFromChannels = useMemo(() => {
    if (!isAuthenticated) return [];
    const fromSubscribed = videos.filter((video) =>
      subscribedIds.has(video.channelId)
    );
    return mediaService.filterVideos(fromSubscribed, {
      category: activeCategory,
      query: searchQuery,
    });
  }, [videos, subscribedIds, activeCategory, searchQuery, isAuthenticated]);

  const hasAnyResults =
    filteredLiveStreams.length > 0 ||
    recommendedVideos.length > 0 ||
    latestFromChannels.length > 0;

  return (
    <div className="space-y-10">
      {/* Hero / Welcome */}
      <section className="space-y-5">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Your corner of the internet.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
            Everything you want to watch. Nothing you don&apos;t.
          </p>
        </div>

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((slot) => (
            <div
              key={slot}
              className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-[var(--bg-elevated)]" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-4/5 rounded bg-[var(--bg-elevated)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--bg-elevated)]" />
              </div>
            </div>
          ))}
        </div>
      ) : !hasAnyResults ? (
        <EmptyState
          icon={SearchX}
          title="No matching streams or videos"
          description="Try clearing your search query or switching back to All categories."
          action={
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          }
        />
      ) : (
        <>
          {/* Live Now Section */}
          {filteredLiveStreams.length > 0 && (
            <section>
              <SectionHeader
                title="Live Now"
                subtitle="Twitch channels streaming right now"
                actionLabel="View all live"
                actionTo="/live"
                badge={
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
                    <Radio className="w-3 h-3" />
                    {filteredLiveStreams.length} live
                  </span>
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredLiveStreams.map((stream) => (
                  <LiveCard key={stream.id} stream={stream} />
                ))}
              </div>
            </section>
          )}

          {/* Recommended For You */}
          {recommendedVideos.length > 0 && (
            <section>
              <SectionHeader
                title="Recommended For You"
                subtitle={
                  isAuthenticated
                    ? 'Curated around your selected topics in Settings'
                    : 'Featured videos across programming, technology, and music'
                }
                actionLabel="Explore more"
                actionTo="/explore"
                badge={
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {recommendedVideos.slice(0, 6).map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          )}

          {/* Latest From Your Channels (Registered mode) */}
          {isAuthenticated && latestFromChannels.length > 0 && (
            <section>
              <SectionHeader
                title="Latest From Your Channels"
                subtitle="Recent uploads from your followed YouTube creators"
                actionLabel="Manage following"
                actionTo="/following"
                badge={
                  <Tv className="w-4 h-4 text-[var(--text-secondary)]" />
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {latestFromChannels.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
