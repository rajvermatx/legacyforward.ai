import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFrameworkPillars, getFrameworkBySlug, getBlogPosts, extractHeadings, stripLeadingH1 } from "@/lib/content";
import Prose from "@/components/Prose";
import TableOfContents from "@/components/TableOfContents";
import SubscribeCTA from "@/components/SubscribeCTA";
import PillarNav from "@/components/PillarNav";
import SignalCaptureFlow from "@/components/diagrams/SignalCaptureFlow";
import GroundedDeliveryFlow from "@/components/diagrams/GroundedDeliveryFlow";
import LegacyPatternsMap from "@/components/diagrams/LegacyPatternsMap";
import { ArticleJsonLd } from "@/components/JsonLd";

const pillarDiagrams: Record<string, React.ReactNode> = {
  "signal-capture": <SignalCaptureFlow />,
  "grounded-delivery": <GroundedDeliveryFlow />,
  "legacy-coexistence": <LegacyPatternsMap />,
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pillars = getFrameworkPillars();
  return pillars.map((p) => ({ slug: p.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pillar = getFrameworkBySlug(slug);
  if (!pillar) return {};
  return {
    title: pillar.meta.title,
    description: pillar.meta.description,
  };
}

export default async function PillarPage({ params }: Props) {
  const { slug } = await params;
  const pillar = getFrameworkBySlug(slug);
  if (!pillar) notFound();

  const allPillars = getFrameworkPillars();
  const otherPillars = allPillars.filter((p) => p.meta.slug !== slug);
  const headings = extractHeadings(pillar.content);
  const relatedArticles = getBlogPosts().filter((p) => p.meta.relatedPillar === slug);

  return (
    <>
      <ArticleJsonLd
        title={pillar.meta.title}
        description={pillar.meta.description}
        url={`https://legacyforward.ai/framework/${slug}`}
      />
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-teal-400 text-sm font-semibold mb-3">
            Pillar {pillar.meta.pillar}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {pillar.meta.title}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {pillar.meta.description}
          </p>
        </div>
      </section>

      {/* Pillar navigation tabs */}
      <PillarNav
        currentSlug={slug}
        pillars={allPillars.map((p) => ({
          slug: p.meta.slug,
          title: p.meta.title,
          pillar: p.meta.pillar ?? 0,
        }))}
      />

      {/* Visual overview diagram */}
      {pillarDiagrams[slug] && (
        <section className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <p className="text-sm font-semibold text-slate-500 text-center mb-6 uppercase tracking-wider">
              Overview
            </p>
            {pillarDiagrams[slug]}
          </div>
        </section>
      )}

      <article className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
            <TableOfContents headings={headings} />
            <div className="max-w-3xl">
              <Prose content={stripLeadingH1(pillar.content)} />
            </div>
          </div>
        </div>
      </article>

      {/* Related reading */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-lg font-bold text-navy-900 mb-6 text-center">
            Continue Reading
          </h2>

          {/* Related blog articles */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Related Articles</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.meta.slug}
                    href={`/blog/${article.meta.slug}`}
                    className="block border border-slate-200 rounded-lg p-6 hover:border-teal-500 transition-colors bg-white"
                  >
                    <p className="text-slate-500 text-xs font-medium mb-1">
                      {article.meta.date && new Date(article.meta.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <p className="font-bold text-navy-900">{article.meta.title}</p>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{article.meta.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Other pillars */}
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Other Pillars</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherPillars.map((p) => (
              <Link
                key={p.meta.slug}
                href={`/framework/${p.meta.slug}`}
                className="block border border-slate-200 rounded-lg p-6 hover:border-teal-500 transition-colors bg-white"
              >
                <p className="text-teal-500 text-xs font-semibold mb-1">
                  Pillar {p.meta.pillar}
                </p>
                <p className="font-bold text-navy-900">{p.meta.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SubscribeCTA
        headline="Go deeper on enterprise AI."
        description="Get framework updates, new patterns, and practitioner insights as we build out each pillar."
      />
    </>
  );
}
