import { useState } from 'react';
import { Eye, Radio } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

function formatViewers(count) {
  if (!count) return '0';
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(count);
}

export function LiveCard({ stream }) {
  const { openStream, compactDensity } = useMedia();
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group flex flex-col rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-elevated)]/70 transition-colors duration-150 overflow-hidden">
      <button
        type="button"
        onClick={() => openStream(stream)}
        className="relative aspect-video w-full bg-[var(--bg-elevated)] overflow-hidden text-left cursor-pointer focus:outline-none"
        aria-label={`Open stream ${stream.displayName}: ${stream.title}`}
      >
        {!imgError && stream.thumbnail ? (
          <img
            src={stream.thumbnail}
            alt={stream.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
              !stream.isLive ? 'opacity-50 grayscale' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-secondary)] p-4">
            <Radio className="w-7 h-7 mb-1.5 text-[var(--accent-primary)]" />
            <span className="text-xs font-medium">{stream.game}</span>
          </div>
        )}

        {/* Top-left LIVE indicator */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {stream.isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-[var(--badge-live)] text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium uppercase bg-[#171614]/90 text-[#A8A29A] border border-[#38332E]">
              OFFLINE
            </span>
          )}
        </div>

        {/* Bottom-left viewer count */}
        {stream.isLive && (
          <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[#171614]/90 text-[#F2EEE7] border border-[#38332E]/80">
            <Eye className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>{formatViewers(stream.viewerCount)}</span>
          </div>
        )}

        {/* Bottom-right uptime */}
        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#171614]/90 text-[#A8A29A] border border-[#38332E]/80">
          {stream.startedAt}
        </span>
      </button>

      <div className={compactDensity ? 'p-3 flex-1 flex flex-col' : 'p-4 flex-1 flex flex-col'}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-semibold text-[var(--text-primary)] shrink-0">
            {stream.avatarInitials}
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => openStream(stream)}
              className="text-left focus:outline-none cursor-pointer w-full"
            >
              <h3 className="text-sm font-medium leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-150 line-clamp-2">
                {stream.title}
              </h3>
            </button>

            <p className="text-xs font-medium text-[var(--text-primary)]/85 mt-1 truncate">
              {stream.displayName}{' '}
              <span className="text-[var(--text-secondary)] font-normal">
                · @{stream.streamerName}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-xs">
          <span className="text-[var(--text-secondary)] truncate">{stream.game}</span>
          <span className="shrink-0 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {stream.category}
          </span>
        </div>
      </div>
    </article>
  );
}

