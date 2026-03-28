import Hero from "@/components/Hero";
import PillarCard from "@/components/PillarCard";
import SubscribeCTA from "@/components/SubscribeCTA";

const pillars = [
  {
    number: 1,
    title: "Signal Capture",
    slug: "signal-capture",
    description:
      "Most AI initiatives are expensive automation. Signal Capture identifies where AI creates outcomes that are impossible by any other means.",
  },
  {
    number: 2,
    title: "Grounded Delivery",
    slug: "grounded-delivery",
    description:
      "Agile was built for predictable software. AI is not predictable. Grounded Delivery defines how to deliver systems whose outputs vary every time.",
  },
  {
    number: 3,
    title: "Legacy Coexistence",
    slug: "legacy-coexistence",
    description:
      "Every AI strategy that ignores your existing systems is a fantasy. Legacy Coexistence provides patterns for making AI work alongside what you already have.",
  },
];

const problems = [
  "AI hype outpaces AI value. Most POCs die or deliver little operational value.",
  "Delivery methods don't fit the work. Agile assumes deterministic outputs. AI is non-deterministic by nature.",
  "Legacy isn't going anywhere. These systems process trillions in transactions and encode decades of business logic.",
  "Agentic AI is the new magic word. Executives skip to fantasizing about outcomes without understanding production reality.",
  "Vibe coding accelerates the wrong thing. Speed without architectural thinking is technical debt at scale.",
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Pillars */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            Three Pillars. One Framework.
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            LegacyForward connects value identification, delivery methodology for
            non-deterministic systems, and legacy coexistence into a single coherent approach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <PillarCard key={p.slug} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            The Enterprise AI Problem
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            The enterprise world is caught in a perfect storm. Nobody is addressing
            these problems together.
          </p>
          <div className="space-y-4">
            {problems.map((problem, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-teal-500 font-bold text-lg mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-slate-700 leading-relaxed">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
