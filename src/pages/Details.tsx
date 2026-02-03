import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Share2, ChevronDown, Check, Youtube, Plus, Shuffle } from 'lucide-react';
import { api } from '../lib/api';
import { MediaDetails, Episode } from '../types';
import { getImageUrl } from '../lib/utils';
import { MediaRow } from '../components/MediaRow';
import { useMyList } from '../hooks/useMyList';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { TrailerModal } from '../components/TrailerModal';

export const Details: React.FC = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [media, setMedia] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const { addToList, removeFromList, isInList } = useMyList();
  const { getProgress } = useWatchHistory();
  
  const inList = media ? isInList(media.id) : false;
  
  // Check for watch history
  const lastWatched = id ? getProgress(parseInt(id)) : undefined;
  
  const resumeLink = useMemo(() => {
    if (!type || !id) return '/';
    if (type === 'movie') return `/watch/movie/${id}`;
    
    if (lastWatched && lastWatched.season && lastWatched.episode) {
      return `/watch/tv/${id}?season=${lastWatched.season}&episode=${lastWatched.episode}`;
    }
    
    return `/watch/tv/${id}`;
  }, [type, id, lastWatched]);

  const resumeLabel = useMemo(() => {
    if (lastWatched && lastWatched.progress > 0) {
      if (type === 'tv' && lastWatched.season && lastWatched.episode) {
        return `Resume S${lastWatched.season}:E${lastWatched.episode}`;
      }
      return 'Resume';
    }
    return 'Watch Now';
  }, [lastWatched, type]);

  const handleToggleList = () => {
    if (!media) return;
    if (inList) {
      removeFromList(media.id);
    } else {
      addToList(media);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = media?.title || media?.name || 'Check this out!';
    const shareText = `Check out ${shareTitle} on Flix!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard', error);
      }
    }
  };

  const handleSurprise = () => {
    const pool = location.state?.surprisePool;
    if (pool && pool.length > 0) {
      // Filter out current item to avoid immediate repeat
      const candidates = pool.filter((item: any) => item.id !== parseInt(id || '0'));
      if (candidates.length > 0) {
        const random = candidates[Math.floor(Math.random() * candidates.length)];
        navigate(`/${random.type}/${random.id}`, { 
          state: { 
            fromSurprise: true, 
            surprisePool: pool 
          } 
        });
      }
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!type || !id) return;
      
      setLoading(true);
      try {
        const data = await api.getDetails(type, parseInt(id));
        setMedia(data);
      } catch (error) {
        console.error('Failed to fetch details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [type, id]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (type !== 'tv' || !id || !selectedSeason) return;
      
      setLoadingEpisodes(true);
      try {
        const data = await api.getSeasonDetails(parseInt(id), selectedSeason);
        setEpisodes(data.episodes || []);
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    if (type === 'tv') {
      fetchEpisodes();
    }
  }, [type, id, selectedSeason]);

  const recommendations = useMemo(() => {
    if (!media) return [];
    
    // Combine recommendations (prioritized) and similar items
    const combined = [
      ...(media.recommendations?.results || []),
      ...(media.similar?.results || [])
    ];
    
    // Get current media genre IDs
    const currentGenreIds = media.genres?.map(g => g.id) || [];
    
    // Filter by genre overlap
    const filtered = combined.filter(item => 
      item.id !== media.id && // Exclude self
      item.genre_ids?.some(id => currentGenreIds.includes(id)) // Must share at least one genre
    );
    
    // Deduplicate by ID
    const unique = new Map();
    filtered.forEach(item => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    });
    
    return Array.from(unique.values()).slice(0, 20); // Limit to 20 items
  }, [media]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!media) {
    return <div className="text-center py-20">Content not found</div>;
  }

  const title = media.title || media.name;
  const date = media.release_date || media.first_air_date;
  const year = date ? new Date(date).getFullYear() : '';
  const runtime = media.runtime || (media.episode_run_time?.length ? media.episode_run_time[0] : 0);
  
  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const trailer = media.videos?.results?.find(
    v => v.site === 'YouTube' && v.type === 'Trailer'
  );



  return (
    <div className="pb-20">
      {/* Backdrop Hero */}
      <div className="relative w-full h-[40vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(media.backdrop_path, 'original')}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-none w-48 md:w-72 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img
                src={getImageUrl(media.poster_path)}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 mb-6">
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar size={16} /> {year}
                </span>
              )}
              {media.certification && (
                <span className="border border-gray-500 px-2 py-0.5 rounded text-xs font-bold text-gray-300">
                  {media.certification}
                </span>
              )}
              {runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={16} /> {formatRuntime(runtime)}
                </span>
              )}
              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={16} fill="currentColor" /> {media.vote_average.toFixed(1)}
              </span>
              <div className="flex gap-2">
                {media.genres.map(g => (
                  <span key={g.id} className="bg-white/10 px-2 py-0.5 rounded text-xs">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                to={resumeLink}
                className="bg-primary text-white px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-primary/20"
              >
                <Play size={20} fill="currentColor" />
                {resumeLabel}
              </Link>
              
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white px-6 py-3 rounded font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Youtube size={20} />
                  Trailer
                </a>
              )}

              <button 
                onClick={handleToggleList}
                className="bg-white/10 text-white px-6 py-3 rounded font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
              >
                {inList ? <Check size={20} /> : <Plus size={20} />}
                {inList ? 'In List' : 'Add to List'}
              </button>

              <button 
                onClick={handleShare}
                className="bg-white/10 text-white px-6 py-3 rounded font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
              >
                {isShared ? <Check size={20} /> : <Share2 size={20} />}
                {isShared ? 'Copied!' : 'Share'}
              </button>

              {location.state?.fromSurprise && (
                <button 
                  onClick={handleSurprise}
                  className="bg-primary text-white p-3 rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-primary/30 group relative overflow-hidden"
                  title="Shuffle"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <Shuffle size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed text-lg">{media.overview}</p>
            </div>

            {media.credits?.cast?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Cast</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {media.credits.cast.slice(0, 10).map(person => (
                    <div key={person.id} className="flex-none w-24 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 bg-surface">
                        {person.profile_path ? (
                          <img
                            src={getImageUrl(person.profile_path, 'w500')}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-white truncate">{person.name}</p>
                      <p className="text-xs text-gray-400 truncate">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Episode List for TV Shows */}
            {type === 'tv' && media.seasons && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Episodes</h3>
                  <div className="relative">
                    <select 
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                      className="bg-surface text-white px-4 py-2 pr-8 rounded appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary"
                    >
                      {media.seasons.map(season => (
                        <option key={season.id} value={season.season_number}>
                          {season.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-4">
                  {loadingEpisodes ? (
                    <div className="text-center py-8 text-gray-400">Loading episodes...</div>
                  ) : (
                    episodes.map(episode => {
                      const episodeProgress = id ? getProgress(parseInt(id), selectedSeason, episode.episode_number) : undefined;
                      const isWatched = episodeProgress && episodeProgress.progress > 90;
                      
                      return (
                      <div key={episode.id} className="flex gap-4 p-4 bg-surface rounded-lg hover:bg-white/5 transition-colors group relative overflow-hidden">
                        {/* Progress overlay for watched episodes */}
                        {episodeProgress && (
                           <div className="absolute bottom-0 left-0 h-1 bg-red-600 z-10" style={{ width: `${episodeProgress.progress}%` }} />
                        )}
                        
                        <div className="flex-none w-32 md:w-48 aspect-video rounded overflow-hidden relative">
                          <img 
                            src={getImageUrl(episode.still_path, 'w500')} 
                            alt={episode.name}
                            className="w-full h-full object-cover"
                          />
                          <Link 
                            to={`/watch/tv/${id}?season=${selectedSeason}&episode=${episode.episode_number}`}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play size={32} className="text-white" fill="currentColor" />
                          </Link>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h4 className={`font-bold truncate ${isWatched ? 'text-gray-400' : 'text-white'}`}>
                                {episode.episode_number}. {episode.name}
                                {isWatched && <span className="ml-2 text-xs text-green-400 font-normal">Watched</span>}
                              </h4>
                              <p className="text-sm text-gray-400">{episode.air_date} • {episode.runtime}m</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">{episode.overview}</p>
                        </div>
                      </div>
                    )})
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Similar Content */}
        {recommendations.length > 0 && (
          <div className="mt-12">
             <MediaRow title="You May Also Like" items={recommendations} />
          </div>
        )}
      </div>

      {trailer && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          videoKey={trailer.key}
        />
      )}
    </div>
  );
};
