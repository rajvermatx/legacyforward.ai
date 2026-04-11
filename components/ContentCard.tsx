import Link from "next/link";

interface ContentCardProps {
  title: string;
  description: string;
  href: string;
  badges?: string[];
  order?: number;
  accent?: string;
  readingTime?: number;
  hasNotebook?: boolean;
}

export default function ContentCard({ title, description, href, badges, order, accent = "teal", readingTime, hasNotebook }: ContentCardProps) {
  const accentColors: Record<string, string> = {
    teal: "bg-teal-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
  };

  return (
    <Link
      href={href}
      className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        {order !== undefined && (
          <span className={`shrink-0 w-8 h-8 rounded-lg ${accentColors[accent] || accentColors.teal} text-white flex items-center justify-center text-sm font-bold`}>
            {String(order).padStart(2, "0")}
          </span>
        )}
        <h3 className="text-base font-bold text-navy-900 group-hover:text-teal-600 transition-colors leading-snug">
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
        {description}
      </p>
      {(readingTime || hasNotebook) && (
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          {readingTime && <span>{readingTime} min read</span>}
          {hasNotebook && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Notebook
            </span>
          )}
        </div>
      )}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {badges.map((badge) => (
            <span key={badge} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {badge}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
