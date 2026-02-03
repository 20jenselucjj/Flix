import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { Media, Genre as GenreType } from '../types';

export const Genre: React.FC = () => {
  const { type, genreId } = useParams<{ type: string; genreId: string }>();
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreName, setGenreName] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !genreId) return;
      
      setLoading(true);
      try {
        const [discoverData, genresData] = await Promise.all([
          api.discoverByGenre(type as 'movie' | 'tv', parseInt(genreId)),
          api.getGenres(type as 'movie' | 'tv')
        ]);
        
        setItems(discoverData.results);
        
        const genre = genresData.genres.find((g: GenreType) => g.id === parseInt(genreId));
        if (genre) {
            setGenreName(genre.name);
        }
      } catch (error) {
        console.error('Failed to fetch genre data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, genreId, location.pathname]);

  const title = `${genreName} ${type === 'movie' ? 'Movies' : 'TV Shows'}`;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {items.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </div>
  );
};
