import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSection, getSectionMeta, estimateReadingTime } from "@/lib/content";
import ContentCard from "@/components/ContentCard";

interface BookDef {
  section: string;
  title: string;
  accentColor: "violet" | "blue" | "purple" | "teal" | "green" | "rose" | "amber";
}

const bookDefs: Record<string, BookDef> = {
  "agenticai": { section: "agenticai", title: "Agentic AI: Build, Ship, Portfolio", accentColor: "teal" },
  "ai-leaders": { section: "ai-leaders", title: "AI for Business Leaders", accentColor: "violet" },
  "ai-pm": { section: "ai-pm", title: "AI Product Management", accentColor: "blue" },
  "ai-enterprise-architect": { section: "ai-enterprise-architect", title: "The AI-First Enterprise", accentColor: "purple" },
  "llm-ba-qa": { section: "llm-ba-qa", title: "The Analyst's AI Toolkit", accentColor: "green" },
  "graph-ai": { section: "graph-ai", title: "Graph Databases for AI", accentColor: "rose" },
  "enterprise-it-101": { section: "enterprise-it-101", title: "The Stack Beneath the Signal: Enterprise IT Explained", accentColor: "amber" },
  "legacyforward-guide": { section: "legacyforward-guide", title: "A Practitioner's Guide to Enterprise AI Transformation", accentColor: "teal" },
};

export async function generateStaticParams() {
  return Object.keys(bookDefs).map((book) => ({ book }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string }>;
}): Promise<Metadata> {
  const { book } = await params;
  const def = bookDefs[book];
  if (!def) return {};
  const meta = getSectionMeta(def.section);
  return {
    title: `${meta?.title ?? def.title} | LegacyForward.ai`,
    description: meta?.description ?? "",
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ book: string }>;
}) {
  const { book } = await params;
  const def = bookDefs[book];
  if (!def) notFound();

  const items = getSection(def.section);
  const meta = getSectionMeta(def.section);

  // Group by part
  const groups: { part: string; items: typeof items }[] = [];
  let currentPart: string | null = null;
  for (const item of items) {
    const part = item.meta.part || "";
    if (part !== currentPart) {
      currentPart = part;
      groups.push({ part, items: [] });
    }
    groups[groups.length - 1].items.push(item);
  }

  return (
    <>
      <section className="bg-navy-900 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Book — {items.length} chapters
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            {meta?.title ?? def.title}
          </h1>
          {meta?.description && (
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {meta.description}
            </p>
          )}
        </div>
      </section>

      <section className="bg-slate-50 pb-24 pt-16">
        <div className="mx-auto max-w-6xl px-6">
          {groups.map((group) => (
            <div key={group.part || "default"} className="mb-10">
              {group.part && (
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  {group.part}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {group.items.map((item) => (
                  <ContentCard
                    key={item.meta.slug}
                    title={item.meta.title}
                    description={item.meta.description}
                    href={`/library/books/${book}/${item.meta.slug}`}
                    badges={item.meta.badges}
                    order={item.meta.order}
                    accent={def.accentColor}
                    readingTime={estimateReadingTime(item.content)}
                    hasNotebook={!!item.meta.notebook}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
