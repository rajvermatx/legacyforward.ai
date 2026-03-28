import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFrameworkPillars, getFrameworkBySlug, getBlogPosts, extractHeadings } from "@/lib/content";
import Prose from "@/components/Prose";
import TableOfContents from "@/components/TableOfContents";
import SubscribeCTA from "@/components/SubscribeCTA";
import SignalCaptureFlow from "@/components/diagrams/SignalCaptureFlow";
import GroundedDeliveryFlow from "@/components/diagrams/GroundedDeliveryFlow";
import LegacyPatternsMap from "@/components/diagrams/LegacyPatternsMap";

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
  const relatedArticle = getBlogPosts().find((p) => p.meta.relatedPillar === slug);

  return (
    <>
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

      {/* Visual overview diagram */}
      {pillarDiagrams[slug] && (
        <section className="bg-slate-50 border-b border-slate-200">
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
              <Prose content={pillar.content} />
            </div>
          </div>
        </div>
      </article>

      {/* Related blog article */}
      {relatedArticle && (
        <section className="bg-white border-t border-slate-100">
          <div className="mx-auto max-w-3xl px-6 py-8 text-center">
            <p className="text-slate-500 text-sm mb-2">Want the short version?</p>
            <Link
              href={`/blog/${relatedArticle.meta.slug}`}
              className="text-teal-600 font-semibold hover:underline"
            >
              Read the article: {relatedArticle.meta.title} &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Other pillars */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-lg font-bold text-navy-900 mb-6 text-center">
            Continue Reading
          </h2>
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
