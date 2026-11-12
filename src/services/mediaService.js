import { CATEGORIES, EXPLORE_TOPICS, TOPIC_OPTIONS } from '../data/categories.js';
import { INITIAL_CHANNELS } from '../data/channels.js';
import { MOCK_VIDEOS } from '../data/videos.js';
import { INITIAL_STREAMS } from '../data/streams.js';
import { API_BASE_URL, USE_BACKEND_API, apiClient } from './apiClient.js';

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_CHANNEL_ID_REGEX = /^UC[A-Za-z0-9_-]{22}$/;

const DEFAULT_PREFERENCES = {
  interests: [...TOPIC_OPTIONS],
  theme: 'warm-dark',
  compactDensity: false,
};

const DEFAULT_YOUTUBE_INTEGRATION = {
  connected: false,
  channelTitle: null,
  consentGranted: false,
  lastSyncedAt: null,
};

const BACKEND_REQUIRED_MESSAGE =
  'Backend API is not connected yet (VITE_USE_BACKEND_API=false).';

/**
 * Service layer separating UI/context state from data retrieval and mutations.
 * Uses mock catalog data when VITE_USE_BACKEND_API is false, and connects cleanly
 * to Spring Boot REST endpoints via `apiClient` when enabled.
 */
export const mediaService = {
  isValidYouTubeVideoId(videoId) {
    return typeof videoId === 'string' && YOUTUBE_ID_REGEX.test(videoId.trim());
  },

  extractYouTubeVideoId(source) {
    if (!source) return null;

    if (typeof source === 'object') {
      if (this.isValidYouTubeVideoId(source.youtubeVideoId)) {
        return source.youtubeVideoId.trim();
      }
      if (source.url) {
        return this.extractYouTubeVideoId(source.url);
      }
      return null;
    }

    if (typeof source !== 'string') return null;
    const trimmed = source.trim();
    if (this.isValidYouTubeVideoId(trimmed)) return trimmed;

    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
        const id = parsed.pathname.split('/').filter(Boolean)[0];
        return this.isValidYouTubeVideoId(id) ? id : null;
      }

      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        const vParam = parsed.searchParams.get('v');
        if (this.isValidYouTubeVideoId(vParam)) return vParam;

        const segments = parsed.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live', 'v'].includes(segments[0])) {
          return this.isValidYouTubeVideoId(segments[1]) ? segments[1] : null;
        }
      }
    } catch {
      return null;
    }

    return null;
  },

  matchesSearchQuery(textFields, query) {
    if (!query || !query.trim()) return true;
    const q = query.trim().toLowerCase();
    return textFields.some((field) => field && field.toLowerCase().includes(q));
  },

  filterVideos(videos, { category = 'All', query = '', channelId = 'all', allowedInterests = null } = {}) {
    return videos.filter((video) => {
      if (channelId !== 'all' && video.channelId !== channelId) {
        return false;
      }

      if (category !== 'All') {
        if (video.category !== category) return false;
      } else if (Array.isArray(allowedInterests) && allowedInterests.length > 0) {
        if (!allowedInterests.includes(video.category)) return false;
      }

      return this.matchesSearchQuery(
        [video.title, video.channelName, video.category, video.description],
        query
      );
    });
  },

  filterStreams(streams, { category = 'All', query = '', onlyLive = true } = {}) {
    return streams.filter((stream) => {
      if (onlyLive && !stream.isLive) return false;
      if (category !== 'All' && stream.category !== category) return false;
      return this.matchesSearchQuery(
        [stream.displayName, stream.streamerName, stream.title, stream.game, stream.category],
        query
      );
    });
  },

  getCategories() {
    return CATEGORIES;
  },

  getTopicOptions() {
    return TOPIC_OPTIONS;
  },

  getExploreTopics() {
    return EXPLORE_TOPICS;
  },

  getDefaultPreferences() {
    return DEFAULT_PREFERENCES;
  },

  getDefaultYouTubeIntegration() {
    return DEFAULT_YOUTUBE_INTEGRATION;
  },

  async fetchPublicCatalog() {
    if (!USE_BACKEND_API) {
      return {
        videos: MOCK_VIDEOS,
        streams: INITIAL_STREAMS,
        categories: CATEGORIES,
        exploreTopics: EXPLORE_TOPICS,
      };
    }

    const [videos, streams, categories] = await Promise.all([
      apiClient.get('/videos/explore'),
      apiClient.get('/streams/live'),
      apiClient.get('/categories'),
    ]);

    return {
      videos,
      streams,
      categories: categories || CATEGORIES,
      exploreTopics: EXPLORE_TOPICS,
    };
  },

  async fetchAuthenticatedWorkspace() {
    if (!USE_BACKEND_API) {
      return {
        channels: INITIAL_CHANNELS,
        streams: INITIAL_STREAMS,
        watchLaterIds: [],
        preferences: DEFAULT_PREFERENCES,
        youtubeIntegration: DEFAULT_YOUTUBE_INTEGRATION,
      };
    }

    return apiClient.get('/me/bootstrap');
  },

  async fetchVideoByYouTubeId(youtubeVideoId) {
    if (!USE_BACKEND_API) {
      return (
        MOCK_VIDEOS.find(
          (item) => !item.isDemoOnly && item.youtubeVideoId === youtubeVideoId
        ) || null
      );
    }
    return apiClient.get(`/videos/${encodeURIComponent(youtubeVideoId)}`);
  },

  async addYouTubeSubscription(rawInput, category = 'Technology') {
    const parsed = this.parseYouTubeChannelInput(rawInput, category);
    if (parsed.error) {
      return { error: parsed.error };
    }

    if (!USE_BACKEND_API) {
      return { channel: parsed.channel };
    }

    const channel = await apiClient.post('/subscriptions/youtube', {
      input: rawInput.trim(),
      category,
      parsedChannel: parsed.channel,
    });
    return { channel };
  },

  async removeYouTubeSubscription(channelId) {
    if (!USE_BACKEND_API) return;
    await apiClient.delete(`/subscriptions/youtube/${encodeURIComponent(channelId)}`);
  },

  async addTwitchSubscription(rawInput, category = 'Gaming') {
    const parsed = this.parseTwitchStreamerInput(rawInput, category);
    if (parsed.error) {
      return { error: parsed.error };
    }

    if (!USE_BACKEND_API) {
      return { stream: parsed.stream };
    }

    const stream = await apiClient.post('/subscriptions/twitch', {
      input: rawInput.trim(),
      streamerName: parsed.stream.streamerName,
      category,
    });
    return { stream };
  },

  async removeTwitchSubscription(streamerId) {
    if (!USE_BACKEND_API) return;
    await apiClient.delete(`/subscriptions/twitch/${encodeURIComponent(streamerId)}`);
  },

  async syncWatchLater(youtubeVideoId, saved) {
    if (!USE_BACKEND_API) {
      return { youtubeVideoId, saved };
    }
    if (saved) {
      return apiClient.put(`/watch-later/${encodeURIComponent(youtubeVideoId)}`);
    }
    return apiClient.delete(`/watch-later/${encodeURIComponent(youtubeVideoId)}`);
  },

  async syncPreferences(preferences) {
    if (!USE_BACKEND_API) {
      return preferences;
    }
    return apiClient.put('/preferences', preferences);
  },

  getYouTubeConnectUrl() {
    return `${API_BASE_URL}/integrations/youtube/connect`;
  },

  async importYouTubeSubscriptions() {
    if (!USE_BACKEND_API) {
      throw new Error(BACKEND_REQUIRED_MESSAGE);
    }
    return apiClient.post('/integrations/youtube/import');
  },

  async resyncYouTubeSubscriptions() {
    if (!USE_BACKEND_API) {
      throw new Error(BACKEND_REQUIRED_MESSAGE);
    }
    return apiClient.post('/integrations/youtube/sync');
  },

  async disconnectYouTube() {
    if (!USE_BACKEND_API) {
      throw new Error(BACKEND_REQUIRED_MESSAGE);
    }
    return apiClient.delete('/integrations/youtube');
  },

  parseYouTubeChannelInput(rawInput, category = 'Technology') {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { error: 'Please enter a YouTube channel URL or @handle.' };
    }

    let handleSlug = '';
    let canonicalChannelId = null;
    let normalizedUrl = '';

    try {
      const hasUrlSyntax =
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.includes('youtube.com') ||
        trimmed.includes('youtu.be');

      if (hasUrlSyntax) {
        const candidateUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const parsed = new URL(candidateUrl);
        const host = parsed.hostname.replace(/^www\./, '');

        if (host === 'youtu.be' || parsed.pathname === '/watch') {
          return { error: 'Please enter a YouTube channel URL, not a video URL.' };
        }
        if (host !== 'youtube.com' && host !== 'm.youtube.com') {
          return { error: 'Please enter a valid youtube.com channel URL or @handle.' };
        }

        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length === 0) {
          return { error: 'Please enter a specific YouTube channel URL.' };
        }

        if (['watch', 'shorts', 'embed', 'live', 'playlist'].includes(segments[0])) {
          return { error: 'Please enter a YouTube channel URL, not a video or playlist URL.' };
        }

        const handleSegment = segments.find((seg) => seg.startsWith('@'));
        if (handleSegment) {
          handleSlug = handleSegment.slice(1);
          normalizedUrl = `https://www.youtube.com/@${handleSlug}`;
        } else if (segments[0] === 'channel' && segments[1]) {
          if (!YOUTUBE_CHANNEL_ID_REGEX.test(segments[1])) {
            return { error: 'Invalid YouTube channel ID format (expected UC...).' };
          }
          canonicalChannelId = segments[1];
          handleSlug = segments[1];
          normalizedUrl = `https://www.youtube.com/channel/${canonicalChannelId}`;
        } else if (['c', 'user'].includes(segments[0]) && segments[1]) {
          handleSlug = segments[1];
          normalizedUrl = `https://www.youtube.com/${segments[0]}/${handleSlug}`;
        } else {
          handleSlug = segments[0];
          normalizedUrl = `https://www.youtube.com/@${handleSlug}`;
        }
      } else {
        handleSlug = trimmed.replace(/^@/, '');
        if (YOUTUBE_CHANNEL_ID_REGEX.test(handleSlug)) {
          canonicalChannelId = handleSlug;
          normalizedUrl = `https://www.youtube.com/channel/${canonicalChannelId}`;
        } else {
          normalizedUrl = `https://www.youtube.com/@${handleSlug}`;
        }
      }
    } catch {
      return { error: 'Invalid YouTube URL format.' };
    }

    const cleanSlug = handleSlug.replace(/[^a-zA-Z0-9._-]/g, '');
    if (!cleanSlug) {
      return { error: 'Could not extract a channel identifier from that URL.' };
    }

    const formattedName = canonicalChannelId
      ? canonicalChannelId
      : cleanSlug
          .split(/[-_.]/)
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

    const initials = canonicalChannelId
      ? 'YT'
      : formattedName
          .split(' ')
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join('') || 'YT';

    const platformKey = canonicalChannelId || `@${cleanSlug.toLowerCase()}`;

    return {
      channel: {
        id: platformKey,
        youtubeChannelId: canonicalChannelId,
        name: formattedName || cleanSlug,
        handle: canonicalChannelId ? canonicalChannelId : `@${cleanSlug}`,
        url: normalizedUrl,
        category,
        subscribers: 'Pending sync',
        avatarInitials: initials,
        description: `Queued for YouTube channel sync (${normalizedUrl}).`,
        addedAt: new Date().toISOString().slice(0, 10),
      },
    };
  },

  parseTwitchStreamerInput(rawInput, category = 'Gaming') {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { error: 'Please enter a Twitch channel URL or username.' };
    }

    let username = '';
    let url = '';

    try {
      const hasDomain = trimmed.includes('twitch.tv');
      if (trimmed.startsWith('http') || hasDomain) {
        const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const parsed = new URL(normalized);
        const host = parsed.hostname.replace(/^www\./, '');
        if (host !== 'twitch.tv' && host !== 'm.twitch.tv') {
          return { error: 'Please enter a valid twitch.tv URL or username.' };
        }
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length === 0 || ['directory', 'videos', 'downloads', 'jobs'].includes(segments[0])) {
          return { error: 'Please enter a valid Twitch streamer URL.' };
        }
        username = segments[0].toLowerCase();
        url = `https://www.twitch.tv/${username}`;
      } else {
        username = trimmed.replace(/^@/, '').toLowerCase();
        url = `https://www.twitch.tv/${username}`;
      }
    } catch {
      return { error: 'Invalid Twitch URL format.' };
    }

    const cleanUsername = username.replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      return { error: 'Could not extract a Twitch username from that input.' };
    }

    const displayName = cleanUsername
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const initials = displayName
      .split(' ')
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || 'TW';

    return {
      stream: {
        id: cleanUsername,
        twitchUserId: null,
        streamerName: cleanUsername,
        displayName: displayName || cleanUsername,
        url,
        title: `${displayName || cleanUsername} — Pending live status sync`,
        game: category === 'Programming' ? 'Software and Game Development' : category,
        category,
        viewerCount: 0,
        isLive: false,
        startedAt: 'Offline',
        avatarInitials: initials,
        thumbnail: null,
        tags: [category],
      },
    };
  },
};
