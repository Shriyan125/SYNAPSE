import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  PlusCircle,
  Trash2,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { providersApi } from '../api/providers.api.js';
import { slotsApi } from '../api/slots.api.js';
import { appointmentsApi } from '../api/appointments.api.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { StatusBadge } from '../components/common/Badge.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatDate, formatTimeRange, formatCurrency } from '../utils/formatters.js';

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [slotDate, setSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);

  const [newSlotDate, setNewSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('09:45');
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);

  const providerId = user?.provider?.id;

  const { data: apptsRes, isLoading: loadingAppts } = useQuery({
    queryKey: ['provider_appointments'],
    queryFn: () => appointmentsApi.getAll({ limit: 10, sort: 'start_time:asc' }),
  });

  const {
    data: slotsRes,
    isLoading: loadingSlots,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ['provider_slots', providerId, slotDate],
    queryFn: () => providersApi.getSlots(providerId, { date: slotDate }),
    enabled: !!providerId,
  });

  const appointments = apptsRes?.data || [];
  const slots = slotsRes?.data || [];

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlotDate || !newStartTime || !newEndTime) {
      toast.error('Please specify the date and slot time window.');
      return;
    }

    const startDateTime = new Date(`${newSlotDate}T${newStartTime}:00`);
    const endDateTime = new Date(`${newSlotDate}T${newEndTime}:00`);

    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time.');
      return;
    }

    if (startDateTime <= new Date()) {
      toast.error('Cannot create an availability slot in the past.');
      return;
    }

    try {
      setIsCreatingSlot(true);
      await slotsApi.create({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      toast.success('Availability slot created successfully!');
      setIsAddSlotOpen(false);
      queryClient.invalidateQueries({ queryKey: ['provider_slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (err) {
      toast.error(err.message || 'Failed to create slot.');
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await slotsApi.delete(slotId);
      toast.success('Availability slot removed.');
      queryClient.invalidateQueries({ queryKey: ['provider_slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (err) {
      toast.error(err.message || 'Failed to delete slot.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Clinical Schedule & Availability Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clinician: {user?.fullName || user?.full_name} • {user?.provider?.specialty || 'General Practice'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="shadow-sm shadow-primary-500/20"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsAddSlotOpen(true)}
        >
          Add Open Slot
        </Button>
      </div>

      {/* Grid: Upcoming patient consultations & Slot manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Scheduled Consultations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Upcoming Patient Consultations</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {appointments.length} scheduled
            </span>
          </div>

          {loadingAppts ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          ) : appointments.length === 0 ? (
            <EmptyState
              title="No upcoming consultations"
              description="Your calendar currently has no patient appointments scheduled."
            />
          ) : (
            <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 rounded-3xl glass-card space-y-2.5 text-xs shadow-soft"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {appt.service_name}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-primary-500" />
                        <span>Patient: <strong>{appt.patient_name}</strong> ({appt.patient_email})</span>
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(appt.start_time)}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatTimeRange(appt.start_time, appt.end_time)}
                    </span>
                  </div>

                  {appt.notes && (
                    <p className="italic text-slate-400 text-[11px] pt-1">
                      "{appt.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Manage Availability Slots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Availability Slots by Date</span>
            </h2>
            <Input
              type="date"
              className="text-xs py-1 h-8 w-36"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            />
          </div>

          {loadingSlots ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : slots.length === 0 ? (
            <EmptyState
              title={`No slots on ${formatDate(slotDate)}`}
              description="You have not created any availability slots for patients to book on this date."
              actionLabel="Create a Slot"
              onAction={() => setIsAddSlotOpen(true)}
            />
          ) : (
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    slot.is_booked
                      ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                      : 'glass-card border-emerald-300 dark:border-emerald-800/80 shadow-soft'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        slot.is_booked
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </p>
                      <span
                        className={`text-[10px] font-bold ${
                          slot.is_booked
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {slot.is_booked ? '● Reserved by Patient' : '○ Open for Booking'}
                      </span>
                    </div>
                  </div>

                  {!slot.is_booked && (
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete availability slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Add Open Time Slot"
        description="Patients will be able to book this slot immediately upon creation."
      >
        <form onSubmit={handleCreateSlot} className="space-y-4 pt-2">
          <Input
            label="Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={newSlotDate}
            onChange={(e) => setNewSlotDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsAddSlotOpen(false)}
              disabled={isCreatingSlot}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isCreatingSlot}
            >
              Publish Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
