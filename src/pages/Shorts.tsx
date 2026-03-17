import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Play, Info, Maximize, ChevronUp, Heart, Volume2, VolumeX } from 'lucide-react';
import { useMyList } from '../hooks/useMyList';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useShortsFeed } from '../hooks/useShortsFeed';
import { getImageUrl } from '../lib/utils';
import { Media, ShortItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

type UnlockableOrientation = ScreenOrientation & {
  unlock?: () => void;
};

export const Shorts: React.FC = () => {
  const { items, loading, hasMore, loadMore } = useShortsFeed();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [lastActiveIndex, setLastActiveIndex] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const navigate = useNavigate();
  const { addToList, isInList, removeFromList } = useMyList();
  const { recordInteraction } = useWatchHistory();

  useEffect(() => {
    const orientation = screen.orientation as UnlockableOrientation;
    if (orientation?.unlock) {
      try {
        orientation.unlock();
      } catch {
        // Ignore unsupported unlocks.
      }
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);

    if (index !== activeIndex) {
      const duration = Date.now() - startTime;
      const previousItem = items[lastActiveIndex];

      if (previousItem) {
        let type: 'skip' | 'partial_watch' | 'full_watch' = 'partial_watch';

        if (duration < 3000) type = 'skip';
        else if (duration > 30000) type = 'full_watch';

        recordInteraction(previousItem.id, previousItem.genre_ids || [], type);
      }

      setActiveIndex(index);
      setLastActiveIndex(index);
      setStartTime(Date.now());
    }

    if (index >= items.length - 3 && hasMore && !loading) {
      loadMore();
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-4 pt-24 md:px-8">
        <div className="rounded-full border border-white/10 bg-black/45 px-4 py-2 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Shorts</p>
          <p className="mt-1 text-sm text-white">Swipe for quick picks</p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm text-white/80 backdrop-blur-xl">
          {Math.min(activeIndex + 1, Math.max(items.length, 1))} / {Math.max(items.length, 1)}
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-screen w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth bg-black"
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <ShortCard
            key={`${item.id}-${item.videoId}`}
            item={item}
            isActive={index === activeIndex}
            navigate={navigate}
            myList={{ addToList, isInList, removeFromList }}
            isMuted={isMuted}
            toggleMute={() => setIsMuted((value) => !value)}
            recordInteraction={recordInteraction}
          />
        ))}
        {loading && items.length > 0 && (
          <div className="flex h-screen w-full snap-start items-center justify-center bg-black text-white">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  delay?: number;
}> = ({ onClick, icon, label, active = false, delay = 0 }) => {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      onClick={onClick}
      className="flex w-full flex-col items-center gap-1 rounded-2xl outline-none transition-transform hover:scale-110"
    >
      <div className={`rounded-full p-3 transition-all duration-300 ${active ? 'bg-primary text-black shadow-lg shadow-primary/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium text-white/80">{label}</span>
    </motion.button>
  );
};

const MenuToggleButton: React.FC<{
  isMenuOpen: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ isMenuOpen, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full p-3 shadow-lg outline-none transition-all duration-300 md:p-4 ${
        isMenuOpen ? 'rotate-180 bg-primary text-black' : 'border border-white/20 bg-black/50 text-white hover:bg-white/20'
      } hover:scale-110`}
    >
      <ChevronUp size={24} />
    </button>
  );
};

const WatchNowButton: React.FC<{
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black outline-none transition-all hover:scale-105 hover:bg-gray-200"
    >
      <Play size={20} fill="currentColor" />
      Watch Now
    </button>
  );
};

interface ShortsListActions {
  addToList: (media: Media) => void;
  isInList: (id: number) => boolean;
  removeFromList: (id: number) => void;
}

const ShortCard: React.FC<{
  item: ShortItem;
  isActive: boolean;
  navigate: ReturnType<typeof useNavigate>;
  myList: ShortsListActions;
  isMuted: boolean;
  toggleMute: () => void;
  recordInteraction: ReturnType<typeof useWatchHistory>['recordInteraction'];
}> = ({ item, isActive, navigate, myList, isMuted, toggleMute, recordInteraction }) => {
  const inList = myList.isInList(item.id);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef<number>(0);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;
      setIsMobileLandscape(isLandscape && isMobile);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isActive && isPlaying && isMobileLandscape && !isMenuOpen) {
      timer = setTimeout(() => {
        setShowInfo(false);
      }, 5000);
    } else {
      setShowInfo(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, isPlaying, isMobileLandscape, isMenuOpen]);

  const handleToggleList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (inList) {
      myList.removeFromList(item.id);
    } else {
      const mediaItem: Media = {
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        vote_average: item.vote_average,
        media_type: 'movie'
      };
      myList.addToList(mediaItem);
    }
  };

  const togglePlay = () => {
    if (iframeRef.current?.contentWindow) {
      const action = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: action,
          args: ''
        }),
        '*'
      );
      setIsPlaying((value) => !value);
    }
  };

  const handleDoubleTap = (stopPropagation: () => void) => {
    const now = Date.now();
    const doubleTapDelay = 300;

    if (now - lastTap.current < doubleTapDelay) {
      stopPropagation();
      setShowHeart(true);
      setIsLiked(true);
      recordInteraction(item.id, item.genre_ids || [], 'like');
      setTimeout(() => setShowHeart(false), 1000);
    } else {
      togglePlay();
    }

    lastTap.current = now;
  };

  const toggleFullscreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!videoContainerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    videoContainerRef.current.requestFullscreen().catch((error: Error) => {
      console.error(`Error attempting to enable fullscreen: ${error.message}`);
    });
  };

  return (
    <div className="relative flex h-screen w-full snap-start items-center justify-center overflow-hidden bg-black">
      <button
        type="button"
        aria-label={`Play or pause ${item.title}`}
        className="absolute inset-0 z-10 outline-none"
        onClick={(e) => {
          handleDoubleTap(() => e.stopPropagation());
        }}
      />
      <div
        className="absolute inset-0 z-0 scale-125 opacity-30 blur-3xl"
        style={{
          backgroundImage: `url(${getImageUrl(item.poster_path, 'w500')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div
        ref={videoContainerRef}
        className="relative z-10 flex h-full w-full items-center justify-center bg-black shadow-2xl md:h-[85vh] md:max-w-6xl md:overflow-hidden md:rounded-[2rem] md:border md:border-white/10"
      >
        {isActive ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&controls=0&mute=${isMuted ? 1 : 0}&loop=1&playlist=${item.videoId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
            className="h-full w-full object-contain pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={item.title}
          />
        ) : (
          <img
            src={`https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`}
            className="h-full w-full object-contain opacity-50"
            alt={item.title}
          />
        )}

        {!isPlaying && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="scale-100 rounded-full bg-black/50 p-6 opacity-100 backdrop-blur-sm transition-transform">
              <Play size={48} fill="white" className="ml-2 text-white" />
            </div>
          </div>
        )}

        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1, rotate: [0, -10, 10, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            >
              <Heart size={100} fill="red" className="text-red-500 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute left-0 right-0 top-0 flex items-start justify-between gap-4 px-5 pt-28 md:px-8 md:pt-28">
          <div className={`rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs font-medium text-white/85 backdrop-blur-xl transition-opacity duration-500 ${showInfo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            Quick preview
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className={`pointer-events-auto rounded-full border border-white/10 bg-black/45 p-3 text-white backdrop-blur-xl transition-opacity duration-500 ${showInfo ? 'opacity-100' : 'opacity-0'}`}
            aria-label={isMuted ? 'Unmute short' : 'Mute short'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className={`absolute right-4 bottom-24 z-50 transition-opacity duration-500 md:right-8 md:bottom-1/3 ${showInfo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <MenuToggleButton
            isMenuOpen={isMenuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((value) => !value);
            }}
          />
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto absolute right-4 bottom-40 z-40 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md md:right-8 md:bottom-[calc(33%+5rem)]"
            >
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  const nextLiked = !isLiked;
                  setIsLiked(nextLiked);
                  recordInteraction(item.id, item.genre_ids || [], nextLiked ? 'like' : 'dislike');
                }}
                icon={<Heart size={20} fill={isLiked ? 'red' : 'none'} className={isLiked ? 'text-red-500' : ''} />}
                label="Like"
                active={isLiked}
                delay={0.05}
              />

              <ActionButton
                onClick={handleToggleList}
                icon={inList ? <Check size={20} /> : <Plus size={20} />}
                label="My List"
                active={inList}
                delay={0.1}
              />

              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/movie/${item.id}`);
                }}
                icon={<Info size={20} />}
                label="Details"
                delay={0.2}
              />

              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                icon={isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                label={isMuted ? 'Unmute' : 'Mute'}
                active={!isMuted}
                delay={0.3}
              />

              <ActionButton
                onClick={toggleFullscreen}
                icon={<Maximize size={20} />}
                label="Full"
                delay={0.4}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-6 bg-gradient-to-t from-black via-black/60 to-transparent p-6 md:p-12">
          <div className={`flex-1 pr-16 transition-opacity duration-500 md:pr-0 ${showInfo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Short pick</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Tap to pause</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Double-tap to like</span>
            </div>

            <button
              type="button"
              className="mb-2 text-left text-2xl font-bold text-white drop-shadow-lg transition-colors hover:text-primary md:text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movie/${item.id}`);
              }}
            >
              {item.title}
            </button>
            <button
              type="button"
              className={`mb-4 max-w-2xl text-left text-sm text-gray-200 drop-shadow-md transition-all duration-300 md:text-base ${isExpanded ? '' : 'line-clamp-2 md:line-clamp-3'}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((value) => !value);
              }}
            >
              {item.overview}
            </button>

            <WatchNowButton
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/watch/movie/${item.id}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
