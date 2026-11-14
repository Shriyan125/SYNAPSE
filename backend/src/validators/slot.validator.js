import { z } from 'zod';

export const createSlotSchema = {
  body: z.object({
    start_time: z.string().datetime({ message: 'Invalid start_time ISO timestamp' }),
    end_time: z.string().datetime({ message: 'Invalid end_time ISO timestamp' }),
  }).refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: 'end_time must be strictly after start_time',
    path: ['end_time'],
  }),
};

export const getSlotsQuerySchema = {
  params: z.object({
    id: z.coerce.number().int().positive('Valid provider ID is required'),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
    available: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
};
