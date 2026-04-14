import type { Metadata } from "next";
import Link from "next/link";
import { getSection, estimateReadingTime } from "@/lib/content";

export const metadata: Metadata = {
  title: "Practitioner Books | LegacyForward.ai",
  description:
    "Free, open-source practitioner books on AI strategy, architecture, engineering, analysis, and data.",
};

const bookDefs = [
  { section: "ai-leaders", title: "AI for Business Leaders", desc: "Strategy, investment, governance, and execution for non-technical leaders.", href: "/library/books/ai-leaders", audience: "Executives", color: "bg-amber-500" },
  { section: "ai-pm", title: "AI Product Management", desc: "From value hypothesis to production — identify, plan, ship, and scale AI features.", href: "/library/books/ai-pm", audience: "Product Managers", color: "bg-blue-500" },
  { section: "ai-enterprise-architect", title: "The AI-First Enterprise", desc: "Patterns, migration, and governance for enterprise AI architecture.", href: "/library/books/ai-enterprise-architect", audience: "Architects", color: "bg-purple-500" },
  { section: "agenticai", title: "Agentic AI: Build, Ship, Portfolio", desc: "Agent patterns, orchestration, tool use, memory, and production deployment.", href: "/library/books/agenticai", audience: "Engineers", color: "bg-teal-500" },
  { section: "llm-ba-qa", title: "The Analyst's AI Toolkit", desc: "LLMs for requirements, testing, defect analysis, and stakeholder communication.", href: "/library/books/llm-ba-qa", audience: "BAs & QAs", color: "bg-green-500" },
  { section: "graph-ai", title: "Graph Databases for AI", desc: "From SQL to knowledge graphs — GraphRAG, graph-aware agents, and production.", href: "/library/books/graph-ai", audience: "Data Practitioners", color: "bg-rose-500" },
  { section: "enterprise-it-101", title: "The Stack Beneath the Signal: Enterprise IT Explained", desc: "Legacy systems, IT sprawl, cloud, APIs, and where AI lands — in plain language. For anyone who needs to understand the landscape before they touch AI.", href: "/library/books/enterprise-it-101", audience: "All Practitioners", color: "bg-amber-500" },
  { section: "legacyforward-guide", title: "A Practitioner's Guide to Enterprise AI Transformation", desc: "The complete LegacyForward.ai framework — Signal Capture, Grounded Delivery, and Legacy Coexistence — for practitioners building AI in real enterprise environments.", href: "/library/books/legacyforward-guide", audience: "All Roles", color: "bg-teal-600" },
];

function getBookStats() {
  return bookDefs.map((b) => {
    const items = getSection(b.section);
    const totalMinutes = items.reduce((sum, item) => sum + estimateReadingTime(item.content), 0);
    return { ...b, count: items.length, totalMinutes };
  });
}

export default function BooksPage() {
  const books = getBookStats();
  return (
    <>
      <section className="bg-navy-900 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
            Practitioner Guides
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
            Practitioner{" "}
            <span className="text-teal-400">Books</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From boardroom strategy to production code. Each book is free,
            open-source, and designed for real-world application.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link
                key={book.href}
                href={book.href}
                className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
              >
                <div className={`${book.color} h-1.5`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{book.audience}</span>
                    <span className="text-xs text-slate-400">{book.count} chapters</span>
                  </div>
                  <h2 className="text-lg font-bold text-navy-900 group-hover:text-teal-600 transition-colors mb-2">
                    {book.title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">
                    {book.desc}
                  </p>
                  <p className="text-xs text-slate-400">
                    ~{book.totalMinutes} min total reading time
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
