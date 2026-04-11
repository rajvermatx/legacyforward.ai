import Link from "next/link";

const FEATURES = [
  { title: "AI Impact Analyzer", desc: "Score your role's AI exposure across 12 dimensions. Know what's at risk and what's an opportunity — before your organization decides for you." },
  { title: "Career Roadmap", desc: "A personalized 90-day action plan built from your role, skills, and target destination. Milestones, skill gaps, and learning resources — all specific to you." },
  { title: "Personalized Career Book", desc: "A 16-chapter book written about you — your skills, your transition path, your story. No generic advice. Every chapter drawn from your profile." },
  { title: "AI Career Coach", desc: "Conversational guidance that knows your full profile and evolves with you. Ask anything about your roadmap, skills, or next move." },
  { title: "Bridge Builder", desc: "Translate your existing skills into your target role. See exactly what carries over, what needs building, and how to frame the transition." },
  { title: "Wins Tracker", desc: "Log achievements as you go. Auto-formatted STAR stories. Ready for performance reviews, interviews, or your next promotion case." },
];

export default function AppLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-navy-900 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-900/40 px-3 py-1 rounded-full mb-6">
            Coming Soon
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            The AI shift is personal.
            <br />
            Your roadmap should be too.
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Seven AI agents built around your career profile — analyzing your AI exposure,
            mapping your skill gaps, and generating a personalized roadmap for navigating
            the shift on your terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app/login"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Early Access
            </Link>
            <Link
              href="/library"
              className="border border-slate-500 text-white hover:border-teal-400 hover:text-teal-400 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Browse the Free Library
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 py-8 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto flex justify-center gap-10 md:gap-20 text-center">
          <div><div className="text-2xl font-bold text-teal-600">7</div><div className="text-xs text-slate-500 mt-1">AI Agents</div></div>
          <div><div className="text-2xl font-bold text-teal-600">16</div><div className="text-xs text-slate-500 mt-1">Chapter Career Book</div></div>
          <div><div className="text-2xl font-bold text-teal-600">12</div><div className="text-xs text-slate-500 mt-1">AI Dimensions Scored</div></div>
          <div><div className="text-2xl font-bold text-teal-600">90</div><div className="text-xs text-slate-500 mt-1">Day Roadmap</div></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-navy-900 mb-3">
            Seven agents. One complete picture.
          </h2>
          <p className="text-sm text-slate-500 text-center mb-12 max-w-xl mx-auto">
            Each agent works from your profile — so the output is specific to you, not a generic template.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="border border-slate-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-sm transition">
                <h3 className="text-base font-bold text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">
            Start with the free library. Come back for the roadmap.
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            The library — 6 books, 30 patterns, 95+ notebooks — is free forever.
            The app gives you the personalized layer on top.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app/login"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors"
            >
              Get Early Access
            </Link>
            <Link
              href="/library"
              className="border border-slate-300 text-slate-700 hover:border-teal-400 hover:text-teal-600 px-8 py-3.5 rounded-lg font-semibold transition-colors"
            >
              Browse the Library →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
