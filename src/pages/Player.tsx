import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Settings, Maximize, Play, Pause, Volume2, VolumeX, Captions } from 'lucide-react';
import { api } from '../lib/api';
import { StreamSource, MediaDetails } from '../types';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useIsMobile } from '../hooks/useIsMobile';
import { getImageUrl } from '../lib/utils';

const checkSourceHealth = async (url: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeoutId);
    return true;
  } catch (e) {
    return false;
  }
};

const findBestSource = async (availableSources: StreamSource[]) => {
  // Check first 3 sources in parallel to save time, as they are most likely to work
  const sourcesToCheck = availableSources.slice(0, 3);
  
  const results = await Promise.all(
    sourcesToCheck.map(src => checkSourceHealth(src.url))
  );

  const workingIndex = results.findIndex(working => working);
  if (workingIndex !== -1) {
    return availableSources[workingIndex];
  }
  
  // Fallback to first source if all checks fail (or return opaque false negatives)
  return availableSources[0];
};

export const Player: React.FC = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const [searchParams] = useSearchParams();
  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');
  
  // Default to Season 1 Episode 1 for TV shows if params are missing
  const season = type === 'tv' && !seasonParam ? '1' : seasonParam;
  const episode = type === 'tv' && !episodeParam ? '1' : episodeParam;

  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [currentSource, setCurrentSource] = useState<StreamSource | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [media, setMedia] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState(false);
  
  const isEmbed = currentSource?.type === 'embed';
  const { saveProgress, getProgress } = useWatchHistory();
  const isMobile = useIsMobile();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getProcessedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      // 'ds_lang' sets the default subtitle language.
      // We set it to 'en' when enabled, and a non-existent code 'xx' when disabled
      // to prevent automatic subtitle selection by the provider.
      urlObj.searchParams.set('ds_lang', isSubtitlesEnabled ? 'en' : 'xx');
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  };

  const handleBack = () => {
    if (type && id) {
      navigate(`/${type}/${id}`);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !id) return;
      
      try {
        const [sourcesData, mediaData] = await Promise.all([
          api.getSources(
            type, 
            parseInt(id),
            season ? parseInt(season) : undefined,
            episode ? parseInt(episode) : undefined
          ),
          api.getDetails(type, parseInt(id))
        ]);
        
        setSources(sourcesData.sources);
        setMedia({ ...mediaData, media_type: type });
        
        if (sourcesData.sources.length > 0) {
          if (isAutoMode) {
             // Find best source
             const bestSource = await findBestSource(sourcesData.sources);
             setCurrentSource(bestSource);
          } else {
             setCurrentSource(sourcesData.sources[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, season, episode, isAutoMode]);

  // Restore progress when video loads
  useEffect(() => {
    if (videoRef.current && id) {
      const savedProgress = getProgress(parseInt(id));
      if (savedProgress && savedProgress.timestamp > 0) {
        videoRef.current.currentTime = savedProgress.timestamp;
      }
    }
  }, [currentSource, id]);

  // Track progress for embeds (simulated)
  useEffect(() => {
    if (!currentSource || !media || !id || !isEmbed) return;

    const saved = getProgress(
        parseInt(id), 
        season ? parseInt(season) : undefined, 
        episode ? parseInt(episode) : undefined
    );
    const startTimestamp = saved ? saved.timestamp : 0;
    const startTime = Date.now();
    const duration = media.runtime ? media.runtime * 60 : 1800;

    // Initial save to mark as watching
    saveProgress(
        media, 
        startTimestamp > 0 ? startTimestamp : 1, 
        duration,
        season ? parseInt(season) : undefined,
        episode ? parseInt(episode) : undefined
    );

    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentTimestamp = Math.min(startTimestamp + elapsed, duration); // Don't exceed duration
        
        saveProgress(
            media,
            currentTimestamp,
            duration,
            season ? parseInt(season) : undefined,
            episode ? parseInt(episode) : undefined
        );
    }, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [currentSource, media, id, isEmbed, season, episode]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && media) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progressPercent = (current / duration) * 100;
      
      setProgress(progressPercent);
      
      // Save progress every ~1 second (throttling handled by React state updates effectively)
      // For production, use lodash.throttle or similar
      if (Math.floor(current) % 5 === 0) {
         saveProgress(
           media, 
           current, 
           duration, 
           season ? parseInt(season) : undefined,
           episode ? parseInt(episode) : undefined
         );
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * (videoRef.current?.duration || 0);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleInteraction = () => {
    if (isMobile) {
      // Toggle controls on mobile tap
      if (showControls) {
         // If playing, hide immediately? Or let timeout handle it? 
         // Standard behavior: tap to show, tap to hide. 
         // But here we want to ensure they hide eventually.
         // If we toggle off, clear timeout.
         setShowControls(false);
         if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      } else {
        setShowControls(true);
        // Set timeout to auto-hide
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, 3000);
      }
    } else {
       // Desktop: just trigger show (mouse move handles this usually, but click should too)
       handleMouseMove();
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mr-4"></div>
        Loading stream...
      </div>
    );
  }

  if (!currentSource) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="mb-4">No sources found for this content.</p>
        <button 
          onClick={handleBack}
          className="bg-primary px-6 py-2 rounded font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const title = media?.title || media?.name;

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden group"
      onMouseMove={handleMouseMove}
      onClick={handleInteraction}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Ambient Mode Background */}
      {media?.backdrop_path && (
        <div 
            className="absolute inset-0 z-0 opacity-30 blur-3xl scale-110 pointer-events-none transition-opacity duration-1000"
            style={{ 
                backgroundImage: `url(${getImageUrl(media.backdrop_path, 'original')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: isPlaying && !showControls ? 0.1 : 0.4
            }}
        />
      )}

      {isEmbed ? (
        <iframe
          src={getProcessedUrl(currentSource.url)}
          className="w-full h-full border-0 relative z-10"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="no-referrer"
        />
      ) : (
        <video
          ref={videoRef}
          src={currentSource.url}
          className="w-full h-full object-contain relative z-10 shadow-2xl"
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          // onClick is handled by container
        />
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Bar */}
        <div 
          className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-black/90 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4">
            <button 
                onClick={handleBack} 
                className="text-white hover:text-primary transition-colors bg-white/10 p-3 rounded-full backdrop-blur-md hover:bg-white/20"
            >
                <ArrowLeft size={24} />
            </button>
            {title && (
                <div 
                    className="text-white font-bold text-lg drop-shadow-md cursor-pointer hover:text-primary transition-colors"
                    onClick={() => type && id && navigate(`/${type}/${id}`)}
                >
                    {title}
                </div>
            )}
          </div>
          
          <div className="flex gap-4 relative pointer-events-auto">


            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`text-white hover:text-primary transition-colors bg-white/10 p-3 rounded-full backdrop-blur-md hover:bg-white/20 ${isSettingsOpen ? 'text-primary bg-white/20' : ''}`}
            >
              <Settings size={24} />
            </button>
            {/* Source Selector Popup */}
            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#181818] border border-white/10 rounded-xl p-2 min-w-[200px] block shadow-2xl">
                <h4 className="text-xs text-gray-500 mb-2 px-3 py-1 uppercase font-bold tracking-wider">Select Source</h4>
                
                {/* Auto Option */}
                <button
                  onClick={async () => {
                    setIsAutoMode(true);
                    setIsSettingsOpen(false);
                    // Re-run best source finder
                    const best = await findBestSource(sources);
                    setCurrentSource(best);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${isAutoMode ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>Auto (Recommended)</span>
                    {isAutoMode && <span className="text-xs bg-primary px-1.5 py-0.5 rounded text-black font-bold">ON</span>}
                  </div>
                  {isAutoMode && currentSource && (
                    <div className="text-xs opacity-60 mt-1 truncate">Using: {currentSource.source}</div>
                  )}
                </button>
                <div className="h-px bg-white/10 my-2 mx-2" />

                {sources.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSource(src);
                      setIsAutoMode(false);
                      setIsSettingsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentSource === src && !isAutoMode ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    {src.source}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar - Only for native video player */}
        {!isEmbed && (
          <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            {/* Progress Bar */}
            <div className="w-full mb-6 flex items-center gap-4 group/progress">
              <div className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer group-hover/progress:h-2 transition-all">
                <div 
                    className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                    style={{ width: `${progress}%` }} 
                />
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button onClick={togglePlay} className="text-white hover:text-primary transition-transform hover:scale-110">
                  {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
                </button>
                
                <div className="flex items-center gap-4 group/vol">
                  <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                    {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isMobile ? 'w-24' : 'w-0 group-hover/vol:w-24'}`}>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setVolume(val);
                          if (videoRef.current) videoRef.current.volume = val;
                          setIsMuted(val === 0);
                        }}
                        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-transform hover:scale-110">
                  <Maximize size={28} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
