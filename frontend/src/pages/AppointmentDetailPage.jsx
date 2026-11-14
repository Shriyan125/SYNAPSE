import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  ArrowLeft,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { appointmentsApi } from '../api/appointments.api.js';
import { Button } from '../components/common/Button.jsx';
import { StatusBadge } from '../components/common/Badge.jsx';
import { RescheduleModal } from '../components/appointments/RescheduleModal.jsx';
import { CancelModal } from '../components/appointments/CancelModal.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { formatDate, formatTimeRange, formatCurrency, isWithinCutoff } from '../utils/formatters.js';

export function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeModal, setActiveModal] = useState(null); // 'reschedule' | 'cancel'

  const {
    data: apptRes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsApi.getById(id),
  });

  const appt = apptRes?.data;
  const isBooked = appt?.status === 'booked';
  const cutoffPassed = appt ? isWithinCutoff(appt.start_time, 2) : false;

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['appointment', id] });
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !appt) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <ErrorState
          title="Appointment not found"
          message="The requested consultation record does not exist or you do not have permission to view it."
          onRetry={() => navigate('/appointments')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        to="/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Appointments
      </Link>

      {/* Main card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">
                #{appt.id}
              </span>
              <StatusBadge status={appt.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {appt.service_name}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Service Fee</span>
            <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">
              {formatCurrency(appt.service_price)}
            </span>
          </div>
        </div>

        {/* 2-Hour Cutoff Warning */}
        {isBooked && cutoffPassed && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold">Cancellation & Reschedule Locked</p>
              <p className="mt-0.5">
                This appointment starts in less than 2 hours. Modifying or cancelling online is now disabled. Please contact the clinic directly.
              </p>
            </div>
          </div>
        )}

        {/* Date & Time block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Consultation Date</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatDate(appt.start_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Time Window</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatTimeRange(appt.start_time, appt.end_time)}
              </p>
            </div>
          </div>
        </div>

        {/* Parties involved: Provider & Patient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Medical Specialist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-primary-500" />
              <span>Medical Specialist</span>
            </h3>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {appt.provider_name}
              </p>
              <p className="text-primary-600 dark:text-primary-400 font-medium">
                {appt.provider_specialty}
              </p>
              <p className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{appt.provider_email}</span>
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>Patient Information</span>
            </h3>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {appt.patient_name}
              </p>
              <p className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{appt.patient_email}</span>
              </p>
              {appt.patient_phone && (
                <p className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{appt.patient_phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {appt.notes && (
          <div className="space-y-1.5 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Visit Notes & History</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {appt.notes}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {isBooked && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="md"
              disabled={cutoffPassed}
              onClick={() => setActiveModal('reschedule')}
            >
              Reschedule Slot
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={cutoffPassed}
              onClick={() => setActiveModal('cancel')}
            >
              Cancel Appointment
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'reschedule' && (
        <RescheduleModal
          isOpen={true}
          appointment={appt}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'cancel' && (
        <CancelModal
          isOpen={true}
          appointment={appt}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
