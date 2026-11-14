import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must not exceed 100 characters'),
    role: z.enum(['user', 'provider']).default('user'),
    phone: z.string().trim().max(30).optional().nullable(),
    avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
    
    // Optional provider details if registering as a provider
    specialty: z.string().trim().min(2).max(100).optional(),
    bio: z.string().trim().optional(),
    experience_years: z.coerce.number().int().min(0).optional(),
    consultation_fee: z.coerce.number().min(0).optional(),
  }).refine((data) => {
    if (data.role === 'provider' && !data.specialty) {
      return false;
    }
    return true;
  }, {
    message: 'Specialty is required when registering as a provider',
    path: ['specialty'],
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().optional(),
  }),
};
