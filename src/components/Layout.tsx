import React from 'react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="bg-black py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} Flix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
