import type { Metadata } from "next";
import { getFrameworkPillars } from "@/lib/content";
import PillarCard from "@/components/PillarCard";
import SubscribeCTA from "@/components/SubscribeCTA";

export const metadata: Metadata = {
  title: "Framework",
  description:
    "The LegacyForward framework: Signal Capture, Grounded Delivery, and Legacy Coexistence — three pillars for enterprise AI transformation.",
};

export default function FrameworkPage() {
  const pillars = getFrameworkPillars();

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

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {/* Flow line */}
          <div className="hidden md:flex items-center justify-center gap-3 mb-12 text-sm font-medium text-navy-700">
            <span className="bg-white border border-teal-300 rounded-full px-4 py-1.5">
              Signal Capture
            </span>
            <span className="text-teal-500">&rarr;</span>
            <span className="bg-white border border-teal-300 rounded-full px-4 py-1.5">
              Grounded Delivery
            </span>
            <span className="text-teal-500">&rarr;</span>
            <span className="bg-white border border-teal-300 rounded-full px-4 py-1.5">
              Legacy Coexistence
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <PillarCard
                key={p.meta.slug}
                number={p.meta.pillar ?? 0}
                title={p.meta.title}
                description={p.meta.description}
                slug={p.meta.slug}
              />
            ))}
          </div>
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
