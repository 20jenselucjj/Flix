import React from 'react';
import { Play, Info, Plus, Check, Shuffle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Media } from '../types';
import { getDisplayYear, getGenreLabels, getImageUrl, getMediaLabel } from '../lib/utils';
import { useMyList } from '../hooks/useMyList';
import { useIsMobile } from '../hooks/useIsMobile';

import { FocusableLink } from './FocusableLink';
import { FocusableButton } from './FocusableButton';

interface HeroProps {
  media: Media;
  onSurprise?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ media, onSurprise }) => {
  const { addToList, removeFromList, isInList } = useMyList();
  const isMobile = useIsMobile();
  
  if (!media) return null;

  const title = media.title || media.name;
  const overview = media.overview;
  const type = media.media_type || (media.title ? 'movie' : 'tv');
  const inList = isInList(media.id);
  const genreLabels = getGenreLabels(media.genre_ids, 2);
  const displayYear = getDisplayYear(media.release_date || media.first_air_date);
  const mediaLabel = getMediaLabel(type);

  const toggleList = () => {
    if (inList) {
      removeFromList(media.id);
    } else {
      addToList(media);
    }
  };

  return (
    <div className="relative h-[85vh] w-full mb-8 overflow-hidden">
      <div className="absolute inset-0">
        <motion.img
          key={`hero-img-${media.id}`}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={getImageUrl(isMobile ? (media.poster_path || media.backdrop_path) : media.backdrop_path, 'original')}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 pb-20 z-20">
        <motion.div 
          key={`hero-txt-${media.id}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-white drop-shadow-2xl leading-tight tracking-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-200 font-semibold mb-4 drop-shadow-md">
            {media.vote_average > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300 ring-1 ring-emerald-400/20">
                <Star size={14} className="fill-current" />
                {Math.round(media.vote_average * 10)}% Match
              </span>
            )}
            {displayYear && <span>{displayYear}</span>}
            {media.certification && (
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">
                {media.certification}
              </span>
            )}
            {mediaLabel && (
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">
                {mediaLabel}
              </span>
            )}
            {genreLabels.map((genre) => (
              <span key={genre} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/85 backdrop-blur-sm">
                {genre}
              </span>
            ))}
          </div>
          <p className="text-lg md:text-xl text-gray-100 mb-8 line-clamp-3 drop-shadow-lg max-w-2xl font-medium leading-relaxed">
            {overview}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <FocusableLink
              focusKey="hero-play"
              to={`/watch/${type}/${media.id}`}
              className="bg-white text-black px-8 py-3 rounded-md font-bold flex items-center gap-3 hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Play size={24} fill="currentColor" />
              Play
            </FocusableLink>
            <FocusableLink
              focusKey="hero-info"
              to={`/${type}/${media.id}`}
              className="bg-white/10 p-3 rounded-full text-white font-bold flex items-center hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 hover:border-white/30 shadow-lg"
              title="More Info"
            >
              <Info size={24} />
            </FocusableLink>
            <FocusableButton
              focusKey="hero-list"
              onClick={toggleList}
              className="bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 hover:border-white/30 shadow-lg group"
              title={inList ? "Remove from My List" : "Add to My List"}
            >
              {inList ? <Check size={24} className="text-green-400" /> : <Plus size={24} className="group-hover:scale-110 transition-transform" />}
            </FocusableButton>
            
            {onSurprise && (
              <FocusableButton
                focusKey="hero-surprise"
                onClick={onSurprise}
                className="bg-primary text-white p-3 rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-primary/30 group relative overflow-hidden"
                title="Surprise Me!"
              >
                 <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                 <Shuffle size={24} className="group-hover:rotate-180 transition-transform duration-500" />
              </FocusableButton>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
