import React, { useEffect } from 'react';
import { HomeIcon } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EmptyState } from './components/EmptyState';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Details } from './pages/Details';
import { Player } from './pages/Player';
import { Category } from './pages/Category';
import { Genre } from './pages/Genre';
import { MyList } from './pages/MyList';
import { Shorts } from './pages/Shorts';
import { Navbar } from './components/Navbar';
import { BrowseGenres } from './pages/BrowseGenres';

import { useMyList } from './hooks/useMyList';

function App() {
  const { fetchList } = useMyList();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <Routes>
      <Route path="/watch/:type/:id" element={<Player />} />
      <Route path="/shorts" element={
        <>
          <Navbar />
          <Shorts />
        </>
      } />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="browse-genres" element={<BrowseGenres />} />
        <Route path="movies" element={<Category type="movie" />} />
        <Route path="tv" element={<Category type="tv" />} />
        <Route path="genre/:type/:genreId" element={<Genre />} />
        <Route path="my-list" element={<MyList />} />
        <Route path=":type/:id" element={<Details />} />
        <Route path="*" element={<EmptyState
          icon={HomeIcon}
          title="Page not found"
          description="That page doesn’t exist yet, but the next great watch is still one click away."
          action={
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200">
              <HomeIcon size={18} />
              Back to Home
            </Link>
          }
        />} />
      </Route>
    </Routes>
  );
}

export default App;
