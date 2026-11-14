import { z } from 'zod';

export const createServiceSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().trim().max(1000).optional().nullable(),
    duration_minutes: z.coerce.number().int().positive('Duration must be positive minutes'),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
  }),
};
