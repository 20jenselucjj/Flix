export const scraperService = {
  getStreams: async (tmdbId: number, type: 'movie' | 'tv', season: number = 1, episode: number = 1) => {
    // Using user-provided list of Vidsrc domains.
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
          url: `https://vidsrcme.ru/embed/movie/${tmdbId}`,
          source: 'VidSrcMe.ru',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrcme.su/embed/movie/${tmdbId}`,
          source: 'VidSrcMe.su',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-me.ru/embed/movie/${tmdbId}`,
          source: 'VidSrc-Me.ru',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-me.su/embed/movie/${tmdbId}`,
          source: 'VidSrc-Me.su',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-embed.ru/embed/movie/${tmdbId}`,
          source: 'VidSrc-Embed.ru',
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-embed.su/embed/movie/${tmdbId}`,
          source: 'VidSrc-Embed.su',
          type: 'embed'
        }
      );
    } else if (type === 'tv') {
      sources.push(
        {
          quality: 'HD',
          url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`,
          source: `VidSrc.cc (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrcme.ru/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`,
          source: `VidSrcMe.ru (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrcme.su/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`,
          source: `VidSrcMe.su (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-me.ru/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`,
          source: `VidSrc-Me.ru (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-me.su/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`,
          source: `VidSrc-Me.su (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-embed.ru/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`,
          source: `VidSrc-Embed.ru (S${season} E${episode})`,
          type: 'embed'
        },
        {
          quality: 'HD',
          url: `https://vidsrc-embed.su/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`,
          source: `VidSrc-Embed.su (S${season} E${episode})`,
          type: 'embed'
        }
      );
    }

    return sources;
  }
};
