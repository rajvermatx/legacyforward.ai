import { Metadata } from 'next';
import { FileText, CheckCircle, TrendingUp } from 'lucide-react';
import Button from '@/components/Button';
import SectionHeader from '@/components/SectionHeader';
import MeridianBadge from '@/components/MeridianBadge';
import RoleCard from '@/components/RoleCard';
import { ROLES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'LegacyForward — Calibration-First LLM Delivery',
  description:
    'Your LLM projects are failing where no one is looking. The Meridian Method™ is a calibration-first delivery methodology for LLM integration in legacy enterprise environments.',
  openGraph: {
    title: 'LegacyForward — Calibration-First LLM Delivery',
    description:
      'Your LLM projects are failing where no one is looking. The Meridian Method™ closes the allied skills gap.',
    url: 'https://legacyforward.ai',
    siteName: 'LegacyForward',
    type: 'website',
  },
};

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="w-full bg-navy hero-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-bold text-white leading-tight tracking-heading max-w-4xl">
            Your LLM projects are failing where no one is looking.
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-[#8AAFD4] max-w-[640px] leading-relaxed">
            Not in engineering. In the room next to engineering — where the BAs,
            QAs, PMs, and product owners are still using mental models built for
            deterministic systems.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button href="/meridian-method" variant="primary">
              Explore the Meridian Method&trade;
            </Button>
            <Button href="/allied-skills" variant="secondary">
              View the Training Program
            </Button>
          </div>
          <p className="mt-6 text-sm text-[#6090B0]">
            The Meridian Method&trade; is a registered trademark of LegacyForward.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="The Allied Skills Gap" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <ProblemColumn
              icon={<FileText className="w-8 h-8 text-mid" />}
              heading="The BA problem"
              body="Requirements like 'the system shall accurately summarize' are unverifiable when the system is probabilistic. Acceptance criteria written for deterministic outputs will never close on a generative feature."
            />
            <ProblemColumn
              icon={<CheckCircle className="w-8 h-8 text-teal" />}
              heading="The QA problem"
              body="Exact-match regression fails silently on LLM systems. A model update can degrade behavior with no code change, no deployment, and no test failure. Your green suite means nothing."
            />
            <ProblemColumn
              icon={<TrendingUp className="w-8 h-8 text-purple" />}
              heading="The PM problem"
              body="Story point velocity does not apply to eval-driven development. LLM quality follows an S-curve. Sprint forecasts built on early velocity will be consistently, expensively wrong."
            />
          </div>
          <div className="mt-12 bg-pale rounded-lg p-8 text-center">
            <p className="text-navy text-lg font-medium max-w-3xl mx-auto italic">
              This is not a skills training problem. It is a methodology problem.
              Agile was not designed for probabilistic systems. Neither were the
              roles that operate inside it.
            </p>
          </div>
        </div>
      </section>

      {/* The Hypothesis */}
      <section className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="The Hypothesis" />
          <blockquote className="mt-8 max-w-4xl mx-auto border-l-4 border-gold pl-6 py-2">
            <p className="text-xl md:text-2xl text-navy font-medium leading-relaxed italic">
              LLM adoption in legacy enterprises will fail primarily because of
              skill gaps in non-engineering roles — not in engineering — and
              current enablement investments are almost entirely misdirected.
            </p>
          </blockquote>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div>
              <h3 className="text-lg font-bold text-navy mb-4">
                What this means for your organization
              </h3>
              <ul className="space-y-3 text-gray">
                <li className="flex gap-2">
                  <span className="text-coral font-bold shrink-0">—</span>
                  Pilots that pass engineering review and fail in delivery
                </li>
                <li className="flex gap-2">
                  <span className="text-coral font-bold shrink-0">—</span>
                  Regression that is invisible until it surfaces in production
                </li>
                <li className="flex gap-2">
                  <span className="text-coral font-bold shrink-0">—</span>
                  Stakeholder confidence lost to failures no one can explain
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-4">
                What LegacyForward does about it
              </h3>
              <ul className="space-y-3 text-gray">
                <li className="flex gap-2">
                  <span className="text-gold font-bold shrink-0">—</span>
                  The Meridian Method&trade; — a purpose-built delivery methodology
                </li>
                <li className="flex gap-2">
                  <span className="text-gold font-bold shrink-0">—</span>
                  LLM Allied Skills Program — role-specific practitioner training
                </li>
                <li className="flex gap-2">
                  <span className="text-gold font-bold shrink-0">—</span>
                  Consulting engagements for legacy enterprise LLM transformation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MERIDIAN Acronym */}
      <section className="w-full bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader
            title="The Meridian Method&trade;"
            subtitle="Measurement-first. Eval-driven. Role-embedded. Iterative. Distributed. Incremental. Adaptive. Non-deterministic."
            light
          />
          <MeridianBadge />
          <div className="mt-10 text-center">
            <Button href="/meridian-method" variant="primary">
              Read the full methodology
            </Button>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <SectionHeader title="Built for the practitioners surrounding the engineering team" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {ROLES.map((role) => (
              <RoleCard key={role.role} {...role} />
            ))}
          </div>
        </div>
      </section>

      {/* Credibility Bar */}
      <section className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <p className="text-center text-gray text-sm max-w-3xl mx-auto mb-8">
            Framework developed across enterprise architecture, multi-cloud AI
            governance, and legacy modernization spanning regulated industries.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            {[
              'GCP Professional Cloud Architect',
              'AWS ML Engineer',
              'Architecture Review Board Co-Chair',
            ].map((cred) => (
              <div
                key={cred}
                className="px-5 py-3 border-2 border-gold rounded-md text-center text-sm font-medium text-navy"
              >
                {cred}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-heading max-w-3xl mx-auto">
            The methodology exists. The training program exists. The path is
            mapped.
          </h2>
          <p className="mt-4 text-light text-lg max-w-2xl mx-auto">
            The only question is whether your organization will invest in the
            people surrounding the engineers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/meridian-method" variant="primary">
              Explore the Meridian Method&trade;
            </Button>
            <Button href="/contact" variant="secondary">
              Contact LegacyForward
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function ProblemColumn({
  icon,
  heading,
  body,
}: {
  icon: React.ReactNode;
  heading: string;
  body: string;
}) {
  return (
    <div className="text-center md:text-left">
      <div className="flex justify-center md:justify-start mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-navy">{heading}</h3>
      <p className="mt-2 text-sm text-gray leading-relaxed">{body}</p>
    </div>
  );
}
