import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Play, Info, Maximize, ChevronUp, Heart } from 'lucide-react';
import { useMyList } from '../hooks/useMyList';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useShortsFeed } from '../hooks/useShortsFeed';
import { getImageUrl } from '../lib/utils';
import { Media, ShortItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Unlock orientation when entering Shorts to allow landscape viewing
  useEffect(() => {
    if (screen.orientation && 'unlock' in screen.orientation) {
      try {
        // @ts-ignore
        screen.orientation.unlock();
      } catch (e) {
        // Ignore errors if unlock is not supported or fails
      }
    }
  }, []);

  // Handle interaction tracking on scroll
  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
      
      if (index !== activeIndex) {
        // User swiped away from lastActiveIndex
        const duration = Date.now() - startTime;
        const previousItem = items[lastActiveIndex];
        
        if (previousItem) {
          // Logic: < 3s = skip, > 30s = full_watch (approx), else partial
          let type: 'skip' | 'partial_watch' | 'full_watch' = 'partial_watch';
          if (duration < 3000) type = 'skip';
          else if (duration > 30000) type = 'full_watch';
          
          recordInteraction(previousItem.id, previousItem.genre_ids || [], type);
        }

        setActiveIndex(index);
        setLastActiveIndex(index);
        setStartTime(Date.now());
      }
      
      // Load more when we are near the end
      if (index >= items.length - 3 && hasMore && !loading) {
        loadMore();
      }
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black scroll-smooth"
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <ShortCard 
          key={`${item.id}-${index}`} 
          item={item} 
          isActive={index === activeIndex} 
          navigate={navigate}
          myList={{ addToList, isInList, removeFromList }}
          isMuted={isMuted}
          toggleMute={() => setIsMuted(!isMuted)}
          recordInteraction={recordInteraction}
        />
      ))}
      {loading && items.length > 0 && (
        <div className="snap-start h-screen w-full flex items-center justify-center bg-black text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

const ActionButton: React.FC<{
  onClick: (e: any) => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  delay?: number;
}> = ({ onClick, icon, label, active = false, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.2 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 group w-full"
  >
    <div className={`p-3 rounded-full transition-colors ${active ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium text-white/80">{label}</span>
  </motion.button>
);

const ShortCard: React.FC<{ 
  item: ShortItem; 
  isActive: boolean; 
  navigate: any;
  myList: any;
  isMuted: boolean;
  toggleMute: () => void;
  recordInteraction: (id: number, genres: number[], type: any) => void;
}> = ({ item, isActive, navigate, myList, isMuted, toggleMute, recordInteraction }) => {
  const inList = myList.isInList(item.id);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef<number>(0);

  const handleToggleList = (e: React.MouseEvent) => {
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
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const action = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: action,
        args: ''
      }), '*');
      setIsPlaying(!isPlaying);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      e.stopPropagation();
      setShowHeart(true);
      setIsLiked(true);
      recordInteraction(item.id, item.genre_ids || [], 'like');
      setTimeout(() => setShowHeart(false), 1000);
    } else {
        // Single tap - toggle play
        togglePlay();
    }
    lastTap.current = now;
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoContainerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="h-screen w-full snap-start relative flex items-center justify-center bg-black overflow-hidden">
      {/* Background Blur */}
      <div 
        className="absolute inset-0 opacity-30 blur-3xl scale-125 z-0"
        style={{ 
          backgroundImage: `url(${getImageUrl(item.poster_path, 'w500')})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      />

      {/* Video Container */}
      <div 
        ref={videoContainerRef}
        className="relative w-full h-full md:max-w-6xl md:h-[85vh] z-10 flex items-center justify-center shadow-2xl bg-black"
        onClick={handleDoubleTap}
      >
        {isActive ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&controls=0&mute=${isMuted ? 1 : 0}&loop=1&playlist=${item.videoId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
            className="w-full h-full object-contain pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={item.title}
          />
        ) : (
           <img 
             src={`https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`} 
             className="w-full h-full object-contain opacity-50"
             alt={item.title}
           />
        )}
        
        {/* Play/Pause overlay handled by DoubleTap */}
        {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
             <div className="bg-black/50 p-6 rounded-full backdrop-blur-sm transition-transform scale-100 opacity-100">
                <Play size={48} fill="white" className="text-white ml-2" />
             </div>
            </div>
        )}

        {/* Heart Animation Overlay */}
        <AnimatePresence>
            {showHeart && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1, rotate: [0, -10, 10, 0] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                >
                    <Heart size={100} fill="red" className="text-red-500 drop-shadow-lg" />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* Toggle Menu Button */}
        <div className="absolute right-4 bottom-24 md:bottom-1/3 md:right-8 z-50 pointer-events-auto">
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                }}
                className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${isMenuOpen ? 'bg-primary text-black rotate-180' : 'bg-black/50 text-white border border-white/20 hover:bg-white/20'}`}
             >
                <ChevronUp size={24} />
             </button>
        </div>

        {/* Action Menu */}
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-4 bottom-40 md:bottom-[calc(33%+5rem)] md:right-8 flex flex-col gap-4 items-center pointer-events-auto z-40 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10"
                >
                     <ActionButton 
                        onClick={() => {
                            setIsLiked(!isLiked);
                            recordInteraction(item.id, item.genre_ids || [], isLiked ? 'dislike' : 'like'); // Toggle-ish, though dislike isn't exactly un-like
                        }}
                        icon={<Heart size={20} fill={isLiked ? "red" : "none"} className={isLiked ? "text-red-500" : ""} />}
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
                        onClick={() => navigate(`/movie/${item.id}`)}
                        icon={<Info size={20} />}
                        label="Details"
                        delay={0.2}
                    />

                    <ActionButton 
                        onClick={(e: any) => {
                            e.stopPropagation();
                            toggleMute();
                        }}
                        icon={isMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        )}
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

        {/* Bottom Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black via-black/60 to-transparent flex items-end justify-between gap-6">
          <div className="flex-1 pointer-events-auto pr-16 md:pr-0">
            <h2 
                className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/movie/${item.id}`)}
            >
                {item.title}
            </h2>
            <p 
                className={`text-gray-200 max-w-2xl drop-shadow-md text-sm md:text-base mb-4 cursor-pointer transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2 md:line-clamp-3'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
            >
                {item.overview}
            </p>
            
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/watch/movie/${item.id}`);
                }}
                className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
                <Play size={20} fill="currentColor" />
                Watch Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
