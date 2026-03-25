import { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';

export const metadata: Metadata = {
  title: 'About LegacyForward',
  description:
    'Built at the intersection of enterprise architecture and enterprise AI adoption. Meet the founder and the story behind the Meridian Method™.',
  openGraph: {
    title: 'About LegacyForward',
    description:
      'Built at the intersection of enterprise architecture and enterprise AI adoption.',
    url: 'https://legacyforward.ai/about',
    siteName: 'LegacyForward',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="w-full bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-bold text-white leading-tight tracking-heading">
            About LegacyForward
          </h1>
          <p className="mt-4 text-xl text-[#8AAFD4] max-w-3xl">
            Built at the intersection of enterprise architecture and enterprise AI
            adoption.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
            {/* Avatar placeholder */}
            <div className="flex justify-center md:justify-start">
              <div className="w-48 h-48 rounded-full bg-navy flex items-center justify-center">
                <span className="text-5xl font-bold text-gold">R</span>
              </div>
            </div>

            {/* Narrative */}
            <div className="space-y-5 text-gray leading-relaxed max-w-readable">
              <p>
                LegacyForward was founded by a practicing enterprise architect
                with over fifteen years of experience governing technology
                adoption in some of the most complex legacy environments in the
                world — large regulated enterprises with deep institutional
                constraints.
              </p>
              <p>
                The Meridian Method&trade; was not invented in a whiteboard
                session. It emerged from watching well-resourced, technically
                capable LLM projects fail repeatedly — not in engineering, but in
                the delivery infrastructure surrounding it. In Architecture Review
                Boards. In requirements sessions. In QA sign-offs. In sprint
                reviews where human judgment walked in too late.
              </p>
              <p>
                The allied skills gap is not theoretical. It is observable in
                every enterprise LLM pilot that passes technical review and then
                quietly disappears six months later.
              </p>
              <p>
                LegacyForward exists to close that gap — through a methodology
                that names the problem precisely, and a training program that
                gives practitioners the role-specific fluency to actually work
                inside it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="Credentials & Context" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-base font-bold text-navy mb-4">
                Certifications
              </h3>
              <ul className="space-y-2 text-sm text-gray">
                <li>GCP Professional Cloud Architect</li>
                <li>AWS ML Engineer</li>
                <li>Ready Tensor Agentic AI (in progress)</li>
                <li>NIST AI RMF Practitioner (in progress)</li>
                <li>FinOps Foundation AI (in progress)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold text-navy mb-4">
                Experience Context
              </h3>
              <ul className="space-y-2 text-sm text-gray">
                <li>Enterprise AI governance in regulated industries</li>
                <li>Architecture Review Board Co-Chair</li>
                <li>Enterprise AI/ML adoption governance</li>
                <li>Multi-cloud architecture (GCP, AWS)</li>
                <li>Legacy modernization in regulated environments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Why */}
      <section className="w-full bg-navy">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <blockquote className="border-l-4 border-gold pl-6 text-left">
            <p className="text-2xl md:text-[30px] text-white font-medium leading-relaxed italic">
              &ldquo;The model is not the risk. We are the risk. And we are also
              the fix.&rdquo;
            </p>
          </blockquote>
          <p className="mt-6 text-sm text-steel">
            Rajesh, LegacyForward Speaking Guide, March 2026
          </p>
        </div>
      </section>
    </>
  );
}
