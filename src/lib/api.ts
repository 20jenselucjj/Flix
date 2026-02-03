const API_BASE_URL = '/api';

export const api = {
  getTrending: async (timeWindow: 'day' | 'week' = 'day') => {
    const res = await fetch(`${API_BASE_URL}/trending?timeWindow=${timeWindow}`);
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },
  
  getPopular: async (type: 'movie' | 'tv') => {
    const res = await fetch(`${API_BASE_URL}/popular/${type}`);
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

  discoverByGenre: async (type: 'movie' | 'tv', genreId: number | string, page: number = 1) => {
    const res = await fetch(`${API_BASE_URL}/discover/${type}?with_genres=${genreId}&page=${page}`);
    return res.json();
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
