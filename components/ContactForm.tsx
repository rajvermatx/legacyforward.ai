'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROLE_OPTIONS, ENQUIRY_TYPES } from '@/lib/constants';
import Button from './Button';

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Please select your role'),
  enquiryType: z.string().min(1, 'Please select an enquiry type'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Form submission failed');
  };

  if (isSubmitSuccessful) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-navy">Thank you for your enquiry.</h3>
        <p className="mt-2 text-gray">We will respond within 2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Full name" error={errors.name?.message}>
        <input
          {...register('name')}
          className="form-input"
          placeholder="Your full name"
        />
      </Field>

      <Field label="Email address" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          className="form-input"
          placeholder="you@organization.com"
        />
      </Field>

      <Field label="Organization" error={errors.organization?.message}>
        <input
          {...register('organization')}
          className="form-input"
          placeholder="Your organization"
        />
      </Field>

      <Field label="Your role" error={errors.role?.message}>
        <select {...register('role')} className="form-input">
          <option value="">Select your role</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Enquiry type" error={errors.enquiryType?.message}>
        <select {...register('enquiryType')} className="form-input">
          <option value="">Select enquiry type</option>
          {ENQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register('message')}
          rows={4}
          className="form-input resize-y"
          placeholder="Tell us about your needs..."
        />
      </Field>

      <Button type="submit" variant="primary" fullWidth>
        {isSubmitting ? 'Sending...' : 'Send Enquiry'}
      </Button>

      <p className="text-xs text-gray text-center mt-3">
        Your information is used only to respond to your enquiry.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy mb-1">
        {label} <span className="text-coral">*</span>
      </label>
      {children}
      {error && <p className="text-xs text-coral mt-1">{error}</p>}
    </div>
  );
}
