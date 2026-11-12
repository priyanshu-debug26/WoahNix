import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { mediaService } from '../services/mediaService';
import { USE_BACKEND_API } from '../services/apiClient';
import { useAuth } from './AuthContext';

const MediaContext = createContext(null);

export function MediaProvider({ children }) {
  const { isAuthenticated, openAuthPrompt } = useAuth();
  const defaultPreferences = useMemo(
    () => mediaService.getDefaultPreferences(),
    []
  );

  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(() => mediaService.getCategories());
  const [exploreTopics, setExploreTopics] = useState(() =>
    mediaService.getExploreTopics()
  );
  const [channels, setChannels] = useState([]);
  const [streams, setStreams] = useState([]);
  const [watchLaterIds, setWatchLaterIds] = useState([]);
  const [interests, setInterests] = useState(defaultPreferences.interests);
  const [theme, setThemeState] = useState(defaultPreferences.theme);
  const [compactDensity, setCompactDensityState] = useState(
    defaultPreferences.compactDensity
  );
  const [youtubeIntegration, setYouTubeIntegration] = useState(() =>
    mediaService.getDefaultYouTubeIntegration()
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pendingActions, setPendingActions] = useState({
    channels: false,
    streams: false,
    watchLater: false,
    preferences: false,
    youtube: false,
  });
  const [actionError, setActionError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const publicCatalog = await mediaService.fetchPublicCatalog();
      setVideos(publicCatalog.videos || []);
      setCategories(publicCatalog.categories || mediaService.getCategories());
      setExploreTopics(
        publicCatalog.exploreTopics || mediaService.getExploreTopics()
      );
      setStreams(publicCatalog.streams || []);

      if (isAuthenticated) {
        const workspace = await mediaService.fetchAuthenticatedWorkspace();
        setChannels(workspace.channels || []);
        if (workspace.streams) setStreams(workspace.streams);
        setWatchLaterIds(workspace.watchLaterIds || []);
        if (workspace.preferences) {
          setInterests(workspace.preferences.interests || defaultPreferences.interests);
          setThemeState(workspace.preferences.theme || defaultPreferences.theme);
          setCompactDensityState(
            Boolean(workspace.preferences.compactDensity)
          );
        }
        setYouTubeIntegration(
          workspace.youtubeIntegration || mediaService.getDefaultYouTubeIntegration()
        );
      } else {
        setChannels([]);
        setWatchLaterIds([]);
        setInterests(defaultPreferences.interests);
        setYouTubeIntegration(mediaService.getDefaultYouTubeIntegration());
      }
    } catch (err) {
      setLoadError(err?.message || 'Failed to load WoahNix data.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, defaultPreferences]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const setActionPending = (key, value) => {
    setPendingActions((prev) => ({ ...prev, [key]: value }));
  };

  const resolveYouTubeId = useCallback((videoOrId) => {
    if (!videoOrId) return null;
    if (typeof videoOrId === 'string') {
      if (mediaService.isValidYouTubeVideoId(videoOrId)) {
        return videoOrId.trim();
      }
      const found = videos.find((v) => v.id === videoOrId);
      return found && !found.isDemoOnly
        ? mediaService.extractYouTubeVideoId(found)
        : null;
    }
    if (videoOrId.isDemoOnly) return null;
    return mediaService.extractYouTubeVideoId(videoOrId);
  }, [videos]);

  const isBookmarked = useCallback(
    (videoOrId) => {
      const ytId = resolveYouTubeId(videoOrId);
      return Boolean(ytId && watchLaterIds.includes(ytId));
    },
    [resolveYouTubeId, watchLaterIds]
  );

  const toggleWatchLater = async (videoOrId) => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to save videos to your Watch Later queue.');
      return { requiresAuth: true };
    }

    const ytId = resolveYouTubeId(videoOrId);
    if (!ytId) {
      setActionError('Demo-only items without a YouTube video ID cannot be saved to Watch Later.');
      return { error: 'Missing YouTube video ID.' };
    }

    const exists = watchLaterIds.includes(ytId);
    const nextIds = exists
      ? watchLaterIds.filter((id) => id !== ytId)
      : [ytId, ...watchLaterIds];

    setWatchLaterIds(nextIds);
    setActionPending('watchLater', true);
    setActionError(null);
    try {
      await mediaService.syncWatchLater(ytId, !exists);
      return { saved: !exists };
    } catch (err) {
      setWatchLaterIds(watchLaterIds);
      setActionError(err?.message || 'Could not update Watch Later.');
      return { error: err?.message };
    } finally {
      setActionPending('watchLater', false);
    }
  };

  const openStream = (stream) => {
    setSelectedMedia({ type: 'stream', item: stream });
  };

  const closeMediaModal = () => setSelectedMedia(null);

  const addChannel = async (rawInput, category) => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to follow YouTube channels.');
      return { error: 'Authentication required.' };
    }

    setActionPending('channels', true);
    setActionError(null);
    try {
      const result = await mediaService.addYouTubeSubscription(rawInput, category);
      if (result.error) return result;

      const duplicate = channels.some(
        (ch) =>
          ch.id.toLowerCase() === result.channel.id.toLowerCase() ||
          ch.handle.toLowerCase() === result.channel.handle.toLowerCase()
      );
      if (duplicate) {
        return { error: `${result.channel.handle} is already in your Following list.` };
      }

      setChannels((prev) => [result.channel, ...prev]);
      return { channel: result.channel };
    } catch (err) {
      const message = err?.message || 'Could not follow channel.';
      setActionError(message);
      return { error: message };
    } finally {
      setActionPending('channels', false);
    }
  };

  const removeChannel = async (channelId) => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to manage followed channels.');
      return;
    }

    const previous = channels;
    setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
    setActionPending('channels', true);
    setActionError(null);
    try {
      await mediaService.removeYouTubeSubscription(channelId);
    } catch (err) {
      setChannels(previous);
      setActionError(err?.message || 'Could not remove channel.');
    } finally {
      setActionPending('channels', false);
    }
  };

  const addStreamer = async (rawInput, category) => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to track Twitch streamers.');
      return { error: 'Authentication required.' };
    }

    setActionPending('streams', true);
    setActionError(null);
    try {
      const result = await mediaService.addTwitchSubscription(rawInput, category);
      if (result.error) return result;

      const duplicate = streams.some(
        (st) => st.streamerName.toLowerCase() === result.stream.streamerName.toLowerCase()
      );
      if (duplicate) {
        return { error: `${result.stream.streamerName} is already in your Twitch list.` };
      }

      setStreams((prev) => [result.stream, ...prev]);
      return { stream: result.stream };
    } catch (err) {
      const message = err?.message || 'Could not add Twitch streamer.';
      setActionError(message);
      return { error: message };
    } finally {
      setActionPending('streams', false);
    }
  };

  const removeStreamer = async (streamId) => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to manage Twitch streamers.');
      return;
    }

    const previous = streams;
    setStreams((prev) => prev.filter((st) => st.id !== streamId));
    setActionPending('streams', true);
    setActionError(null);
    try {
      await mediaService.removeTwitchSubscription(streamId);
    } catch (err) {
      setStreams(previous);
      setActionError(err?.message || 'Could not remove Twitch streamer.');
    } finally {
      setActionPending('streams', false);
    }
  };

  const persistPreferences = async (nextPrefs) => {
    if (!isAuthenticated) return;
    setActionPending('preferences', true);
    setActionError(null);
    try {
      await mediaService.syncPreferences(nextPrefs);
    } catch (err) {
      setActionError(err?.message || 'Could not sync preferences.');
    } finally {
      setActionPending('preferences', false);
    }
  };

  const toggleInterest = (topicId) => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to customize your personal topic interests.');
      return;
    }
    const nextInterests = interests.includes(topicId)
      ? interests.filter((id) => id !== topicId)
      : [...interests, topicId];
    setInterests(nextInterests);
    void persistPreferences({
      interests: nextInterests,
      theme,
      compactDensity,
    });
  };

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
    void persistPreferences({
      interests,
      theme: nextTheme,
      compactDensity,
    });
  };

  const setCompactDensity = (updater) => {
    setCompactDensityState((prev) => {
      const nextValue = typeof updater === 'function' ? updater(prev) : updater;
      void persistPreferences({
        interests,
        theme,
        compactDensity: nextValue,
      });
      return nextValue;
    });
  };

  const connectYouTube = () => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in first before connecting a YouTube account.');
      return { ok: false, error: 'Sign in required.' };
    }
    if (!USE_BACKEND_API) {
      const msg =
        'YouTube OAuth connection requires the Spring Boot backend (VITE_USE_BACKEND_API=true).';
      setActionError(msg);
      return { ok: false, error: msg };
    }
    window.location.assign(mediaService.getYouTubeConnectUrl());
    return { ok: true };
  };

  const importYouTubeSubscriptions = async () => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to import YouTube subscriptions.');
      return { error: 'Authentication required.' };
    }
    setActionPending('youtube', true);
    setActionError(null);
    try {
      const imported = await mediaService.importYouTubeSubscriptions();
      if (Array.isArray(imported?.channels)) {
        setChannels(imported.channels);
      }
      setYouTubeIntegration((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
      }));
      return imported;
    } catch (err) {
      setActionError(err?.message || 'Could not import YouTube subscriptions.');
      return { error: err?.message };
    } finally {
      setActionPending('youtube', false);
    }
  };

  const resyncYouTubeSubscriptions = async () => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to resynchronize YouTube subscriptions.');
      return { error: 'Authentication required.' };
    }
    setActionPending('youtube', true);
    setActionError(null);
    try {
      const synced = await mediaService.resyncYouTubeSubscriptions();
      if (Array.isArray(synced?.channels)) {
        setChannels(synced.channels);
      }
      setYouTubeIntegration((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
      }));
      return synced;
    } catch (err) {
      setActionError(err?.message || 'Could not resync YouTube subscriptions.');
      return { error: err?.message };
    } finally {
      setActionPending('youtube', false);
    }
  };

  const disconnectYouTube = async () => {
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to manage your YouTube connection.');
      return { error: 'Authentication required.' };
    }
    setActionPending('youtube', true);
    setActionError(null);
    try {
      await mediaService.disconnectYouTube();
      setYouTubeIntegration(mediaService.getDefaultYouTubeIntegration());
      return { ok: true };
    } catch (err) {
      setActionError(err?.message || 'Could not disconnect YouTube.');
      return { error: err?.message };
    } finally {
      setActionPending('youtube', false);
    }
  };

  const watchLaterVideos = useMemo(
    () =>
      watchLaterIds.map((ytId) => {
        const matched = videos.find(
          (v) => !v.isDemoOnly && v.youtubeVideoId === ytId
        );
        if (matched) return matched;
        return {
          id: ytId,
          youtubeVideoId: ytId,
          isDemoOnly: false,
          title: `YouTube Video (${ytId})`,
          channelId: 'external',
          channelName: 'YouTube',
          channelInitials: 'YT',
          category: 'Technology',
          duration: 'YouTube',
          views: 'External',
          publishedAt: 'Saved by ID',
          thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${ytId}`,
          description: 'Saved directly via YouTube video ID.',
        };
      }),
    [watchLaterIds, videos]
  );

  const liveStreams = useMemo(
    () => streams.filter((st) => st.isLive),
    [streams]
  );

  const value = {
    videos,
    categories,
    exploreTopics,
    channels,
    streams,
    liveStreams,
    watchLaterIds,
    watchLaterVideos,
    interests,
    theme,
    setTheme,
    compactDensity,
    setCompactDensity,
    youtubeIntegration,
    isLoading,
    loadError,
    pendingActions,
    actionError,
    clearActionError: () => setActionError(null),
    retryLoad: loadWorkspace,
    searchQuery,
    setSearchQuery,
    selectedMedia,
    openStream,
    closeMediaModal,
    toggleWatchLater,
    isBookmarked,
    addChannel,
    removeChannel,
    addStreamer,
    removeStreamer,
    toggleInterest,
    connectYouTube,
    importYouTubeSubscriptions,
    resyncYouTubeSubscriptions,
    disconnectYouTube,
  };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return ctx;
}
