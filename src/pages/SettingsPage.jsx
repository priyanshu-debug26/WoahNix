import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Youtube,
  Radio,
  Plus,
  Trash2,
  Check,
  Palette,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';

const TOPIC_OPTIONS = ['Programming', 'Gaming', 'Formula 1', 'Music', 'Technology'];

const THEMES = [
  {
    id: 'warm-dark',
    name: 'Warm Charcoal',
    description: 'Default WoahNix dark theme (#171614)',
    swatches: ['#171614', '#24211E', '#D97745'],
  },
  {
    id: 'deep-slate',
    name: 'Deep Slate',
    description: 'Cooler neutral dark surface (#111214)',
    swatches: ['#111214', '#1D1F23', '#D97745'],
  },
  {
    id: 'warm-light',
    name: 'Warm Paper',
    description: 'Soft daytime parchment palette (#F6F3EE)',
    swatches: ['#F6F3EE', '#FFFFFF', '#C86432'],
  },
];

export function SettingsPage() {
  const {
    channels,
    addChannel,
    removeChannel,
    streams,
    addStreamer,
    removeStreamer,
    toggleStreamLive,
    interests,
    toggleInterest,
    theme,
    setTheme,
    compactDensity,
    setCompactDensity,
  } = useMedia();

  const [ytInput, setYtInput] = useState('');
  const [ytCategory, setYtCategory] = useState('Programming');
  const [ytFeedback, setYtFeedback] = useState(null);

  const [twitchInput, setTwitchInput] = useState('');
  const [twitchCategory, setTwitchCategory] = useState('Gaming');
  const [twitchFeedback, setTwitchFeedback] = useState(null);

  const handleAddYouTube = (e) => {
    e.preventDefault();
    const res = addChannel(ytInput, ytCategory);
    if (res.error) {
      setYtFeedback({ type: 'error', message: res.error });
      return;
    }
    setYtInput('');
    setYtFeedback({
      type: 'success',
      message: `Added ${res.channel.name} (${res.channel.handle}).`,
    });
  };

  const handleAddTwitch = (e) => {
    e.preventDefault();
    const res = addStreamer(twitchInput, twitchCategory);
    if (res.error) {
      setTwitchFeedback({ type: 'error', message: res.error });
      return;
    }
    setTwitchInput('');
    setTwitchFeedback({
      type: 'success',
      message: `Added ${res.stream.displayName} (@${res.stream.streamerName}).`,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* YouTube Connection Section (Visual UI + Local Channel URL Management) */}
      <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                YouTube Connection
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Visual preview for future Google OAuth sync. Channels are currently tracked locally via URL.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
            Local URL Mode
          </span>
        </div>

        <form onSubmit={handleAddYouTube} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={ytInput}
            onChange={(e) => {
              setYtInput(e.target.value);
              if (ytFeedback) setYtFeedback(null);
            }}
            placeholder="https://www.youtube.com/@handle"
            aria-label="YouTube channel URL"
            className="flex-1 bg-[var(--bg-main)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <select
            value={ytCategory}
            onChange={(e) => setYtCategory(e.target.value)}
            aria-label="YouTube channel category"
            className="bg-[var(--bg-main)] text-[var(--text-primary)] text-sm px-3 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            {TOPIC_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add URL
          </button>
        </form>

        {ytFeedback && (
          <p
            className={`text-xs ${
              ytFeedback.type === 'error'
                ? 'text-[#E57368]'
                : 'text-[var(--accent-primary)]'
            }`}
          >
            {ytFeedback.message}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Tracked YouTube channels ({channels.length})</span>
            <Link to="/following" className="text-[var(--accent-primary)] hover:underline">
              Open Following page
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
            {channels.length === 0 ? (
              <p className="p-4 text-xs text-[var(--text-secondary)]">
                No YouTube channels added yet.
              </p>
            ) : (
              channels.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {ch.name}{' '}
                      <span className="text-xs font-normal text-[var(--text-secondary)]">
                        {ch.handle}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {ch.category} · {ch.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChannel(ch.id)}
                    aria-label={`Remove ${ch.name}`}
                    className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[#E57368] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Twitch Streamer Management Section */}
      <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Twitch Streamer Management
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Add or remove Twitch streamer URLs manually. Toggle live status to preview Live feed states.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
            Manual Stream List
          </span>
        </div>

        <form onSubmit={handleAddTwitch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={twitchInput}
            onChange={(e) => {
              setTwitchInput(e.target.value);
              if (twitchFeedback) setTwitchFeedback(null);
            }}
            placeholder="https://www.twitch.tv/streamer_name"
            aria-label="Twitch streamer URL"
            className="flex-1 bg-[var(--bg-main)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <select
            value={twitchCategory}
            onChange={(e) => setTwitchCategory(e.target.value)}
            aria-label="Twitch streamer category"
            className="bg-[var(--bg-main)] text-[var(--text-primary)] text-sm px-3 py-2 rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            {TOPIC_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Streamer
          </button>
        </form>

        {twitchFeedback && (
          <p
            className={`text-xs ${
              twitchFeedback.type === 'error'
                ? 'text-[#E57368]'
                : 'text-[var(--accent-primary)]'
            }`}
          >
            {twitchFeedback.message}
          </p>
        )}

        <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
          {streams.length === 0 ? (
            <p className="p-4 text-xs text-[var(--text-secondary)]">
              No Twitch streamers tracked yet.
            </p>
          ) : (
            streams.map((st) => (
              <div
                key={st.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {st.displayName}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        st.isLive
                          ? 'bg-[var(--badge-live)]/20 text-[#E57368]'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {st.isLive ? 'Live' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                    @{st.streamerName} · {st.category} · {st.url}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStreamLive(st.id)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  >
                    {st.isLive ? 'Set Offline' : 'Set Live'}
                  </button>
                  <a
                    href={st.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${st.displayName} on Twitch`}
                    className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeStreamer(st.id)}
                    aria-label={`Remove ${st.displayName}`}
                    className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[#E57368] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Interest / Topic Preferences */}
      <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Interest & Topic Preferences
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Select the subjects you want featured in Recommended For You on Home.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {TOPIC_OPTIONS.map((topic) => {
            const active = interests.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggleInterest(topic)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border-[var(--accent-primary)]/60'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
                <span>{topic}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Appearance Preferences */}
      <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Appearance Preferences
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Choose your preferred color surface and card density. Saved automatically in your browser.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  selected
                    ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-main)]/60 border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    {t.swatches.map((hex) => (
                      <span
                        key={hex}
                        className="w-4 h-4 rounded border border-white/15"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  {selected && (
                    <Check className="w-4 h-4 text-[var(--accent-primary)]" />
                  )}
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 pt-3 border-t border-[var(--border-subtle)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Compact card spacing
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Reduces inner card padding so more titles fit on screen.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={compactDensity}
            onClick={() => setCompactDensity((prev) => !prev)}
            className={`w-11 h-6 rounded-md p-0.5 transition-colors cursor-pointer border ${
              compactDensity
                ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-sm bg-[#171614] transition-transform ${
                compactDensity ? 'translate-x-5 bg-[#171614]' : 'translate-x-0 bg-[var(--text-secondary)]'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}

