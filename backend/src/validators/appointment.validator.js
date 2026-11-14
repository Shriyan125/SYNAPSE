import { z } from 'zod';

export const createAppointmentSchema = {
  body: z.object({
    provider_id: z.coerce.number().int().positive('Valid provider ID is required'),
    service_id: z.coerce.number().int().positive('Valid service ID is required'),
    slot_id: z.coerce.number().int().positive('Valid slot ID is required'),
    notes: z.string().trim().max(1000).optional().nullable(),
  }),
};

export const rescheduleAppointmentSchema = {
  params: z.object({
    id: z.coerce.number().int().positive('Valid appointment ID is required'),
  }),
  body: z.object({
    new_slot_id: z.coerce.number().int().positive('Valid new slot ID is required'),
  }),
};

export const cancelAppointmentSchema = {
  params: z.object({
    id: z.coerce.number().int().positive('Valid appointment ID is required'),
  }),
  body: z.object({
    reason: z.string().trim().max(500).optional().nullable(),
  }),
};

export const getAppointmentsQuerySchema = {
  query: z.object({
    status: z.enum(['booked', 'cancelled', 'completed']).optional(),
    from: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    to: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.string().default('start_time:asc'),
  }),
};
