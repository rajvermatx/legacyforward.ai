import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Library | LegacyForward.ai",
  description:
    "Free, open-source practitioner resources — books, architecture patterns, learning paths, and cheatsheets for enterprise AI practitioners.",
};

const sections = [
  {
    title: "Practitioner Books",
    desc: "6 free books covering AI strategy, architecture, engineering, analysis, and data — from boardroom to production code.",
    href: "/library/books",
    count: "6 books · 100+ chapters",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "bg-violet-500",
  },
  {
    title: "Practitioners Toolkit",
    desc: "30 production-ready architecture blueprints, agentic design patterns, and GenAI reference architectures with diagrams and notebooks.",
    href: "/library/toolkit",
    count: "30 patterns",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    color: "bg-teal-500",
  },
  {
    title: "Learning Paths",
    desc: "Structured study guides for GCP certifications and Generative AI — free, practitioner-written modules with companion Jupyter notebooks.",
    href: "/library/learn",
    count: "6 paths · 95+ notebooks",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    color: "bg-blue-500",
  },
  {
    title: "Quick Reference",
    desc: "Concise, printable quick-reference guides covering the most important AI and ML topics. Download as PDF or read online.",
    href: "/library/cheatsheets",
    count: "guides",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    color: "bg-amber-500",
  },
];

export default function LibraryPage() {
  return (
    <>
      <section className="bg-navy-900 py-24 md:py-32 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
            Free · Open Source · Practitioner-Written
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
            The{" "}
            <span className="text-teal-400">Library</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hands-on resources for AI practitioners — from architecture blueprints
            to certification guides to in-depth books. Everything is free.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
              >
                <div className={`${section.color} h-1.5`} />
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.icon} />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                        {section.count}
                      </span>
                      <h2 className="text-xl font-bold text-navy-900 group-hover:text-teal-600 transition-colors mt-0.5">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {section.desc}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-teal-600 group-hover:text-teal-500 transition-colors flex items-center gap-1">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
