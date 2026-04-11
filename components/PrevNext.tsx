import Link from "next/link";

interface PrevNextProps {
  prev?: { title: string; href: string } | null;
  next?: { title: string; href: string } | null;
}

export default function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-4 hover:border-teal-500/50 transition-all"
        >
          <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Previous</p>
            <p className="text-sm font-semibold text-navy-900 group-hover:text-teal-600 transition-colors truncate">{prev.title}</p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex-1 flex items-center justify-end gap-3 bg-white border border-slate-200 rounded-lg p-4 hover:border-teal-500/50 transition-all text-right"
        >
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Next</p>
            <p className="text-sm font-semibold text-navy-900 group-hover:text-teal-600 transition-colors truncate">{next.title}</p>
          </div>
          <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
