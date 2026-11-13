import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Film,
  Play,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { mediaService } from '../services/mediaService';

export function WatchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { videos, isBookmarked, toggleWatchLater, pendingActions } = useMedia();

  const rawV = searchParams.get('v')?.trim() || '';
  const demoId = searchParams.get('demo')?.trim() || '';

  const isValidVideoId = mediaService.isValidYouTubeVideoId(rawV);

  const catalogMatch = useMemo(() => {
    if (rawV) {
      return (
        videos.find((item) => !item.isDemoOnly && item.youtubeVideoId === rawV) ||
        null
      );
    }
    if (demoId) {
      return videos.find((item) => item.id === demoId) || null;
    }
    return null;
  }, [videos, rawV, demoId]);

  const [fetchedVideo, setFetchedVideo] = useState(null);
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isValidVideoId || catalogMatch) {
      setFetchedVideo(null);
      setIsFetchingVideo(false);
      return undefined;
    }

    setIsFetchingVideo(true);
    mediaService
      .fetchVideoByYouTubeId(rawV)
      .then((result) => {
        if (active) setFetchedVideo(result);
      })
      .catch(() => {
        if (active) setFetchedVideo(null);
      })
      .finally(() => {
        if (active) setIsFetchingVideo(false);
      });

    return () => {
      active = false;
    };
  }, [rawV, isValidVideoId, catalogMatch]);

  const matchedVideo = catalogMatch || fetchedVideo;
  const isDemoEntry = Boolean(demoId) || Boolean(matchedVideo?.isDemoOnly);
  const canEmbed = isValidVideoId && !isDemoEntry;

  const upNextVideos = useMemo(
    () =>
      videos.filter(
        (item) =>
          !item.isDemoOnly &&
          mediaService.isValidYouTubeVideoId(item.youtubeVideoId) &&
          item.youtubeVideoId !== rawV
      ),
    [videos, rawV]
  );

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    navigate(location.state?.from || '/');
  };

  const displayTitle =
    matchedVideo?.title ||
    (canEmbed ? `YouTube Video (${rawV})` : 'Video Unavailable');
  const displayChannel = matchedVideo?.channelName || 'YouTube';
  const displayInitials = matchedVideo?.channelInitials || 'YT';
  const displayCategory = matchedVideo?.category || 'Video';
  const displayDescription =
    matchedVideo?.description ||
    (canEmbed
      ? 'Loaded directly from the YouTube video ID in the URL. Use Open on YouTube if the owner restricts external embedding.'
      : '');
  const youtubeUrl = canEmbed
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(rawV)}`
    : null;
  const bookmarked = canEmbed ? isBookmarked(rawV) : false;

  return (
    <div className="space-y-6">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {youtubeUrl && (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/50 transition-colors"
          >
            <span>Open on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Primary Player + Details Column */}
        <div className="xl:col-span-2 space-y-5">
          {/* 16:9 Player or Graceful Error / Demo State */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            {canEmbed ? (
              <iframe
                key={rawV}
                src={`https://www.youtube.com/embed/${encodeURIComponent(
                  rawV
                )}?autoplay=0&rel=0`}
                title={displayTitle}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-card)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] mb-4">
                  {isDemoEntry ? (
                    <Film className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                  {isDemoEntry
                    ? 'Demo-only entry — no YouTube video attached'
                    : rawV
                      ? 'Invalid or unavailable YouTube video ID'
                      : 'No YouTube video selected'}
                </h2>

                <p className="text-sm text-[var(--text-secondary)] max-w-md mt-1.5 leading-relaxed">
                  {isDemoEntry
                    ? 'This catalog card is a demo placeholder without a verified YouTube video ID. Pick one of the verified YouTube videos in the sidebar to test live playback.'
                    : rawV
                      ? `The value "${rawV}" is not a valid 11-character YouTube video ID.`
                      : 'Open any verified video card or pass a valid ?v=VIDEO_ID parameter in the URL.'}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Return to Home
                  </Link>
                  {upNextVideos[0] && (
                    <Link
                      to={`/watch?v=${encodeURIComponent(
                        upNextVideos[0].youtubeVideoId
                      )}`}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors"
                    >
                      Watch verified sample
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Video Metadata Card */}
          {(canEmbed || matchedVideo) && (
            <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4">
              {isFetchingVideo ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-5 w-2/3 rounded bg-[var(--bg-elevated)]" />
                  <div className="h-4 w-1/3 rounded bg-[var(--bg-elevated)]" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--accent-primary)] border border-[var(--border-subtle)]">
                          {displayCategory}
                        </span>
                        {isDemoEntry && (
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            Demo-only placeholder
                          </span>
                        )}
                      </div>

                      <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] leading-snug">
                        {displayTitle}
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {canEmbed && (
                        <button
                          type="button"
                          disabled={pendingActions.watchLater}
                          onClick={() => void toggleWatchLater(rawV)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer disabled:opacity-60 ${
                            bookmarked
                              ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border-[var(--accent-primary)]/50'
                              : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/50'
                          }`}
                        >
                          {bookmarked ? (
                            <>
                              <BookmarkCheck className="w-4 h-4" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4" />
                              <span>Watch Later</span>
                            </>
                          )}
                        </button>
                      )}

                      {youtubeUrl && (
                        <a
                          href={youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
                        >
                          <span>Open on YouTube</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-semibold text-[var(--text-primary)]">
                        {displayInitials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {displayChannel}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {matchedVideo
                            ? `${matchedVideo.views} views · ${matchedVideo.publishedAt}`
                            : `Video ID: ${rawV}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {displayDescription && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
                      {displayDescription}
                    </p>
                  )}
                </>
              )}
            </section>
          )}
        </div>

        {/* Up Next / Verified Playable Videos */}
        <aside className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              More Playable Videos
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Verified YouTube embeds ready to watch
            </p>
          </div>

          <div className="space-y-3">
            {upNextVideos.map((item) => (
              <Link
                key={item.id}
                to={`/watch?v=${encodeURIComponent(item.youtubeVideoId)}`}
                state={{ from: location.state?.from || '/' }}
                className="group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div className="relative w-32 aspect-video rounded-md overflow-hidden bg-[var(--bg-elevated)] shrink-0 border border-[var(--border-subtle)]">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-[var(--accent-primary)]" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-medium bg-[#171614]/90 text-[#F2EEE7]">
                    {item.duration}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 truncate">
                    {item.channelName}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {item.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
