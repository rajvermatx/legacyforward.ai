import Link from "next/link";

interface PillarNavProps {
  currentSlug: string;
  pillars: { slug: string; title: string; pillar: number }[];
}

export default function PillarNav({ currentSlug, pillars }: PillarNavProps) {
  return (
    <nav className="bg-navy-800 border-b border-navy-700">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex items-center justify-center gap-1">
          {pillars.map((p) => {
            const isActive = p.slug === currentSlug;
            return (
              <Link
                key={p.slug}
                href={`/framework/${p.slug}`}
                className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-teal-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-xs mr-1.5 opacity-60">{p.pillar}</span>
                {p.title}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
