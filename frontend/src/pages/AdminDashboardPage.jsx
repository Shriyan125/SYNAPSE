import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart2,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../api/admin.api.js';
import { StatusBadge } from '../components/common/Badge.jsx';
import { Skeleton, SkeletonTable } from '../components/common/Skeleton.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Button } from '../components/common/Button.jsx';
import { formatDate, formatTimeRange, formatCurrency } from '../utils/formatters.js';

export function AdminDashboardPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  const {
    data: statsRes,
    isLoading: loadingStats,
    isError: errorStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: () => adminApi.getStats(),
  });

  const {
    data: apptsRes,
    isLoading: loadingAppts,
    isError: errorAppts,
  } = useQuery({
    queryKey: ['admin_appointments', statusFilter, page],
    queryFn: () =>
      adminApi.getAppointments({
        status: statusFilter || undefined,
        page,
        limit,
        sort: 'start_time:desc',
      }),
  });

  const stats = statsRes?.data;
  const summary = stats?.summary || {};
  const perProvider = stats?.appointmentsPerProvider || [];
  const busiestDays = stats?.busiestDays || [];
  const frequentPatients = stats?.frequentPatients || [];

  const appointments = apptsRes?.data || [];
  const meta = apptsRes?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Administrative Command & System Analytics
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time system KPIs, SQL aggregation reports, and centralized appointment management.
        </p>
      </div>

      {/* KPI Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : errorStats ? (
        <ErrorState onRetry={refetchStats} message="Failed to load admin statistics." />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <div className="p-5 rounded-3xl glass-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Total Patients</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.totalPatients ?? 0}
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              <span>Clinicians</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.totalProviders ?? 0}
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Active Bookings</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.activeBookings ?? 0}
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              <span>Completed</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.completedBookings ?? 0}
            </p>
          </div>

          <div className="col-span-2 lg:col-span-1 p-5 rounded-3xl glass-card">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Gross Revenue</span>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.grossRevenue || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinician Volume Breakdown (GROUP BY / HAVING Query) */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary-500" />
              <span>Provider Appointment Volume & Revenue (SQL GROUP BY / HAVING)</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-2.5">Provider</th>
                  <th className="pb-2.5">Specialty</th>
                  <th className="pb-2.5 text-center">Total</th>
                  <th className="pb-2.5 text-center">Completed</th>
                  <th className="pb-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {perProvider.map((p) => (
                  <tr key={p.provider_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {p.provider_name}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{p.specialty}</td>
                    <td className="py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                      {p.total_appointments}
                    </td>
                    <td className="py-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                      {p.completed_appointments}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(p.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Busiest Days */}
        <div className="p-6 rounded-3xl glass-card space-y-4 shadow-soft">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Busiest Schedule Days</span>
          </h2>

          <div className="space-y-3.5">
            {busiestDays.map((day, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{day.day_name.trim()}</span>
                  <span className="text-primary-600 dark:text-primary-400 font-bold">
                    {day.appointment_count} visits
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (Number(day.appointment_count) / 10) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frequent Patients (CTE Query Section) */}
      <div className="p-6 rounded-3xl glass-card space-y-4 shadow-soft">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Frequent Patients (Common Table Expression / CTE Analysis)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-2.5">Patient</th>
                <th className="pb-2.5">Email</th>
                <th className="pb-2.5">Phone</th>
                <th className="pb-2.5 text-center">Total Bookings</th>
                <th className="pb-2.5 text-right">Last Visit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {frequentPatients.map((fp) => (
                <tr key={fp.user_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {fp.full_name}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{fp.email}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{fp.phone || 'N/A'}</td>
                  <td className="py-3 text-center font-bold text-primary-600 dark:text-primary-400">
                    {fp.total_bookings}
                  </td>
                  <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                    {formatDate(fp.last_booking_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All System Appointments Log Table */}
      <div className="p-6 rounded-3xl glass-card space-y-4 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              All System Appointments Registry
            </h2>
            <p className="text-xs text-slate-400">
              Complete historical and scheduled consultations across all accounts.
            </p>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked (Upcoming)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loadingAppts ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-2.5">ID</th>
                  <th className="pb-2.5">Patient</th>
                  <th className="pb-2.5">Provider</th>
                  <th className="pb-2.5">Service</th>
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-mono text-slate-400">#{a.id}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {a.patient_name}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {a.provider_name}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{a.service_name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(a.start_time)} at {formatTimeRange(a.start_time, a.end_time)}
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              Page {page} of {meta.totalPages} ({meta.total} records)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
