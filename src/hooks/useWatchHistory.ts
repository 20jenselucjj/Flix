import { useState, useEffect } from 'react';
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

const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
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

  const saveProgress = async (media: Media, timestamp: number, duration: number, season?: number, episode?: number) => {
    if (!media || !media.id) return;

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
        ...media,
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
            mediaId: media.id,
            mediaType: media.media_type,
            progress,
            timestamp,
            duration,
            season,
            episode,
            mediaDetails: media
        });
    } catch (error) {
        console.error('Failed to save progress to server', error);
    }
  };

  const getProgress = (id: number, season?: number, episode?: number) => {
    if (season && episode) {
      return history.find((item) => item.id === id && item.season === season && item.episode === episode);
    }
    return history.find((item) => item.id === id);
  };

  const removeFromHistory = (id: number) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    // TODO: Add API call to remove from server
  };

  const getTopGenres = () => {
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
  };

  const recordInteraction = (mediaId: number, genres: number[], type: InteractionType) => {
    const newInteraction: InteractionEvent = {
      mediaId,
      genres,
      type,
      timestamp: Date.now(),
    };
    setInteractions((prev) => [...prev, newInteraction]);
  };

  const getWeightedGenres = () => {
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
  };

  return {
    history,
    saveProgress,
    getProgress,
    removeFromHistory,
    getTopGenres,
    recordInteraction,
    getWeightedGenres
  };
};
