import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFrameworkPillars, getFrameworkBySlug } from "@/lib/content";
import Prose from "@/components/Prose";
import SubscribeCTA from "@/components/SubscribeCTA";

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

      <article className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Prose content={pillar.content} />
        </div>
      </article>

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

      <SubscribeCTA />
    </>
  );
}
