import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface SearchHistoryItem {
  id: string;
  query: string;
  searched_at: string;
}

const USER_ID_KEY = 'flix_user_id';

const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      userId = crypto.randomUUID();
    } else {
      userId = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = getUserId();

  const fetchSearchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getSearchHistory(userId);
      if (Array.isArray(data)) {
        setSearchHistory(data);
      }
    } catch (error) {
      console.error('Failed to load search history', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  const addToSearchHistory = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Optimistic update - keep only 5 most recent
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
      const newItem: SearchHistoryItem = {
        id: crypto.randomUUID(),
        query: query.trim(),
        searched_at: new Date().toISOString(),
      };
      // Keep only the 5 most recent
      return [newItem, ...filtered].slice(0, 5);
    });

    try {
      await api.addToSearchHistory(userId, query);
    } catch (error) {
      console.error('Failed to save search to history', error);
    }
  }, [userId]);

  const clearSearchHistory = useCallback(async () => {
    setSearchHistory([]);
    try {
      await api.clearSearchHistory(userId);
    } catch (error) {
      console.error('Failed to clear search history', error);
      // Refetch on error to sync with server
      fetchSearchHistory();
    }
  }, [userId, fetchSearchHistory]);

  return {
    searchHistory,
    isLoading,
    addToSearchHistory,
    clearSearchHistory,
    refreshSearchHistory: fetchSearchHistory,
  };
};
