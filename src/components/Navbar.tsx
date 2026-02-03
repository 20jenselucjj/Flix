import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Home, Plus, Menu, X, ChevronDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Genre } from '../types';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

    return () => window.removeEventListener('scroll', handleScroll);
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
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen ? 'bg-[#141414]/95 backdrop-blur-xl shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-primary font-black text-3xl tracking-tighter hover:scale-105 transition-transform">
            FLIX
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" label="Home" active={location.pathname === '/'} />
            
            <div 
                className="relative group h-20 flex items-center" 
                onMouseEnter={() => setIsGenreMenuOpen(true)} 
                onMouseLeave={() => setIsGenreMenuOpen(false)}
            >
                <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-white ${isGenreMenuOpen ? 'text-white' : 'text-gray-400'}`}>
                    Categories <ChevronDown size={14} className={`transition-transform duration-300 ${isGenreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isGenreMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 w-[500px] bg-[#141414] border border-white/10 rounded-lg shadow-xl p-6 grid grid-cols-2 gap-x-8 gap-y-2 z-50"
                        >
                            <div>
                                <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2 flex items-center gap-2">
                                    <Film size={16} className="text-primary" /> Movies
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <Link to="/movies" className="text-primary hover:text-white text-xs block py-1 font-bold col-span-2">All Movies</Link>
                                    {movieGenres.slice(0, 14).map(g => (
                                         <Link key={g.id} to={`/genre/movie/${g.id}`} className="text-gray-400 hover:text-white text-xs block py-1 truncate">{g.name}</Link>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2 flex items-center gap-2">
                                    <Tv size={16} className="text-primary" /> TV Shows
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                     <Link to="/tv" className="text-primary hover:text-white text-xs block py-1 font-bold col-span-2">All TV Shows</Link>
                                     {tvGenres.slice(0, 14).map(g => (
                                         <Link key={g.id} to={`/genre/tv/${g.id}`} className="text-gray-400 hover:text-white text-xs block py-1 truncate">{g.name}</Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <NavLink to="/my-list" label="My List" active={location.pathname === '/my-list'} />
            
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary px-3 py-1.5 rounded-full transition-colors text-sm font-bold border border-primary/20"
              >
                <Download size={14} />
                Install App
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <form onSubmit={handleSearch} className="relative hidden md:block group">
            <input
              type="text"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-0 group-hover:w-64 focus:w-64 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer focus:cursor-text"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors pointer-events-none" />
          </form>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
            <nav className="flex flex-col p-4 gap-4">
              <MobileNavLink to="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/movies" label="Movies" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/tv" label="TV Shows" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="border-t border-white/10 pt-2">
                 <div className="text-gray-400 text-sm mb-2 font-bold">Browse Genres</div>
                 <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {movieGenres.slice(0, 6).map(g => (
                        <MobileNavLink key={g.id} to={`/genre/movie/${g.id}`} label={g.name} onClick={() => setIsMobileMenuOpen(false)} />
                    ))}
                 </div>
              </div>
              <MobileNavLink to="/my-list" label="My List" onClick={() => setIsMobileMenuOpen(false)} />
              
              {installPrompt && (
                <button
                  onClick={() => {
                    handleInstallClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-primary font-bold text-lg py-2 border-b border-white/5 w-full text-left"
                >
                  <Download size={20} />
                  Install App
                </button>
              )}
              
              <form onSubmit={handleSearch} className="relative mt-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavLink: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => (
  <Link 
    to={to} 
    className={`text-sm font-medium transition-colors hover:text-white ${active ? 'text-white font-bold' : 'text-gray-400'}`}
  >
    {label}
  </Link>
);

const MobileNavLink: React.FC<{ to: string; label: string; onClick: () => void }> = ({ to, label, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="text-lg font-medium text-gray-300 hover:text-white py-2 block border-b border-white/5"
  >
    {label}
  </Link>
);
