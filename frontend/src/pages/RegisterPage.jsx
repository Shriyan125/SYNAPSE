import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Stethoscope, ArrowRight } from 'lucide-react';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().trim().optional(),
    role: z.enum(['user', 'provider']),
    specialty: z.string().trim().optional(),
    bio: z.string().trim().optional(),
    experience_years: z.coerce.number().min(0).optional(),
    consultation_fee: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'provider' && (!data.specialty || data.specialty.length < 2)) {
        return false;
      }
      return true;
    },
    {
      message: 'Specialty is required for providers',
      path: ['specialty'],
    }
  );

export function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      specialty: '',
      bio: '',
      experience_years: 0,
      consultation_fee: 100,
    },
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setValue('role', newRole, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const user = await registerAuth(data);
      toast.success(`Account registered! Welcome to Synapse, ${user.fullName || user.full_name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Create your account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Book appointments or manage your clinical schedule
        </p>
      </div>

      {/* Role Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleRoleChange('user')}
          className={`py-2 rounded-lg transition-all ${
            role === 'user'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Patient
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange('provider')}
          className={`py-2 rounded-lg transition-all ${
            role === 'provider'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Medical Provider
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label="Full Legal Name"
          placeholder="e.g. Eleanor Vance"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. eleanor@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password (min 8 characters)"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Phone Number (optional)"
          placeholder="+1-555-0199"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        {role === 'provider' && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-primary-500" />
              <span>Provider Credentials</span>
            </div>

            <Input
              label="Medical Specialty"
              placeholder="e.g. Cardiology, Neurology, Pediatrics"
              error={errors.specialty?.message}
              {...register('specialty')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Exp. Years"
                type="number"
                min="0"
                error={errors.experience_years?.message}
                {...register('experience_years')}
              />
              <Input
                label="Fee ($ USD)"
                type="number"
                min="0"
                error={errors.consultation_fee?.message}
                {...register('consultation_fee')}
              />
            </div>

            <Input
              label="Bio / Credentials"
              placeholder="Brief professional summary..."
              error={errors.bio?.message}
              {...register('bio')}
            />
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          Complete Registration
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
