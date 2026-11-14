import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { providersApi } from '../../api/providers.api.js';
import { appointmentsApi } from '../../api/appointments.api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatTimeRange, formatDate } from '../../utils/formatters.js';

export function RescheduleModal({ appointment, isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available slots for this provider on selected date
  const { data: slotsRes, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['slots', appointment?.provider_id, selectedDate],
    queryFn: () =>
      providersApi.getSlots(appointment.provider_id, {
        date: selectedDate,
        available: true,
      }),
    enabled: isOpen && !!appointment?.provider_id && !!selectedDate,
  });

  const slots = slotsRes?.data || [];

  const handleReschedule = async () => {
    if (!selectedSlotId) {
      toast.error('Please select an available time slot.');
      return;
    }

    try {
      setIsSubmitting(true);
      await appointmentsApi.reschedule(appointment.id, {
        new_slot_id: selectedSlotId,
      });
      toast.success('Appointment successfully rescheduled! Confirmation email sent.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to reschedule appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      description={`Choose a new available time slot with ${appointment.provider_name}.`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Select New Date
          </label>
          <Input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlotId(null);
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Available Slots on {formatDate(selectedDate)}
          </label>

          {isLoadingSlots ? (
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
          ) : slots.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              No available slots found for this date. Try another date.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {slots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 ring-2 ring-primary-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formatTimeRange(slot.start_time, slot.end_time)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReschedule}
            isLoading={isSubmitting}
            disabled={!selectedSlotId}
          >
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </Modal>
  );
}
