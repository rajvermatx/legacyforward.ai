import Link from 'next/link';
import { Metadata } from 'next';
import { BarChart3, FileDown, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meridian Compass — Run the Meridian Method. Starting today.',
  description: 'Free tools for BAs, QAs, PMs, and product owners working on LLM projects. Readiness Diagnostic, Templates, and Eval Scorer.',
};

const modules = [
  { name: 'Readiness Diagnostic', description: 'Score your team\'s LLM delivery readiness in 10 minutes. Radar chart, gap analysis, and prioritised next steps.', icon: Target, color: 'bg-purple' },
  { name: 'Templates & Resources', description: 'Download ceremony guides and job aid templates for your team. Ready to use — no app required.', icon: FileDown, color: 'bg-teal' },
  { name: 'Eval Scorer', description: 'Score LLM outputs against your human meridian baseline. Get confidence scores and gate recommendations.', icon: BarChart3, color: 'bg-gold' },
];

const steps = [
  { number: '1', title: 'Run the Diagnostic', description: 'Find your gaps in 10 minutes' },
  { number: '2', title: 'Grab the templates', description: 'Ceremony guides and job aids for your team' },
  { number: '3', title: 'Score your outputs', description: 'Know if you\'re above the threshold' },
];

export default function CompassLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/compass" className="flex items-center gap-2 text-white">
            <span className="text-lg font-bold tracking-heading">Meridian Compass</span>
            <span className="text-xs font-bold text-gold align-super">&trade;</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-steel hover:text-white transition-colors">
              legacyforward.ai
            </Link>
            <Link href="/compass/login" className="px-4 py-2 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy hero-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-bold text-white leading-tight tracking-heading">
            Run the Meridian Method.
            <br />
            <span className="text-gold">Starting today.</span>
          </h1>
          <p className="mt-4 text-xl text-[#8AAFD4] max-w-2xl mx-auto">
            Free tools for BAs, QAs, PMs, and product owners working on LLM projects.
          </p>
          <div className="mt-8">
            <Link href="/compass/login" className="inline-block px-8 py-3.5 bg-gold text-white text-base font-bold rounded-lg hover:bg-gold/90 transition-colors">
              Start your first project
            </Link>
          </div>
        </div>
      </section>

      {/* Module cards */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.name} className="bg-white rounded-lg border border-light p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${mod.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">{mod.name}</h3>
                  <p className="mt-2 text-sm text-gray">{mod.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-lt-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-navy text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gold text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold text-navy">{step.title}</h3>
                <p className="mt-1 text-sm text-gray">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white border-t border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-sm text-gray">
            Built on the <strong className="text-navy">Meridian Method&trade;</strong> — a LegacyForward IP publication
          </p>
          <Link href="/resources" className="text-sm text-mid hover:text-blue font-medium mt-1 inline-block">
            Read the white paper &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-center py-8">
        <p className="text-sm text-light">Meridian Compass is free. No credit card. No install.</p>
        <p className="text-xs text-steel mt-2">&copy; 2026 LegacyForward. The Meridian Method&trade; is a trademark of LegacyForward.</p>
      </footer>
    </div>
  );
}
