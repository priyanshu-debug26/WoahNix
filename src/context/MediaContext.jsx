import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mediaService } from '../services/mediaService';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MediaContext = createContext(null);

const DEFAULT_INTERESTS = ['Programming', 'Formula 1', 'Technology', 'Music', 'Gaming'];

export function MediaProvider({ children }) {
  const [channels, setChannels] = useLocalStorage(
    'channels',
    mediaService.getInitialChannels()
  );
  const [streams, setStreams] = useLocalStorage(
    'streams',
    mediaService.getInitialStreams()
  );
  const [watchLaterIds, setWatchLaterIds] = useLocalStorage('watchLater', [
    'vid-01',
    'vid-07',
  ]);
  const [historyItems, setHistoryItems] = useLocalStorage(
    'history',
    mediaService.getInitialHistory()
  );
  const [interests, setInterests] = useLocalStorage('interests', DEFAULT_INTERESTS);
  const [theme, setTheme] = useLocalStorage('theme', 'warm-dark');
  const [compactDensity, setCompactDensity] = useLocalStorage('compactDensity', false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const videos = useMemo(() => mediaService.getVideos(), []);
  const categories = useMemo(() => mediaService.getCategories(), []);
  const exploreTopics = useMemo(() => mediaService.getExploreTopics(), []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleWatchLater = (videoId) => {
    setWatchLaterIds((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [videoId, ...prev]
    );
  };

  const isBookmarked = (videoId) => watchLaterIds.includes(videoId);

  const recordWatch = (videoId) => {
    setHistoryItems((prev) => {
      const filtered = prev.filter((item) => item.videoId !== videoId);
      return [
        {
          videoId,
          watchedAt: 'Just now',
          progress: 100,
        },
        ...filtered,
      ];
    });
  };

  const openVideo = (video) => {
    recordWatch(video.id);
    setSelectedMedia({ type: 'video', item: video });
  };

  const openStream = (stream) => {
    setSelectedMedia({ type: 'stream', item: stream });
  };

  const closeMediaModal = () => setSelectedMedia(null);

  const removeHistoryItem = (videoId) => {
    setHistoryItems((prev) => prev.filter((item) => item.videoId !== videoId));
  };

  const clearHistory = () => {
    setHistoryItems([]);
  };

  const addChannel = (rawInput, category) => {
    const result = mediaService.parseYouTubeChannelInput(rawInput, category);
    if (result.error) return result;

    const duplicate = channels.some(
      (ch) => ch.handle.toLowerCase() === result.channel.handle.toLowerCase()
    );
    if (duplicate) {
      return { error: `${result.channel.handle} is already in your Following list.` };
    }

    setChannels((prev) => [result.channel, ...prev]);
    return { channel: result.channel };
  };

  const removeChannel = (channelId) => {
    setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
  };

  const addStreamer = (rawInput, category) => {
    const result = mediaService.parseTwitchStreamerInput(rawInput, category);
    if (result.error) return result;

    const duplicate = streams.some(
      (st) => st.streamerName.toLowerCase() === result.stream.streamerName.toLowerCase()
    );
    if (duplicate) {
      return { error: `${result.stream.streamerName} is already in your Twitch list.` };
    }

    setStreams((prev) => [result.stream, ...prev]);
    return { stream: result.stream };
  };

  const removeStreamer = (streamId) => {
    setStreams((prev) => prev.filter((st) => st.id !== streamId));
  };

  const toggleStreamLive = (streamId) => {
    setStreams((prev) =>
      prev.map((st) =>
        st.id === streamId
          ? {
              ...st,
              isLive: !st.isLive,
              viewerCount: !st.isLive ? st.viewerCount || 650 : 0,
              startedAt: !st.isLive ? 'Just went live' : 'Offline',
            }
          : st
      )
    );
  };

  const toggleInterest = (topicId) => {
    setInterests((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const watchLaterVideos = useMemo(
    () =>
      watchLaterIds
        .map((id) => videos.find((v) => v.id === id))
        .filter(Boolean),
    [watchLaterIds, videos]
  );

  const historyVideos = useMemo(
    () =>
      historyItems
        .map((entry) => {
          const video = videos.find((v) => v.id === entry.videoId);
          return video ? { ...video, ...entry } : null;
        })
        .filter(Boolean),
    [historyItems, videos]
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
    historyItems,
    historyVideos,
    interests,
    theme,
    setTheme,
    compactDensity,
    setCompactDensity,
    searchQuery,
    setSearchQuery,
    selectedMedia,
    openVideo,
    openStream,
    closeMediaModal,
    toggleWatchLater,
    isBookmarked,
    recordWatch,
    removeHistoryItem,
    clearHistory,
    addChannel,
    removeChannel,
    addStreamer,
    removeStreamer,
    toggleStreamLive,
    toggleInterest,
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

