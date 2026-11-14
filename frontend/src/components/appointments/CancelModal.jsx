import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { appointmentsApi } from '../../api/appointments.api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate, formatTimeRange } from '../../utils/formatters.js';

export function CancelModal({ appointment, isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      await appointmentsApi.cancel(appointment.id, { reason });
      toast.success('Appointment cancelled. Confirmation email sent.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      description="Are you sure you want to cancel this scheduled appointment?"
    >
      <div className="space-y-4 pt-2">
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-0.5">{appointment.service_name}</p>
            <p>With {appointment.provider_name}</p>
            <p className="mt-1">
              {formatDate(appointment.start_time)} at{' '}
              {formatTimeRange(appointment.start_time, appointment.end_time)}
            </p>
          </div>
        </div>

        <Input
          label="Reason for cancellation (optional)"
          placeholder="e.g. Schedule conflict, feeling better..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={200}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Keep Appointment
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            isLoading={isSubmitting}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
