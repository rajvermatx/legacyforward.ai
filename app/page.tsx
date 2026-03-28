import Hero from "@/components/Hero";
import FrameworkFlow from "@/components/diagrams/FrameworkFlow";
import SubscribeCTA from "@/components/SubscribeCTA";

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

      {/* Framework — the answer */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            A Framework That Addresses All Three
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            Value identification, delivery methodology for non-deterministic systems,
            and legacy coexistence — connected into a single coherent approach.
          </p>
          <FrameworkFlow />
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
