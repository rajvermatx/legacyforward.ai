import { Metadata } from 'next';
import Button from '@/components/Button';
import SectionHeader from '@/components/SectionHeader';
import CalloutBox from '@/components/CalloutBox';
import ComparisonTable from '@/components/ComparisonTable';
import { BROKEN_ASSUMPTIONS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'The Meridian Method\u2122',
  description:
    'A calibration-first delivery methodology for LLM integration in legacy enterprise environments. Designed for systems that cannot behave the same way twice.',
  openGraph: {
    title: 'The Meridian Method\u2122 | LegacyForward',
    description:
      'A calibration-first delivery methodology for LLM integration in legacy enterprise environments.',
    url: 'https://legacyforward.ai/meridian-method',
    siteName: 'LegacyForward',
    type: 'website',
  },
};

export default function MeridianMethodPage() {
  return (
    <>
      {/* Hero */}
      <section className="w-full bg-navy hero-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-bold text-white leading-tight tracking-heading">
            The Meridian Method&trade;
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-[#8AAFD4] max-w-3xl">
            A calibration-first delivery methodology for LLM integration in
            legacy enterprise environments.
          </p>
          <p className="mt-2 text-light text-lg">
            Designed for systems that cannot behave the same way twice.
          </p>
          <div className="mt-8">
            <Button href="/resources" variant="primary">
              Download the White Paper
            </Button>
          </div>
        </div>
      </section>

      {/* The Core Claim */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <CalloutBox label="THE CORE CLAIM" accent="gold">
            <p className="text-base md:text-lg">
              The Meridian Method&trade; is not a patch on Agile. It is a
              purpose-built methodology for a class of systems that did not exist
              when Agile was conceived. Its organizing principle: human judgment is
              the meridian — the fixed reference line from which all system
              behavior is measured, toward which every iteration converges.
            </p>
          </CalloutBox>
        </div>
      </section>

      {/* Five Broken Assumptions — Compact */}
      <section id="broken-assumptions" className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <SectionHeader title="Five Assumptions That Break" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 max-w-6xl mx-auto">
            {BROKEN_ASSUMPTIONS.map((item) => (
              <div
                key={item.number}
                className={`bg-white rounded-lg p-5 border-l-4 border-coral shadow-sm ${
                  item.number === 5 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-bold text-gold font-mono">
                    {item.number}
                  </span>
                  <h3 className="text-sm font-bold text-navy leading-snug">
                    {item.assumption}
                  </h3>
                </div>
                <p className="text-xs text-gray leading-relaxed">
                  {item.failure}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <SectionHeader title="Waterfall vs Agile vs The Meridian Method&trade;" />
          <div className="mt-8">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* The Calibration Cycle — CTA to dedicated page */}
      <section className="w-full bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
          <SectionHeader
            title="The Calibration Cycle &amp; Ceremonies"
            subtitle="Five phases. Six ceremonies. One question throughout: how far are we from the meridian?"
            light
          />
          <div className="mt-8">
            <Button href="/meridian-cycle" variant="primary">
              Explore the Calibration Cycle
            </Button>
          </div>
        </div>
      </section>

      {/* Licensing */}
      <section id="licensing" className="w-full bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <SectionHeader title="Licensing" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <LicenseCard
              title="Practitioner License"
              description="Included with Allied Skills Program enrollment"
            />
            <LicenseCard
              title="Organizational License"
              description="$25,000\u2013$60,000/year, train-the-trainer included"
            />
            <LicenseCard
              title="Delivery Partner License"
              description="$40,000\u2013$80,000/year + rev share, co-branding rights"
            />
          </div>
          <div className="mt-8 text-center">
            <Button href="/contact" variant="primary">
              Enquire about licensing
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function LicenseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-light">
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 text-sm text-gray">{description}</p>
    </div>
  );
}
