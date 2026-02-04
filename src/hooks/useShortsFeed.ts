import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { useWatchHistory } from './useWatchHistory';
import { ShortItem } from '../types';

export const useShortsFeed = () => {
  const [items, setItems] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const corePageRef = useRef(1);
  const trendingPageRef = useRef(1);
  const fetchedIds = useRef(new Set<number>());
  const loadingRef = useRef(false);
  
  const { getWeightedGenres } = useWatchHistory();

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const genres = getWeightedGenres();
      
      // Fetch concurrently: Core interests vs Trending/Viral
      // We start with page 1 for both, but maintain separate counters
      const [coreRes, trendingRes] = await Promise.all([
        api.getShorts(genres, corePageRef.current),
        api.getShorts(undefined, trendingPageRef.current)
      ]);

      const coreItems: ShortItem[] = Array.isArray(coreRes) ? coreRes : (coreRes.results || []);
      const trendingItems: ShortItem[] = Array.isArray(trendingRes) ? trendingRes : (trendingRes.results || []);

      // Advance pages if we got results
      if (coreItems.length > 0) corePageRef.current++;
      if (trendingItems.length > 0) trendingPageRef.current++;

      // Mix strategy: 60% Core, 40% Trending
      // Interleave pattern: 2 Core, 1 Trending
      const mixed: ShortItem[] = [];
      let c = 0, t = 0;
      
      while (c < coreItems.length || t < trendingItems.length) {
        // Add up to 2 core items
        for (let i = 0; i < 2 && c < coreItems.length; i++) {
            mixed.push(coreItems[c++]);
        }
        // Add 1 trending item
        if (t < trendingItems.length) {
            mixed.push(trendingItems[t++]);
        }
      }

      // Deduplicate
      const uniqueNewItems = mixed.filter(item => {
        if (fetchedIds.current.has(item.id)) return false;
        fetchedIds.current.add(item.id);
        return true;
      });

      if (uniqueNewItems.length === 0 && coreItems.length === 0 && trendingItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...uniqueNewItems]);
      }

    } catch (error) {
      console.error('Failed to load shorts feed', error);
      // If error, maybe try again later or just stop?
      // For now, stop infinite loading if both fail
      setHasMore(false); 
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [getWeightedGenres]);

  // Initial load
  useEffect(() => {
    // Only load if empty and not loading
    if (items.length === 0 && !loadingRef.current) {
        loadMore();
    }
  }, []); // Run once on mount

  return { items, loading, hasMore, loadMore };
};
