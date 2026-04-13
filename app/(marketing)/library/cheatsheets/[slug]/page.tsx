import type { Metadata } from "next";
import Link from "next/link";
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
import PrevNext from "@/components/PrevNext";
import { ReadingProgressTracker } from "@/components/ReadingProgress";
import { ArticleJsonLd } from "@/components/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getSection("cheatsheets").map((item) => ({ slug: item.meta.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getBySlug("cheatsheets", slug);
  if (!item) return {};
  return {
    title: `${item.meta.title} | LegacyForward.ai`,
    description: item.meta.description,
  };
}

export default async function CheatsheetSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getBySlug("cheatsheets", slug);
  if (!item) notFound();

  const allItems = getSection("cheatsheets");
  const { prev, next } = getPrevNext(allItems, slug, "/library/cheatsheets");
  const headings = extractHeadings(item.content);
  const readingTime = estimateReadingTime(item.content);
  const content = stripLeadingH1(item.content);

  return (
    <>
      <ReadingProgressTracker path={`/library/cheatsheets/${slug}`} title={item.meta.title} />

      <ArticleJsonLd
        title={item.meta.title}
        description={item.meta.description}
        url={`https://legacyforward.ai/library/cheatsheets/${slug}`}
      />

      <section className="bg-navy-900 text-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <Breadcrumb items={[
              { label: "Library", href: "/library" },
              { label: "Quick Reference", href: "/library/cheatsheets" },
              { label: item.meta.title },
            ]} />
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Quick Reference {String(item.meta.order).padStart(2, "0")}
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
              <Link
                href={`/cheatsheets/pdf/${slug}.pdf`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </Link>
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
              <PrevNext prev={prev} next={next} />
              <div className="mt-10 mb-4 text-center">
                <Link href="/library/cheatsheets" className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors">
                  ← All Quick Reference Guides
                </Link>
              </div>
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
