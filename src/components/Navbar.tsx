import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Menu, X, ChevronDown, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Genre } from '../types';
import { FocusableLink } from './FocusableLink';

const SEARCH_HISTORY_KEY = 'flix_search_history';
const MAX_SEARCH_HISTORY = 5;

const getSearchHistory = (): string[] => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSearchToHistory = (query: string) => {
  if (!query.trim()) return;
  const history = getSearchHistory();
  const filtered = history.filter(item => item.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, MAX_SEARCH_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

const removeSearchFromHistory = (query: string) => {
  const history = getSearchHistory();
  const updated = history.filter(item => item !== query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};


export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchInputRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

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
      }
    };

    window.addEventListener('scroll', handleScroll);
    fetchGenres();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsGenreMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    saveSearchToHistory(searchQuery.trim());
    setSearchHistory(getSearchHistory());
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    closeMobileMenu();
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchFocused(false);
  };

  const handleRemoveHistory = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeSearchFromHistory(query);
    setSearchHistory(getSearchHistory());
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full px-3 pt-[env(safe-area-inset-top)] transition-all duration-500 md:px-5 ${
        isScrolled || isMobileMenuOpen ? 'py-3' : 'py-4'
      }`}
    >
      <div
        className={`container mx-auto flex h-20 items-center justify-between rounded-[1.75rem] border border-white/10 px-4 shadow-panel transition-all duration-500 md:px-6 ${
          isScrolled || isMobileMenuOpen ? 'bg-[#0d1018]/92 backdrop-blur-2xl' : 'bg-[#0d1018]/78 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center gap-6 lg:gap-10">
          <FocusableLink to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <img src="/F192.png" alt="FLIX" className="h-10 w-auto object-contain" />

          </FocusableLink>

          <nav className="hidden items-center gap-3 xl:flex">
            <NavLink to="/" label="Home" active={location.pathname === '/'} />
            <NavLink to="/shorts" label="Shorts" active={location.pathname === '/shorts'} />
            <NavLink to="/browse-genres" label="Browse" active={location.pathname === '/browse-genres'} />

            <div className="relative flex h-20 items-center">
              <button
                type="button"
                onClick={() => setIsGenreMenuOpen((value) => !value)}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors hover:text-white ${
                  isGenreMenuOpen ? 'bg-white/10 text-white' : 'text-gray-400'
                }`}
              >
                Categories
                <ChevronDown size={14} className={`transition-transform duration-300 ${isGenreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isGenreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="panel absolute top-full left-1/2 z-50 mt-3 grid w-[620px] -translate-x-1/2 grid-cols-2 gap-x-8 gap-y-2 rounded-[1.5rem] p-6"
                  >
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                        <Film size={16} className="text-primary" /> Movies
                      </h3>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <MenuLink to="/movies" className="col-span-2 text-primary font-bold">All Movies</MenuLink>
                        {movieGenres.slice(0, 14).map((genre) => (
                          <MenuLink key={genre.id} to={`/genre/movie/${genre.id}`}>{genre.name}</MenuLink>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                        <Tv size={16} className="text-primary" /> TV Shows
                      </h3>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <MenuLink to="/tv" className="col-span-2 text-primary font-bold">All TV Shows</MenuLink>
                        {tvGenres.slice(0, 14).map((genre) => (
                          <MenuLink key={genre.id} to={`/genre/tv/${genre.id}`}>{genre.name}</MenuLink>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/my-list" label="My List" active={location.pathname === '/my-list'} />
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative hidden md:block" ref={searchInputRef}>
            <form onSubmit={handleSearch}>
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Titles, people, genres"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-64 rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-text-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 xl:w-72"
              />
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
            
            <AnimatePresence>
              {isSearchFocused && searchHistory.length > 0 && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl py-2 shadow-xl z-50"
                >
                  <div className="flex items-center px-3 pb-2 mb-1 border-b border-white/5">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-400">
                      <Clock size={12} />
                      Recent Searches
                    </span>
                  </div>
                  {searchHistory.map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => handleHistoryClick(query)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <span>{query}</span>
                      <XCircle 
                        size={14} 
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                        onClick={(e) => handleRemoveHistory(e, query)}
                      />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <AnimatePresence>
                {isMobileSearchOpen ? (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="relative"
                  >
                    <input
                      type="search"
                      inputMode="search"
                      enterKeyHint="search"
                      autoComplete="off"
                      placeholder="Search..."
                      value={searchQuery}
                      onBlur={() => !searchQuery && setIsMobileSearchOpen(false)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-44 rounded-full border border-white/10 bg-white/10 py-2 pl-8 pr-3 text-sm text-white focus:border-primary focus:outline-none"
                    />
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </motion.form>
                ) : (
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 p-2.5"
                    onClick={() => setIsMobileSearchOpen(true)}
                  >
                    <Search size={24} className="text-white" />
                  </button>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white xl:hidden"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="container mx-auto overflow-hidden rounded-b-[1.5rem] border border-t-0 border-white/10 bg-[#0d1018]/98 backdrop-blur-2xl xl:hidden"
          >
            <nav className="flex flex-col gap-2 p-4 pb-8">
              <MobileNavLink to="/" label="Home" onClick={closeMobileMenu} />
              <MobileNavLink to="/shorts" label="Shorts" onClick={closeMobileMenu} />
              <MobileNavLink to="/browse-genres" label="Browse Genres" onClick={closeMobileMenu} />
              <MobileNavLink to="/my-list" label="My List" onClick={closeMobileMenu} />

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavLink: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => {
  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-all hover:bg-white/5 hover:text-white ${
        active ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400'
      }`}
    >
      {label}
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string; label: string; onClick: () => void }> = ({ to, label, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-base font-medium text-gray-300 outline-none transition-all hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
    >
      {label}
    </Link>
  );
};

const MenuLink = ({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) => {
  return (
    <Link
      to={to}
      className={`block truncate rounded-xl px-3 py-2 text-xs text-gray-400 outline-none transition-colors hover:bg-white/5 hover:text-white ${className}`}
    >
      {children}
    </Link>
  );
};
