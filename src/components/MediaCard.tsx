import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Media } from '../types';
import { getImageUrl } from '../lib/utils';
import { useIsMobile } from '../hooks/useIsMobile';

interface MediaCardProps {
  media: Media & { 
    progress?: number;
    season?: number;
    episode?: number;
  };
  onRemove?: (id: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onRemove }) => {
  const isMobile = useIsMobile();
  
  const title = media.title || media.name;
  const type = media.media_type || (media.title ? 'movie' : 'tv');

  return (
    <motion.div 
      className="relative aspect-[2/3] group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={isMobile ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/${type}/${media.id}`} className="block w-full h-full">
        <div className="w-full h-full rounded-md overflow-hidden bg-surface shadow-lg relative">
          <img
            src={getImageUrl(media.poster_path)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Season/Episode Badge */}
          {type === 'tv' && media.season && media.episode && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-primary/90 px-2 py-1 rounded text-[10px] text-white font-bold backdrop-blur-sm shadow-sm">
                S{media.season} E{media.episode}
              </div>
            </div>
          )}

          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
            {media.certification && (
              <div className="bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-bold backdrop-blur-sm border border-white/20">
                {media.certification}
              </div>
            )}
            <div className="bg-black/60 px-1.5 py-0.5 rounded text-xs text-white font-bold flex items-center gap-1 backdrop-blur-sm">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              {media.vote_average?.toFixed(1)}
            </div>
          </div>
          
          {/* Progress Bar */}
          {media.progress !== undefined && media.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/80 z-10">
              <div 
                className="h-full bg-red-600" 
                style={{ width: `${media.progress}%` }} 
              />
            </div>
          )}
        </div>
      </Link>

      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(media.id);
          }}
          className="absolute top-2 left-2 z-20 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
          title="Remove from list"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
};
