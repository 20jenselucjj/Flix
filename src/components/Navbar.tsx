import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Home, Plus, Menu, X, ChevronDown, Download, Clapperboard, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { api } from '../lib/api';
import { Genre } from '../types';
import { FocusableLink } from './FocusableLink';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    
    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
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
        }
    }
    fetchGenres();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 pt-[env(safe-area-inset-top)] ${
        isScrolled || isMobileMenuOpen ? 'bg-[#141414]/95 backdrop-blur-xl shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <FocusableLink to="/" className="hover:scale-105 transition-transform">
            <img src="/F192.png" alt="FLIX" className="h-10 w-auto object-contain" />
          </FocusableLink>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" label="Home" active={location.pathname === '/'} />
            <NavLink to="/shorts" label="Shorts" active={location.pathname === '/shorts'} />
            
            <div 
                className="relative group h-20 flex items-center" 
            >
                <button 
                  onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-white outline-none ${isGenreMenuOpen ? 'text-white' : 'text-gray-400'}`}
                >
                    Categories <ChevronDown size={14} className={`transition-transform duration-300 ${isGenreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isGenreMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full -left-48 w-[600px] bg-[#141414] border border-white/10 rounded-lg shadow-xl p-6 grid grid-cols-2 gap-x-8 gap-y-2 z-50"
                        >
                            <div>
                                <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2 flex items-center gap-2">
                                    <Film size={16} className="text-primary" /> Movies
                                </h3>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                    <MenuLink to="/movies" className="col-span-2 text-primary font-bold">All Movies</MenuLink>
                                    {movieGenres.slice(0, 14).map(g => (
                                         <MenuLink key={g.id} to={`/genre/movie/${g.id}`}>{g.name}</MenuLink>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2 flex items-center gap-2">
                                    <Tv size={16} className="text-primary" /> TV Shows
                                </h3>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                     <MenuLink to="/tv" className="col-span-2 text-primary font-bold">All TV Shows</MenuLink>
                                     {tvGenres.slice(0, 14).map(g => (
                                         <MenuLink key={g.id} to={`/genre/tv/${g.id}`}>{g.name}</MenuLink>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <NavLink to="/my-list" label="My List" active={location.pathname === '/my-list'} />
            
            {/* Download APK Button */}
            {!isNative && <DownloadApkButton />}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <form onSubmit={handleSearch} className="relative hidden md:block group">
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-10 group-hover:w-64 opacity-0 group-hover:opacity-100 cursor-pointer focus:cursor-text focus:w-64 focus:opacity-100`}
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors pointer-events-none" />
          </form>

          {/* Mobile Search & Toggle */}
          <div className="flex items-center gap-6 md:hidden">
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
                          autoFocus
                          value={searchQuery}
                          onBlur={() => !searchQuery && setIsMobileSearchOpen(false)}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-40 bg-white/10 border border-white/10 rounded-full py-1.5 pl-8 pr-3 text-white text-sm focus:outline-none focus:border-primary"
                        />
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </motion.form>
                ) : (
                    <button onClick={() => setIsMobileSearchOpen(true)}>
                        <Search size={24} className="text-white" />
                    </button>
                )}
            </AnimatePresence>
            
            <button 
                className="text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#141414] border-t border-white/10 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2 pb-8">
              <MobileNavLink to="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/shorts" label="Shorts" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/browse-genres" label="Browse Genres" onClick={() => setIsMobileMenuOpen(false)} />

              <MobileNavLink to="/my-list" label="My List" onClick={() => setIsMobileMenuOpen(false)} />
              
              {!isNative && (
              <a
                href="/flix.apk"
                className="flex items-center gap-2 text-primary font-bold text-lg py-2 border-b border-white/5 w-full text-left"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/flix.apk';
                }}
              >
                <Download size={20} />
                Download App
              </a>
              )}
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
      className={`text-sm font-medium transition-all hover:text-white outline-none rounded px-2 py-1 ${active ? 'text-white font-bold' : 'text-gray-400'}`}
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
      className={`text-lg font-medium transition-all outline-none py-2 block border-b border-white/5 text-gray-300 hover:text-white`}
    >
      {label}
    </Link>
  );
};

const MenuLink = ({ to, children, className = '' }: { to: string, children: React.ReactNode, className?: string }) => {
    return (
        <Link 
            to={to}
            className={`text-xs block py-1 truncate transition-colors outline-none px-2 rounded text-gray-400 hover:text-white ${className}`}
        >
            {children}
        </Link>
    )
};

const DownloadApkButton: React.FC = () => {
    const handleDownload = () => {
        window.location.href = '/flix.apk';
    };

    return (
      <a
        href="/flix.apk"
        onClick={(e) => { e.preventDefault(); handleDownload(); }}
        className={`flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded-full transition-all text-sm font-bold border border-primary/20 hover:bg-primary/40`}
      >
        <Download size={14} />
        App
      </a>
    );
  };
