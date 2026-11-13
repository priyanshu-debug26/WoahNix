import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Youtube,
  Radio,
  Trash2,
  Check,
  Palette,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Unlink,
  User,
  LogOut,
  Download,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { useAuth } from '../context/AuthContext';
import { TOPIC_OPTIONS } from '../data/categories';
import { SubscriptionForm } from '../components/SubscriptionForm';

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
  const { isAuthenticated, user, logout, openAuthPrompt } = useAuth();
  const {
    channels,
    addChannel,
    removeChannel,
    streams,
    addStreamer,
    removeStreamer,
    interests,
    toggleInterest,
    theme,
    setTheme,
    compactDensity,
    setCompactDensity,
    youtubeIntegration,
    connectYouTube,
    importYouTubeSubscriptions,
    resyncYouTubeSubscriptions,
    disconnectYouTube,
    pendingActions,
  } = useMedia();

  const [youtubeConsentChecked, setYoutubeConsentChecked] = useState(false);

  const handleAddYouTube = async (rawInput, category) => {
    const res = await addChannel(rawInput, category);
    if (res.error) return { error: res.error };
    return {
      successMessage: `Added ${res.channel.name} (${res.channel.handle}).`,
    };
  };

  const handleAddTwitch = async (rawInput, category) => {
    const res = await addStreamer(rawInput, category);
    if (res.error) return { error: res.error };
    return {
      successMessage: `Added ${res.stream.displayName} (@${res.stream.streamerName}).`,
    };
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Account Status Section */}
      <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {isAuthenticated
                  ? user?.name || user?.email || 'WoahNix Account'
                  : 'Guest Session'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                {isAuthenticated
                  ? `${user?.email || 'Signed in'} · Preferences and subscriptions sync through your account.`
                  : 'Sign in or create an account to save Watch Later, personal channels, and topic interests.'}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[#E57368]/50 hover:text-[#E57368] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/register"
                className="px-3.5 py-2 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* YouTube Integration Section (Optional OAuth Permission Flow + Manual URLs) */}
      <section className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                YouTube Integration
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Optional read-only OAuth connection to import your YouTube subscriptions into Following, separate from app sign-in.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                youtubeIntegration.connected
                  ? 'bg-emerald-400'
                  : 'bg-[var(--accent-primary)]'
              }`}
            />
            {youtubeIntegration.connected ? 'YouTube Connected' : 'Not Connected'}
          </span>
        </div>

        {/* Explicit Consent & OAuth Actions */}
        <div className="rounded-lg bg-[var(--bg-main)]/60 border border-[var(--border-subtle)] p-4 space-y-4">
          {youtubeIntegration.connected ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Connected as {youtubeIntegration.channelTitle || 'YouTube Account'}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {youtubeIntegration.lastSyncedAt
                    ? `Last synchronized: ${new Date(youtubeIntegration.lastSyncedAt).toLocaleString()}`
                    : 'Ready to import or resynchronize subscriptions.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={pendingActions.youtube}
                  onClick={() => void importYouTubeSubscriptions()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Import Subscriptions</span>
                </button>
                <button
                  type="button"
                  disabled={pendingActions.youtube}
                  onClick={() => void resyncYouTubeSubscriptions()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resync</span>
                </button>
                <button
                  type="button"
                  disabled={pendingActions.youtube}
                  onClick={() => void disconnectYouTube()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[#E57368] border border-[var(--border-subtle)] hover:border-[#E57368]/40 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={youtubeConsentChecked}
                  onChange={(e) => setYoutubeConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--border-subtle)] accent-[var(--accent-primary)]"
                />
                <span className="leading-relaxed">
                  I explicitly consent to grant WoahNix read-only YouTube access (
                  <code className="text-[var(--text-primary)]">youtube.readonly</code>) solely to import my subscribed channels into Following.
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[var(--text-secondary)]">
                  You can still add channels manually below without connecting Google.
                </span>
                <button
                  type="button"
                  disabled={!youtubeConsentChecked || pendingActions.youtube}
                  onClick={() => connectYouTube()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent-primary)] text-[#171614] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Connect YouTube Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Manual Channel URL Management */}
        <div className="space-y-3 pt-1">
          <SubscriptionForm
            onSubmit={handleAddYouTube}
            placeholder="https://www.youtube.com/@handle or /channel/UC..."
            ariaLabel="YouTube channel URL"
            submitLabel="Add URL"
            defaultCategory="Programming"
            isPending={pendingActions.channels}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>
                {isAuthenticated
                  ? `Tracked YouTube channels (${channels.length})`
                  : 'Sign in to manage personal YouTube channels'}
              </span>
              <Link to="/following" className="text-[var(--accent-primary)] hover:underline">
                Open Following page
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
              {!isAuthenticated ? (
                <div className="p-4 flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                  <span>Personal YouTube channel lists are available for registered users.</span>
                  <button
                    type="button"
                    onClick={() =>
                      openAuthPrompt('Sign in to manage your personal YouTube channels.')
                    }
                    className="text-[var(--accent-primary)] font-medium hover:underline cursor-pointer shrink-0"
                  >
                    Sign in
                  </button>
                </div>
              ) : channels.length === 0 ? (
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
                      disabled={pendingActions.channels}
                      onClick={() => void removeChannel(ch.id)}
                      aria-label={`Remove ${ch.name}`}
                      className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[#E57368] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
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
                Add or remove Twitch streamer URLs. Live status updates automatically from the backend stream service.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
            Twitch Helix Ready
          </span>
        </div>

        <SubscriptionForm
          onSubmit={handleAddTwitch}
          placeholder="https://www.twitch.tv/streamer_name"
          ariaLabel="Twitch streamer URL"
          submitLabel="Add Streamer"
          defaultCategory="Gaming"
          isPending={pendingActions.streams}
        />

        <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
          {!isAuthenticated ? (
            <div className="p-4 flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
              <span>Sign in to save and manage your personal Twitch streamer list.</span>
              <button
                type="button"
                onClick={() =>
                  openAuthPrompt('Sign in to customize your Twitch streamer list.')
                }
                className="text-[var(--accent-primary)] font-medium hover:underline cursor-pointer shrink-0"
              >
                Sign in
              </button>
            </div>
          ) : streams.length === 0 ? (
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
                    disabled={pendingActions.streams}
                    onClick={() => void removeStreamer(st.id)}
                    aria-label={`Remove ${st.displayName}`}
                    className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[#E57368] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer disabled:opacity-50"
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
              {isAuthenticated
                ? 'Select the subjects you want featured in Recommended For You on Home.'
                : 'Sign in to save personal topic preferences for your Home recommendations.'}
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
                disabled={pendingActions.preferences}
                onClick={() => toggleInterest(topic)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer disabled:opacity-60 ${
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
              {isAuthenticated
                ? 'Choose your preferred color surface and card density. Synced with your account preferences.'
                : 'Choose your preferred color surface and card density for this session.'}
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
