import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Media } from '../types';
import { getDisplayYear, getGenreLabels, getImageUrl, getMediaLabel } from '../lib/utils';
import { useIsMobile } from '../hooks/useIsMobile';

interface MediaCardProps {
  media: Media & { 
    progress?: number;
    season?: number;
    episode?: number;
  };
  onRemove?: (id: number) => void;
  onImageError?: (id: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onRemove, onImageError }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const title = media.title || media.name;
  const type = media.media_type || (media.title ? 'movie' : 'tv');
  const displayYear = getDisplayYear(media.release_date || media.first_air_date);
  const genreLabels = getGenreLabels(media.genre_ids, 1);
  const mediaLabel = getMediaLabel(type);

  if (!media.poster_path) return null;

  return (
    <motion.div 
      className="group cursor-pointer outline-none transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={isMobile ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/${type}/${media.id}`)}
    >
      <div className="block w-full h-full space-y-3">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-surface shadow-lg ring-1 ring-white/10">
          <img
            src={getImageUrl(media.poster_path)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => onImageError?.(media.id)}
          />
          
          {/* Season/Episode Badge */}
          {type === 'tv' && media.season && media.episode && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-primary/90 px-2 py-1 rounded text-[10px] text-white font-bold backdrop-blur-sm shadow-sm">
                S{media.season} E{media.episode}
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
            <div className="rounded-xl bg-black/30 p-3 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-0">
              <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight mb-1">{title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-200 font-medium">
                {displayYear && <span>{displayYear}</span>}
                {mediaLabel && (
                  <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/85">
                    {mediaLabel}
                  </span>
                )}
                {genreLabels.map((genre) => (
                  <span key={genre} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/85">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            {media.certification && (
              <div className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-bold backdrop-blur-md border border-white/20">
                {media.certification}
              </div>
            )}
            <div className="bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-bold flex items-center gap-1 backdrop-blur-md">
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

        <div className="space-y-1 px-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white/95">{title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/55">
            {displayYear && <span>{displayYear}</span>}
            {mediaLabel && <span>{mediaLabel}</span>}
            {genreLabels.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
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
