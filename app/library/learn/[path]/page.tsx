import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSection, getSectionMeta, estimateReadingTime } from "@/lib/content";
import { pathNames } from "@/lib/path-names";
import ContentCard from "@/components/ContentCard";

interface PathDef {
  section: string;
  hasUseCases?: boolean;
}

const pathDefs: Record<string, PathDef> = {
  "gcp-mle": { section: "gcp-mle", hasUseCases: true },
  "genai": { section: "genai", hasUseCases: true },
  "gcp-cdl": { section: "gcp-cdl" },
  "gcp-gal": { section: "gcp-gal" },
  "gcp-pca": { section: "gcp-pca" },
  "gcp-pde": { section: "gcp-pde" },
};

export async function generateStaticParams() {
  return Object.keys(pathDefs).map((path) => ({ path }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>;
}): Promise<Metadata> {
  const { path } = await params;
  const def = pathDefs[path];
  if (!def) return {};
  const meta = getSectionMeta(def.section);
  return {
    title: `${meta?.title ?? pathNames[path] ?? path} | LegacyForward.ai`,
    description: meta?.description ?? "",
  };
}

export default async function LearnPathPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const def = pathDefs[path];
  if (!def) notFound();

  const items = getSection(def.section);
  const meta = getSectionMeta(def.section);
  const BASE_PATH = `/library/learn/${path}`;

  return (
    <>
      <section className="bg-navy-900 text-white py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Learning Path
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {meta?.title ?? pathNames[path] ?? path}
          </h1>
          {meta?.description && (
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {meta.description}
            </p>
          )}
        </div>
      </section>

      <section className="bg-slate-50 pb-20 pt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <ContentCard
                key={item.meta.slug}
                title={item.meta.title}
                description={item.meta.description}
                href={`${BASE_PATH}/${item.meta.slug}`}
                badges={item.meta.badges}
                order={item.meta.order}
                accent="teal"
                readingTime={estimateReadingTime(item.content)}
                hasNotebook={!!item.meta.notebook}
              />
            ))}
          </div>

          {def.hasUseCases && (
            <div className="mt-12 text-center">
              <Link
                href={`${BASE_PATH}/usecases`}
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-500 font-semibold transition-colors"
              >
                Explore Use Cases
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
