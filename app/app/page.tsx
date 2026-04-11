import Link from "next/link";

const FEATURES = [
  { icon: "🤖", title: "AI Career Coach", desc: "Conversational guidance that knows your full profile and evolves with you" },
  { icon: "📊", title: "AI Impact Report", desc: "See exactly how AI affects your role — task by task, with a 0-100 CAII score" },
  { icon: "📖", title: "Personalized Career Book", desc: "A 16-chapter book written about YOU — your skills, roadmap, and story" },
  { icon: "📌", title: "Career Roadmap", desc: "Skill gaps, milestones, timelines, and learning resources for your target role" },
  { icon: "🏆", title: "Wins Tracker", desc: "Log achievements daily, get auto-STAR formatting, generate PMAP summaries" },
  { icon: "🔧", title: "Bridge Builder", desc: "Translate your skills across industries — homemaker to PM, engineer to tech" },
];

const PERSONAS = [
  { icon: "🔄", name: "The Pivoter", desc: "Mid-career, feeling AI disruption", color: "bg-indigo-50 border-indigo-200" },
  { icon: "📈", name: "The Climber", desc: "Ready to level up strategically", color: "bg-emerald-50 border-emerald-200" },
  { icon: "🔍", name: "The Explorer", desc: "Discovering what's possible", color: "bg-amber-50 border-amber-200" },
  { icon: "🧠", name: "The Adapter", desc: "Future-proofing their career", color: "bg-cyan-50 border-cyan-200" },
  { icon: "🔥", name: "The Rebuilder", desc: "Recently laid off, needs help now", color: "bg-rose-50 border-rose-200" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl font-extrabold text-indigo-600">LegacyForward.ai</div>
        <div className="flex items-center gap-4">
          <Link href="/app/pricing" className="text-sm text-slate-600 hover:text-indigo-600 transition">Pricing</Link>
          <Link href="/app/login" className="text-sm text-slate-600 hover:text-indigo-600 transition">Sign In</Link>
          <Link href="/app/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold mb-6">
            AI-Powered Career Navigation for US & India
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            See where you&apos;re going —<br />
            <span className="text-indigo-600">not just where to apply</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            LegacyForward.ai gives you a personalized roadmap from where you are to where you want to be —
            with real-time guidance on how AI is reshaping your path and exactly what to do about it.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/app/login" className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Start Your Free Career Snapshot →
            </Link>
            <Link href="/app/pricing" className="px-8 py-3.5 bg-white text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition">
              View Pricing
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-slate-100 py-6 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto flex justify-center gap-8 md:gap-16 text-center">
          <div><div className="text-2xl font-extrabold text-indigo-600">7</div><div className="text-xs text-slate-500">AI Agents</div></div>
          <div><div className="text-2xl font-extrabold text-emerald-500">16</div><div className="text-xs text-slate-500">Chapter Career Book</div></div>
          <div><div className="text-2xl font-extrabold text-amber-500">12</div><div className="text-xs text-slate-500">AI Dimensions Scored</div></div>
          <div><div className="text-2xl font-extrabold text-rose-500">2</div><div className="text-xs text-slate-500">Markets (US + India)</div></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center text-slate-900 mb-3">Everything you need to navigate your career</h2>
          <p className="text-sm text-slate-500 text-center mb-12">Not just a job board. Not just a resume tool. A complete career navigator.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-200 transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center text-slate-900 mb-3">Built for every stage of your career</h2>
          <p className="text-sm text-slate-500 text-center mb-10">Whether you&apos;re pivoting, climbing, exploring, adapting, or rebuilding</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PERSONAS.map((p) => (
              <div key={p.name} className={`rounded-xl p-4 border text-center ${p.color}`}>
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="text-sm font-bold text-slate-900">{p.name}</div>
                <div className="text-[11px] text-slate-500 mt-1">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Your career is too important for generic advice
          </h2>
          <p className="text-slate-500 mb-8">
            Get a personalized Career Bible that no one else can get — because it&apos;s built from YOUR data.
          </p>
          <Link href="/app/login" className="px-10 py-4 bg-indigo-600 text-white rounded-xl text-base font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-400">
            © 2026 LegacyForward.ai. AI-powered career navigation.
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/app/pricing" className="hover:text-indigo-600 transition">Pricing</Link>
            <a href="https://legacyforward.ai" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">Blog</a>
            <a href="https://legacyforward.ai" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">Framework</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
