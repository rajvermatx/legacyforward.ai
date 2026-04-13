import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSection, getBySlug, extractHeadings, stripLeadingH1, estimateReadingTime } from "@/lib/content";
import { getPrevNext } from "@/lib/nav-helpers";
import { pathNames } from "@/lib/path-names";
import Prose from "@/components/Prose";
import TableOfContents from "@/components/TableOfContents";
import PrevNext from "@/components/PrevNext";
import TextToSpeech from "@/components/TextToSpeech";
import NotebookLink from "@/components/NotebookLink";
import { ReadingProgressTracker } from "@/components/ReadingProgress";
import { ArticleJsonLd } from "@/components/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";

const usecasesDefs: Record<string, { section: string; sectionKey: string }> = {
  "gcp-mle": { section: "gcp-mle-usecases", sectionKey: "gcp-mle-usecases" },
  "genai": { section: "genai-usecases", sectionKey: "genai-usecases" },
};

export async function generateStaticParams() {
  const params: { path: string; slug: string }[] = [];
  for (const [path, def] of Object.entries(usecasesDefs)) {
    const items = getSection(def.section);
    for (const item of items) {
      params.push({ path, slug: item.meta.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string; slug: string }>;
}): Promise<Metadata> {
  const { path, slug } = await params;
  const def = usecasesDefs[path];
  if (!def) return {};
  const item = getBySlug(def.section, slug);
  if (!item) return {};
  return {
    title: `${item.meta.title} | LegacyForward.ai`,
    description: item.meta.description,
  };
}

export default async function LearnUsecaseSlugPage({
  params,
}: {
  params: Promise<{ path: string; slug: string }>;
}) {
  const { path, slug } = await params;
  const def = usecasesDefs[path];
  if (!def) notFound();

  const item = getBySlug(def.section, slug);
  if (!item) notFound();

  const BASE_PATH = `/library/learn/${path}/usecases`;
  const items = getSection(def.section);
  const { prev, next } = getPrevNext(items, slug, BASE_PATH);
  const headings = extractHeadings(item.content);
  const content = stripLeadingH1(item.content);
  const readTime = estimateReadingTime(item.content);
  const sectionLabel = pathNames[def.sectionKey] ?? def.sectionKey;

  return (
    <>
      <ReadingProgressTracker path={`${BASE_PATH}/${slug}`} title={item.meta.title} />

      <ArticleJsonLd
        title={item.meta.title}
        description={item.meta.description}
        url={`https://legacyforward.ai${BASE_PATH}/${slug}`}
      />

      <section className="bg-navy-900 text-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <Breadcrumb items={[
              { label: "Library", href: "/library" },
              { label: "Learning Paths", href: "/library/learn" },
              { label: pathNames[path] ?? path, href: `/library/learn/${path}` },
              { label: "Use Cases", href: BASE_PATH },
              { label: item.meta.title },
            ]} />
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Use Case {String(item.meta.order).padStart(2, "0")} of {items.length}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {item.meta.title}
            </h1>
            <p className="text-slate-300 leading-relaxed mb-4">
              {item.meta.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{readTime} min read</span>
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
            <div className="min-w-0 flex-1">
              <TextToSpeech />
              <Prose content={content} />
              <PrevNext prev={prev} next={next} />
              <div className="mt-10 mb-4 text-center">
                <Link href={BASE_PATH} className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors">
                  ← Back to {sectionLabel}
                </Link>
              </div>
            </div>
            <aside className="hidden lg:block w-64 shrink-0">
              <TableOfContents headings={headings} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
