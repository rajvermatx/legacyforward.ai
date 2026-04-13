import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSection, getSectionMeta, estimateReadingTime } from "@/lib/content";
import ContentCard from "@/components/ContentCard";

// Maps learning path slug to its usecases section name
const usecasesDefs: Record<string, { section: string; label: string }> = {
  "gcp-mle": { section: "gcp-mle-usecases", label: "ML Engineer Use Cases" },
  "genai": { section: "genai-usecases", label: "GenAI Use Cases" },
};

export async function generateStaticParams() {
  return Object.keys(usecasesDefs).map((path) => ({ path }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>;
}): Promise<Metadata> {
  const { path } = await params;
  const def = usecasesDefs[path];
  if (!def) return {};
  const meta = getSectionMeta(def.section);
  return {
    title: `${meta?.title ?? def.label} | LegacyForward.ai`,
    description: meta?.description ?? "",
  };
}

export default async function LearnUsecasesPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const def = usecasesDefs[path];
  if (!def) notFound();

  const items = getSection(def.section);
  const meta = getSectionMeta(def.section);
  const BASE_PATH = `/library/learn/${path}/usecases`;

  return (
    <>
      <section className="bg-navy-900 text-white py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Use Cases
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {meta?.title ?? def.label}
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
        </div>
      </section>
    </>
  );
}
