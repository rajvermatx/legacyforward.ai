import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Practitioners Toolkit | LegacyForward.ai",
  description:
    "Production-ready architecture blueprints, agentic design patterns, and GenAI reference architectures for enterprise AI practitioners.",
};

const sections = [
  {
    title: "AI Architecture Blueprints",
    desc: "Enterprise system design — cloud strategy, compliance, governance, and operational patterns for AI at scale.",
    when: "You need to make infrastructure or organizational decisions about AI systems.",
    href: "/library/toolkit/blueprints",
    count: "10",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Agentic Design Patterns",
    desc: "Complete agent implementations for real business problems — each with working code and open-source data.",
    when: "You have a specific problem and want to see a full agent solution end-to-end.",
    href: "/library/toolkit/agentic-designs",
    count: "10",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "GenAI Reference Architectures",
    desc: "Application building blocks — from simple chat APIs to production multi-agent platforms, with diagrams and notebooks.",
    when: "You need to understand how to build a specific GenAI feature or capability.",
    href: "/library/toolkit/genai-arch",
    count: "10",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  },
];

export default function ToolkitPage() {
  return (
    <>
      <section className="bg-navy-900 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
            30 Production-Ready Patterns
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
            Practitioners{" "}
            <span className="text-teal-400">Toolkit</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Architecture blueprints, agentic design patterns, and GenAI reference architectures.
            Each with diagrams, decision frameworks, and companion notebooks.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
              >
                <div className="bg-teal-500 h-1.5" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-xs font-bold bg-teal-500/10 text-teal-500 px-2 py-1 rounded">{item.count} patterns</span>
                  </div>
                  <h2 className="text-lg font-bold text-navy-900 group-hover:text-teal-600 transition-colors mb-2">
                    {item.title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">
                    {item.desc}
                  </p>
                  <p className="text-xs text-teal-600 font-medium">
                    {item.when}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
