import { Metadata } from 'next';
import Button from '@/components/Button';
import SectionHeader from '@/components/SectionHeader';
import SessionCard from '@/components/SessionCard';
import JobAidCard from '@/components/JobAidCard';
import { SESSIONS, JOB_AIDS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'LLM Allied Skills Program',
  description:
    'Role-specific fluency for the practitioners surrounding the engineering team. 6 sessions. 4 job aids. 6 roles. One capstone. One credential.',
  openGraph: {
    title: 'LLM Allied Skills Program | LegacyForward',
    description:
      'Role-specific fluency for BAs, QAs, PMs, POs, Data Stewards, and Change Managers working on LLM projects.',
    url: 'https://legacyforward.ai/allied-skills',
    siteName: 'LegacyForward',
    type: 'website',
  },
};

export default function AlliedSkillsPage() {
  return (
    <>
      {/* Hero */}
      <section className="w-full bg-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-bold text-white leading-tight tracking-heading">
            LLM Allied Skills Program
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-light max-w-3xl">
            Role-specific fluency for the practitioners surrounding the
            engineering team.
          </p>
          <p className="mt-2 text-steel text-lg">
            6 sessions. 4 job aids. 6 roles. One capstone. One credential.
          </p>
        </div>
      </section>

      {/* The Distinction */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Generic */}
            <div className="bg-coral-lt rounded-lg p-8">
              <div className="text-coral font-bold text-2xl mb-4">&#x2717;</div>
              <h3 className="text-lg font-bold text-navy mb-4">
                Generic AI literacy asks:
              </h3>
              <ul className="space-y-2 text-gray text-sm">
                <li>What is an LLM?</li>
                <li>How does RAG work?</li>
                <li>What is a token?</li>
              </ul>
            </div>
            {/* Allied Skills */}
            <div className="bg-teal-lt rounded-lg p-8">
              <div className="text-teal font-bold text-2xl mb-4">&#x2713;</div>
              <h3 className="text-lg font-bold text-navy mb-4">
                LLM Allied Skills asks:
              </h3>
              <ul className="space-y-3 text-gray text-sm">
                <li>
                  How do I write an acceptance criterion when the output is
                  probabilistic? <span className="text-mid font-medium">(BA)</span>
                </li>
                <li>
                  How do I build a regression suite for a system that is not
                  deterministic? <span className="text-mid font-medium">(QA)</span>
                </li>
                <li>
                  How do I scope a story when I cannot predict what the model will
                  return? <span className="text-mid font-medium">(PO)</span>
                </li>
                <li>
                  How do I plan a sprint when progress is measured by eval scores?{' '}
                  <span className="text-mid font-medium">(PM)</span>
                </li>
                <li>
                  How do I assess retrieval quality and who owns it when it
                  degrades?{' '}
                  <span className="text-mid font-medium">(Data Steward)</span>
                </li>
                <li>
                  How do I communicate system behavior when it can change without a
                  deployment? <span className="text-mid font-medium">(CM)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Six Sessions */}
      <section id="sessions" className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="The Program" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {SESSIONS.map((s) => (
              <SessionCard key={s.number} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Four Job Aids */}
      <section id="job-aids" className="w-full bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader
            title="Four Job Aids. Designed for Live Projects."
            subtitle="These are tools, not reading material. Every participant leaves with artifacts they use in their next sprint."
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {JOB_AIDS.map((aid) => (
              <JobAidCard key={aid.title} {...aid} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/resources" variant="secondary">
              Download a sample job aid
            </Button>
          </div>
        </div>
      </section>

      {/* Delivery Model */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="Delivery Model" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <InfoCard
              title="Format"
              text="Blended — reading, group exercises, individual reflection"
            />
            <InfoCard
              title="Duration"
              text="Multi-session across 6 weeks minimum, up to 24 weeks for full program"
            />
            <InfoCard
              title="Cohort size"
              text="15–25 practitioners, cross-functional groups"
            />
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="w-full bg-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="Markets" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-lg font-bold text-navy mb-4">USA Market</h3>
              <ul className="space-y-2 text-sm text-gray">
                <li>
                  <span className="font-medium text-dark">Target:</span>{' '}
                  Enterprise L&amp;D, digital transformation leads, regulated
                  industry enterprises, system integrators
                </li>
                <li>
                  <span className="font-medium text-dark">Pricing:</span>{' '}
                  $45,000–$65,000 pilot | $120,000–$180,000 full program
                </li>
                <li>
                  <span className="font-medium text-dark">Licensing:</span> SI
                  white-label licensing available
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-lg font-bold text-navy mb-4">India Market</h3>
              <ul className="space-y-2 text-sm text-gray">
                <li>
                  <span className="font-medium text-dark">Target:</span> Tier 1
                  IT services firms, Indian BFSI and healthcare
                </li>
                <li>
                  <span className="font-medium text-dark">Pricing:</span>{' '}
                  ₹15,000–₹35,000/seat for B2B cohorts | ₹4,999–₹9,999
                  individual track
                </li>
                <li>
                  <span className="font-medium text-dark">Alignment:</span>{' '}
                  IndiaAI Mission framework
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Credential */}
      <section id="credential" className="w-full bg-gold-lt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="LLM Allied Skills Certified Practitioner&trade;" />
          <div className="max-w-2xl mx-auto mt-8 space-y-4 text-sm text-gray">
            <p>
              <span className="font-medium text-dark">Issued by:</span>{' '}
              LegacyForward
            </p>
            <p>
              <span className="font-medium text-dark">Role-specific tracks:</span>{' '}
              BA / QA / PO / PM / Data Steward / Change Manager
            </p>
            <p>
              <span className="font-medium text-dark">Assessment:</span> Meridian
              Method&trade; Practitioner Assessment + job aid submission
            </p>
            <p>
              <span className="font-medium text-dark">Renewal:</span> Annual —
              requires evidence of active Meridian participation
            </p>
          </div>
          <div className="mt-10 text-center">
            <Button href="/contact" variant="primary">
              Enquire about the program
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-lt-gray rounded-lg p-6 text-center">
      <h3 className="text-base font-bold text-navy">{title}</h3>
      <p className="mt-2 text-sm text-gray">{text}</p>
    </div>
  );
}
