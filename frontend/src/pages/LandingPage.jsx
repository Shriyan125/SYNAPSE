import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { SkeletonCard } from '../components/common/Skeleton.jsx';
import { providersApi } from '../api/providers.api.js';
import { servicesApi } from '../api/services.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/formatters.js';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('All');

  const { data: providersRes, isLoading: loadingProviders } = useQuery({
    queryKey: ['landing_providers'],
    queryFn: () => providersApi.getAll(),
  });

  const { data: servicesRes, isLoading: loadingServices } = useQuery({
    queryKey: ['landing_services'],
    queryFn: () => servicesApi.getAll(),
  });

  const allProviders = providersRes?.data || [];
  const allServices = servicesRes?.data || [];

  const topProviders = allProviders.slice(0, 3);
  const featuredServices = allServices.slice(0, 6);

  return (
    <div className="space-y-20 sm:space-y-32 py-4">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-14 pb-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Beacon Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold shadow-sm animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Real-Time Clinical Scheduling Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.12]">
              <span className="text-slate-900 dark:text-white">Healthcare scheduling,</span> <br />
              <span className="bg-gradient-to-r from-primary-600 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
                simplified & instantaneous.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Synapse eliminates phone queues and double-booked calendar slots.
              Browse certified clinical specialists, select open time slots, and receive automated email reminders.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                to={isAuthenticated ? '/book' : '/register'}
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto shadow-md shadow-primary-500/25 hover:shadow-glow-primary transition-all"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Book an Appointment
              </Button>
              <Button
                to={isAuthenticated ? '/dashboard' : '/login'}
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                {isAuthenticated ? 'My Dashboard' : 'Sign In'}
              </Button>
            </div>

            {/* Quick metrics pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Double Booking</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant Confirmation</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Email Reminders</span>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive Mock Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              {/* Decorative gradient glow behind mock */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-3xl blur-xl opacity-20 dark:opacity-30 group-hover:opacity-40 transition duration-1000 animate-pulse-subtle" />

              <div className="relative glass-card rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    Instant Schedule
                  </span>
                </div>

                {/* Specialist preview */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
                    alt="Dr. Sarah Jenkins"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Dr. Sarah Jenkins
                    </h3>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                      Cardiology Specialist
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">4.95</span>
                      <span className="text-slate-400">(12 yrs exp)</span>
                    </div>
                  </div>
                </div>

                {/* Mock Slot Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Available Slots Tomorrow</span>
                    <span className="text-emerald-500">3 Open</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl border border-primary-500 bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 font-bold text-center ring-2 ring-primary-500/20">
                      09:00 AM
                    </div>
                    <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-center">
                      10:30 AM
                    </div>
                    <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-center">
                      02:00 PM
                    </div>
                  </div>
                </div>

                {/* Confirmation preview banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                      Instant Booking Confirmation
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">$150.00</span>
                </div>

                <Link to="/book" className="block w-full">
                  <Button variant="primary" fullWidth size="md">
                    Reserve Slot in 30 Seconds
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </section>


      {/* Services Catalog */}
      <section id="services" className="space-y-6 max-w-6xl mx-auto scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Clinical Services
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transparent consultation pricing with board-certified physicians.
            </p>
          </div>
          <Link
            to="/book"
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            All Services <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredServices.map((srv) => (
              <div
                key={srv.id}
                className="p-5 rounded-3xl glass-card glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {srv.name}
                    </h3>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/70 px-2 py-0.5 rounded-xl border border-primary-200/80 dark:border-primary-800/80 shrink-0">
                      {formatCurrency(srv.price)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 font-normal">
                    {srv.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-primary-500" />
                    {srv.duration_minutes} mins
                  </span>
                  <Button
                    to={`/book?serviceId=${srv.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-primary-600 dark:text-primary-400 font-semibold"
                  >
                    Select Service
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Medical Providers */}
      <section id="providers" className="space-y-6 max-w-6xl mx-auto scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Featured Clinicians
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top-rated clinicians available for scheduling.
            </p>
          </div>
        </div>

        {loadingProviders ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topProviders.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-3xl glass-card glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                      alt={p.full_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary-500/20"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.full_name}
                      </h3>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                        {p.specialty}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.rating}</span>
                        <span className="text-slate-400">({p.experience_years} yrs exp)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed font-normal">
                    {p.bio}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(p.consultation_fee)} / visit
                  </span>
                  <Button to={`/book?providerId=${p.id}`} variant="primary" size="sm">
                    Check Slots
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
