import { useEffect } from 'react';
import {
  X,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Eye,
  Radio,
  Play,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export function MediaPreviewModal() {
  const { selectedMedia, closeMediaModal, isBookmarked, toggleWatchLater } = useMedia();

  useEffect(() => {
    if (!selectedMedia) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMediaModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, closeMediaModal]);

  if (!selectedMedia) return null;

  const isVideo = selectedMedia.type === 'video';
  const item = selectedMedia.item;
  const bookmarked = isVideo ? isBookmarked(item.id) : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={closeMediaModal}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview visual */}
        <div className="relative aspect-video bg-[var(--bg-elevated)] overflow-hidden">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : null}

          <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#171614]/90 border border-[#38332E] flex items-center justify-center text-[var(--accent-primary)] mb-3">
              {isVideo ? <Play className="w-5 h-5 fill-current ml-0.5" /> : <Radio className="w-5 h-5" />}
            </div>
            <p className="text-xs uppercase tracking-wider font-medium text-[#A8A29A]">
              {isVideo ? 'YouTube Video Preview' : 'Twitch Stream Preview'}
            </p>
            <p className="text-sm text-[#F2EEE7] mt-1 max-w-md">
              {isVideo
                ? 'Added to your Watch History. Open externally or manage your Watch Later queue below.'
                : item.isLive
                  ? `${item.displayName} is currently live in ${item.game}.`
                  : `${item.displayName} is currently offline.`}
            </p>
          </div>

          <button
            type="button"
            onClick={closeMediaModal}
            aria-label="Close preview"
            className="absolute top-3 right-3 p-2 rounded-lg bg-[#171614]/90 text-[#F2EEE7] border border-[#38332E] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {!isVideo && item.isLive && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-[var(--badge-live)] text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE · {item.viewerCount.toLocaleString()} watching
            </span>
          )}
        </div>

        {/* Details */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--accent-primary)] border border-[var(--border-subtle)] mb-2">
                {item.category}
              </span>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                {item.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {isVideo
                  ? `${item.channelName} · ${item.views} views · ${item.publishedAt}`
                  : `${item.displayName} (@${item.streamerName}) · ${item.game}`}
              </p>
            </div>
          </div>

          {isVideo && item.description && (
            <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
              {item.description}
            </p>
          )}

          {!isVideo && item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-xs bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isVideo && (
                <button
                  type="button"
                  onClick={() => toggleWatchLater(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                    bookmarked
                      ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border-[var(--accent-primary)]/50'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/50'
                  }`}
                >
                  {bookmarked ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" />
                      Saved in Watch Later
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      Save to Watch Later
                    </>
                  )}
                </button>
              )}

              {!isVideo && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <Eye className="w-4 h-4 text-[var(--accent-primary)]" />
                  {item.isLive
                    ? `Live for ${item.startedAt}`
                    : 'Stream currently offline'}
                </span>
              )}
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
            >
              <span>Open on {isVideo ? 'YouTube' : 'Twitch'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

