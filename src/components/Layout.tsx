import React from 'react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text">
      <div className="pointer-events-none absolute inset-0 bg-app-radial opacity-90" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/[0.04] to-transparent" />
      <Navbar />
      <main className="relative z-10 flex-1 pt-24 md:pt-28">
        <Outlet />
      </main>
      <footer className="relative z-10 mt-20 border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        </div>
      </footer>
    </div>
  );
};
