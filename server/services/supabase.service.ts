import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config.js';

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
  throw new Error('Supabase URL and Key are required');
}

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

export const supabaseService = {
  getCachedMetadata: async (tmdbId: number, type: 'movie' | 'tv') => {
    const { data, error } = await supabase
      .from('media_cache')
      .select('metadata')
      .eq('tmdb_id', tmdbId)
      .eq('type', type)
      .single();

    if (error) return null;
    return data?.metadata;
  },

  cacheMetadata: async (tmdbId: number, type: 'movie' | 'tv', metadata: any) => {
    const { error } = await supabase
      .from('media_cache')
      .upsert({
        tmdb_id: tmdbId,
        type,
        metadata,
        last_updated: new Date().toISOString(),
      });

    if (error) {
      console.error('Error caching metadata:', error);
    }
  },

  getHistory: async (userId: string) => {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_watched', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }
    return data;
  },

  upsertHistory: async (historyItem: any) => {
    const { error } = await supabase
      .from('watch_history')
      .upsert(historyItem, { onConflict: 'user_id,media_id,season,episode' });

    if (error) {
      console.error('Error saving history:', error);
      throw error;
    }
  },

  getMyList: async (userId: string) => {
    const { data, error } = await supabase
      .from('my_list')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching my list:', error);
      return [];
    }
    return data;
  },

  addToMyList: async (item: any) => {
    const { error } = await supabase
      .from('my_list')
      .upsert(item, { onConflict: 'user_id,media_id,media_type' });

    if (error) {
      console.error('Error adding to list:', error);
      throw error;
    }
  },

  removeFromMyList: async (userId: string, mediaId: number) => {
    const { error } = await supabase
      .from('my_list')
      .delete()
      .eq('user_id', userId)
      .eq('media_id', mediaId);

    if (error) {
      console.error('Error removing from list:', error);
      throw error;
    }
  },

  checkConnection: async () => {
    const { count, error } = await supabase
      .from('watch_history')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return true;
  }
};
