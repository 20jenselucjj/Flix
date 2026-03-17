import React, { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { FilterBar } from '../components/FilterBar';
import { Media } from '../types';
import { getImageUrl } from '../lib/utils';

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
  const observer = useRef<IntersectionObserver | null>(null);
  const resetKey = `${type}:${sortBy}`;
  const previousResetKey = useRef<string | null>(null);

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
    if (previousResetKey.current === null) {
      previousResetKey.current = resetKey;
      return;
    }

    if (previousResetKey.current !== resetKey) {
      previousResetKey.current = resetKey;
      setItems([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
    }
  }, [resetKey]);

  const handleSortChange = (value: string) => {
    if (value === sortBy) return;

    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setSortBy(value);
  };

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
  }, [type, page, sortBy]);

  const getTitle = () => {
    const mediaType = type === 'movie' ? 'Movies' : 'TV Shows';
    if (sortBy === 'popularity.desc') return `Popular ${mediaType}`;
    if (sortBy === 'vote_average.desc') return `Top Rated ${mediaType}`;
    if (sortBy.includes('date.desc')) return `Newest ${mediaType}`;
    return mediaType;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <section className="relative mb-8 rounded-[2rem] border border-white/10 bg-white/[0.03]">
        {items[0]?.backdrop_path && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={getImageUrl(items[0].backdrop_path, 'w1280')}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        <div className="relative flex flex-col gap-5 px-6 py-8 md:flex-row md:items-end md:justify-between md:px-8 md:py-10">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Browse</p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">{getTitle()}</h2>
          </div>
          <FilterBar 
            sortBy={sortBy} 
            onSortChange={handleSortChange} 
            type={type} 
          />
        </div>
      </section>

      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white/90">All results</h3>
        <p className="text-sm text-white/45">Infinite scroll enabled</p>
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
