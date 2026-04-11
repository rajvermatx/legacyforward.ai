import Link from "next/link";
import SubscribeCTA from "@/components/SubscribeCTA";

const problems = [
  "AI hype outpaces AI value. Most POCs die or deliver little operational value.",
  "Delivery methods don't fit the work. Agile assumes deterministic outputs. AI is non-deterministic by nature.",
  "Legacy isn't going anywhere. These systems process trillions in transactions and encode decades of business logic.",
  "Agentic AI is the new magic word. Executives skip to fantasizing about outcomes without understanding production reality.",
  "Vibe coding accelerates the wrong thing. Speed without architectural thinking is technical debt at scale.",
];

const valueProps = [
  "Start with a framework, not a vendor pitch. Signal Capture gives you a disciplined way to find and validate real AI value before committing resources.",
  "Adopt a delivery model built for non-determinism. Grounded Delivery replaces Agile assumptions with phases designed for probabilistic outputs.",
  "Stop treating legacy as the enemy. Legacy Coexistence patterns let AI and existing systems work together without a rip-and-replace.",
  "Build the skills you actually need — free practitioner books, architecture patterns, and hands-on notebooks, organized by your role.",
  "Know your AI exposure before it finds you. The AI Impact Analyzer scores your role and generates a personalized roadmap for navigating the shift.",
];


export default function Home() {
  return (
    <>
      {/* ── ZONE 1: Hero ── */}
      <section className="bg-navy-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="mx-auto max-w-4xl px-6 pt-28 md:pt-36 pb-24 text-center relative">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
            Move from Chaos to Clarity
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
            The future of AI runs through the systems that keep the lights on.
          </h1>
          <p className="text-base text-slate-400 font-medium mb-12">
            Signal Capture → Grounded Delivery → Legacy Coexistence
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/framework"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Explore the Framework
            </Link>
            <Link
              href="/library"
              className="border border-slate-500 text-white hover:border-teal-400 hover:text-teal-400 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Browse the Library
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
            {[
              { value: "6", label: "Books" },
              { value: "102+", label: "Chapters" },
              { value: "30", label: "Patterns" },
              { value: "95+", label: "Notebooks" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-lg py-4 px-3">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONE 2: Three Platform Panels ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Panel 1 — Framework */}
            <div className="border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-5">
                <span className="inline-block text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full mb-4">
                  The Framework
                </span>
                <h2 className="text-xl font-bold text-navy-900 leading-snug mb-3">
                  Signal Capture → Grounded Delivery → Legacy Coexistence
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  A practitioner&rsquo;s methodology for identifying real AI value, delivering
                  through non-deterministic reality, and coexisting with the systems that
                  actually run your enterprise.
                </p>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {[
                  { label: "Signal Capture", sub: "Find the value before you build" },
                  { label: "Grounded Delivery", sub: "Ship through uncertainty" },
                  { label: "Legacy Coexistence", sub: "Work with what you have" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                    <div>
                      <span className="text-sm font-semibold text-navy-900">{item.label}</span>
                      <span className="text-sm text-slate-400"> — {item.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/framework"
                className="text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors"
              >
                Explore the Framework →
              </Link>
            </div>

            {/* Panel 2 — Library */}
            <div className="border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-5">
                <span className="inline-block text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full mb-4">
                  The Library
                </span>
                <h2 className="text-xl font-bold text-navy-900 leading-snug mb-3">
                  6 Books. 30 Patterns. 95+ Notebooks.
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Free practitioner resources — architecture blueprints, certification paths,
                  deep-dive books, and hands-on notebooks. No paywalls. No sign-ups.
                </p>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {[
                  { label: "6 practitioner books", sub: "every role, from strategy to code" },
                  { label: "30 toolkit patterns", sub: "blueprints, agents, GenAI architectures" },
                  { label: "15 cheatsheets", sub: "PDF downloads, prompt engineering to MCP" },
                  { label: "6 learning paths", sub: "GCP certs and GenAI with notebooks" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                    <div>
                      <span className="text-sm font-semibold text-navy-900">{item.label}</span>
                      <span className="text-sm text-slate-400"> — {item.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/library"
                className="text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors"
              >
                Browse the Library →
              </Link>
            </div>

            {/* Panel 3 — App */}
            <div className="border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                    The App
                  </span>
                  <span className="inline-block text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h2 className="text-xl font-bold text-navy-900 leading-snug mb-3">
                  AI-Powered Career Navigation
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Seven AI agents working from your career profile — giving you a personalized
                  roadmap, impact analysis, and tools to navigate the AI shift on your terms.
                </p>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {[
                  { label: "Career Roadmap", sub: "personalized 90-day action plan" },
                  { label: "AI Impact Analyzer", sub: "score your role's AI exposure" },
                  { label: "Personalized Career Book", sub: "16 chapters written about you" },
                  { label: "Bridge Builder", sub: "skill translation map to your target role" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <div>
                      <span className="text-sm font-semibold text-navy-900">{item.label}</span>
                      <span className="text-sm text-slate-400"> — {item.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Explore the App →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── ZONE 3: Problem + Solution side by side ── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* 3A — The Problem */}
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-3">
                Why Most Enterprise AI Fails
              </h2>
              <p className="text-slate-500 mb-8">
                Not because of technology — because of how organizations approach it.
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

            {/* 3B — What To Do */}
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-3">
                What You Should Do Instead
              </h2>
              <p className="text-slate-500 mb-8">
                The LegacyForward.ai platform gives you the framework, the resources, and the tools.
              </p>
          <div className="space-y-4">
            {valueProps.map((text, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-teal-500 font-bold text-lg mt-0.5 shrink-0 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-slate-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

            </div>

          </div>
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
