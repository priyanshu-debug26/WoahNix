import { useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { useAuth } from '../context/AuthContext';
import { mediaService } from '../services/mediaService';
import { SectionHeader } from '../components/SectionHeader';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';
import { AuthRequiredCard } from '../components/AuthRequiredCard';

export function WatchLaterPage() {
  const { isAuthenticated } = useAuth();
  const { watchLaterVideos, searchQuery } = useMedia();

  const filtered = useMemo(
    () =>
      mediaService.filterVideos(watchLaterVideos, {
        query: searchQuery,
      }),
    [watchLaterVideos, searchQuery]
  );

  if (!isAuthenticated) {
    return (
      <AuthRequiredCard
        icon={Bookmark}
        title="Sign in to access Watch Later"
        description="Save YouTube videos to your personal Watch Later queue once signed in. You can continue watching videos directly in Guest mode."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Watch Later"
        subtitle="Videos you saved to come back to when you have time"
        badge={
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {watchLaterVideos.length} saved
          </span>
        }
      />

      {watchLaterVideos.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your Watch Later queue is empty"
          description="Bookmark any playable YouTube video from Home, Explore, or the Watch page."
          action={
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
            >
              Browse Home Feed
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved videos match your search"
          description="Clear the search bar in the header to see all of your saved videos."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
