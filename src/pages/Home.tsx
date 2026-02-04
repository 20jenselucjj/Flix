import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Hero } from '../components/Hero';
import { MediaRow } from '../components/MediaRow';
import { Media } from '../types';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useRecommendations } from '../hooks/useRecommendations';

export const Home: React.FC = () => {
  const [trending, setTrending] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTV, setPopularTV] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { history } = useWatchHistory();
  const { recommendations } = useRecommendations();
  const navigate = useNavigate();

  // Track surprised items to avoid repetition
  const [surprisedHistory, setSurprisedHistory] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('flix_surprised_history');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Deduplicate history to show only the most recent episode per show
  const uniqueHistory = React.useMemo(() => {
    const seen = new Set();
    return history.filter(item => {
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, moviesData, tvData] = await Promise.all([
          api.getTrending('day'),
          api.getPopular('movie'),
          api.getPopular('tv')
        ]);

        setTrending(trendingData.results);
        setPopularMovies(moviesData.results);
        setPopularTV(tvData.results);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSurprise = () => {
    // Combine all lists to get a large pool
    const pool = [...trending, ...popularMovies, ...popularTV];
    // Filter out items already in history to keep it fresh
    const historyIds = new Set(history.map(h => h.id));
    
    // Filter out items already watched OR already surprised
    let freshPool = pool.filter(m => !historyIds.has(m.id) && !surprisedHistory.has(m.id));
    
    // If we've run out of fresh "surprise" options (e.g. cycled through everything), 
    // reset the surprise history but keep excluding watched items
    if (freshPool.length === 0) {
      freshPool = pool.filter(m => !historyIds.has(m.id));
      // Clear local storage and state
      localStorage.removeItem('flix_surprised_history');
      setSurprisedHistory(new Set());
    }
    
    // Fallback to full pool if watched everything (unlikely)
    const candidates = freshPool.length > 0 ? freshPool : pool;
    
    if (candidates.length > 0) {
      const random = candidates[Math.floor(Math.random() * candidates.length)];
      const type = random.media_type || (random.title ? 'movie' : 'tv');
      
      // Update surprise history
      const newHistory = new Set(surprisedHistory);
      newHistory.add(random.id);
      setSurprisedHistory(newHistory);
      localStorage.setItem('flix_surprised_history', JSON.stringify([...newHistory]));
      
      const surprisePool = candidates.map(c => ({
        id: c.id,
        type: c.media_type || (c.title ? 'movie' : 'tv')
      }));

      navigate(`/${type}/${random.id}`, { 
        state: { 
          fromSurprise: true, 
          surprisePool 
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const heroItem = trending[0];

  return (
    <div className="pb-20">
      <Hero media={heroItem} onSurprise={handleSurprise} />
      <div className="relative z-10 container mx-auto px-4">
        {uniqueHistory.length > 0 && (
            <MediaRow title="Continue Watching" items={uniqueHistory} />
        )}
        {recommendations.length > 0 && (
            <MediaRow title="Recommended For You" items={recommendations} />
        )}
        <MediaRow title="Trending Now" items={trending.slice(1)} />
        <MediaRow title="Popular Movies" items={popularMovies} linkTo="/movies" />
        <MediaRow title="Popular TV Shows" items={popularTV} linkTo="/tv" />
      </div>
    </div>
  );
};
