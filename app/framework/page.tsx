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
