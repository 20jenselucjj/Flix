const API_BASE_URL = '/api';

export const api = {
  getTrending: async (timeWindow: 'day' | 'week' = 'day', page: number = 1) => {
    const res = await fetch(`${API_BASE_URL}/trending?timeWindow=${timeWindow}&page=${page}`);
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },
  
  getPopular: async (type: 'movie' | 'tv', page: number = 1) => {
    const res = await fetch(`${API_BASE_URL}/popular/${type}?page=${page}`);
    return res.json();
  },

  search: async (query: string) => {
    const res = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    return res.json();
  },

  getGenres: async (type: 'movie' | 'tv') => {
    const res = await fetch(`${API_BASE_URL}/genres/${type}`);
    return res.json();
  },

  discover: async (type: 'movie' | 'tv', page: number = 1, sortBy: string = 'popularity.desc', genreId?: number | string) => {
    let url = `${API_BASE_URL}/discover/${type}?page=${page}&sort_by=${sortBy}`;
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
    const res = await fetch(`${API_BASE_URL}/media/${type}/${id}`);
    return res.json();
  },

  getSeasonDetails: async (id: number, seasonNumber: number) => {
    const res = await fetch(`${API_BASE_URL}/media/tv/${id}/season/${seasonNumber}`);
    return res.json();
  },

  getSources: async (type: 'movie' | 'tv', id: number, season?: number, episode?: number) => {
    let url = `${API_BASE_URL}/sources/${type}/${id}`;
    if (season && episode) {
      url += `?season=${season}&episode=${episode}`;
    }
    const res = await fetch(url);
    return res.json();
  },

  getShorts: async (genres?: string, page: number = 1) => {
    let url = `${API_BASE_URL}/shorts?page=${page}`;
    if (genres) {
      url += `&genres=${encodeURIComponent(genres)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  getHistory: async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/history/${userId}`);
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  saveProgress: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getMyList: async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/list/${userId}`);
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },

  addToList: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  removeFromList: async (userId: string, mediaId: number) => {
    const res = await fetch(`${API_BASE_URL}/list/${userId}/${mediaId}`, {
      method: 'DELETE',
    });
    return res.json();
  }
};
