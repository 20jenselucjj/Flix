import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { FilterBar } from '../components/FilterBar';
import { Media } from '../types';

interface CategoryProps {
  type: 'movie' | 'tv';
}

export const Category: React.FC<CategoryProps> = ({ type }) => {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const location = useLocation();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isFetching) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isFetching, hasMore]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setSortBy('popularity.desc');
  }, [type, location.pathname]);

  // Handle sort change reset
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [sortBy]);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const data = await api.discover(type, page, sortBy);
        setItems(prev => {
          if (page === 1) return data.results;
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = data.results.filter((item: Media) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        setHasMore(data.page < data.total_pages);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchData();
  }, [type, page, location.pathname, sortBy]);

  const getTitle = () => {
    const mediaType = type === 'movie' ? 'Movies' : 'TV Shows';
    if (sortBy === 'popularity.desc') return `Popular ${mediaType}`;
    if (sortBy === 'vote_average.desc') return `Top Rated ${mediaType}`;
    if (sortBy.includes('date.desc')) return `Newest ${mediaType}`;
    return mediaType;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <FilterBar 
          sortBy={sortBy} 
          onSortChange={setSortBy} 
          type={type} 
        />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {items.map((item, index) => {
          if (items.length === index + 1) {
            return (
              <div ref={lastElementRef} key={item.id}>
                <MediaCard media={item} />
              </div>
            );
          }
          return <MediaCard key={item.id} media={item} />;
        })}
      </div>

      {(loading || isFetching) && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};
