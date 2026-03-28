"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-navy-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Legacy<span className="text-teal-400">Forward</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/framework" className="hover:text-teal-400 transition-colors">
            Framework
          </Link>
          <Link href="/blog" className="hover:text-teal-400 transition-colors">
            Blog
          </Link>
          <Link href="/about" className="hover:text-teal-400 transition-colors">
            About
          </Link>
          <a
            href="https://legacyforwardai.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
          >
            Subscribe
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-300 hover:text-white"
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-navy-800 px-6 py-4 flex flex-col gap-4 text-sm font-medium">
          <Link href="/framework" onClick={() => setOpen(false)} className="hover:text-teal-400">
            Framework
          </Link>
          <Link href="/blog" onClick={() => setOpen(false)} className="hover:text-teal-400">
            Blog
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} className="hover:text-teal-400">
            About
          </Link>
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
  );
}
