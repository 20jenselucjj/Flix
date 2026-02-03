import { create } from 'zustand';
import { Media } from '../types';
import { api } from '../lib/api';

interface MyListState {
  list: Media[];
  addToList: (media: Media) => void;
  removeFromList: (id: number) => void;
  isInList: (id: number) => boolean;
  fetchList: () => Promise<void>;
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

export const useMyList = create<MyListState>((set, get) => ({
  list: [],
  
  fetchList: async () => {
    const userId = getUserId();
    try {
      const data = await api.getMyList(userId);
      if (Array.isArray(data)) {
        const mapped = data.map((item: any) => ({
            ...item.media_details,
            id: item.media_id,
            media_type: item.media_type,
        }));
        set({ list: mapped });
      }
    } catch (error) {
      console.error('Failed to load list', error);
    }
  },

  addToList: async (media) => {
    const userId = getUserId();
    
    // Optimistic update
    set((state) => {
      if (state.list.some((item) => item.id === media.id)) return state;
      return { list: [media, ...state.list] };
    });

    try {
        await api.addToList({
            userId,
            mediaId: media.id,
            mediaType: media.media_type || (media.title ? 'movie' : 'tv'),
            mediaDetails: media
        });
    } catch (error) {
        console.error('Failed to add to list server', error);
        // Revert on error?
    }
  },

  removeFromList: async (id) => {
    const userId = getUserId();

    // Optimistic update
    set((state) => ({
      list: state.list.filter((item) => item.id !== id)
    }));

    try {
        await api.removeFromList(userId, id);
    } catch (error) {
        console.error('Failed to remove from list server', error);
    }
  },

  isInList: (id) => get().list.some((item) => item.id === id),
}));
