import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSection, getSectionMeta, estimateReadingTime } from "@/lib/content";
import ContentCard from "@/components/ContentCard";

interface CategoryDef {
  section: string;
  label: string;
  when: string;
}

const categoryDefs: Record<string, CategoryDef> = {
  "blueprints": {
    section: "blueprints",
    label: "Blueprint",
    when: "Use these when you need to make enterprise-level infrastructure, compliance, or operational decisions about AI systems.",
  },
  "agentic-designs": {
    section: "agentic-designs",
    label: "Agentic Design",
    when: "Use these when you have a specific business problem and want to see a full agent solution end-to-end.",
  },
  "genai-arch": {
    section: "genai-arch",
    label: "GenAI Architecture",
    when: "Use these when you need to understand how to build a specific GenAI feature or capability.",
  },
};

export async function generateStaticParams() {
  return Object.keys(categoryDefs).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const def = categoryDefs[category];
  if (!def) return {};
  const meta = getSectionMeta(def.section);
  return {
    title: `${meta?.title ?? def.label} | LegacyForward.ai`,
    description: meta?.description ?? "",
  };
}

export default async function ToolkitCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const def = categoryDefs[category];
  if (!def) notFound();

  const items = getSection(def.section);
  const meta = getSectionMeta(def.section);

  return (
    <>
      <section className="bg-navy-900 text-white py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Toolkit
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {meta?.title ?? def.label}
          </h1>
          {meta?.description && (
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {meta.description}
            </p>
          )}
          <p className="text-sm text-teal-400 mt-4 max-w-xl mx-auto">
            {def.when}
          </p>
        </div>
      </section>

      <section className="bg-slate-50 pb-24 pt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ContentCard
                key={item.meta.slug}
                title={item.meta.title}
                description={item.meta.description}
                href={`/library/toolkit/${category}/${item.meta.slug}`}
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
