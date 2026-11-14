import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  Star,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { servicesApi } from '../api/services.api.js';
import { providersApi } from '../api/providers.api.js';
import { appointmentsApi } from '../api/appointments.api.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { SkeletonCard, Skeleton } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate, formatTimeRange } from '../utils/formatters.js';

export function BookFlowPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Queries
  const { data: servicesRes, isLoading: loadingServices, isError: errorServices } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => servicesApi.getAll(),
  });

  const { data: providersRes, isLoading: loadingProviders, isError: errorProviders } = useQuery({
    queryKey: ['providers', 'catalog'],
    queryFn: () => providersApi.getAll(),
  });

  const services = servicesRes?.data || [];
  const providers = providersRes?.data || [];

  // Pre-selection via query parameters
  useEffect(() => {
    const paramServiceId = searchParams.get('serviceId');
    if (paramServiceId && services.length > 0 && !selectedService) {
      const match = services.find((s) => s.id === Number(paramServiceId));
      if (match) {
        setSelectedService(match);
        setStep(2);
      }
    }

    const paramProviderId = searchParams.get('providerId');
    if (paramProviderId && providers.length > 0 && !selectedProvider) {
      const match = providers.find((p) => p.id === Number(paramProviderId));
      if (match) {
        setSelectedProvider(match);
        if (selectedService) {
          setStep(3);
        }
      }
    }
  }, [searchParams, services, providers]);

  // Query slots for selected provider & date
  const {
    data: slotsRes,
    isLoading: loadingSlots,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ['slots', selectedProvider?.id, selectedDate],
    queryFn: () =>
      providersApi.getSlots(selectedProvider.id, {
        date: selectedDate,
        available: true,
      }),
    enabled: !!selectedProvider && !!selectedDate && step >= 3,
  });

  const availableSlots = slotsRes?.data || [];

  const filteredProviders = selectedService
    ? providers.filter(
        (p) =>
          !p.offered_services?.length ||
          p.offered_services.some((s) => s.id === selectedService.id)
      )
    : providers;

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedProvider || !selectedSlot) {
      toast.error('Please complete all booking steps first.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await appointmentsApi.create({
        provider_id: selectedProvider.id,
        service_id: selectedService.id,
        slot_id: selectedSlot.id,
        notes: notes.trim() || null,
      });

      setBookingSuccessData(res.data);
      toast.success('Appointment successfully confirmed! An email has been sent.');
    } catch (err) {
      toast.error(err.message || 'Failed to complete booking. Please try another slot.');
      if (err.code === 'CONFLICT') {
        refetchSlots();
        setStep(3);
        setSelectedSlot(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (bookingSuccessData) {
    return (
      <div className="relative max-w-xl mx-auto py-8 text-center space-y-6 animate-scale-in">
        {/* Confetti celebration particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti rounded-sm"
              style={{
                left: `${(i * 4.2) % 100}%`,
                top: `${(i * 6) % 25}%`,
                width: `${7 + (i % 4) * 2}px`,
                height: `${6 + (i % 3) * 3}px`,
                backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'][i % 6],
                animationDelay: `${(i * 0.08).toFixed(2)}s`,
                animationDuration: `${1.8 + (i % 3) * 0.4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce-subtle">
          <CheckCircle2 className="w-11 h-11" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Booking Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A confirmation receipt and calendar reminder has been sent to your email.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl glass-card text-left space-y-3.5 shadow-soft">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Appointment Reference</span>
            <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
              #{bookingSuccessData.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500">Clinical Service</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedService.name}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Attending Specialist</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedProvider.full_name}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Scheduled Date</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {formatDate(selectedSlot.start_time)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Reserved Window</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to={`/appointments/${bookingSuccessData.id}`}>
            <Button variant="primary" fullWidth size="md">
              View Appointment Details
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" fullWidth size="md">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Step Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Schedule a Consultation
          </h1>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/70 px-2.5 py-1 rounded-xl border border-primary-200/80 dark:border-primary-800/80">
            Step {step} of 4
          </span>
        </div>

        {/* Step indicator breadcrumbs */}
        <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
          {[
            { num: 1, label: 'Service' },
            { num: 2, label: 'Provider' },
            { num: 3, label: 'Date & Slot' },
            { num: 4, label: 'Confirm' },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              disabled={step < item.num}
              onClick={() => setStep(item.num)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                step === item.num
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 font-bold shadow-sm'
                  : step > item.num
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200/70 dark:border-slate-800/70 text-slate-400 opacity-60'
              }`}
            >
              <div className="hidden sm:inline-block mr-1">Step {item.num}:</div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Choose a Clinical Service
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select the medical service you need assistance with today.
            </p>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : errorServices ? (
            <ErrorState message="Could not load healthcare services catalog." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedService(srv);
                      setStep(2);
                    }}
                    className={`p-5 rounded-3xl glass-card glass-card-hover cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-500/25 bg-primary-50/40 dark:bg-primary-950/50 shadow-md'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {srv.name}
                        </h3>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/70 px-2 py-0.5 rounded-xl border border-primary-200/80 dark:border-primary-800/80 shrink-0">
                          {formatCurrency(srv.price)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 font-normal">
                        {srv.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {srv.duration_minutes} minutes
                      </span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
                        Select <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Select Provider */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Select a Medical Provider
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Qualified for: <strong className="text-slate-800 dark:text-slate-200">{selectedService?.name}</strong>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => setStep(1)}
            >
              Change Service
            </Button>
          </div>

          {loadingProviders ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : errorProviders ? (
            <ErrorState message="Could not load providers directory." />
          ) : filteredProviders.length === 0 ? (
            <EmptyState
              title="No providers found for this service"
              description="Please choose another service or contact administration."
              actionLabel="Pick Different Service"
              onAction={() => setStep(1)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProviders.map((prov) => {
                const isSelected = selectedProvider?.id === prov.id;
                return (
                  <div
                    key={prov.id}
                    onClick={() => {
                      setSelectedProvider(prov);
                      setSelectedSlot(null);
                      setStep(3);
                    }}
                    className={`p-5 rounded-3xl glass-card glass-card-hover cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-500/25 bg-primary-50/40 dark:bg-primary-950/50 shadow-md'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <img
                          src={prov.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                          alt={prov.full_name}
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-primary-500/20"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {prov.full_name}
                          </h3>
                          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                            {prov.specialty}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">{prov.rating}</span>
                            <span className="text-slate-400">({prov.experience_years} yrs exp)</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
                        {prov.bio}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(prov.consultation_fee)} / visit
                      </span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
                        Select Provider <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Select Date & Available Slot */}
      {step === 3 && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Choose Date & Open Slot
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clinician: <strong className="text-slate-800 dark:text-slate-200">{selectedProvider?.full_name}</strong>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => setStep(2)}
            >
              Change Provider
            </Button>
          </div>

          {/* Date Picker Input */}
          <div className="p-6 rounded-3xl glass-card space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Appointment Date
            </label>
            <div className="max-w-xs">
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
              />
            </div>
          </div>

          {/* Slots Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Open Slots on {formatDate(selectedDate)}
            </h3>

            {loadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
              </div>
            ) : availableSlots.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No free slots on this date"
                description="This provider does not have any available time slots on the selected day. Please select a different date."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/25 font-bold shadow-md'
                          : 'border-slate-200/80 dark:border-slate-800 glass-card hover:border-primary-400 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-primary-500 mb-0.5" />
                      <span className="text-xs font-semibold">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!selectedSlot}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setStep(4)}
            >
              Review Details
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Notes & Review & Confirm */}
      {step === 4 && (
        <div className="space-y-6 animate-slide-up">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Review & Confirm Booking
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please double check all visit details before confirming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consultation summary card */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-4 shadow-soft">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Appointment Overview
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Service</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedService?.name}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Medical Clinician</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedProvider?.full_name} ({selectedProvider?.specialty})
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatDate(selectedSlot?.start_time)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Time Window</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatTimeRange(selectedSlot?.start_time, selectedSlot?.end_time)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Estimated Duration</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedService?.duration_minutes} minutes
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Input
                    label="Reason for visit / Patient notes (optional)"
                    placeholder="e.g. Regular health check, symptoms review..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={300}
                  />
                </div>
              </div>
            </div>

            {/* Price & Confirmation sidebar */}
            <div className="space-y-4">
              <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-4 shadow-soft">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Investment
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Consultation fee</span>
                    <span>{formatCurrency(selectedService?.price)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Platform booking fee</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free ($0)</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span>Total</span>
                    <span className="text-primary-600 dark:text-primary-400">{formatCurrency(selectedService?.price)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    onClick={handleBookingSubmit}
                    className="shadow-md shadow-primary-500/25"
                  >
                    Confirm & Reserve
                  </Button>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed font-normal">
                  Protected with row-level locking. You can cancel or reschedule online up to 2 hours prior to the slot.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
