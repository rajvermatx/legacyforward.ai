"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { LogoWordmark } from "./Logo";
import ReadingHistoryPanel from "./ReadingHistoryPanel";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const openSearch = useCallback(() => {
    window.dispatchEvent(new Event("open-search"));
  }, []);

  return (
    <>
      <nav className="bg-navy-900 text-white sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <LogoWordmark />
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/framework" className="hover:text-teal-400 transition-colors">
              Framework
            </Link>
            <div className="relative group">
              <Link href="/library" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                Library
                <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="bg-white rounded-lg shadow-lg border border-slate-100 py-2 w-44">
                  {[
                    { label: "Books", href: "/library/books" },
                    { label: "Toolkit", href: "/library/toolkit" },
                    { label: "Learning Paths", href: "/library/learn" },
                    { label: "Quick Reference", href: "/library/cheatsheets" },
                  ].map(({ label, href }) => (
                    <Link key={href} href={href} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/app" className="hover:text-teal-400 transition-colors">
              Roadmap
            </Link>
            <Link href="/blog" className="hover:text-teal-400 transition-colors">
              Blog
            </Link>
            <Link href="/about" className="hover:text-teal-400 transition-colors">
              About
            </Link>

            {/* Search icon */}
            <button
              onClick={openSearch}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Search"
              title="Search (⌘K)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth={2} />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </button>

            {/* Reading history icon */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Reading history"
              title="Reading history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <a
              href="https://legacyforwardai.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
            >
              Subscribe
            </a>
          </div>

          {/* Mobile: search + history + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={openSearch}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth={2} />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="text-slate-300 hover:text-white"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-navy-800 px-6 py-4 flex flex-col gap-4 text-sm font-medium">
            <Link href="/framework" onClick={() => setOpen(false)} className="hover:text-teal-400">
              Framework
            </Link>
            <Link href="/library" onClick={() => setOpen(false)} className="hover:text-teal-400">
              Library
            </Link>
            <Link href="/app" onClick={() => setOpen(false)} className="hover:text-teal-400">
              Roadmap
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="hover:text-teal-400">
              Blog
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="hover:text-teal-400">
              About
            </Link>
            <button
              onClick={() => { setOpen(false); setHistoryOpen(true); }}
              className="text-left hover:text-teal-400"
            >
              Reading History
            </button>
            <a
              href="https://legacyforwardai.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm font-semibold text-center transition-colors"
            >
              Subscribe
            </a>
          </div>
        )}
      </nav>

      <ReadingHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
