import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Details } from './pages/Details';
import { Player } from './pages/Player';
import { Category } from './pages/Category';
import { Genre } from './pages/Genre';
import { MyList } from './pages/MyList';

import { useMyList } from './hooks/useMyList';

function App() {
  const { fetchList } = useMyList();

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="movies" element={<Category type="movie" />} />
        <Route path="tv" element={<Category type="tv" />} />
        <Route path="genre/:type/:genreId" element={<Genre />} />
        <Route path="my-list" element={<MyList />} />
        <Route path=":type/:id" element={<Details />} />
        <Route path="watch/:type/:id" element={<Player />} />
        <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
