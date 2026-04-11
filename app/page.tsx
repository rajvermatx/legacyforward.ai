import Link from "next/link";
import FrameworkFlow from "@/components/diagrams/FrameworkFlow";
import SubscribeCTA from "@/components/SubscribeCTA";

const problems = [
  "AI hype outpaces AI value. Most POCs die or deliver little operational value.",
  "Delivery methods don't fit the work. Agile assumes deterministic outputs. AI is non-deterministic by nature.",
  "Legacy isn't going anywhere. These systems process trillions in transactions and encode decades of business logic.",
  "Agentic AI is the new magic word. Executives skip to fantasizing about outcomes without understanding production reality.",
  "Vibe coding accelerates the wrong thing. Speed without architectural thinking is technical debt at scale.",
];

const valueProps = [
  { num: "01", text: "Six practitioner books covering every role — from boardroom strategy to production code." },
  { num: "02", text: "30 architecture patterns with diagrams, decision frameworks, and cloud mappings." },
  { num: "03", text: "15 printable cheatsheets with PDF downloads — prompt engineering to responsible AI." },
  { num: "04", text: "95+ Jupyter notebooks on Google Colab — learn by doing, not just reading." },
  { num: "05", text: "Built by practitioners, not vendors. No product pitches. No paywalls. No tracking." },
];

const books = [
  { title: "AI for Business Leaders", desc: "Strategy, investment, governance, and execution for non-technical leaders.", href: "/library/books/ai-leaders", chapters: "14", audience: "Executives", color: "bg-amber-500" },
  { title: "AI Product Management", desc: "From value hypothesis to production — identify, plan, ship, and scale AI features.", href: "/library/books/ai-pm", chapters: "16", audience: "Product Managers", color: "bg-blue-500" },
  { title: "The AI-First Enterprise", desc: "Patterns, migration, and governance for enterprise AI architecture.", href: "/library/books/ai-enterprise-architect", chapters: "17", audience: "Architects", color: "bg-purple-500" },
  { title: "Agentic AI: Build, Ship, Portfolio", desc: "Agent patterns, orchestration, tool use, memory, and production deployment.", href: "/library/books/agenticai", chapters: "19", audience: "Engineers", color: "bg-teal-500" },
  { title: "The Analyst's AI Toolkit", desc: "LLMs for requirements, testing, defect analysis, and stakeholder communication.", href: "/library/books/llm-ba-qa", chapters: "17", audience: "BAs & QAs", color: "bg-green-500" },
  { title: "Graph Databases for AI", desc: "From SQL to knowledge graphs — GraphRAG, graph-aware agents, and production.", href: "/library/books/graph-ai", chapters: "19", audience: "Data Practitioners", color: "bg-rose-500" },
];

const toolkit = [
  { title: "AI Architecture Blueprints", desc: "Enterprise system design — cloud, compliance, governance.", href: "/library/toolkit/blueprints", count: "10", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { title: "Agentic Design Patterns", desc: "Complete agent solutions for real business problems.", href: "/library/toolkit/agentic-designs", count: "10", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { title: "GenAI Architectures", desc: "From simple chat to multi-agent production platforms.", href: "/library/toolkit/genai-arch", count: "10", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-900 py-28 md:py-36 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
            Free &amp; Open Source
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
            Enterprise AI.{" "}
            <span className="text-teal-400">Done Right.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            A framework for capturing AI value, delivering in non-deterministic environments,
            and coexisting with legacy — plus a free practitioner library with six books,
            30 patterns, and 95+ notebooks.
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-xl mx-auto">
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

      {/* Framework */}
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

      {/* Problem Statement */}
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

      {/* Library Value Props */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            The Practitioner Library
          </h2>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-14">
            Not another AI course. A complete practitioner library — from strategy to production.
          </p>
          <div className="space-y-5 max-w-3xl mx-auto">
            {valueProps.map((item) => (
              <div key={item.num} className="flex gap-4 items-start">
                <span className="text-teal-500 font-bold text-lg mt-0.5 shrink-0 font-mono">
                  {item.num}
                </span>
                <p className="text-slate-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Books */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Six Books. Every Role.</h2>
              <p className="text-slate-500">From boardroom strategy to production code — pick your path.</p>
            </div>
            <Link href="/library/books" className="hidden sm:inline-flex text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
              >
                <div className={`${item.color} h-1.5`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.audience}</span>
                    <span className="text-xs text-slate-400">{item.chapters} ch</span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 group-hover:text-teal-600 transition-colors mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Toolkit */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Practitioners Toolkit</h2>
              <p className="text-slate-500">30 production-ready patterns with diagrams, code, and notebooks.</p>
            </div>
            <Link href="/library/toolkit" className="hidden sm:inline-flex text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {toolkit.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-teal-500/50 hover:bg-white transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-bold bg-teal-500/10 text-teal-500 px-2 py-1 rounded">{item.count} patterns</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-500 transition-colors mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cheatsheets + Learning */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/library/cheatsheets" className="group block bg-white border border-slate-200 rounded-xl p-8 hover:border-teal-500/50 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2 py-1 rounded">15 guides</span>
              </div>
              <h3 className="text-xl font-bold text-navy-900 group-hover:text-teal-600 transition-colors mb-2">Cheatsheets</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Printable quick-reference guides with PDF downloads. Prompt engineering, RAG, agents, evaluation, MCP, and more.</p>
              <span className="text-sm font-semibold text-teal-600 group-hover:text-teal-500">Browse cheatsheets →</span>
            </Link>

            <Link href="/library/learn" className="group block bg-white border border-slate-200 rounded-xl p-8 hover:border-teal-500/50 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xs font-bold bg-blue-500/10 text-blue-600 px-2 py-1 rounded">6 paths</span>
              </div>
              <h3 className="text-xl font-bold text-navy-900 group-hover:text-teal-600 transition-colors mb-2">Learning Paths</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Structured study guides for GCP certifications and Generative AI with companion Jupyter notebooks.</p>
              <span className="text-sm font-semibold text-teal-600 group-hover:text-teal-500">Browse paths →</span>
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
