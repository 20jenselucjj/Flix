import React, { useEffect, useState, useRef } from 'react';
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

  const [inputValue, setInputValue] = useState(query || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(query || '');
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
        navigate(`/search?q=${encodeURIComponent(inputValue)}`);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
          setResults([]);
          setLoading(false);
          return;
      }
      
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

  if (!query && results.length === 0) {
    return (
      <div className="container mx-auto px-8 md:px-16 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <SearchIcon size={64} className="text-gray-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-white">Find your next favorite</h2>
        
        <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mb-12 relative">
             <input
                ref={inputRef}
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search movies, TV shows..."
                className={`w-full bg-[#2a2a2a] border border-white/10 rounded-full py-4 pl-14 pr-6 text-xl text-white placeholder-gray-500 focus:outline-none transition-all focus:ring-4 focus:ring-primary/50 focus:border-primary`}
             />
             <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        </form>
        
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase text-xs font-bold tracking-wider">
            <TrendingUp size={14} />
            <span>Trending Searches</span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {trendingSearches.map((term) => (
              <TrendingTag key={term} term={term} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 md:px-16 py-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Results for <span className="text-primary">"{query}"</span>
          </h2>
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
             <input
                ref={inputRef}
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search..."
                className={`w-full bg-[#2a2a2a] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none transition-all focus:ring-2 focus:ring-primary focus:border-primary`}
             />
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </form>
      </div>
      
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

const TrendingTag: React.FC<{ term: string }> = ({ term }) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/search?q=${encodeURIComponent(term)}`);
  
  return (
    <button
      tabIndex={0}
      onClick={handleClick}
      className={`bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white transition-all outline-none focus:ring-2 focus:ring-white focus:bg-white/20`}
    >
      {term}
    </button>
  );
};
