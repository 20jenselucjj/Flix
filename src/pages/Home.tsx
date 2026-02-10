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
  const [heroItem, setHeroItem] = useState<Media | null>(null);
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

        if (trendingData.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(10, trendingData.results.length));
          setHeroItem(trendingData.results[randomIndex]);
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate Hero every 10 seconds
  useEffect(() => {
    if (trending.length === 0) return;

    const interval = setInterval(() => {
      // Don't rotate if user is interacting with Hero
      // Skipped for now with new navigation
      
      const topItems = trending.slice(0, 15);
      let nextIndex = Math.floor(Math.random() * topItems.length);
      
      // Try to ensure we don't pick the same item twice
      setHeroItem(currentItem => {
        if (currentItem && topItems[nextIndex].id === currentItem.id) {
           nextIndex = (nextIndex + 1) % topItems.length;
        }
        return topItems[nextIndex];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [trending]);


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

  return (
    <div className="pb-20">
      <Hero media={heroItem || trending[0]} onSurprise={handleSurprise} />
      <div className="relative z-10 container mx-auto px-4">
        {uniqueHistory.length > 0 && (
            <MediaRow title="Continue Watching" items={uniqueHistory} />
        )}
        {recommendations.length > 0 && (
            <MediaRow title="Recommended For You" items={recommendations} />
        )}
        <MediaRow title="Trending Now" items={trending.filter(t => t.id !== (heroItem?.id || trending[0]?.id))} />
        <MediaRow title="Popular Movies" items={popularMovies} linkTo="/movies" />
        <MediaRow title="Popular TV Shows" items={popularTV} linkTo="/tv" />
      </div>
    </div>
  );
};
