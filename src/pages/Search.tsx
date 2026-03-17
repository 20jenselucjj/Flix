import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clapperboard, Search as SearchIcon, TrendingUp, Tv2 } from 'lucide-react';
import { api } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { Media } from '../types';
import { Link } from 'react-router-dom';

export const Search: React.FC = () => {
  const skeletonKeys = [
    'search-skeleton-1',
    'search-skeleton-2',
    'search-skeleton-3',
    'search-skeleton-4',
    'search-skeleton-5',
    'search-skeleton-6',
    'search-skeleton-7',
    'search-skeleton-8',
    'search-skeleton-9',
    'search-skeleton-10',
    'search-skeleton-11',
    'search-skeleton-12'
  ];
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState(query || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(query || '');
    setMediaFilter('all');
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

  const filteredResults = React.useMemo(() => {
    if (mediaFilter === 'all') return results;
    return results.filter(item => item.media_type === mediaFilter);
  }, [results, mediaFilter]);

  if (!query && results.length === 0) {
    return (
      <div className="container mx-auto px-8 md:px-16 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <SearchIcon size={64} className="text-gray-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-white">Find your next favorite</h2>
        
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Results for <span className="text-primary">"{query}"</span>
            </h2>
            {results.length > 0 && (
              <div className="flex gap-2">
                {(['all', 'movie', 'tv'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setMediaFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      mediaFilter === filter 
                        ? 'bg-white text-black' 
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'movie' ? 'Movies' : 'TV Shows'}
                  </button>
                ))}
              </div>
            )}
          </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {skeletonKeys.map((key) => (
            <SkeletonCard key={key} />
          ))}
        </div>
      ) : results.length > 0 && filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredResults.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchIcon}
          title={results.length > 0 ? `No ${mediaFilter === 'movie' ? 'movie' : 'TV'} matches` : 'No results found'}
          description={results.length > 0
            ? `We found results for "${query}", but nothing matches the ${mediaFilter === 'movie' ? 'Movies' : 'TV Shows'} filter right now.`
            : `We couldn't find anything matching "${query}". Try a broader title or jump into one of the popular searches below.`}
          action={
            <div className="space-y-5">
              {results.length === 0 && (
                <div className="flex flex-wrap justify-center gap-3">
                  {trendingSearches.map((term) => (
                    <TrendingTag key={term} term={term} />
                  ))}
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/movies" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-gray-200">
                  <Clapperboard size={16} />
                  Browse Movies
                </Link>
                <Link to="/tv" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  <Tv2 size={16} />
                  Browse TV Shows
                </Link>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};

const TrendingTag: React.FC<{ term: string }> = ({ term }) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/search?q=${encodeURIComponent(term)}`);
  
  return (
    <button
      type="button"
      tabIndex={0}
      onClick={handleClick}
      className={`bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white transition-all outline-none focus:ring-2 focus:ring-white focus:bg-white/20`}
    >
      {term}
    </button>
  );
};
