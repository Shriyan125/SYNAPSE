import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { appointmentsApi } from '../api/appointments.api.js';
import { Button } from '../components/common/Button.jsx';
import { StatusBadge } from '../components/common/Badge.jsx';
import { AppointmentCard } from '../components/appointments/AppointmentCard.jsx';
import { RescheduleModal } from '../components/appointments/RescheduleModal.jsx';
import { CancelModal } from '../components/appointments/CancelModal.jsx';
import { SkeletonAppointment, Skeleton } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { formatDate, formatTimeRange, formatCurrency, isWithinCutoff } from '../../src/utils/formatters.js';

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeModal, setActiveModal] = useState(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Query upcoming appointments
  const {
    data: upcomingRes,
    isLoading: loadingUpcoming,
    isError: errorUpcoming,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ['appointments', 'dashboard', 'booked'],
    queryFn: () => appointmentsApi.getAll({ status: 'booked', limit: 5, sort: 'start_time:asc' }),
  });

  // Query completed count
  const { data: completedRes } = useQuery({
    queryKey: ['appointments', 'count', 'completed'],
    queryFn: () => appointmentsApi.getAll({ status: 'completed', limit: 1 }),
  });

  const appointments = upcomingRes?.data || [];
  const nextAppointment = appointments[0] || null;
  const otherUpcoming = appointments.slice(1);

  const totalUpcoming = upcomingRes?.meta?.total ?? appointments.length;
  const totalCompleted = completedRes?.meta?.total ?? 0;

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              Patient Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.fullName || user?.full_name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your consultations, manage upcoming schedules, and explore open specialists.
          </p>
        </div>

        <Button
          to="/book"
          variant="primary"
          size="md"
          className="shadow-sm shadow-primary-500/25"
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Book Appointment
        </Button>
      </div>

      {/* Modern KPI Stats Cards with Gradient Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
        <div className="p-5 rounded-3xl glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-primary-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Upcoming Visits</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalUpcoming}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalCompleted}
            </p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-5 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Need Medical Care?</p>
            <Link
              to="/book"
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 mt-1.5"
            >
              Select Open Slot <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* HIGHLIGHT: Next Upcoming Appointment (Gradient Banner) */}
      {loadingUpcoming ? (
        <SkeletonAppointment />
      ) : errorUpcoming ? (
        <ErrorState onRetry={refetchUpcoming} message="Unable to load appointments schedule." />
      ) : nextAppointment ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-primary-900/10 border border-primary-600/30">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white/90 border border-white/15">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>Next Scheduled Consultation</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {nextAppointment.service_name}
                </h2>
                <p className="text-sm text-primary-100/90 flex items-center gap-1.5 mt-1 font-medium">
                  <User className="w-4 h-4 text-cyan-300" />
                  <span>{nextAppointment.provider_name}</span>
                  <span>•</span>
                  <span>{nextAppointment.provider_specialty}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-white/90 pt-1">
                <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
                  <Calendar className="w-4 h-4 text-cyan-300" />
                  <span>{formatDate(nextAppointment.start_time)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-cyan-300" />
                  <span>{formatTimeRange(nextAppointment.start_time, nextAppointment.end_time)}</span>
                </div>
              </div>

              {nextAppointment.notes && (
                <p className="text-xs text-primary-200/90 italic">
                  Note: "{nextAppointment.notes}"
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <Button
                to={`/appointments/${nextAppointment.id}`}
                variant="secondary"
                size="sm"
                fullWidth
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
              >
                View Details
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                  disabled={isWithinCutoff(nextAppointment.start_time, 2)}
                  onClick={() => setActiveModal({ type: 'reschedule', appointment: nextAppointment })}
                >
                  Reschedule
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-rose-200 hover:bg-rose-500/20 hover:text-white"
                  disabled={isWithinCutoff(nextAppointment.start_time, 2)}
                  onClick={() => setActiveModal({ type: 'cancel', appointment: nextAppointment })}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Upcoming Appointments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {nextAppointment ? 'Other Upcoming Appointments' : 'Upcoming Appointments'}
          </h3>
          <Link
            to="/appointments"
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            All Appointments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingUpcoming ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonAppointment />
            <SkeletonAppointment />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No upcoming visits scheduled"
            description="You don't have any appointments on your calendar right now. Choose a convenient time slot with our certified specialists."
            actionLabel="Book an Appointment"
            onAction={() => (window.location.href = '/book')}
          />
        ) : otherUpcoming.length === 0 ? (
          <div className="p-5 rounded-2xl glass-card text-center text-xs text-slate-500 dark:text-slate-400 italic">
            You have no further appointments booked after your upcoming visit.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherUpcoming.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onReschedule={(a) => setActiveModal({ type: 'reschedule', appointment: a })}
                onCancel={(a) => setActiveModal({ type: 'cancel', appointment: a })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal?.type === 'reschedule' && (
        <RescheduleModal
          isOpen={true}
          appointment={activeModal.appointment}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal?.type === 'cancel' && (
        <CancelModal
          isOpen={true}
          appointment={activeModal.appointment}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
