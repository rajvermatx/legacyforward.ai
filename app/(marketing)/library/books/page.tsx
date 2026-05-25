import type { Metadata } from "next";
import Link from "next/link";
import { getSection, getRewriteSection, estimateReadingTime } from "@/lib/content";

export const metadata: Metadata = {
  title: "Practitioner Books | LegacyForward.ai",
  description:
    "Free, open-source practitioner books on AI strategy, architecture, engineering, analysis, and data.",
};

const bookDefs = [
  { section: "leading-ai-real-enterprise", title: "Leading AI in the Real Enterprise", desc: "Strategy, governance, and execution for modern leaders navigating AI investment and transformation.", href: "/library/books/leading-ai-real-enterprise", audience: "Executives", color: "bg-amber-500" },
  { section: "building-ai-products-that-ship", title: "Building AI Products That Ship", desc: "From AI ideas to production systems — identify, plan, ship, and scale AI features.", href: "/library/books/building-ai-products-that-ship", audience: "Product Managers", color: "bg-blue-500" },
  { section: "architecting-ai-real-enterprise", title: "Architecting AI in the Real Enterprise", desc: "Patterns, platforms, and enterprise-scale AI delivery for architects.", href: "/library/books/architecting-ai-real-enterprise", audience: "Architects", color: "bg-purple-500" },
  { section: "building-agentic-ai-systems", title: "Building Agentic AI Systems", desc: "Agents, orchestration, memory, and production deployment for engineers.", href: "/library/books/building-agentic-ai-systems", audience: "Engineers", color: "bg-teal-500" },
  { section: "ai-for-analysts-and-qa", title: "AI for Analysts and QA Teams", desc: "Requirements, testing, analysis, and communication with AI for BAs and QA engineers.", href: "/library/books/ai-for-analysts-and-qa", audience: "BAs & QAs", color: "bg-green-500" },
  { section: "knowledge-graphs-enterprise-ai", title: "Knowledge Graphs for Enterprise AI", desc: "GraphRAG, semantic systems, and production knowledge architectures.", href: "/library/books/knowledge-graphs-enterprise-ai", audience: "Data Practitioners", color: "bg-rose-500" },
  { section: "the-stack-beneath-the-signal", title: "The Stack Beneath the Signal", desc: "How enterprise IT actually works — legacy systems, IT sprawl, cloud, APIs, and where AI lands.", href: "/library/books/the-stack-beneath-the-signal", audience: "All Practitioners", color: "bg-amber-500" },
  { section: "ai-beyond-the-demo-guide", title: "The LegacyForward Framework", desc: "Signal Capture, Grounded Delivery, and Legacy Coexistence — the three-pillar framework for enterprise AI transformation.", href: "/library/books/ai-beyond-the-demo-guide", audience: "All Roles", color: "bg-teal-600" },
  { section: "beyond-llms-large-concept-models", title: "Beyond LLMs: Large Concept Models", desc: "Concept-space reasoning and the next generation of enterprise AI — SONAR embeddings, hybrid architectures, and transition roadmap.", href: "/library/books/beyond-llms-large-concept-models", audience: "Architects & Engineers", color: "bg-violet-600" },
  { section: "ai-beyond-the-demo", title: "AI Beyond the Demo", desc: "How AI Actually Works in Enterprises — 75 chapters synthesizing all nine practitioner books into a single sequenced journey.", href: "/library/books/ai-beyond-the-demo", audience: "All Practitioners", color: "bg-violet-700" },
];

const rewriteDefs = [
  { section: "leading-ai-real-enterprise", title: "Leading AI in the Real Enterprise", desc: "Strategy, governance, and execution for modern leaders navigating AI investment and transformation.", href: "/library/books/r-leading-ai-real-enterprise", audience: "Executives", color: "bg-amber-500" },
  { section: "building-ai-products-that-ship", title: "Building AI Products That Ship", desc: "From AI ideas to production systems — identify, plan, ship, and scale AI features.", href: "/library/books/r-building-ai-products-that-ship", audience: "Product Managers", color: "bg-blue-500" },
  { section: "architecting-ai-real-enterprise", title: "Architecting AI in the Real Enterprise", desc: "Patterns, platforms, and enterprise-scale AI delivery for architects.", href: "/library/books/r-architecting-ai-real-enterprise", audience: "Architects", color: "bg-purple-500" },
  { section: "building-agentic-ai-systems", title: "Building Agentic AI Systems", desc: "Agents, orchestration, memory, and production deployment for engineers.", href: "/library/books/r-building-agentic-ai-systems", audience: "Engineers", color: "bg-teal-500" },
  { section: "ai-for-analysts-and-qa", title: "AI for Analysts and QA Teams", desc: "Requirements, testing, analysis, and communication with AI for BAs and QA engineers.", href: "/library/books/r-ai-for-analysts-and-qa", audience: "BAs & QAs", color: "bg-green-500" },
  { section: "knowledge-graphs-enterprise-ai", title: "Knowledge Graphs for Enterprise AI", desc: "GraphRAG, semantic systems, and production knowledge architectures.", href: "/library/books/r-knowledge-graphs-enterprise-ai", audience: "Data Practitioners", color: "bg-rose-500" },
  { section: "the-stack-beneath-the-signal", title: "The Stack Beneath the Signal", desc: "How enterprise IT actually works — legacy systems, IT sprawl, cloud, APIs, and where AI lands.", href: "/library/books/r-the-stack-beneath-the-signal", audience: "All Practitioners", color: "bg-amber-500" },
  { section: "ai-beyond-the-demo-guide", title: "The LegacyForward Framework", desc: "Signal Capture, Grounded Delivery, and Legacy Coexistence — the three-pillar framework for enterprise AI transformation.", href: "/library/books/r-ai-beyond-the-demo-guide", audience: "All Roles", color: "bg-teal-600" },
  { section: "beyond-llms-large-concept-models", title: "Beyond LLMs: Large Concept Models", desc: "Concept-space reasoning and the next generation of enterprise AI — SONAR embeddings, hybrid architectures, and transition roadmap.", href: "/library/books/r-beyond-llms-large-concept-models", audience: "Architects & Engineers", color: "bg-violet-600" },
  { section: "ai-beyond-the-demo", title: "AI Beyond the Demo", desc: "How AI Actually Works in Enterprises — 75 chapters synthesizing all nine practitioner books into a single sequenced journey.", href: "/library/books/r-ai-beyond-the-demo", audience: "All Practitioners", color: "bg-violet-700" },
];

function getBookStats() {
  return bookDefs.map((b) => {
    const items = getSection(b.section);
    const totalMinutes = items.reduce((sum, item) => sum + estimateReadingTime(item.content), 0);
    return { ...b, count: items.length, totalMinutes };
  });
}

function getRewriteStats() {
  return rewriteDefs.map((b) => {
    const items = getRewriteSection(b.section);
    const totalMinutes = items.reduce((sum, item) => sum + estimateReadingTime(item.content), 0);
    return { ...b, count: items.length, totalMinutes };
  });
}

export default function BooksPage() {
  const books = getBookStats();
  const rewrites = getRewriteStats();
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

      <section className="bg-white py-20 border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Revised Editions</p>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
              Prose-Rewritten Editions
            </h2>
            <p className="text-slate-500 max-w-2xl leading-relaxed">
              The same frameworks, numbers, and examples — rewritten for human cadence. Same content, different voice.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewrites.map((book) => (
              <Link
                key={book.href}
                href={book.href}
                className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
              >
                <div className={`${book.color} h-1.5`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{book.audience}</span>
                    <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Revised</span>
                  </div>
                  <h2 className="text-lg font-bold text-navy-900 group-hover:text-violet-600 transition-colors mb-2">
                    {book.title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">
                    {book.desc}
                  </p>
                  <p className="text-xs text-slate-400">
                    {book.count > 0 ? `${book.count} chapters · ~${book.totalMinutes} min` : "Coming soon"}
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
