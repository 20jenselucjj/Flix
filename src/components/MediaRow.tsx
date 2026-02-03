import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Media } from '../types';
import { MediaCard } from './MediaCard';

interface MediaRowProps {
  title: string;
  items: Media[];
}

export const MediaRow: React.FC<MediaRowProps> = ({ title, items }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth + 100 : current.offsetWidth - 100;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 group/row">
      <h2 className="text-xl font-bold mb-4 px-4 md:px-12 text-white">{title}</h2>
      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto px-4 md:px-12 pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-none w-[140px] md:w-[180px]">
              <MediaCard media={item} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
