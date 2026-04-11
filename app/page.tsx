import Link from "next/link";
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

const libraryCards = [
  {
    title: "Practitioner Books",
    desc: "6 free books — AI strategy, architecture, engineering, analysis, and data.",
    href: "/library/books",
    count: "6 books · 100+ chapters",
    color: "bg-violet-500",
  },
  {
    title: "Toolkit",
    desc: "30 production-ready blueprints, agentic patterns, and GenAI architectures.",
    href: "/library/toolkit",
    count: "30 patterns",
    color: "bg-teal-500",
  },
  {
    title: "Learning Paths",
    desc: "GCP certifications and Generative AI study guides with companion notebooks.",
    href: "/library/learn",
    count: "6 paths · 95+ notebooks",
    color: "bg-blue-500",
  },
  {
    title: "Cheatsheets",
    desc: "15 concise quick-reference guides for AI and ML topics. Download as PDF.",
    href: "/library/cheatsheets",
    count: "15 guides",
    color: "bg-amber-500",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Framework — lead with the solution */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            Three Pillars. One Coherent Approach.
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            Value identification, delivery methodology for non-deterministic systems,
            and legacy coexistence — connected into a single framework.
          </p>
          <FrameworkFlow />
        </div>
      </section>

      {/* Problem Statement — why this matters */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-4">
            Why Most Enterprise AI Fails
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            Not because of technology — because of how organizations approach it.
          </p>
          <div className="space-y-4 max-w-3xl mx-auto">
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

      {/* Library Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-teal-500 font-semibold text-sm uppercase tracking-widest mb-3">
              Free · Open Source
            </p>
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              The Library
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Practitioner resources to go deeper — books, patterns, learning paths, and cheatsheets.
              Everything is free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {libraryCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group block bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-teal-500/50 hover:shadow-md transition-all"
              >
                <div className={`${card.color} h-1`} />
                <div className="p-5">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                    {card.count}
                  </span>
                  <h3 className="text-base font-bold text-navy-900 group-hover:text-teal-600 transition-colors mt-1 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-500 font-semibold transition-colors text-sm"
            >
              Browse the full Library
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* App Teaser */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Coming Soon
          </p>
          <h2 className="text-3xl font-bold text-white mb-4">
            The LegacyForward.ai App
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            AI-powered career navigation. Get a personalized roadmap, AI impact analysis,
            skill translation, and a 16-chapter career book written about you.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Learn more
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
