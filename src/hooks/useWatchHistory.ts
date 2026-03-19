import { useState, useEffect, useCallback, useMemo } from 'react';
import { Media } from '../types';
import { api } from '../lib/api';

export interface WatchHistoryItem extends Media {
  progress: number; // Percentage 0-100
  timestamp: number; // Current time in seconds
  duration: number; // Total duration in seconds
  lastWatched: string; // ISO Date string
  season?: number;
  episode?: number;
}

export type InteractionType = 'like' | 'dislike' | 'full_watch' | 'partial_watch' | 'skip';

interface InteractionEvent {
  mediaId: number;
  genres: number[];
  type: InteractionType;
  timestamp: number;
}

const USER_ID_KEY = 'flix_user_id';
const INTERACTIONS_KEY = 'flix_user_interactions';

const normalizeHistoryMedia = (media: Media): Media => ({
  id: media.id,
  title: media.title,
  name: media.name,
  overview: media.overview,
  poster_path: media.poster_path,
  backdrop_path: media.backdrop_path,
  media_type: media.media_type,
  vote_average: media.vote_average,
  release_date: media.release_date,
  first_air_date: media.first_air_date,
  certification: media.certification,
  genre_ids: media.genre_ids,
});

const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    // Fallback for older browsers/TVs that might not support crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        userId = crypto.randomUUID();
    } else {
        userId = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const useWatchHistory = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [interactions, setInteractions] = useState<InteractionEvent[]>(() => {
    try {
      const saved = localStorage.getItem(INTERACTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const userId = getUserId();

  useEffect(() => {
    localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory(userId);
        if (Array.isArray(data)) {
            const mapped = data.map((item: any) => ({
                ...item.media_details,
                id: item.media_id,
                media_type: item.media_type,
                progress: item.progress,
                timestamp: item.timestamp,
                duration: item.duration,
                lastWatched: item.last_watched,
                season: item.season === 0 ? undefined : item.season,
                episode: item.episode === 0 ? undefined : item.episode,
            }));
            setHistory(mapped);
        }
      } catch (error) {
        console.error('Failed to load history', error);
      }
    };
    
    fetchHistory();
  }, [userId]);

  const saveProgress = useCallback(async (media: Media, timestamp: number, duration: number, season?: number, episode?: number) => {
    if (!media || !media.id) return;

    const normalizedMedia = normalizeHistoryMedia(media);
    const progress = duration > 0 ? (timestamp / duration) * 100 : 0;
    
    // Optimistic update
    setHistory((prev) => {
      const filtered = prev.filter((item) => {
        if (media.media_type === 'tv' && season && episode) {
          return !(item.id === media.id && item.season === season && item.episode === episode);
        }
        return item.id !== media.id;
      });
      
      const newItem: WatchHistoryItem = {
        ...normalizedMedia,
        progress,
        timestamp,
        duration,
        lastWatched: new Date().toISOString(),
        season,
        episode
      };

      return [newItem, ...filtered];
    });

    try {
        await api.saveProgress({
            userId,
            mediaId: normalizedMedia.id,
            mediaType: normalizedMedia.media_type,
            progress,
            timestamp,
            duration,
            season,
            episode,
            mediaDetails: normalizedMedia
        });
    } catch (error) {
        console.error('Failed to save progress to server', error);
    }
  }, [userId]);

  const saveProgressOnUnload = useCallback((media: Media, timestamp: number, duration: number, season?: number, episode?: number) => {
    if (!media || !media.id) return false;

    const normalizedMedia = normalizeHistoryMedia(media);
    const progress = duration > 0 ? (timestamp / duration) * 100 : 0;

    return api.saveProgressOnUnload({
      userId,
      mediaId: normalizedMedia.id,
      mediaType: normalizedMedia.media_type,
      progress,
      timestamp,
      duration,
      season,
      episode,
      mediaDetails: normalizedMedia,
    });
  }, [userId]);

  const getProgress = useCallback((id: number, season?: number, episode?: number) => {
    if (season && episode) {
      return history.find((item) => item.id === id && item.season === season && item.episode === episode);
    }
    return history.find((item) => item.id === id);
  }, [history]);

  const removeFromHistory = useCallback((id: number) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    // TODO: Add API call to remove from server
  }, []);

  const getTopGenres = useCallback(() => {
    const genreCounts: Record<number, number> = {};

    history.forEach((item) => {
      // Check for 'genres' array (MediaDetails)
      if ((item as any).genres && Array.isArray((item as any).genres)) {
        (item as any).genres.forEach((g: any) => {
          genreCounts[g.id] = (genreCounts[g.id] || 0) + 1;
        });
      }
      // Check for 'genre_ids' array (Media)
      else if (item.genre_ids && Array.isArray(item.genre_ids)) {
        item.genre_ids.forEach((id) => {
          genreCounts[id] = (genreCounts[id] || 0) + 1;
        });
      }
    });

    const sortedGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id)
      .slice(0, 3);

    return sortedGenres.join('|');
  }, [history]);

  const recordInteraction = useCallback((mediaId: number, genres: number[], type: InteractionType) => {
    const newInteraction: InteractionEvent = {
      mediaId,
      genres,
      type,
      timestamp: Date.now(),
    };
    setInteractions((prev) => [...prev, newInteraction]);
  }, []);

  const getWeightedGenres = useCallback(() => {
    const genreScores: Record<number, number> = {};
    const now = Date.now();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Weight configuration
    const weights: Record<InteractionType, number> = {
      like: 10,
      full_watch: 5,
      partial_watch: 1,
      skip: -3,
      dislike: -10,
    };

    if (interactions.length === 0) {
      return getTopGenres();
    }

    interactions.forEach((interaction) => {
      const daysSince = (now - interaction.timestamp) / MS_PER_DAY;
      // Decay factor: retains 90% of value each day
      const decay = Math.max(0.1, Math.pow(0.9, daysSince)); 
      const score = (weights[interaction.type] || 0) * decay;

      interaction.genres.forEach((genreId) => {
        genreScores[genreId] = (genreScores[genreId] || 0) + score;
      });
    });

    // Sort by score
    return Object.entries(genreScores)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id)
      .slice(0, 5)
      .join('|');
  }, [getTopGenres, interactions]);

  return useMemo(() => ({
    history,
    saveProgress,
    saveProgressOnUnload,
    getProgress,
    removeFromHistory,
    getTopGenres,
    recordInteraction,
    getWeightedGenres
  }), [getProgress, getTopGenres, getWeightedGenres, history, recordInteraction, removeFromHistory, saveProgress, saveProgressOnUnload]);
};
