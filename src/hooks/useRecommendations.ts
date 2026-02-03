import { useState, useEffect } from 'react';
import { Media } from '../types';
import { api } from '../lib/api';
import { useWatchHistory } from './useWatchHistory';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const { history, getTopGenres } = useWatchHistory();

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Wait for history to be populated
      if (history.length === 0) return;

      const topGenres = getTopGenres();
      if (!topGenres) return;

      try {
        // Fetch recommendations based on top genres
        // We fetch movies for now. In a robust app, we might mix or check what the user watches more of.
        const data = await api.discoverByGenre('movie', topGenres);
        
        // Filter out what we've already watched
        const watchedIds = new Set(history.map(h => h.id));
        const filtered = data.results.filter((m: Media) => !watchedIds.has(m.id));
        
        setRecommendations(filtered);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      }
    };

    fetchRecommendations();
  }, [history]); 

  return { recommendations };
};
