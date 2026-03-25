import { Metadata } from 'next';
import Button from '@/components/Button';
import SectionHeader from '@/components/SectionHeader';
import MeridianCycleDiagram from '@/components/MeridianCycleDiagram';
import { CEREMONIES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'The Calibration Cycle & Ceremonies',
  description:
    'The Meridian Method\u2122 calibration cycle: five phases and six ceremonies that replace Agile sprints for LLM delivery in legacy enterprise environments.',
  openGraph: {
    title: 'The Calibration Cycle & Ceremonies | LegacyForward',
    description:
      'Five phases. Six ceremonies. A structured loop that moves a behavioral hypothesis from statement to evidence to decision.',
    url: 'https://legacyforward.ai/meridian-cycle',
    siteName: 'LegacyForward',
    type: 'website',
  },
};

export default function MeridianCyclePage() {
  return (
    <>
      {/* Hero */}
      <section className="w-full bg-navy hero-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
            The Meridian Method&trade;
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-bold text-white leading-tight tracking-heading">
            The Calibration Cycle
          </h1>
          <p className="mt-4 text-xl text-[#8AAFD4] max-w-3xl">
            A structured loop that moves a behavioral hypothesis from statement
            to evidence to decision. Not a time-boxed sprint — a calibration
            cycle.
          </p>
        </div>
      </section>

      {/* Diagram */}
      <section className="w-full bg-navy border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <MeridianCycleDiagram />
        </div>
      </section>

      {/* Six Ceremonies */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <SectionHeader
            title="Six Ceremonies"
            subtitle="Each ceremony is designed around the calibration-first principle: human judgment is established and consulted before, during, and after every build cycle."
          />
          <div className="mt-8 overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[640px] text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-navy">
                  <th className="text-left py-3 px-3 font-semibold text-navy">Ceremony</th>
                  <th className="text-left py-3 px-3 font-semibold text-navy">Replaces</th>
                  <th className="text-left py-3 px-3 font-semibold text-navy">Who</th>
                  <th className="text-left py-3 px-3 font-semibold text-navy">Cadence</th>
                </tr>
              </thead>
              <tbody>
                {CEREMONIES.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`border-b border-light ${i % 2 === 0 ? 'bg-white' : 'bg-pale'}`}
                  >
                    <td className="py-3 px-3 font-medium text-navy">{c.name}</td>
                    <td className="py-3 px-3 text-gray italic">{c.replaces}</td>
                    <td className="py-3 px-3 text-gray">{c.who}</td>
                    <td className="py-3 px-3 text-gray">{c.cadence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ceremony details (expandable) */}
          <div className="mt-10 space-y-4 max-w-4xl mx-auto">
            {CEREMONIES.map((c) => (
              <div
                key={c.name}
                className="border border-light rounded-lg p-5 hover:shadow-sm transition-shadow duration-200"
              >
                <h3 className="text-base font-bold text-navy">{c.name}</h3>
                <p className="mt-2 text-sm text-gray leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
          <h2 className="text-2xl font-bold text-white tracking-heading">
            See how the methodology replaces Agile assumptions
          </h2>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/meridian-method" variant="secondary">
              Back to The Meridian Method&trade;
            </Button>
            <Button href="/contact" variant="primary">
              Enquire about licensing
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
