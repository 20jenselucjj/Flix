const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const api = {
  getTrending: async (timeWindow: 'day' | 'week' = 'day', page: number = 1) => {
    const res = await fetch(buildApiUrl(`/trending?timeWindow=${timeWindow}&page=${page}`));
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  getUpcoming: async (page: number = 1) => {
    const res = await fetch(buildApiUrl(`/upcoming?page=${page}`));
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },
  
  getPopular: async (type: 'movie' | 'tv', page: number = 1) => {
    const res = await fetch(buildApiUrl(`/popular/${type}?page=${page}`));
    return res.json();
  },

  search: async (query: string) => {
    const res = await fetch(buildApiUrl(`/search?query=${encodeURIComponent(query)}`));
    return res.json();
  },

  getGenres: async (type: 'movie' | 'tv') => {
    const res = await fetch(buildApiUrl(`/genres/${type}`));
    return res.json();
  },

  discover: async (type: 'movie' | 'tv', page: number = 1, sortBy: string = 'popularity.desc', genreId?: number | string) => {
    let url = buildApiUrl(`/discover/${type}?page=${page}&sort_by=${sortBy}`);
    if (genreId) {
      url += `&with_genres=${genreId}`;
    }
    const res = await fetch(url);
    return res.json();
  },

  discoverByGenre: async (type: 'movie' | 'tv', genreId: number | string, page: number = 1) => {
    return api.discover(type, page, 'popularity.desc', genreId);
  },

  getDetails: async (type: 'movie' | 'tv', id: number) => {
    const res = await fetch(buildApiUrl(`/media/${type}/${id}`));
    return res.json();
  },

  getSeasonDetails: async (id: number, seasonNumber: number) => {
    const res = await fetch(buildApiUrl(`/media/tv/${id}/season/${seasonNumber}`));
    return res.json();
  },

  getSources: async (type: 'movie' | 'tv', id: number, season?: number, episode?: number) => {
    let url = buildApiUrl(`/sources/${type}/${id}`);
    if (season && episode) {
      url += `?season=${season}&episode=${episode}`;
    }
    const res = await fetch(url);
    return res.json();
  },

  getShorts: async (genres?: string, page: number = 1) => {
    let url = buildApiUrl(`/shorts?page=${page}`);
    if (genres) {
      url += `&genres=${encodeURIComponent(genres)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  getHistory: async (userId: string) => {
    const res = await fetch(buildApiUrl(`/history/${userId}`));
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  getSearchHistory: async (userId: string) => {
    const res = await fetch(buildApiUrl(`/search/${userId}`));
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  addToSearchHistory: async (userId: string, query: string) => {
    const res = await fetch(buildApiUrl('/search'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, query }),
    });
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  clearSearchHistory: async (userId: string) => {
    const res = await fetch(buildApiUrl(`/search/${userId}`), {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  saveProgress: async (data: any) => {
    const res = await fetch(buildApiUrl('/history'), {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  saveProgressOnUnload: (data: unknown) => {
    if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
      return false;
    }

    const body = JSON.stringify(data);
    return navigator.sendBeacon(
      buildApiUrl('/history'),
      new Blob([body], { type: 'application/json' })
    );
  },

  getMyList: async (userId: string) => {
    const res = await fetch(buildApiUrl(`/list/${userId}`));
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  addToList: async (data: any) => {
    const res = await fetch(buildApiUrl('/list'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  removeFromList: async (userId: string, mediaId: number) => {
    const res = await fetch(buildApiUrl(`/list/${userId}/${mediaId}`), {
      method: 'DELETE',
    });
    return res.json();
  }
};
