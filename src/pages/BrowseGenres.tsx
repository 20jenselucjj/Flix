import React, { useState, useEffect } from 'react';
import { Film, Tv, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { Genre } from '../types';
import { FocusableLink } from '../components/FocusableLink';

export const BrowseGenres: React.FC = () => {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movies, tv] = await Promise.all([
          api.getGenres('movie'),
          api.getGenres('tv')
        ]);
        setMovieGenres(movies.genres || []);
        setTvGenres(tv.genres || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-background px-8 md:px-16">
      <div className="container mx-auto max-w-6xl">
        {/* Movies Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Film className="text-primary" size={24} />
            <h2 className="text-2xl font-bold text-white">Movies</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <FocusableLink 
              to="/movies" 
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-colors flex items-center justify-between group"
            >
              <span className="text-white font-medium">All Movies</span>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
            </FocusableLink>
            {movieGenres.map(genre => (
              <FocusableLink 
                key={`movie-${genre.id}`}
                to={`/genre/movie/${genre.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-colors flex items-center justify-between group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">{genre.name}</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
              </FocusableLink>
            ))}
          </div>
        </div>

        {/* TV Shows Section */}
        <div>
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Tv className="text-primary" size={24} />
            <h2 className="text-2xl font-bold text-white">TV Shows</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             <FocusableLink 
              to="/tv" 
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-colors flex items-center justify-between group"
            >
              <span className="text-white font-medium">All TV Shows</span>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
            </FocusableLink>
            {tvGenres.map(genre => (
              <FocusableLink 
                key={`tv-${genre.id}`}
                to={`/genre/tv/${genre.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-colors flex items-center justify-between group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">{genre.name}</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
              </FocusableLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
