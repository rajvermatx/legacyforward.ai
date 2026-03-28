import type { Metadata } from "next";
import FrameworkFlow from "@/components/diagrams/FrameworkFlow";
import SubscribeCTA from "@/components/SubscribeCTA";

export const metadata: Metadata = {
  title: "Framework",
  description:
    "The LegacyForward framework: Signal Capture, Grounded Delivery, and Legacy Coexistence — three pillars for enterprise AI transformation.",
};

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

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <FrameworkFlow />
        </div>
      </section>

      <SubscribeCTA
        headline="Go deeper on enterprise AI."
        description="Get framework updates, new patterns, and practitioner insights as we build out each pillar."
      />
    </>
  );
}
