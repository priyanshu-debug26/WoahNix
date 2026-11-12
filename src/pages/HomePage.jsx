import { useMemo, useState } from 'react';
import { Radio, Sparkles, Tv, SearchX } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { CategoryTabs } from '../components/CategoryTabs';
import { SectionHeader } from '../components/SectionHeader';
import { LiveCard } from '../components/LiveCard';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';

function matchesQuery(textFields, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return textFields.some((field) => field && field.toLowerCase().includes(q));
}

export function HomePage() {
  const {
    videos,
    categories,
    liveStreams,
    channels,
    interests,
    searchQuery,
    setSearchQuery,
  } = useMedia();

  const [activeCategory, setActiveCategory] = useState('All');

  const subscribedIds = useMemo(
    () => new Set(channels.map((ch) => ch.id)),
    [channels]
  );

  const filteredLiveStreams = useMemo(() => {
    return liveStreams.filter((stream) => {
      const catMatch =
        activeCategory === 'All' || stream.category === activeCategory;
      const queryMatch = matchesQuery(
        [stream.displayName, stream.streamerName, stream.title, stream.game, stream.category],
        searchQuery
      );
      return catMatch && queryMatch;
    });
  }, [liveStreams, activeCategory, searchQuery]);

  const recommendedVideos = useMemo(() => {
    return videos.filter((video) => {
      if (!video.isRecommended) return false;
      const catMatch =
        activeCategory === 'All'
          ? interests.length === 0 || interests.includes(video.category)
          : video.category === activeCategory;
      const queryMatch = matchesQuery(
        [video.title, video.channelName, video.category, video.description],
        searchQuery
      );
      return catMatch && queryMatch;
    });
  }, [videos, activeCategory, interests, searchQuery]);

  const latestFromChannels = useMemo(() => {
    return videos.filter((video) => {
      if (!subscribedIds.has(video.channelId)) return false;
      const catMatch =
        activeCategory === 'All' || video.category === activeCategory;
      const queryMatch = matchesQuery(
        [video.title, video.channelName, video.category, video.description],
        searchQuery
      );
      return catMatch && queryMatch;
    });
  }, [videos, subscribedIds, activeCategory, searchQuery]);

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

      {!hasAnyResults ? (
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
                subtitle="Curated around your selected topics in Settings"
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

          {/* Latest From Your Channels */}
          {latestFromChannels.length > 0 && (
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

