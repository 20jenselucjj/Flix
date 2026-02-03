import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { Media } from '../types';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data.results.filter((item: Media) => item.media_type === 'movie' || item.media_type === 'tv'));
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const trendingSearches = ["Avatar", "Stranger Things", "The Dark Knight", "Inception", "Breaking Bad"];

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <SearchIcon size={64} className="text-gray-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-white">Find your next favorite</h2>
        <p className="text-text-secondary mb-8 text-center max-w-md">
          Search for movies, TV shows, and more.
        </p>
        
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase text-xs font-bold tracking-wider">
            <TrendingUp size={14} />
            <span>Trending Searches</span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
        Results for <span className="text-primary">"{query}"</span>
      </h2>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(12)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {results.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
          <p className="text-text-secondary">We couldn't find anything matching "{query}".</p>
        </div>
      )}
    </div>
  );
};
