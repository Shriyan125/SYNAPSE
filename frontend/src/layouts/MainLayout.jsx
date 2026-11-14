import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar.jsx';
import { Footer } from '../components/navbar/Footer.jsx';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Subtle Ambient Decorative Orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] pointer-events-none opacity-50 dark:opacity-25 blur-3xl"
        aria-hidden="true"
      >
        <div className="absolute top-8 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-300 to-primary-400 dark:from-primary-600 dark:to-cyan-500 animate-float" />
        <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-gradient-to-bl from-cyan-200 to-indigo-300 dark:from-indigo-600 dark:to-primary-500 animate-float-delayed" />
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
