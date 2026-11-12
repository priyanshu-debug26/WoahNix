import { useState } from 'react';
import { Bookmark, BookmarkCheck, Play, Trash2 } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export function VideoCard({
  video,
  watchedAt,
  progress,
  onRemoveHistory,
}) {
  const { isBookmarked, toggleWatchLater, openVideo, compactDensity } = useMedia();
  const [imgError, setImgError] = useState(false);

  const bookmarked = isBookmarked(video.id);

  return (
    <article className="group flex flex-col rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/40 hover:bg-[var(--bg-elevated)]/70 transition-colors duration-150 overflow-hidden">
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => openVideo(video)}
        className="relative aspect-video w-full bg-[var(--bg-elevated)] overflow-hidden text-left cursor-pointer focus:outline-none"
        aria-label={`Watch ${video.title}`}
      >
        {!imgError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-secondary)] p-4">
            <Play className="w-7 h-7 mb-1.5 text-[var(--accent-primary)]" />
            <span className="text-xs font-medium">{video.category}</span>
          </div>
        )}

        {/* Subtle play hover indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-150 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-10 h-10 rounded-lg bg-[#171614]/90 border border-[#38332E] flex items-center justify-center text-[#F2EEE7]">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </span>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-[#171614]/90 text-[#F2EEE7] border border-[#38332E]/80">
          {video.duration}
        </span>

        {/* History progress bar */}
        {typeof progress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#171614]/80">
            <div
              className="h-full bg-[var(--accent-primary)]"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </button>

      {/* Card Body */}
      <div className={compactDensity ? 'p-3 flex-1 flex flex-col' : 'p-4 flex-1 flex flex-col'}>
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => openVideo(video)}
            className="text-left focus:outline-none cursor-pointer"
          >
            <h3 className="text-sm font-medium leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-150 line-clamp-2">
              {video.title}
            </h3>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => toggleWatchLater(video.id)}
              aria-label={bookmarked ? 'Remove from Watch Later' : 'Save to Watch Later'}
              title={bookmarked ? 'Saved to Watch Later' : 'Save to Watch Later'}
              className={`p-1.5 rounded-md border transition-colors duration-150 cursor-pointer ${
                bookmarked
                  ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border-[var(--accent-primary)]/40'
                  : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }`}
            >
              {bookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {onRemoveHistory && (
              <button
                type="button"
                onClick={() => onRemoveHistory(video.id)}
                aria-label="Remove from watch history"
                title="Remove from history"
                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors duration-150 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Channel & metadata */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-primary)] shrink-0">
              {video.channelInitials}
            </span>
            <span className="truncate font-medium text-[var(--text-primary)]/85">
              {video.channelName}
            </span>
          </div>

          <span className="shrink-0 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {video.category}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          {watchedAt ? (
            <span>Watched {watchedAt}</span>
          ) : (
            <>
              <span>{video.views} views</span>
              <span aria-hidden="true">·</span>
              <span>{video.publishedAt}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

