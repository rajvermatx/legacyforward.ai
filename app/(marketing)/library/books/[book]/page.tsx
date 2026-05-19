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
  "building-agentic-ai-systems": { section: "building-agentic-ai-systems", title: "Building Agentic AI Systems", accentColor: "teal" },
  "leading-ai-real-enterprise": { section: "leading-ai-real-enterprise", title: "Leading AI in the Real Enterprise", accentColor: "violet" },
  "building-ai-products-that-ship": { section: "building-ai-products-that-ship", title: "Building AI Products That Ship", accentColor: "blue" },
  "architecting-ai-real-enterprise": { section: "architecting-ai-real-enterprise", title: "Architecting AI in the Real Enterprise", accentColor: "purple" },
  "ai-for-analysts-and-qa": { section: "ai-for-analysts-and-qa", title: "AI for Analysts and QA Teams", accentColor: "green" },
  "knowledge-graphs-enterprise-ai": { section: "knowledge-graphs-enterprise-ai", title: "Knowledge Graphs for Enterprise AI", accentColor: "rose" },
  "the-stack-beneath-the-signal": { section: "the-stack-beneath-the-signal", title: "The Stack Beneath the Signal", accentColor: "amber" },
  "ai-beyond-the-demo-guide": { section: "ai-beyond-the-demo-guide", title: "AI Beyond the Demo", accentColor: "teal" },
  "beyond-llms-large-concept-models": { section: "beyond-llms-large-concept-models", title: "Beyond LLMs: Large Concept Models", accentColor: "violet" },
  "ai-beyond-the-demo": { section: "ai-beyond-the-demo", title: "LegacyForward: AI Beyond the Demo", accentColor: "violet" },
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
