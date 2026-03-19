import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { StreamSource, MediaDetails } from '../types';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { getImageUrl } from '../lib/utils';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

const KNOWN_BROKEN_SOURCE_PATTERNS = [
  'vidsrcme.ru',
  'vidsrcme.su',
  'vidsrc-me.ru',
  'vidsrc-me.su',
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vsembed.ru',
];

function isKnownBrokenSource(source: StreamSource): boolean {
  const normalizedUrl = source.url.toLowerCase();
  const normalizedName = source.source.toLowerCase();

  return KNOWN_BROKEN_SOURCE_PATTERNS.some((pattern) => {
    return normalizedUrl.includes(pattern) || normalizedName.includes(pattern);
  });
}

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
  const [duration, setDuration] = useState(0);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const [iframeState, setIframeState] = useState<'idle' | 'loading' | 'unverified' | 'error'>('idle');
  const [allSourcesExhausted, setAllSourcesExhausted] = useState(false);
  
  const isEmbed = currentSource?.type === 'embed';
  const { saveProgress, saveProgressOnUnload, getProgress } = useWatchHistory();
  const getProgressRef = useRef(getProgress);
  const saveProgressOnUnloadRef = useRef(saveProgressOnUnload);

  // Refs for data access in event listeners/cleanup
  const mediaRef = useRef<MediaDetails | null>(null);
  const videoTimeRef = useRef(0);
  const lastSaveTimeRef = useRef(0);
  const sourcesRef = useRef<StreamSource[]>([]);
  const failedSourcesRef = useRef<string[]>([]);
  const iframeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    getProgressRef.current = getProgress;
  }, [getProgress]);

  useEffect(() => {
    saveProgressOnUnloadRef.current = saveProgressOnUnload;
  }, [saveProgressOnUnload]);

  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  useEffect(() => {
    failedSourcesRef.current = failedSources;
  }, [failedSources]);

  const getSourceKey = useCallback((source: StreamSource) => `${source.source}::${source.url}`, []);

  const setFailedSourceState = useCallback((sourceKey: string, shouldFail: boolean) => {
    setFailedSources((previous) => {
      const next = shouldFail
        ? (previous.includes(sourceKey) ? previous : [...previous, sourceKey])
        : previous.filter((key) => key !== sourceKey);

      failedSourcesRef.current = next;
      return next;
    });
  }, []);

  const clearIframeTimeout = useCallback(() => {
    if (iframeTimeoutRef.current !== null) {
      window.clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = null;
    }
  }, []);

  const switchToNextAvailableSource = useCallback((failedSourceKey: string) => {
    const nextSource = sourcesRef.current.find((source) => {
      const sourceKey = getSourceKey(source);
      return sourceKey !== failedSourceKey && !failedSourcesRef.current.includes(sourceKey);
    });

    if (nextSource) {
      setAllSourcesExhausted(false);
      setCurrentSource(nextSource);
      return true;
    }

    setAllSourcesExhausted(true);
    return false;
  }, [getSourceKey]);

  const hasRemainingSources = useCallback((failedSourceKey: string) => {
    return sourcesRef.current.some((source) => {
      const sourceKey = getSourceKey(source);
      return sourceKey !== failedSourceKey && !failedSourcesRef.current.includes(sourceKey);
    });
  }, [getSourceKey]);

  const markCurrentSourceAsFailed = useCallback((source: StreamSource) => {
    const sourceKey = getSourceKey(source);
    clearIframeTimeout();
    setIframeState('error');
    setFailedSourceState(sourceKey, true);
    if (hasRemainingSources(sourceKey)) {
      switchToNextAvailableSource(sourceKey);
      return;
    }
    setAllSourcesExhausted(true);
  }, [clearIframeTimeout, getSourceKey, hasRemainingSources, setFailedSourceState, switchToNextAvailableSource]);

  const handleSaveProgress = useCallback((useUnloadTransport: boolean = false) => {
    if (!mediaRef.current || videoTimeRef.current <= 0) return;
    
    const duration = mediaRef.current.runtime ? mediaRef.current.runtime * 60 : 1800;
    const finalDuration = videoRef.current?.duration || duration;

    if (useUnloadTransport) {
      saveProgressOnUnloadRef.current(
        mediaRef.current,
        videoTimeRef.current,
        finalDuration,
        season ? parseInt(season) : undefined,
        episode ? parseInt(episode) : undefined
      );
      return;
    }

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
        handleSaveProgress(true);
      }
    };

    const handlePageHide = () => {
      handleSaveProgress(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      handleSaveProgress(true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [handleSaveProgress]);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await ScreenOrientation.lock({ orientation: 'landscape' });
        }
      } catch (error) {
        console.warn('Screen orientation lock failed:', error);
      }
    };

    const unlockOrientation = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await ScreenOrientation.unlock();
        }
      } catch (error) {
        console.warn('Screen orientation unlock failed:', error);
      }
    };

    lockOrientation();

    return () => {
      unlockOrientation();
    };
  }, []);

  const startAt = React.useMemo(() => {
      if (!id) return 0;
      const saved = getProgressRef.current(
        parseInt(id), 
        season ? parseInt(season) : undefined, 
        episode ? parseInt(episode) : undefined
      );
      return saved ? saved.timestamp : 0;
  }, [id, season, episode]);

  const getProcessedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      if (startAt > 0) {
         return urlObj.toString() + `#t=${Math.floor(startAt)}`;
      }
      
      return urlObj.toString();
    } catch {
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
        
        setMedia({ ...mediaData, media_type: type });

        const validSources = Array.isArray(sourcesData?.sources)
          ? sourcesData.sources.filter((source): source is StreamSource => (
            typeof source?.url === 'string' && source.url.length > 0
            && typeof source?.source === 'string' && source.source.length > 0
          ))
          : [];

        const usableSources = validSources.filter((source) => !isKnownBrokenSource(source));

        setSources(usableSources);
        setFailedSources([]);
        failedSourcesRef.current = [];
        setAllSourcesExhausted(false);
        
        if (usableSources.length > 0) {
          const sourcePriority = [
            'VidSrc.cc',
            'VidSrc-Me.ru',
            'VidSrc-Me.su',
            'VidSrc-Embed.ru',
            'VidSrc-Embed.su',
          ];

          const preferredSource = sourcePriority
            .map((name) => usableSources.find((source) => source.source.includes(name)))
            .find((source): source is StreamSource => Boolean(source));

          setCurrentSource(preferredSource ?? usableSources[0]);
        } else {
          setAllSourcesExhausted(true);
          setCurrentSource(null);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setSources([]);
        setAllSourcesExhausted(true);
        setCurrentSource(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, season, episode]);

  useEffect(() => {
    if (videoRef.current && id) {
      const savedProgress = getProgressRef.current(
        parseInt(id),
        season ? parseInt(season) : undefined,
        episode ? parseInt(episode) : undefined
      );
      if (savedProgress && savedProgress.timestamp > 0) {
        videoRef.current.currentTime = savedProgress.timestamp;
      }
    }
  }, [episode, id, season]);

  useEffect(() => {
    if (!currentSource || !media || !id || !isEmbed) return;

    const saved = getProgressRef.current(
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
  }, [currentSource, media, id, isEmbed, season, episode, saveProgress]);

  const handleTimeUpdate = () => {
    if (videoRef.current && media) {
      const current = videoRef.current.currentTime;
      const nextDuration = videoRef.current.duration;
      setDuration(nextDuration || 0);
      videoTimeRef.current = current;
      
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 5000) {
         saveProgress(
            media, 
            current, 
            nextDuration || duration, 
            season ? parseInt(season) : undefined,
            episode ? parseInt(episode) : undefined
          );
         lastSaveTimeRef.current = now;
      }
    }
  };

  const [showOverlay, setShowOverlay] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetOverlayTimeout = useCallback(() => {
    setShowOverlay(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowOverlay(false);
    }, 2000);
  }, []);

  const handleSourceSelection = useCallback((source: StreamSource) => {
    const sourceKey = getSourceKey(source);
    clearIframeTimeout();
    resetOverlayTimeout();
    setFailedSourceState(sourceKey, false);
    setAllSourcesExhausted(false);
    setIframeState(source.type === 'embed' ? 'loading' : 'idle');
    setCurrentSource(source);
  }, [clearIframeTimeout, getSourceKey, resetOverlayTimeout, setFailedSourceState]);

  const handleTryNextSource = useCallback(() => {
    if (!currentSource) {
      return;
    }

    markCurrentSourceAsFailed(currentSource);
    resetOverlayTimeout();
  }, [currentSource, markCurrentSourceAsFailed, resetOverlayTimeout]);

  useEffect(() => {
    resetOverlayTimeout();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetOverlayTimeout]);

  useEffect(() => {
    if (!currentSource || !isEmbed) {
      clearIframeTimeout();
      setIframeState('idle');
      return;
    }

    const sourceKey = getSourceKey(currentSource);
    setIframeState('loading');

    iframeTimeoutRef.current = window.setTimeout(() => {
      markCurrentSourceAsFailed(currentSource);
    }, 15000);

    return () => {
      if (iframeTimeoutRef.current !== null) {
        window.clearTimeout(iframeTimeoutRef.current);
        iframeTimeoutRef.current = null;
      }
    };
  }, [clearIframeTimeout, currentSource, getSourceKey, isEmbed, markCurrentSourceAsFailed]);

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
        <p className="mb-4">{allSourcesExhausted ? 'All current sources failed for this title.' : 'No working sources are currently available for this content.'}</p>
        <button 
          type="button"
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
    <main 
      className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden"
      onMouseMove={resetOverlayTimeout}
      onTouchStart={resetOverlayTimeout}
      onMouseLeave={() => setShowOverlay(false)}
    >
      {media?.backdrop_path && (
        <div 
            className="absolute inset-0 z-0 scale-110 blur-3xl pointer-events-none"
            style={{ 
                backgroundImage: `url(${getImageUrl(media.backdrop_path, 'original')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.28,
            }}
        />
      )}

      {/* Thin hover area at the top to re-show overlays without blocking the player controls */}
      <div 
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-2 z-30" 
        onMouseEnter={resetOverlayTimeout}
        onMouseMove={resetOverlayTimeout}
        onTouchStart={resetOverlayTimeout}
      />

      <div className={`absolute top-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-b from-black/90 via-black/65 to-transparent px-5 py-4 md:px-8 md:py-6 transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <button 
                type="button"
                aria-label="Back to details"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                className="pointer-events-auto rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 hover:text-primary"
            >
                <ArrowLeft size={24} />
            </button>
            <div className="min-w-0 pointer-events-none">
              <h1 className="truncate text-lg font-semibold text-white md:text-2xl">{title}</h1>
              {isEmbed && iframeState === 'error' && (
                <p className="mt-1 text-sm text-red-200">That source did not load. Try another source below.</p>
              )}
              {isEmbed && allSourcesExhausted && (
                <p className="mt-1 text-sm text-red-200">All current sources failed for this title.</p>
              )}
              {isEmbed && iframeState === 'unverified' && (
                <p className="mt-1 text-sm text-white/80">If this source looks wrong or stays blank, switch to another one.</p>
              )}
            </div>
          </div>

          {isEmbed && sources.length > 0 && (
            <div className="pointer-events-auto flex max-w-[55vw] flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleTryNextSource}
                disabled={allSourcesExhausted}
                className={`rounded-full border border-primary/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors ${allSourcesExhausted ? 'cursor-not-allowed bg-primary/10 opacity-50' : 'bg-primary/20 hover:bg-primary/30'}`}
              >
                Next source
              </button>
              {sources.map((source, index) => {
                const sourceKey = getSourceKey(source);
                const isActiveSource = currentSource ? getSourceKey(currentSource) === sourceKey : false;
                const hasFailed = failedSources.includes(sourceKey);

                return (
                  <button
                    key={sourceKey}
                    type="button"
                    onClick={() => handleSourceSelection(source)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors ${isActiveSource ? 'border-white/70 bg-white/25' : 'border-white/20 bg-black/35 hover:border-white/40 hover:bg-white/15'} ${hasFailed ? 'border-red-300/50 bg-red-950/30 text-red-100 opacity-70' : ''}`}
                    aria-pressed={isActiveSource}
                    aria-label={source.source}
                  >
                    {`S${index + 1}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 z-10">
        {isEmbed ? (
        <div className="h-full w-full bg-black">
            <iframe
                src={getProcessedUrl(currentSource.url)}
                className="w-full h-full border-0 pointer-events-auto"
                allowFullScreen
                {...(currentSource.source.toLowerCase().includes('vidsrc.cc') || currentSource.url.includes('vidsrc.cc') 
                ? { sandbox: "allow-forms allow-scripts allow-same-origin allow-presentation allow-popups" } 
                : {}
                )}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="no-referrer"
                onLoad={() => {
                  clearIframeTimeout();
                  setIframeState('unverified');
                }}
                onError={() => {
                  markCurrentSourceAsFailed(currentSource);
                }}
            />
        </div>
      ) : (
        <video
          controls
          ref={videoRef}
          src={currentSource.url}
          className="h-full w-full object-contain shadow-2xl"
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (!videoRef.current) return;
            setDuration(videoRef.current.duration || 0);
          }}
        >
          <track kind="captions" label="English captions" />
        </video>
      )}
      </div>
    </main>
  );
};
