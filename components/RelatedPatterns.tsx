import Link from "next/link";
import type { RelatedItem } from "@/lib/related";

interface RelatedPatternsProps {
  items: RelatedItem[];
}

export default function RelatedPatterns({ items }: RelatedPatternsProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wide mb-4">
        Related patterns
      </h3>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 hover:border-teal-500/50 hover:bg-white transition-all"
          >
            <span className="text-[11px] text-teal-600 font-medium shrink-0">
              {item.section}
            </span>
            <span className="text-sm text-navy-900 group-hover:text-teal-600 transition-colors">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
