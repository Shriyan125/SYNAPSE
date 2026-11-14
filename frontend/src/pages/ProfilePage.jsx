import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Stethoscope, Save, ShieldCheck, Camera, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authApi } from '../api/auth.api.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().trim().optional().nullable(),
  avatar_url: z.string().trim().url('Invalid URL').optional().or(z.literal('')),
  specialty: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  consultation_fee: z.coerce.number().min(0).optional(),
  experience_years: z.coerce.number().min(0).optional(),
});

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isProvider = user?.role === 'provider';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.fullName || user?.full_name || '',
      phone: user?.phone || '',
      avatar_url: user?.avatarUrl || user?.avatar_url || '',
      specialty: user?.provider?.specialty || '',
      bio: user?.provider?.bio || '',
      consultation_fee: user?.provider?.consultation_fee ?? 100,
      experience_years: user?.provider?.experience_years ?? 0,
    },
  });

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsUploading(true);
      const res = await authApi.uploadAvatar(formData);
      const uploadedUrl = res.data?.avatarUrl;
      setValue('avatar_url', uploadedUrl);
      updateUser(res.data?.user || { ...user, avatarUrl: uploadedUrl });
      toast.success('Avatar uploaded to Cloudinary successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar to Cloudinary.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await authApi.updateMe(data);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Account Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, credentials, and notification preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* User Identity Snapshot */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group">
            {user?.avatarUrl || user?.avatar_url ? (
              <img
                src={user?.avatarUrl || user?.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border border-primary-200 dark:border-primary-800 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-2xl border border-primary-200 dark:border-primary-800">
                {user?.fullName?.charAt(0) || user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-primary-600 text-white shadow-md hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              title="Upload photo to Cloudinary"
            >
              {isUploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {user?.fullName || user?.full_name}
              </h2>
              <Badge variant="primary" className="capitalize text-[11px]">
                {user?.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
            <p className="text-[11px] text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1 font-medium">
              <Upload className="w-3 h-3" />
              <span>Cloudinary media storage enabled</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label="Phone Number"
            placeholder="+1-555-0199"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Avatar Image URL (optional)"
            placeholder="https://..."
            error={errors.avatar_url?.message}
            {...register('avatar_url')}
          />

          {isProvider && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-primary-500" />
                <span>Provider Clinical Profile</span>
              </div>

              <Input
                label="Specialty"
                error={errors.specialty?.message}
                {...register('specialty')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Years in Practice"
                  type="number"
                  min="0"
                  error={errors.experience_years?.message}
                  {...register('experience_years')}
                />
                <Input
                  label="Consultation Fee ($ USD)"
                  type="number"
                  min="0"
                  error={errors.consultation_fee?.message}
                  {...register('consultation_fee')}
                />
              </div>

              <Input
                label="Professional Bio"
                error={errors.bio?.message}
                {...register('bio')}
              />
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
