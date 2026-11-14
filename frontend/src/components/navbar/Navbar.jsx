import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ShieldAlert,
  Stethoscope,
  PlusCircle,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/Badge.jsx';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with subtle gradient glow */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold text-xl text-slate-900 dark:text-slate-100 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-primary-500/25 group-hover:scale-105 group-hover:shadow-glow-primary transition-all duration-200">
              <Calendar className="w-5 h-5 transition-transform duration-200 group-hover:rotate-6" />
            </div>
            <span className="tracking-tight text-lg sm:text-xl font-extrabold">
              Synapse<span className="text-primary-500">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-950/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 opacity-75" />
                  Dashboard
                </Link>

                <Link
                  to="/book"
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/book')
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-950/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 opacity-75" />
                  Book Visit
                </Link>

                <Link
                  to="/appointments"
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/appointments')
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-950/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Clock className="w-4 h-4 opacity-75" />
                  My Appointments
                </Link>

                {user?.role === 'provider' && (
                  <Link
                    to="/provider"
                    className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                      isActive('/provider')
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-emerald-500" />
                    Provider Hub
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                      isActive('/admin')
                        ? 'text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/60 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-500" />
                    Admin Command
                  </Link>
                )}
              </>
            ) : (
              <>
                <a
                  href="/#services"
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium"
                >
                  Services
                </a>
                <a
                  href="/#providers"
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium"
                >
                  Specialists
                </a>
              </>
            )}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 rotate-0 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user?.fullName?.charAt(0) || user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                      {user?.fullName || user?.full_name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {user?.role}
                    </span>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button to="/login" variant="ghost" size="sm">
                  Log In
                </Button>
                <Button to="/register" variant="primary" size="sm" className="shadow-sm shadow-primary-500/20">
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-slide-down shadow-xl">
          {isAuthenticated ? (
            <>
              <div className="py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-cyan-500 text-white font-bold flex items-center justify-center text-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {user?.fullName || user?.full_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <Badge variant="primary" className="ml-auto capitalize text-[10px]">
                  {user?.role}
                </Badge>
              </div>

              <div className="flex flex-col gap-1 text-sm font-medium">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  My Appointments
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Profile Settings
                </Link>

                {user?.role === 'provider' && (
                  <Link
                    to="/provider"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Provider Hub
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Admin Command
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium mt-2"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button to="/login" variant="outline" fullWidth onClick={() => setMobileMenuOpen(false)}>
                Log In
              </Button>
              <Button to="/register" variant="primary" fullWidth onClick={() => setMobileMenuOpen(false)}>
                Create Account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
