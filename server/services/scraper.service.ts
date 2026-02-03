export const scraperService = {
  getStreams: async (tmdbId: number, type: 'movie' | 'tv', season: number = 1, episode: number = 1) => {
    // Using a curated list of reliable public embed APIs for 2025/2026.
    // These services take TMDB IDs and return embeddable players.
    
    const sources = [];

    if (type === 'movie') {
      sources.push(
        {
          quality: 'HD',
          url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
          source: 'VidSrc.cc (v2)',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`,
          source: 'VidSrc.xyz',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://moviesapi.club/movie/${tmdbId}`,
          source: 'MoviesAPI.club',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc.to/embed/movie/${tmdbId}`,
          source: 'VidSrc.to',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://player.autoembed.cc/embed/movie/${tmdbId}`,
          source: 'AutoEmbed',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://player.smashy.stream/movie/${tmdbId}`,
          source: 'SmashyStream',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
          source: 'MultiEmbed',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc.vip/embed/movie/${tmdbId}`,
          source: 'VidSrc.vip',
          type: 'embed'
        }
      );
    } else if (type === 'tv') {
      sources.push(
        {
          quality: 'HD',
          url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
          source: `VidSrc.cc (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
          source: `VidSrc.xyz (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`,
          source: `MoviesAPI.club (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
          source: `VidSrc.to (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
          source: `AutoEmbed (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`,
          source: `SmashyStream (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc.vip/embed/tv/${tmdbId}/${season}/${episode}`,
          source: `VidSrc.vip (S${season} E${episode})`,
          type: 'embed'
        }
      );
    }

    return sources;
  }
};
