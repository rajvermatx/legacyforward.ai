'use client';

import { useState } from 'react';
import { FileText, Lock, Mic } from 'lucide-react';
import Button from '@/components/Button';
import SectionHeader from '@/components/SectionHeader';
import EmailCaptureModal from '@/components/EmailCaptureModal';

const freeResources = [
  {
    title: 'The Meridian Method\u2122 White Paper',
    description:
      'Why Agile breaks on LLM projects and what to do about it.',
    format: 'PDF | 6 sections | March 2026',
    gated: true,
  },
  {
    title: 'LLM Allied Skills \u2014 Program Overview',
    description:
      'The business case, role gap map, and 6-month program skeleton.',
    format: 'PDF | 9 sections | March 2026',
    gated: true,
  },
  {
    title: 'Sample Job Aid \u2014 LLM Acceptance Criteria Template',
    description:
      'The BA/PO template that replaces the traditional acceptance criterion.',
    format: 'PDF | 1 page | March 2026',
    gated: false,
  },
];

export default function ResourcesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResource, setModalResource] = useState('');

  const openModal = (title: string) => {
    setModalResource(title);
    setModalOpen(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-bold text-white leading-tight tracking-heading">
            Resources
          </h1>
          <p className="mt-4 text-xl text-light max-w-3xl">
            The methodology is documented. The training program is structured.
            Start here.
          </p>
        </div>
      </section>

      {/* Free Downloads */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="Free Resources" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {freeResources.map((r) => (
              <div
                key={r.title}
                className="bg-pale rounded-lg p-6 flex flex-col"
              >
                <FileText className="w-8 h-8 text-mid mb-4" />
                <h3 className="text-base font-bold text-navy">{r.title}</h3>
                <p className="mt-2 text-sm text-gray flex-1">
                  {r.description}
                </p>
                <p className="mt-3 text-xs text-steel">{r.format}</p>
                <div className="mt-4">
                  {r.gated ? (
                    <Button
                      variant="primary"
                      className="text-sm w-full"
                      onClick={() => openModal(r.title)}
                    >
                      Request the white paper
                    </Button>
                  ) : (
                    <Button
                      href="/downloads/sample-job-aid.pdf"
                      variant="primary"
                      className="text-sm w-full"
                    >
                      Download free
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paid / Program Documents */}
      <section className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="Program Documents" />
          <p className="text-center text-sm text-gray mb-8">
            Full program documents are provided to enrolled cohorts and licensed
            partners.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                title: 'LLM Allied Skills Participant Guide',
                desc: '6 sessions, 4 job aids, capstone',
              },
              {
                title: 'Meridian Method\u2122 Licensing Package',
                desc: 'Ceremonies, IP framework, certification',
              },
            ].map((doc) => (
              <div
                key={doc.title}
                className="bg-white rounded-lg p-6 border border-light flex items-start gap-4 opacity-75"
              >
                <Lock className="w-6 h-6 text-gray shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-navy">{doc.title}</h3>
                  <p className="text-sm text-gray mt-1">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speaking */}
      <section className="w-full bg-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <Mic className="w-10 h-10 text-mid mx-auto mb-4" />
            <p className="text-gray leading-relaxed">
              Available for keynotes, workshops, and practitioner sessions on LLM
              delivery methodology, enterprise AI adoption, and the allied skills
              gap.
            </p>
            <div className="mt-6">
              <Button href="/contact" variant="primary">
                Enquire about speaking
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <EmailCaptureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        resourceTitle={modalResource}
      />
    </>
  );
}
