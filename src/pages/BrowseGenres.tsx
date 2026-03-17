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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 md:px-8 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <section className="section-shell relative overflow-hidden px-6 py-8 md:px-10 md:py-12">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-primary/10" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Browse smarter</p>
              <h1 className="text-3xl font-bold text-white md:text-5xl">Every genre, organized for faster discovery.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
                Jump straight into the mood you want. Movie and TV categories are grouped, easy to scan, and tuned for quick browsing instead of endless hunting.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{movieGenres.length} movie genres</div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{tvGenres.length} TV genres</div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <section className="section-shell p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Film className="text-primary" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-white">Movies</h2>
                <p className="mt-1 text-sm text-text-secondary">Blockbusters, hidden gems, and everything in between.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <GenreTile to="/movies" label="All Movies" featured />
              {movieGenres.map((genre) => (
                <GenreTile key={`movie-${genre.id}`} to={`/genre/movie/${genre.id}`} label={genre.name} />
              ))}
            </div>
          </section>

          <section className="section-shell p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Tv className="text-primary" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-white">TV Shows</h2>
                <p className="mt-1 text-sm text-text-secondary">Find the next binge without digging through noisy menus.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <GenreTile to="/tv" label="All TV Shows" featured />
              {tvGenres.map((genre) => (
                <GenreTile key={`tv-${genre.id}`} to={`/genre/tv/${genre.id}`} label={genre.name} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const GenreTile: React.FC<{ to: string; label: string; featured?: boolean }> = ({ to, label, featured = false }) => {
  return (
    <FocusableLink
      to={to}
      className={`group flex items-center justify-between rounded-2xl p-4 transition-colors ${
        featured
          ? 'border border-primary/25 bg-primary/10 hover:bg-primary/15'
          : 'border border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
      }`}
    >
      <span className={featured ? 'font-medium text-white' : 'text-gray-300 transition-colors group-hover:text-white'}>{label}</span>
      <ChevronRight size={16} className="text-gray-400 transition-colors group-hover:text-primary" />
    </FocusableLink>
  );
};
