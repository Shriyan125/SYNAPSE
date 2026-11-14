import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 font-extrabold text-lg text-slate-900 dark:text-white group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Synapse<span className="text-primary-500">.</span></span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Intelligent healthcare appointment management. Book, reschedule and get reminders — all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/book" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                  My Appointments
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Signals */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Security</h3>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>JWT auth with refresh tokens</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>End-to-end encrypted sessions</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>No double-booking, ever</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                <span>Automated email reminders</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {currentYear} Synapse Health. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
