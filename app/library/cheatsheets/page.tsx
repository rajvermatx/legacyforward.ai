import type { Metadata } from "next";
import { getSection, getSectionMeta, estimateReadingTime } from "@/lib/content";
import ContentCard from "@/components/ContentCard";

export async function generateMetadata(): Promise<Metadata> {
  const meta = getSectionMeta("cheatsheets");
  return {
    title: `${meta?.title ?? "Cheatsheets"} | LegacyForward.ai`,
    description:
      meta?.description ??
      "Concise, printable quick-reference guides for AI and ML topics.",
  };
}

export default function CheatsheetsPage() {
  const items = getSection("cheatsheets");
  const meta = getSectionMeta("cheatsheets");

  return (
    <>
      <section className="bg-navy-900 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
            15 Quick Reference Guides
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
            {meta?.title ?? "Cheatsheets"}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {meta?.description ?? "Concise, printable quick-reference guides for the most important AI and ML topics. Download as PDF or read online."}
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <ContentCard
                key={item.meta.slug}
                title={item.meta.title}
                description={item.meta.description}
                href={`/library/cheatsheets/${item.meta.slug}`}
                badges={item.meta.badges}
                order={item.meta.order}
                accent="teal"
                readingTime={estimateReadingTime(item.content)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
