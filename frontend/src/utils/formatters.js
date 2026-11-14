/**
 * Format currency in USD
 */
export function formatCurrency(amount) {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numeric || 0);
}

/**
 * Format full date string (e.g. "Wednesday, Nov 12, 2026")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format time range (e.g. "09:00 AM - 09:45 AM")
 */
export function formatTimeRange(startTime, endTime) {
  if (!startTime) return '';
  const start = new Date(startTime);
  const startFormatted = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(start);

  if (!endTime) return startFormatted;

  const end = new Date(endTime);
  const endFormatted = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(end);

  return `${startFormatted} – ${endFormatted}`;
}

/**
 * Check if appointment is within the 2-hour cancellation/reschedule cutoff
 */
export function isWithinCutoff(startTime, cutoffHours = 2) {
  if (!startTime) return false;
  const slotMs = new Date(startTime).getTime();
  const nowMs = Date.now();
  const diffMs = slotMs - nowMs;
  return diffMs < cutoffHours * 60 * 60 * 1000;
}

/**
 * Check if slot is in the past
 */
export function isPastDate(dateString) {
  if (!dateString) return false;
  return new Date(dateString).getTime() < Date.now();
}

/**
 * Map appointment status to Tailwind colors with balanced contrast
 */
export function getStatusBadgeProps(status) {
  switch (status) {
    case 'booked':
      return {
        label: 'Upcoming',
        variant: 'info',
        className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80',
      };
    case 'completed':
      return {
        label: 'Completed',
        variant: 'success',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        variant: 'danger',
        className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',
      };
    default:
      return {
        label: status,
        variant: 'neutral',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80',
      };
  }
}
