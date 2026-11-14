import { z } from 'zod';

export const updateMeSchema = {
  body: z.object({
    full_name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().max(30).optional().nullable(),
    avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
    bio: z.string().trim().optional(),
    specialty: z.string().trim().min(2).max(100).optional(),
    consultation_fee: z.coerce.number().min(0).optional(),
    experience_years: z.coerce.number().int().min(0).optional(),
  }),
};
