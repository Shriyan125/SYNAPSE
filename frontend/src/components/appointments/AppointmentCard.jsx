import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, User, ArrowRight, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../common/Badge.jsx';
import { Button } from '../common/Button.jsx';
import { formatDate, formatTimeRange, formatCurrency, isWithinCutoff } from '../../utils/formatters.js';

export function AppointmentCard({ appointment, onReschedule, onCancel }) {
  const isBooked = appointment.status === 'booked';
  const cutoffPassed = isWithinCutoff(appointment.start_time, 2);

  const providerInitial = appointment.provider_name ? appointment.provider_name.charAt(0) : 'D';

  return (
    <div className="glass-card glass-card-hover rounded-3xl p-5 sm:p-6 flex flex-col justify-between group border border-slate-200/90 dark:border-slate-700/60 transition-all duration-300">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-sky-400 text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20 text-sm">
              {providerInitial}
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {appointment.service_name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">{appointment.provider_name}</span>
                {appointment.provider_specialty && (
                  <>
                    <span>•</span>
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">{appointment.provider_specialty}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 border-y border-slate-100 dark:border-slate-800 my-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(appointment.start_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">{formatTimeRange(appointment.start_time, appointment.end_time)}</span>
          </div>
        </div>

        {appointment.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
            "{appointment.notes}"
          </p>
        )}

        {isBooked && cutoffPassed && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 p-1.5 px-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>2-hour cutoff locked (cannot modify)</span>
          </div>
        )}
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-between gap-2 mt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(appointment.price)}
        </div>

        <div className="flex items-center gap-2">
          {isBooked && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={cutoffPassed}
                title={cutoffPassed ? 'Cutoff: cannot reschedule within 2 hours of slot' : 'Reschedule'}
                onClick={() => onReschedule?.(appointment)}
              >
                Reschedule
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={cutoffPassed}
                title={cutoffPassed ? 'Cutoff: cannot cancel within 2 hours of slot' : 'Cancel'}
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={() => onCancel?.(appointment)}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            to={`/appointments/${appointment.id}`}
            variant="secondary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
