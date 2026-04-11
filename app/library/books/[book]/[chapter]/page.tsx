import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSection, getBySlug, stripLeadingH1, extractHeadings, estimateReadingTime } from "@/lib/content";
import { getPrevNext } from "@/lib/nav-helpers";
import { ReadingProgressTracker } from "@/components/ReadingProgress";
import { ArticleJsonLd } from "@/components/JsonLd";
import BookSidebar from "@/components/BookSidebar";
import Prose from "@/components/Prose";
import TextToSpeech from "@/components/TextToSpeech";
import NotebookLink from "@/components/NotebookLink";
import TableOfContents from "@/components/TableOfContents";
import Breadcrumb from "@/components/Breadcrumb";

interface BookDef {
  section: string;
  title: string;
}

const bookDefs: Record<string, BookDef> = {
  "agenticai": { section: "agenticai", title: "Agentic AI: Build, Ship, Portfolio" },
  "ai-leaders": { section: "ai-leaders", title: "AI for Business Leaders" },
  "ai-pm": { section: "ai-pm", title: "AI Product Management" },
  "ai-enterprise-architect": { section: "ai-enterprise-architect", title: "The AI-First Enterprise" },
  "llm-ba-qa": { section: "llm-ba-qa", title: "The Analyst's AI Toolkit" },
  "graph-ai": { section: "graph-ai", title: "Graph Databases for AI" },
};

export async function generateStaticParams() {
  const params: { book: string; chapter: string }[] = [];
  for (const [book, def] of Object.entries(bookDefs)) {
    const items = getSection(def.section);
    for (const item of items) {
      params.push({ book, chapter: item.meta.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}): Promise<Metadata> {
  const { book, chapter } = await params;
  const def = bookDefs[book];
  if (!def) return {};
  const item = getBySlug(def.section, chapter);
  if (!item) return {};
  return {
    title: `${item.meta.title} | ${def.title} | LegacyForward.ai`,
    description: item.meta.description,
  };
}

export default async function BookChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;
  const def = bookDefs[book];
  if (!def) notFound();

  const BASE_PATH = `/library/books/${book}`;
  const items = getSection(def.section);
  const item = items.find((i) => i.meta.slug === chapter);
  if (!item) notFound();

  const { prev, next } = getPrevNext(items, chapter, BASE_PATH);
  const chapters = items.map((i) => i.meta);
  const content = stripLeadingH1(item.content);
  const headings = extractHeadings(item.content);
  const readTime = estimateReadingTime(item.content);

  return (
    <>
      <ReadingProgressTracker path={`${BASE_PATH}/${chapter}`} title={item.meta.title} />

      <ArticleJsonLd
        title={item.meta.title}
        description={item.meta.description}
        url={`https://legacyforward.ai${BASE_PATH}/${chapter}`}
      />

      <section className="bg-navy-900 text-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <Breadcrumb items={[
              { label: "Library", href: "/library" },
              { label: "Books", href: "/library/books" },
              { label: def.title, href: BASE_PATH },
              { label: item.meta.title },
            ]} />
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Chapter {String(item.meta.order).padStart(2, "0")} of {items.length}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {item.meta.title}
            </h1>
            {item.meta.description && (
              <p className="text-slate-300 leading-relaxed mb-4">
                {item.meta.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{readTime} min read</span>
              {item.meta.notebook && (
                <NotebookLink url={item.meta.notebook} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <BookSidebar
              chapters={chapters}
              currentSlug={chapter}
              basePath={BASE_PATH}
              bookTitle={def.title}
            />

            <main className="min-w-0 flex-1">
              <TextToSpeech />
              <Prose content={content} />

              <div className="mt-10 mb-4 text-center">
                <Link href={BASE_PATH} className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors">
                  ← Back to {def.title}
                </Link>
              </div>
            </main>

            <aside className="hidden xl:block w-56 shrink-0">
              <TableOfContents headings={headings} />
            </aside>
          </div>

          <div className="xl:hidden mt-0 -mb-6">
            <TableOfContents headings={headings} />
          </div>
        </div>
      </section>
    </>
  );
}
