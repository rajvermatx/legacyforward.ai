'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { ROLE_OPTIONS } from '@/lib/constants';
import Button from './Button';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Please select your role'),
});

type FormData = z.infer<typeof schema>;

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  resourceTitle,
}: EmailCaptureModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, resource: resourceTitle }),
    });
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Download ${resourceTitle}`}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray hover:text-dark transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <h3 className="text-xl font-bold text-navy">Thank you!</h3>
            <p className="mt-2 text-gray text-sm">
              Your download for &ldquo;{resourceTitle}&rdquo; will begin shortly.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-navy">
              Download: {resourceTitle}
            </h3>
            <p className="text-sm text-gray mt-1 mb-6">
              Enter your details to access this resource.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Name</label>
                <input {...register('name')} className="form-input" />
                {errors.name && (
                  <p className="text-xs text-coral mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Email</label>
                <input {...register('email')} type="email" className="form-input" />
                {errors.email && (
                  <p className="text-xs text-coral mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Organization</label>
                <input {...register('organization')} className="form-input" />
                {errors.organization && (
                  <p className="text-xs text-coral mt-1">{errors.organization.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Role</label>
                <select {...register('role')} className="form-input">
                  <option value="">Select role</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-xs text-coral mt-1">{errors.role.message}</p>
                )}
              </div>

              <Button type="submit" variant="primary" fullWidth>
                {isSubmitting ? 'Processing...' : 'Download'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
