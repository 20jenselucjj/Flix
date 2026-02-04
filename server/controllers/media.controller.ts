import { Request, Response } from 'express';
import { tmdbService } from '../services/tmdb.service.js';
import { supabaseService } from '../services/supabase.service.js';
import { scraperService } from '../services/scraper.service.js';

export const mediaController = {

  getTrending: async (req: Request, res: Response) => {
    try {
      const { page } = req.query;
      const pageNum = page ? parseInt(page as string) : 1;
      const data = await tmdbService.getTrending('day', pageNum);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trending content' });
    }
  },

  getPopular: async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const { page } = req.query;
      const pageNum = page ? parseInt(page as string) : 1;
      const data = type === 'movie' 
        ? await tmdbService.getPopularMovies(pageNum) 
        : await tmdbService.getPopularTV(pageNum);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch popular content' });
    }
  },

  search: async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      // Check if the query is a genre
      const genreMatch = await tmdbService.findGenreByName(query);

      if (genreMatch) {
        // Fetch movies and TV shows for this genre
        const promises = [];
        if (genreMatch.movie) {
          promises.push(tmdbService.discover('movie', 1, 'popularity.desc', genreMatch.movie.id)
            .then((data: any) => ({ ...data, type: 'movie' })));
        }
        if (genreMatch.tv) {
          promises.push(tmdbService.discover('tv', 1, 'popularity.desc', genreMatch.tv.id)
            .then((data: any) => ({ ...data, type: 'tv' })));
        }

        const results = await Promise.all(promises);
        
        // Merge results
        let mergedResults: any[] = [];
        results.forEach((result: any) => {
          if (result.results) {
            const typedResults = result.results.map((item: any) => ({
              ...item,
              media_type: result.type // Add media_type for frontend filtering
            }));
            mergedResults = [...mergedResults, ...typedResults];
          }
        });

        // Sort by popularity (descending)
        mergedResults.sort((a, b) => b.popularity - a.popularity);

        return res.json({
          page: 1,
          results: mergedResults,
          total_pages: 1, // simplified
          total_results: mergedResults.length
        });
      }

      const data = await tmdbService.search(query);

      // Improved Person Search:
      // If the top result is a person, fetch their known works (movies/tv) 
      // instead of returning the person object.
      if (data.results && data.results.length > 0) {
        const topResult = data.results[0];
        if (topResult.media_type === 'person') {
          const credits = await tmdbService.getPersonCredits(topResult.id);
          return res.json({
            page: 1,
            results: credits,
            total_pages: 1,
            total_results: credits.length
          });
        }
      }

      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to search content' });
    }
  },

  getDetails: async (req: Request, res: Response) => {
    try {
      const { type, id } = req.params;
      const tmdbId = parseInt(id);

      if (type !== 'movie' && type !== 'tv') {
        return res.status(400).json({ error: 'Invalid media type' });
      }

      // Check cache first
      const cached = await supabaseService.getCachedMetadata(tmdbId, type);
      if (cached) {
        // Check if the cached data has certification or the raw data to derive it
        // This ensures old cached data (without certification) gets refreshed
        const hasCertificationData = cached.certification || 
          (type === 'movie' ? cached.release_dates : cached.content_ratings);
        
        if (hasCertificationData) {
          // If we have raw data but no explicit certification field, let's derive it now
          if (!cached.certification) {
             let cert = '';
             if (type === 'movie' && cached.release_dates) {
               const usRelease = cached.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
               if (usRelease) cert = usRelease.release_dates[0]?.certification || '';
             } else if (type === 'tv' && cached.content_ratings) {
               const usRating = cached.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
               if (usRating) cert = usRating.rating || '';
             }
             if (cert) cached.certification = cert;
          }
          return res.json({ ...cached, media_type: type });
        }
        // If cache is incomplete (missing certification data), fall through to fetch fresh data
      }

      // Fetch from TMDB if not cached
      const data = await tmdbService.getDetails(type, tmdbId);
      
      // Extract certification
      let certification = '';
      if (type === 'movie' && data.release_dates) {
        const usRelease = data.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
        if (usRelease) {
          certification = usRelease.release_dates[0]?.certification || '';
        }
      } else if (type === 'tv' && data.content_ratings) {
        const usRating = data.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
        if (usRating) {
          certification = usRating.rating || '';
        }
      }
      
      if (certification) {
        data.certification = certification;
      }

      // Cache the result
      await supabaseService.cacheMetadata(tmdbId, type, data);

      res.json({ ...data, media_type: type });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch details' });
    }
  },

  getGenres: async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      if (type !== 'movie' && type !== 'tv') {
        return res.status(400).json({ error: 'Invalid media type' });
      }
      const data = await tmdbService.getGenres(type);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch genres' });
    }
  },

  discover: async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const { with_genres, page, sort_by } = req.query;
      
      if (type !== 'movie' && type !== 'tv') {
        return res.status(400).json({ error: 'Invalid media type' });
      }

      const pageNum = page ? parseInt(page as string) : 1;
      const genreId = with_genres ? (with_genres as string) : undefined;
      const sortBy = sort_by ? (sort_by as string) : 'popularity.desc';

      const data = await tmdbService.discover(type, pageNum, sortBy, genreId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to discover content' });
    }
  },

  getSeasonDetails: async (req: Request, res: Response) => {
    try {
      const { id, seasonNumber } = req.params;
      const data = await tmdbService.getSeasonDetails(parseInt(id), parseInt(seasonNumber));
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch season details' });
    }
  },

  getSources: async (req: Request, res: Response) => {
    try {
      const { type, id } = req.params;
      const { season, episode } = req.query;
      const tmdbId = parseInt(id);
      
      const seasonNum = season ? parseInt(season as string) : 1;
      const episodeNum = episode ? parseInt(episode as string) : 1;

      const sources = await scraperService.getStreams(tmdbId, type as 'movie' | 'tv', seasonNum, episodeNum);
      res.json({ sources });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sources' });
    }
  },

  getShorts: async (req: Request, res: Response) => {
    try {
      const { genres, page } = req.query;
      const pageNum = page ? parseInt(page as string) : 1;
      const data = await tmdbService.getShortsContent(genres as string, pageNum);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch shorts' });
    }
  }
};
