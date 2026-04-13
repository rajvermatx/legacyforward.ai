import type { Metadata } from "next";
import Link from "next/link";
import FrameworkFlow from "@/components/diagrams/FrameworkFlow";
import SubscribeCTA from "@/components/SubscribeCTA";

export const metadata: Metadata = {
  title: "Framework",
  description:
    "The LegacyForward.ai framework: Signal Capture, Grounded Delivery, and Legacy Coexistence — three pillars for enterprise AI transformation.",
};

const pillars = [
  {
    number: 1,
    title: "Signal Capture",
    slug: "signal-capture",
    summary:
      "Most AI initiatives are expensive automation. Signal Capture is the discipline of identifying where AI creates outcomes that are impossible by any other means — not just faster versions of what you already do. It defines a three-stage process (hypothesis, validation, tracking) that kills initiatives without a clear value thesis before they consume resources.",
  },
  {
    number: 2,
    title: "Grounded Delivery",
    slug: "grounded-delivery",
    summary:
      "Agile was built for deterministic systems. AI is non-deterministic by nature. Grounded Delivery replaces sprints with five phases — Frame, Explore, Shape, Harden, Operate — each with explicit decision gates. It treats experimentation as a first-class phase, quality as a distribution, and \"done\" as a probabilistic threshold rather than a binary condition.",
  },
  {
    number: 3,
    title: "Legacy Coexistence",
    slug: "legacy-coexistence",
    summary:
      "Every AI strategy that ignores existing systems is a fantasy. Legacy Coexistence provides five architectural patterns — from Data Exhaust to Legacy-Aware Agents — for making AI work alongside the mainframes, batch jobs, and decades-old databases that actually run the enterprise. Not rip-and-replace. Not wrappers. Deliberate coexistence.",
  },
];

export default function FrameworkPage() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The Framework
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Three pillars that connect value identification, delivery methodology for
            non-deterministic systems, and legacy coexistence into a single coherent
            approach to enterprise AI transformation.
          </p>
        </div>
      </section>

      {/* Why this framework exists */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">Why Three Pillars</h2>
          <div className="text-slate-700 leading-relaxed space-y-4">
            <p>
              The enterprise AI problem is not one problem — it is three problems that
              compound each other. Organizations pick the wrong initiatives (a value
              problem), deliver them with methods designed for predictable software (a
              delivery problem), and deploy into environments dominated by legacy systems
              they cannot replace (a coexistence problem).
            </p>
            <p>
              Solving any one without the others fails. A brilliant value thesis dies in
              an Agile process that cannot handle non-deterministic outputs. A perfectly
              delivered AI system fails because it assumed greenfield when the enterprise
              runs on mainframes. LegacyForward.ai addresses all three together.
            </p>
          </div>
        </div>
      </section>

      {/* Diagram */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <FrameworkFlow />
        </div>
      </section>

      {/* Decision aid — where to start */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Where Should You Start?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/framework/signal-capture"
              className="border border-slate-200 rounded-lg p-6 hover:border-teal-500 transition-colors"
            >
              <p className="text-sm font-semibold text-teal-600 mb-2">&ldquo;We have AI ideas but don&rsquo;t know which ones are worth pursuing.&rdquo;</p>
              <p className="text-navy-900 font-bold">Start with Signal Capture &rarr;</p>
            </Link>
            <Link
              href="/framework/grounded-delivery"
              className="border border-slate-200 rounded-lg p-6 hover:border-teal-500 transition-colors"
            >
              <p className="text-sm font-semibold text-teal-600 mb-2">&ldquo;Our AI projects keep stalling or delivering inconsistent results.&rdquo;</p>
              <p className="text-navy-900 font-bold">Start with Grounded Delivery &rarr;</p>
            </Link>
            <Link
              href="/framework/legacy-coexistence"
              className="border border-slate-200 rounded-lg p-6 hover:border-teal-500 transition-colors"
            >
              <p className="text-sm font-semibold text-teal-600 mb-2">&ldquo;We can&rsquo;t replace our legacy systems but need AI to work with them.&rdquo;</p>
              <p className="text-navy-900 font-bold">Start with Legacy Coexistence &rarr;</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillar summaries */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16 space-y-12">
          {pillars.map((pillar) => (
            <div key={pillar.slug}>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-navy-900 text-teal-400 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-teal-400">
                  {pillar.number}
                </span>
                <h2 className="text-xl font-bold text-navy-900">{pillar.title}</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-3">{pillar.summary}</p>
              <Link
                href={`/framework/${pillar.slug}`}
                className="text-teal-600 font-semibold text-sm hover:underline"
              >
                Read the full pillar &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Cheatsheet callout */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-slate-500 text-sm mb-2">Want the quick reference?</p>
          <Link
            href="/cheatsheet"
            className="text-teal-600 font-semibold hover:underline text-lg"
          >
            Download the Framework Quick Reference &rarr;
          </Link>
        </div>
      </section>

      <SubscribeCTA
        headline="Go deeper on enterprise AI."
        description="Get framework updates, new patterns, and practitioner insights as we build out each pillar."
      />
    </>
  );
}
