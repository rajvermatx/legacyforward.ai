import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSection,
  getBySlug,
  extractHeadings,
  stripLeadingH1,
  estimateReadingTime,
} from "@/lib/content";
import { getPrevNext } from "@/lib/nav-helpers";
import Prose from "@/components/Prose";
import TextToSpeech from "@/components/TextToSpeech";
import TableOfContents from "@/components/TableOfContents";
import NotebookLink from "@/components/NotebookLink";
import RelatedPatterns from "@/components/RelatedPatterns";
import { ReadingProgressTracker } from "@/components/ReadingProgress";
import { ArticleJsonLd } from "@/components/JsonLd";
import { getRelated } from "@/lib/related";

const categoryDefs: Record<string, { section: string; label: string }> = {
  "blueprints": { section: "blueprints", label: "Blueprint" },
  "agentic-designs": { section: "agentic-designs", label: "Agentic Design" },
  "genai-arch": { section: "genai-arch", label: "GenAI Architecture" },
};

export async function generateStaticParams() {
  const params: { category: string; pattern: string }[] = [];
  for (const [category, def] of Object.entries(categoryDefs)) {
    const items = getSection(def.section);
    for (const item of items) {
      params.push({ category, pattern: item.meta.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; pattern: string }>;
}): Promise<Metadata> {
  const { category, pattern } = await params;
  const def = categoryDefs[category];
  if (!def) return {};
  const item = getBySlug(def.section, pattern);
  if (!item) return {};
  return {
    title: `${item.meta.title} | LegacyForward.ai`,
    description: item.meta.description,
  };
}

export default async function ToolkitPatternPage({
  params,
}: {
  params: Promise<{ category: string; pattern: string }>;
}) {
  const { category, pattern } = await params;
  const def = categoryDefs[category];
  if (!def) notFound();

  const item = getBySlug(def.section, pattern);
  if (!item) notFound();

  const BASE_PATH = `/library/toolkit/${category}`;
  const allItems = getSection(def.section);
  const { prev, next } = getPrevNext(allItems, pattern, BASE_PATH);
  const headings = extractHeadings(item.content);
  const readingTime = estimateReadingTime(item.content);
  const content = stripLeadingH1(item.content);
  const relatedItems = getRelated(def.section, pattern);

  return (
    <>
      <ReadingProgressTracker path={`${BASE_PATH}/${pattern}`} title={item.meta.title} />

      <ArticleJsonLd
        title={item.meta.title}
        description={item.meta.description}
        url={`https://legacyforward.ai${BASE_PATH}/${pattern}`}
      />

      <section className="bg-navy-900 text-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-3">
              {def.label} {String(item.meta.order).padStart(2, "0")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {item.meta.title}
            </h1>
            <p className="text-slate-300 leading-relaxed mb-4">
              {item.meta.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400">
                {readingTime} min read
              </span>
              {item.meta.badges?.map((badge) => (
                <span
                  key={badge}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {badge}
                </span>
              ))}
              {item.meta.notebook && (
                <NotebookLink url={item.meta.notebook} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8">
            <article className="min-w-0 flex-1">
              <TextToSpeech />
              <Prose content={content} />
              <RelatedPatterns items={relatedItems} />
            </article>

            <aside className="hidden lg:block w-64 shrink-0">
              <TableOfContents headings={headings} />
            </aside>
          </div>

          <div className="lg:hidden mt-0 -mb-6">
            <TableOfContents headings={headings} />
          </div>
        </div>
      </section>
    </>
  );
}
