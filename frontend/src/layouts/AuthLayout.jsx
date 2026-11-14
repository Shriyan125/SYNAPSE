import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Calendar, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative ambient orbs */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[450px] pointer-events-none opacity-40 dark:opacity-20 blur-3xl"
        aria-hidden="true"
      >
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-sky-400 to-primary-500 animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gradient-to-bl from-cyan-400 to-indigo-500 animate-float-delayed" />
      </div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white glass-card shadow-sm hover:scale-105 transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 font-black text-2xl text-slate-900 dark:text-white group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-primary-500/25 group-hover:scale-105 transition-all duration-200">
              <Calendar className="w-6 h-6" />
            </div>
            <span>Synapse<span className="text-primary-500">.</span></span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Intelligent Healthcare Appointment Management
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
