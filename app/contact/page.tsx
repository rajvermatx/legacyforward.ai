import { Metadata } from 'next';
import { Mail, ExternalLink, Globe } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact LegacyForward',
  description:
    'Enquiries for training programs, methodology licensing, consulting, and speaking. Get in touch with LegacyForward.',
  openGraph: {
    title: 'Contact LegacyForward',
    description:
      'Enquiries for training programs, methodology licensing, consulting, and speaking.',
    url: 'https://legacyforward.ai/contact',
    siteName: 'LegacyForward',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="w-full bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-heading">
            Contact LegacyForward
          </h1>
          <p className="mt-4 text-xl text-[#8AAFD4] max-w-3xl">
            Enquiries for training programs, methodology licensing, consulting,
            and speaking.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="w-full bg-white">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <ContactForm />
          <p className="text-center text-sm text-gray mt-6">
            Expected response: within 2 business days.
          </p>
        </div>
      </section>

      {/* Alternative Contact */}
      <section className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row justify-center gap-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray">
              <Mail className="w-4 h-4 text-mid" />
              hello@legacyforward.ai
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray">
              <ExternalLink className="w-4 h-4 text-mid" />
              LinkedIn
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray">
              <Globe className="w-4 h-4 text-mid" />
              USA &amp; India
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
