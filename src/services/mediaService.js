import { CATEGORIES, EXPLORE_TOPICS } from '../data/categories';
import { INITIAL_CHANNELS } from '../data/channels';
import { MOCK_VIDEOS } from '../data/videos';
import { INITIAL_STREAMS } from '../data/streams';
import { INITIAL_HISTORY } from '../data/history';

/**
 * Abstraction layer for media data.
 * Currently backed by local mock data; structured so each method
 * can be swapped with Spring Boot REST API calls later.
 */
export const mediaService = {
  getCategories() {
    return CATEGORIES;
  },

  getExploreTopics() {
    return EXPLORE_TOPICS;
  },

  getInitialChannels() {
    return INITIAL_CHANNELS;
  },

  getVideos() {
    return MOCK_VIDEOS;
  },

  getInitialStreams() {
    return INITIAL_STREAMS;
  },

  getInitialHistory() {
    return INITIAL_HISTORY;
  },

  parseYouTubeChannelInput(rawInput, category = 'Technology') {
    const trimmed = rawInput.trim();
    if (!trimmed) return { error: 'Please enter a YouTube channel URL or @handle.' };

    let handle = '';
    let url = trimmed;

    try {
      const normalizedUrl = trimmed.startsWith('http')
        ? trimmed
        : trimmed.includes('youtube.com') || trimmed.includes('youtu.be')
          ? `https://${trimmed}`
          : null;

      if (normalizedUrl) {
        const parsed = new URL(normalizedUrl);
        if (!parsed.hostname.includes('youtube.com') && !parsed.hostname.includes('youtu.be')) {
          return { error: 'Please enter a valid youtube.com channel URL or @handle.' };
        }
        const segments = parsed.pathname.split('/').filter(Boolean);
        handle = segments[segments.length - 1] || '';
        url = parsed.toString();
      } else {
        handle = trimmed.replace(/^@/, '');
        url = `https://www.youtube.com/@${handle}`;
      }
    } catch {
      return { error: 'Invalid YouTube URL format.' };
    }

    const cleanSlug = handle.replace(/^@/, '').replace(/[^a-zA-Z0-9._-]/g, '');
    if (!cleanSlug) {
      return { error: 'Could not extract a channel handle from that URL.' };
    }

    const formattedName = cleanSlug
      .split(/[-_.]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const initials = formattedName
      .split(' ')
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || 'YT';

    return {
      channel: {
        id: `ch-${cleanSlug.toLowerCase()}-${Date.now()}`,
        name: formattedName || cleanSlug,
        handle: `@${cleanSlug}`,
        url,
        category,
        subscribers: 'New',
        avatarInitials: initials,
        description: `Manually added YouTube channel (${url}).`,
        addedAt: new Date().toISOString().slice(0, 10),
      },
    };
  },

  parseTwitchStreamerInput(rawInput, category = 'Gaming') {
    const trimmed = rawInput.trim();
    if (!trimmed) return { error: 'Please enter a Twitch channel URL or username.' };

    let username = '';
    let url = '';

    try {
      const hasDomain = trimmed.includes('twitch.tv');
      if (trimmed.startsWith('http') || hasDomain) {
        const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const parsed = new URL(normalized);
        if (!parsed.hostname.includes('twitch.tv')) {
          return { error: 'Please enter a valid twitch.tv URL or username.' };
        }
        const segments = parsed.pathname.split('/').filter(Boolean);
        username = (segments[0] || '').toLowerCase();
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
        id: `tw-${cleanUsername}-${Date.now()}`,
        streamerName: cleanUsername,
        displayName: displayName || cleanUsername,
        url,
        title: `${displayName || cleanUsername} — Live stream feed ready`,
        game: category === 'Programming' ? 'Software and Game Development' : category,
        category,
        viewerCount: 420,
        isLive: true,
        startedAt: 'Just added',
        avatarInitials: initials,
        thumbnail:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        tags: [category, 'Tracked'],
      },
    };
  },
};

