"use client";

import { useState } from "react";
import { type TocEntry } from "@/lib/content";

interface TableOfContentsProps {
  headings: TocEntry[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile: collapsible top bar */}
      <nav className="lg:hidden bg-slate-50 border border-slate-200 rounded-lg p-4 mb-10">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full text-sm font-semibold text-navy-900"
        >
          In this article
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <ul className="mt-3 space-y-1.5">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                <a
                  href={`#${h.id}`}
                  onClick={() => setOpen(false)}
                  className="text-sm text-slate-600 hover:text-teal-600 transition-colors block leading-snug"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Desktop: sticky left sidebar */}
      <nav className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="text-xs font-semibold text-navy-900 uppercase tracking-wide mb-3">
          In this article
        </p>
        <ul className="space-y-1.5 border-l border-slate-200 pl-4">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                className="text-[13px] text-slate-500 hover:text-teal-600 transition-colors block leading-snug py-0.5"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
