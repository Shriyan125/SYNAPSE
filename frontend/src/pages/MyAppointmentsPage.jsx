import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentsApi } from '../api/appointments.api.js';
import { AppointmentCard } from '../components/appointments/AppointmentCard.jsx';
import { RescheduleModal } from '../components/appointments/RescheduleModal.jsx';
import { CancelModal } from '../components/appointments/CancelModal.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { SkeletonAppointment } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';

export function MyAppointmentsPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('booked'); // 'booked' | 'completed' | 'cancelled'
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [sort, setSort] = useState('start_time:asc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [activeModal, setActiveModal] = useState(null); // { type, appointment }

  const queryParams = {
    status: activeTab,
    page,
    limit,
    sort,
    from: fromDate ? `${fromDate}T00:00:00Z` : undefined,
    to: toDate ? `${toDate}T23:59:59Z` : undefined,
  };

  const {
    data: appointmentsRes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['appointments', activeTab, page, sort, fromDate, toDate],
    queryFn: () => appointmentsApi.getAll(queryParams),
  });

  const appointments = appointmentsRes?.data || [];
  const meta = appointmentsRes?.meta || { total: 0, totalPages: 1 };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPage(1);
    if (newTab === 'booked') {
      setSort('start_time:asc');
    } else {
      setSort('start_time:desc');
    }
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your upcoming consultations, past visit summaries, and reschedule requests.
          </p>
        </div>

        <Link to="/book">
          <Button
            variant="primary"
            size="sm"
            className="shadow-sm shadow-primary-500/20"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            New Consultation
          </Button>
        </Link>
      </div>

      {/* Tabs with modern animated pill indicator */}
      <div className="flex p-1.5 rounded-2xl glass-card max-w-md gap-1 text-xs font-bold">
        {[
          { key: 'booked', label: 'Upcoming' },
          { key: 'completed', label: 'Past Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-2 px-3 rounded-xl transition-all duration-200 text-center ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters & Sorting Bar */}
      <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Dates:</span>
          <Input
            type="date"
            placeholder="From"
            className="text-xs py-1 h-8 w-36"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
          <span className="text-slate-400">to</span>
          <Input
            type="date"
            placeholder="To"
            className="text-xs py-1 h-8 w-36"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
              className="text-xs text-rose-500 hover:underline font-medium ml-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="start_time:asc">Date: Earliest First</option>
            <option value="start_time:desc">Date: Latest First</option>
          </select>
        </div>
      </div>

      {/* Appointments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonAppointment />
          <SkeletonAppointment />
          <SkeletonAppointment />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not retrieve your appointment list." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} appointments found`}
          description={
            fromDate || toDate
              ? 'No appointments matched your selected date filters.'
              : `You do not have any ${activeTab} visits listed.`
          }
          actionLabel={activeTab === 'booked' ? 'Book an Appointment' : undefined}
          onAction={() => (window.location.href = '/book')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onReschedule={(a) => setActiveModal({ type: 'reschedule', appointment: a })}
              onCancel={(a) => setActiveModal({ type: 'cancel', appointment: a })}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Showing page <strong>{page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} total)
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
