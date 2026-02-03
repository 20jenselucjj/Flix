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

const USER_ID_KEY = 'flix_user_id';

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
  const userId = getUserId();

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

  return {
    history,
    saveProgress,
    getProgress,
    removeFromHistory,
    getTopGenres
  };
};
