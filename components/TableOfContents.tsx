"use client";

import { useState } from "react";
import { type TocEntry } from "@/lib/content";

interface TableOfContentsProps {
  headings: TocEntry[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (headings.length === 0) return null;

  // Group headings: h2s are top-level, h3s are children of the preceding h2
  const grouped: { h2: TocEntry; children: TocEntry[] }[] = [];
  for (const h of headings) {
    if (h.level === 2) {
      grouped.push({ h2: h, children: [] });
    } else if (h.level === 3 && grouped.length > 0) {
      grouped[grouped.length - 1].children.push(h);
    }
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderList = (onLinkClick?: () => void) => (
    <ul className="space-y-1">
      {grouped.map(({ h2, children }) => {
        const hasChildren = children.length > 0;
        const isExpanded = expandedSections.has(h2.id);
        return (
          <li key={h2.id}>
            <div className="flex items-start gap-1">
              <a
                href={`#${h2.id}`}
                onClick={onLinkClick}
                className="text-[13px] text-navy-900 font-medium hover:text-teal-600 transition-colors block leading-snug py-0.5 flex-1"
              >
                {h2.text}
              </a>
              {hasChildren && (
                <button
                  onClick={() => toggleSection(h2.id)}
                  className="p-0.5 mt-0.5 shrink-0 text-slate-500 hover:text-teal-600 transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            {hasChildren && isExpanded && (
              <ul className="pl-4 mt-0.5 space-y-0.5">
                {children.map((h3) => (
                  <li key={h3.id}>
                    <a
                      href={`#${h3.id}`}
                      onClick={onLinkClick}
                      className="text-[12px] text-slate-600 hover:text-teal-600 transition-colors block leading-snug py-0.5"
                    >
                      {h3.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible top bar */}
      <nav className="lg:hidden bg-slate-50 border border-slate-200 rounded-lg p-4 mb-10">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-between w-full text-sm font-semibold text-navy-900"
        >
          In this article
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="mt-3">
            {renderList(() => setMobileOpen(false))}
          </div>
        )}
      </nav>

      {/* Desktop: sticky sidebar */}
      <nav className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="text-xs font-semibold text-navy-900 uppercase tracking-wide mb-3">
          In this article
        </p>
        <div className="border-l-2 border-teal-500 pl-4">
          {renderList()}
        </div>
      </nav>
    </>
  );
}
