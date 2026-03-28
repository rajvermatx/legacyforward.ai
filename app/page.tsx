import Hero from "@/components/Hero";
import PillarCard from "@/components/PillarCard";
import SubscribeCTA from "@/components/SubscribeCTA";

const problems = [
  "AI hype outpaces AI value. Most POCs die or deliver little operational value.",
  "Delivery methods don't fit the work. Agile assumes deterministic outputs. AI is non-deterministic by nature.",
  "Legacy isn't going anywhere. These systems process trillions in transactions and encode decades of business logic.",
  "Agentic AI is the new magic word. Executives skip to fantasizing about outcomes without understanding production reality.",
  "Vibe coding accelerates the wrong thing. Speed without architectural thinking is technical debt at scale.",
];

const pillars = [
  {
    number: 1,
    title: "Signal Capture",
    slug: "signal-capture",
    description:
      "Find where AI creates outcomes that are impossible by any other means — not just faster versions of what you already do.",
  },
  {
    number: 2,
    title: "Grounded Delivery",
    slug: "grounded-delivery",
    description:
      "A delivery methodology built for systems whose outputs vary every time — because Agile wasn't designed for non-deterministic work.",
  },
  {
    number: 3,
    title: "Legacy Coexistence",
    slug: "legacy-coexistence",
    description:
      "Patterns for making AI work alongside the systems you already have — because rip-and-replace is a fantasy.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Problem Statement — lead with the pain */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            Enterprise AI Is Failing
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            Not because of technology — because of how organizations are approaching it.
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

      {/* Pillars — the answer */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            A Framework That Addresses All Three
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            Value identification, delivery methodology for non-deterministic systems,
            and legacy coexistence — connected into a single coherent approach.
          </p>

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
              <PillarCard key={p.slug} {...p} />
            ))}
          </div>
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
