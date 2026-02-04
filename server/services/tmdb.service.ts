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
  getTrending: async (timeWindow: 'day' | 'week' = 'day', page: number = 1) => {
    const response = await tmdbClient.get(`/trending/all/${timeWindow}`, {
      params: { page }
    });
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  getPopularMovies: async (page: number = 1) => {
    const response = await tmdbClient.get('/movie/popular', {
      params: { page }
    });
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  getPopularTV: async (page: number = 1) => {
    const response = await tmdbClient.get('/tv/popular', {
      params: { page }
    });
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

  discover: async (type: 'movie' | 'tv', page: number = 1, sortBy: string = 'popularity.desc', genreId?: string | number) => {
    const params: any = {
      page,
      sort_by: sortBy,
      include_adult: false,
      include_video: false
    };
    
    // Filter by genre if provided
    if (genreId) {
      params.with_genres = genreId;
    }

    // Quality Control: Filter out noise for Top Rated and Newest
    if (sortBy === 'vote_average.desc') {
      // For Top Rated, ensure a significant number of votes to avoid 1-vote wonders
      params['vote_count.gte'] = 300;
    } else if (sortBy === 'primary_release_date.desc' || sortBy === 'first_air_date.desc') {
      // For Newest, ensure it has at least some engagement to be "relevant"
      // and ensure we don't show far-future releases (though discover defaults usually handle this, explicit is safer)
      params['vote_count.gte'] = 5;
      params['release_date.lte'] = new Date().toISOString().split('T')[0];
      if (type === 'tv') {
        params['first_air_date.lte'] = new Date().toISOString().split('T')[0];
      }
    }

    const response = await tmdbClient.get(`/discover/${type}`, { params });
    response.data.results = await tmdbService._enrichWithCertifications(response.data.results);
    return response.data;
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number) => {
    const response = await tmdbClient.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  },

  getShortsContent: async (genres?: string, page: number = 1) => {
    try {
      let results = [];
      
      if (genres) {
        // Personalization: Discover based on genres
        const response = await tmdbClient.get('/discover/movie', {
          params: {
            with_genres: genres,
            sort_by: 'popularity.desc',
            'vote_count.gte': 100, // Ensure good quality
            page: page
          }
        });
        results = response.data.results.slice(0, 10);
        
        // Add some trending content to mix it up (discovery)
        const trendingRes = await tmdbClient.get('/trending/movie/week', { params: { page } });
        const trending = trendingRes.data.results.slice(0, 5);
        
        // Merge and deduplicate
        const existingIds = new Set(results.map((m: any) => m.id));
        trending.forEach((m: any) => {
           if (!existingIds.has(m.id)) {
             results.push(m);
           }
        });
      } else {
        // Fallback: Just trending
        const response = await tmdbClient.get('/trending/movie/week', { params: { page } });
        results = response.data.results.slice(0, 15);
      }

      const enriched = await Promise.all(results.map(async (item: any) => {
        try {
          const vidRes = await tmdbClient.get(`/movie/${item.id}/videos`);
          const videos = vidRes.data.results;
          
          // Find official trailer (YouTube)
          // Prioritize "Trailer" then "Teaser"
          const trailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || 
                          videos.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser');
          
          if (trailer) {
            return {
              id: item.id,
              title: item.title,
              overview: item.overview,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              vote_average: item.vote_average,
              media_type: 'movie',
              videoId: trailer.key
            };
          }
          return null;
        } catch (e) {
          // If video fetch fails, just skip this item
          return null;
        }
      }));

      // Filter out nulls (items without trailers)
      // Shuffle results to make it feel more "feed-like"
      const finalResults = enriched.filter(Boolean);
      return finalResults.sort(() => Math.random() - 0.5);
    } catch (e) {
      console.error('Failed to fetch shorts content', e);
      return [];
    }
  },

  getPersonCredits: async (personId: number) => {
    const response = await tmdbClient.get(`/person/${personId}/combined_credits`);
    const cast = response.data.cast || [];
    
    // Deduplicate by ID
    const uniqueCast = Array.from(new Map(cast.map((item: any) => [item.id, item])).values());
    
    // Sort by vote_count (descending) to show "top" movies first
    // This prioritizes famous blockbusters over recent obscure appearances
    uniqueCast.sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));
    
    // Enrich top results
    const topCredits = uniqueCast.slice(0, 40); // Fetch enough for a full grid
    const enriched = await tmdbService._enrichWithCertifications(topCredits);
    
    return enriched;
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
