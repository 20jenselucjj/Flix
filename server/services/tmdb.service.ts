import axios from 'axios';
import { CONFIG } from '../config.js';

const tmdbClient = axios.create({
  baseURL: CONFIG.TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${CONFIG.TMDB_ACCESS_TOKEN}`,
    accept: 'application/json',
  },
});

// Cache for genres
let genresCache: { movie: any[], tv: any[], timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const GENRE_ALIASES: Record<string, string> = {
  'sci-fi': 'Science Fiction',
  'scifi': 'Science Fiction',
  'sf': 'Science Fiction',
  'romcom': 'Romance',
};

export const tmdbService = {
  getTrending: async (timeWindow: 'day' | 'week' = 'day') => {
    const response = await tmdbClient.get(`/trending/all/${timeWindow}`);
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  getPopularMovies: async () => {
    const response = await tmdbClient.get('/movie/popular');
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  getPopularTV: async () => {
    const response = await tmdbClient.get('/tv/popular');
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  findGenreByName: async (query: string) => {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        tmdbService.getGenres('movie'),
        tmdbService.getGenres('tv')
      ]);

      const normalizedQuery = query.toLowerCase().trim();
      // Check aliases
      const alias = GENRE_ALIASES[normalizedQuery];
      const targetGenre = alias ? alias.toLowerCase() : normalizedQuery;

      const movieGenre = movieGenres.genres.find((g: any) => g.name.toLowerCase() === targetGenre);
      const tvGenre = tvGenres.genres.find((g: any) => g.name.toLowerCase() === targetGenre);

      if (movieGenre || tvGenre) {
        return { movie: movieGenre, tv: tvGenre };
      }
      return null;
    } catch (e) {
      console.error('Error finding genre:', e);
      return null;
    }
  },

  search: async (query: string, page: number = 1) => {
    const response = await tmdbClient.get('/search/multi', {
      params: { query, page },
    });
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  getDetails: async (type: 'movie' | 'tv', id: number) => {
    const append = type === 'movie' 
      ? 'credits,videos,similar,recommendations,release_dates' 
      : 'credits,videos,similar,recommendations,content_ratings';
      
    const response = await tmdbClient.get(`/${type}/${id}`, {
      params: {
        append_to_response: append,
      },
    });
    return response.data;
  },

  getGenres: async (type: 'movie' | 'tv') => {
    const response = await tmdbClient.get(`/genre/${type}/list`);
    return response.data;
  },

  discoverByGenre: async (type: 'movie' | 'tv', genreId: string | number, page: number = 1) => {
    const response = await tmdbClient.get(`/discover/${type}`, {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    });
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number) => {
    const response = await tmdbClient.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  },

  _enrichWithCertifications: async (results: any[]) => {
    // Process in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    const enriched = [];
    
    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (item) => {
        if (!item.id) return item;
        
        const type = item.media_type || (item.title ? 'movie' : 'tv');
        if (type !== 'movie' && type !== 'tv') return item;
        
        try {
          if (type === 'movie') {
             const res = await tmdbClient.get(`/movie/${item.id}/release_dates`);
             const us = res.data.results?.find((r: any) => r.iso_3166_1 === 'US');
             const cert = us?.release_dates?.[0]?.certification;
             if (cert) item.certification = cert;
          } else {
             const res = await tmdbClient.get(`/tv/${item.id}/content_ratings`);
             const us = res.data.results?.find((r: any) => r.iso_3166_1 === 'US');
             const cert = us?.rating;
             if (cert) item.certification = cert;
          }
        } catch (e) {
          // Ignore errors for individual items
          // console.warn(`Failed to fetch certification for ${type} ${item.id}`);
        }
        return item;
      });
      
      const batchResults = await Promise.all(batchPromises);
      enriched.push(...batchResults);
      
      // Small delay between batches
      if (i + BATCH_SIZE < results.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return enriched;
  }
};
