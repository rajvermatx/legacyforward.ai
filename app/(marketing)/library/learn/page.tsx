import Link from "next/link";
import type { Metadata } from "next";
import { getSection, estimateReadingTime } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learning Paths | LegacyForward.ai",
  description:
    "Structured study guides for GCP certifications and Generative AI. Free, open-source modules with companion notebooks.",
};

const pathDefs = [
  { section: "gcp-mle", title: "GCP ML Engineer", description: "20 modules covering all exam domains for the Professional Machine Learning Engineer certification.", href: "/library/learn/gcp-mle", color: "bg-blue-500" },
  { section: "genai", title: "Generative AI", description: "17 deep-dive modules from foundations to agents, prompt engineering, and RAG patterns.", href: "/library/learn/genai", color: "bg-teal-500" },
  { section: "gcp-cdl", title: "GCP Cloud Digital Leader", description: "6 guides covering cloud concepts, infrastructure, and digital transformation for the CDL certification.", href: "/library/learn/gcp-cdl", color: "bg-purple-500" },
  { section: "gcp-gal", title: "GCP Gen AI Leader", description: "4 guides covering Generative AI concepts and applications on Google Cloud.", href: "/library/learn/gcp-gal", color: "bg-amber-500" },
  { section: "gcp-pca", title: "GCP Prof Cloud Architect", description: "6 guides for the Professional Cloud Architect certification exam domains.", href: "/library/learn/gcp-pca", color: "bg-green-500" },
  { section: "gcp-pde", title: "GCP Prof Data Engineer", description: "5 guides for the Professional Data Engineer certification exam domains.", href: "/library/learn/gcp-pde", color: "bg-rose-500" },
];

function getPathStats() {
  return pathDefs.map((p) => {
    const items = getSection(p.section);
    const totalMinutes = items.reduce((sum, item) => sum + estimateReadingTime(item.content), 0);
    return { ...p, count: items.length, totalMinutes };
  });
}

export default function LearnPage() {
  const paths = getPathStats();
  return (
    <>
      <section className="bg-navy-900 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
            Structured Paths
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
            Learning{" "}
            <span className="text-teal-400">Paths</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Free, practitioner-written study guides for GCP certifications and
            Generative AI. Each path includes companion Jupyter notebooks.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
              >
                <div className={`${path.color} h-1.5`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-navy-900 group-hover:text-teal-600 transition-colors">
                      {path.title}
                    </h2>
                    <span className="text-xs font-bold text-teal-500 whitespace-nowrap ml-2">
                      {path.count} modules
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">
                    {path.description}
                  </p>
                  <p className="text-xs text-slate-400">
                    ~{path.totalMinutes} min total reading time
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
