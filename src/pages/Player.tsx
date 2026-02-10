import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Settings, Maximize, Play, Pause, Volume2, VolumeX, Captions, SkipBack, SkipForward, RotateCcw, RotateCw } from 'lucide-react';
import { api } from '../lib/api';
import { StreamSource, MediaDetails } from '../types';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useIsMobile } from '../hooks/useIsMobile';
import { getImageUrl } from '../lib/utils';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

export const Player: React.FC = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const [searchParams] = useSearchParams();
  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');
  
  const season = type === 'tv' && !seasonParam ? '1' : seasonParam;
  const episode = type === 'tv' && !episodeParam ? '1' : episodeParam;

  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [currentSource, setCurrentSource] = useState<StreamSource | null>(null);
  const [media, setMedia] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isEmbed = currentSource?.type === 'embed';
  const { saveProgress, getProgress } = useWatchHistory();
  const isMobile = useIsMobile();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Double tap refs
  const lastTapRef = useRef<{ time: number, side: 'left' | 'right' } | null>(null);

  // Refs for data access in event listeners/cleanup
  const progressRefVal = useRef(0);
  const mediaRef = useRef<MediaDetails | null>(null);
  const videoTimeRef = useRef(0);
  const lastSaveTimeRef = useRef(0);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    progressRefVal.current = progress;
  }, [progress]);

  const handleSaveProgress = useCallback(() => {
    if (!mediaRef.current || videoTimeRef.current <= 0) return;
    
    const duration = mediaRef.current.runtime ? mediaRef.current.runtime * 60 : 1800;
    const finalDuration = videoRef.current?.duration || duration;

    saveProgress(
      mediaRef.current,
      videoTimeRef.current,
      finalDuration,
      season ? parseInt(season) : undefined,
      episode ? parseInt(episode) : undefined
    );
  }, [season, episode, saveProgress]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSaveProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleSaveProgress);

    return () => {
      handleSaveProgress();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleSaveProgress);
    };
  }, [handleSaveProgress]);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      } catch (error) {
        console.warn('Screen orientation lock failed:', error);
      }
    };

    const unlockOrientation = async () => {
      try {
        await ScreenOrientation.unlock();
      } catch (error) {
        console.warn('Screen orientation unlock failed:', error);
      }
    };

    lockOrientation();

    return () => {
      unlockOrientation();
    };
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) setShowControls(false);
    }, 3000);
  }, [isPlaying, isSettingsOpen]);

  const startAt = React.useMemo(() => {
      if (!id) return 0;
      const saved = getProgress(
        parseInt(id), 
        season ? parseInt(season) : undefined, 
        episode ? parseInt(episode) : undefined
      );
      return saved ? saved.timestamp : 0;
  }, [id, season, episode, getProgress]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2000);
  };

  const getProcessedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('ds_lang', isSubtitlesEnabled ? 'en' : 'xx');
      
      if (startAt > 0) {
         return urlObj.toString() + `#t=${Math.floor(startAt)}`;
      }
      
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

  const handlePrevEpisode = () => {
    const currentSeason = parseInt(season || '1');
    const currentEpisode = parseInt(episode || '1');
    
    if (currentEpisode > 1) {
      navigate(`/watch/${type}/${id}?season=${currentSeason}&episode=${currentEpisode - 1}`);
    }
  };

  const handleNextEpisode = () => {
    const currentSeason = parseInt(season || '1');
    const currentEpisode = parseInt(episode || '1');
    
    const currentSeasonData = media?.seasons?.find(s => s.season_number === currentSeason);
    
    if (currentSeasonData) {
      if (currentEpisode < currentSeasonData.episode_count) {
        navigate(`/watch/${type}/${id}?season=${currentSeason}&episode=${currentEpisode + 1}`);
        return;
      }
      
      const nextSeason = media?.seasons?.find(s => s.season_number === currentSeason + 1);
      if (nextSeason) {
        navigate(`/watch/${type}/${id}?season=${currentSeason + 1}&episode=1`);
        return;
      }
      
      showToast('No more episodes available');
    } else {
      navigate(`/watch/${type}/${id}?season=${currentSeason}&episode=${currentEpisode + 1}`);
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
          const preferredSource = sourcesData.sources.find((s: StreamSource) => s.source.includes('VidSrc.cc'));
          if (preferredSource) {
            setCurrentSource(preferredSource);
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
  }, [type, id, season, episode]);

  useEffect(() => {
    if (videoRef.current && id) {
      const savedProgress = getProgress(parseInt(id));
      if (savedProgress && savedProgress.timestamp > 0) {
        videoRef.current.currentTime = savedProgress.timestamp;
      }
    }
  }, [currentSource, id, getProgress]);

  useEffect(() => {
    if (!currentSource || !media || !id || !isEmbed) return;

    const saved = getProgress(
        parseInt(id), 
        season ? parseInt(season) : undefined, 
        episode ? parseInt(episode) : undefined
    );
    const startTimestamp = saved ? saved.timestamp : 0;
    videoTimeRef.current = startTimestamp;
    
    const startTime = Date.now();
    const duration = media.runtime ? media.runtime * 60 : 1800;

    saveProgress(
        media, 
        startTimestamp > 0 ? startTimestamp : 1, 
        duration,
        season ? parseInt(season) : undefined,
        episode ? parseInt(episode) : undefined
    );

    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentTimestamp = Math.min(startTimestamp + elapsed, duration);
        videoTimeRef.current = currentTimestamp;
        
        saveProgress(
            media,
            currentTimestamp,
            duration,
            season ? parseInt(season) : undefined,
            episode ? parseInt(episode) : undefined
        );
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSource, media, id, isEmbed, season, episode, saveProgress, getProgress]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const seekRelative = useCallback((seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = newTime;
      showToast(`${seconds > 0 ? '+' : ''}${seconds}s`);
      handleMouseMove();
    }
  }, [handleMouseMove]);

  const handleTimeUpdate = () => {
    if (videoRef.current && media) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progressPercent = (current / duration) * 100;
      
      setProgress(progressPercent);
      videoTimeRef.current = current;
      
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 5000) {
         saveProgress(
           media, 
           current, 
           duration, 
           season ? parseInt(season) : undefined,
           episode ? parseInt(episode) : undefined
         );
         lastSaveTimeRef.current = now;
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEmbed) return;
      
      switch(e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(videoRef.current.volume + 0.1, 1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            showToast(`Volume: ${Math.round(newVol * 100)}%`);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(videoRef.current.volume - 0.1, 0);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            showToast(`Volume: ${Math.round(newVol * 100)}%`);
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (showControls) {
             // Maybe go back?
          } else {
             setShowControls(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, isEmbed, showControls]);

  const handleDoubleTap = (side: 'left' | 'right') => {
    const now = Date.now();
    if (lastTapRef.current && 
        now - lastTapRef.current.time < 300 && 
        lastTapRef.current.side === side) {
      // Double tap detected
      seekRelative(side === 'left' ? -10 : 10);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, side };
      // Single tap logic (toggle controls) could go here if we want to distinguish
      // but simpler to just handle click on wrapper
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
          className="bg-primary px-6 py-2 rounded font-bold transition-transform hover:scale-105"
        >
          Go Back
        </button>
      </div>
    );
  }

  const title = media?.title || media?.name;

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onClick={() => {
        setShowControls(!showControls);
        handleMouseMove(); // reset timer
      }}
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

      {/* Toast Notification */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md transition-opacity duration-300 pointer-events-none z-50 font-bold ${toastMessage ? 'opacity-100' : 'opacity-0'}`}
      >
        {toastMessage}
      </div>

      {/* Loading Spinner */}
      {isBuffering && !isEmbed && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      )}

      {/* Double Tap Zones (Mobile/Touch) */}
      <div 
        className="absolute inset-y-0 left-0 w-1/4 z-30"
        onClick={(e) => {
            e.stopPropagation();
            handleDoubleTap('left');
        }}
      />
      <div 
        className="absolute inset-y-0 right-0 w-1/4 z-30"
        onClick={(e) => {
            e.stopPropagation();
            handleDoubleTap('right');
        }}
      />

      {isEmbed ? (
        <div className="w-full h-full relative z-10">
            <iframe
                src={getProcessedUrl(currentSource.url)}
                className="w-full h-full border-0 pointer-events-auto"
                allowFullScreen
                {...(currentSource.source.toLowerCase().includes('vidsrc.cc') || currentSource.url.includes('vidsrc.cc') 
                ? { sandbox: "allow-forms allow-scripts allow-same-origin allow-presentation" } 
                : {}
                )}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="no-referrer"
            />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={currentSource.url}
          className="w-full h-full relative z-10 shadow-2xl transition-all duration-300 object-contain"
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
        />
      )}

      {/* Controls Overlay */}
      {!isEmbed && (
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-40 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Bar */}
        <div 
          className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}
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
            {type === 'tv' && (
              <>
                {parseInt(episode || '1') > 1 && (
                  <button 
                    onClick={handlePrevEpisode}
                    className="text-white hover:text-primary transition-colors bg-white/10 p-3 rounded-full backdrop-blur-md hover:bg-white/20"
                    title="Previous Episode"
                  >
                    <SkipBack size={24} />
                  </button>
                )}
                <button 
                  onClick={handleNextEpisode}
                  className="text-white hover:text-primary transition-colors bg-white/10 p-3 rounded-full backdrop-blur-md hover:bg-white/20"
                  title="Next Episode"
                >
                  <SkipForward size={24} />
                </button>
              </>
            )}

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
                
                {sources.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSource(src);
                      setIsSettingsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentSource === src ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    {src.source}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar - Only for native video player */}
        <div className={`absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
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
                
                <button 
                    onClick={() => seekRelative(-10)} 
                    className="text-white hover:text-primary transition-colors"
                    title="-10s"
                >
                    <RotateCcw size={24} />
                </button>
                <button 
                    onClick={() => seekRelative(10)} 
                    className="text-white hover:text-primary transition-colors"
                    title="+10s"
                >
                    <RotateCw size={24} />
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
      </div>
      )}
    </div>
  );
};
