"use client";

import Link from "next/link";
import { useState } from "react";
import type { ContentMeta } from "@/lib/types";

interface BookSidebarProps {
  chapters: ContentMeta[];
  currentSlug: string;
  basePath: string;
  bookTitle: string;
}

export default function BookSidebar({ chapters, currentSlug, basePath, bookTitle }: BookSidebarProps) {
  const [open, setOpen] = useState(false);

  // Group chapters by part
  const groups: { part: string; items: ContentMeta[] }[] = [];
  let currentPart: string | null = null;
  for (const ch of chapters) {
    const part = ch.part || "";
    if (part !== currentPart) {
      currentPart = part;
      groups.push({ part, items: [] });
    }
    groups[groups.length - 1].items.push(ch);
  }

  const sidebar = (onLinkClick?: () => void) => (
    <div className="space-y-4">
      <Link href={basePath} className="text-sm font-bold text-teal-600 hover:underline" onClick={onLinkClick}>
        {bookTitle}
      </Link>
      {groups.map((group) => (
        <div key={group.part || "default"}>
          {group.part && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-2">
              {group.part}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((ch) => {
              const active = ch.slug === currentSlug;
              return (
                <li key={ch.slug}>
                  <Link
                    href={`${basePath}/${ch.slug}`}
                    onClick={onLinkClick}
                    className={`block text-[13px] py-1 px-2 rounded transition-colors ${
                      active
                        ? "bg-teal-50 text-teal-600 font-semibold"
                        : "text-slate-600 hover:text-teal-600"
                    }`}
                  >
                    {ch.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <nav className="lg:hidden bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full text-sm font-semibold text-navy-900"
        >
          Chapters
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && <div className="mt-3">{sidebar(() => setOpen(false))}</div>}
      </nav>

      {/* Desktop */}
      <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto w-64 shrink-0">
        {sidebar()}
      </aside>
    </>
  );
}
