import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, videoKey }) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Auto-fullscreen logic for mobile
  useEffect(() => {
    if (isOpen && isMobile && containerRef.current) {
      const enterFullscreen = async () => {
        try {
          // Type assertion for vendor prefixes if needed, though standard API is preferred
          const element = containerRef.current as any;
          const requestMethod = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;

          if (requestMethod) {
            await requestMethod.call(element);
            
            // Try to lock orientation to landscape
            if (screen.orientation && 'lock' in screen.orientation) {
               // @ts-ignore - lock is not in all TS definitions
               await screen.orientation.lock('landscape').catch(() => {
                 // Ignore errors (e.g. not supported or permission denied)
               });
            }
          }
        } catch (e) {
          console.error('Fullscreen attempt failed:', e);
        }
      };
      
      // Small delay to ensure render is complete
      const timer = setTimeout(enterFullscreen, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile]);

  // Listen for fullscreen exit to close modal on mobile
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (!isFullscreen && isMobile && isOpen) {
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isMobile, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl max-h-[80vh] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl z-10"
          >
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 z-20 bg-black/50 hover:bg-white/20 text-white p-3 rounded-full transition-colors backdrop-blur-md ${isMobile ? 'hidden' : 'block'}`}
            >
              <X size={24} />
            </button>
            
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
