import { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  ExternalLink,
  Users,
  Video as VideoIcon,
  Check,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { SectionHeader } from '../components/SectionHeader';
import { VideoCard } from '../components/VideoCard';
import { EmptyState } from '../components/EmptyState';

const TOPIC_OPTIONS = ['Programming', 'Gaming', 'Formula 1', 'Music', 'Technology'];

export function FollowingPage() {
  const {
    channels,
    videos,
    searchQuery,
    addChannel,
    removeChannel,
  } = useMedia();

  const [channelInput, setChannelInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Programming');
  const [selectedChannelId, setSelectedChannelId] = useState('all');
  const [formFeedback, setFormFeedback] = useState(null);

  const handleAddChannel = (e) => {
    e.preventDefault();
    const res = addChannel(channelInput, selectedCategory);
    if (res.error) {
      setFormFeedback({ type: 'error', message: res.error });
      return;
    }
    setChannelInput('');
    setFormFeedback({
      type: 'success',
      message: `Added ${res.channel.name} (${res.channel.handle}) to Following.`,
    });
  };

  const subscribedIds = useMemo(
    () => new Set(channels.map((c) => c.id)),
    [channels]
  );

  const channelVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return videos.filter((video) => {
      if (!subscribedIds.has(video.channelId)) return false;
      if (selectedChannelId !== 'all' && video.channelId !== selectedChannelId) {
        return false;
      }
      if (!q) return true;
      return (
        video.title.toLowerCase().includes(q) ||
        video.channelName.toLowerCase().includes(q) ||
        video.category.toLowerCase().includes(q)
      );
    });
  }, [videos, subscribedIds, selectedChannelId, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Channel Management Panel */}
      <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6">
        <SectionHeader
          title="YouTube Channels"
          subtitle="Add YouTube channel URLs or handles to organize your personal feed"
          badge={
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {channels.length} followed
            </span>
          }
        />

        <form
          onSubmit={handleAddChannel}
          className="flex flex-col sm:flex-row gap-3 mt-4"
        >
          <input
            type="text"
            value={channelInput}
            onChange={(e) => {
              setChannelInput(e.target.value);
              if (formFeedback) setFormFeedback(null);
            }}
            placeholder="https://youtube.com/@veritasium or @handle"
            aria-label="YouTube channel URL or handle"
            className="flex-1 bg-[var(--bg-main)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Channel category"
            className="bg-[var(--bg-main)] text-[var(--text-primary)] text-sm px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            {TOPIC_OPTIONS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Channel
          </button>
        </form>

        {formFeedback && (
          <p
            className={`mt-2.5 text-xs flex items-center gap-1.5 ${
              formFeedback.type === 'error'
                ? 'text-[#E57368]'
                : 'text-[var(--accent-primary)]'
            }`}
          >
            {formFeedback.type === 'success' && <Check className="w-3.5 h-3.5" />}
            {formFeedback.message}
          </p>
        )}

        {/* Subscribed channels grid */}
        {channels.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title="No followed channels yet"
              description="Add a YouTube channel URL above to start building your Following feed."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-6">
            {channels.map((channel) => {
              const isSelected = selectedChannelId === channel.id;
              return (
                <div
                  key={channel.id}
                  className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]/60'
                      : 'bg-[var(--bg-main)]/60 border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedChannelId(isSelected ? 'all' : channel.id)
                    }
                    className="flex items-start gap-3 text-left min-w-0 flex-1 cursor-pointer focus:outline-none"
                  >
                    <span className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-semibold text-[var(--accent-primary)] shrink-0">
                      {channel.avatarInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {channel.name}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
                          {channel.category}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                        {channel.handle} · {channel.subscribers} subscribers
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]/85 line-clamp-1 mt-1">
                        {channel.description}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${channel.name} on YouTube`}
                      title="Open on YouTube"
                      className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedChannelId === channel.id) {
                          setSelectedChannelId('all');
                        }
                        removeChannel(channel.id);
                      }}
                      aria-label={`Unfollow ${channel.name}`}
                      title="Remove channel"
                      className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[#E57368] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Latest Uploads from Subscribed Channels */}
      <section>
        <SectionHeader
          title="Latest Uploads"
          subtitle={
            selectedChannelId === 'all'
              ? 'Recent videos from your followed channels (click a channel above to filter)'
              : `Filtered to ${
                  channels.find((c) => c.id === selectedChannelId)?.name || 'channel'
                }`
          }
          rightSlot={
            selectedChannelId !== 'all' ? (
              <button
                type="button"
                onClick={() => setSelectedChannelId('all')}
                className="text-xs font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Show all channels
              </button>
            ) : null
          }
        />

        {channelVideos.length === 0 ? (
          <EmptyState
            icon={VideoIcon}
            title="No videos available"
            description="Follow a creator with uploads in our catalog or clear your active search/channel filter."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {channelVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

