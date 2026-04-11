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

const pathDefs: Record<string, { section: string }> = {
  "gcp-mle": { section: "gcp-mle" },
  "genai": { section: "genai" },
  "gcp-cdl": { section: "gcp-cdl" },
  "gcp-gal": { section: "gcp-gal" },
  "gcp-pca": { section: "gcp-pca" },
  "gcp-pde": { section: "gcp-pde" },
};

export async function generateStaticParams() {
  const params: { path: string; module: string }[] = [];
  for (const [path, def] of Object.entries(pathDefs)) {
    const items = getSection(def.section);
    for (const item of items) {
      params.push({ path, module: item.meta.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string; module: string }>;
}): Promise<Metadata> {
  const { path, module } = await params;
  const def = pathDefs[path];
  if (!def) return {};
  const item = getBySlug(def.section, module);
  if (!item) return {};
  return {
    title: `${item.meta.title} | LegacyForward.ai`,
    description: item.meta.description,
  };
}

export default async function LearnModulePage({
  params,
}: {
  params: Promise<{ path: string; module: string }>;
}) {
  const { path, module } = await params;
  const def = pathDefs[path];
  if (!def) notFound();

  const item = getBySlug(def.section, module);
  if (!item) notFound();

  const BASE_PATH = `/library/learn/${path}`;
  const items = getSection(def.section);
  const { prev, next } = getPrevNext(items, module, BASE_PATH);
  const headings = extractHeadings(item.content);
  const content = stripLeadingH1(item.content);
  const readTime = estimateReadingTime(item.content);
  const pathLabel = pathNames[path] ?? path;

  return (
    <>
      <ReadingProgressTracker path={`${BASE_PATH}/${module}`} title={item.meta.title} />

      <ArticleJsonLd
        title={item.meta.title}
        description={item.meta.description}
        url={`https://legacyforward.ai${BASE_PATH}/${module}`}
      />

      <section className="bg-navy-900 text-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <Breadcrumb items={[
              { label: "Library", href: "/library" },
              { label: "Learning Paths", href: "/library/learn" },
              { label: pathLabel, href: BASE_PATH },
              { label: item.meta.title },
            ]} />
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Module {String(item.meta.order).padStart(2, "0")} of {items.length}
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
                  ← Back to {pathLabel}
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
