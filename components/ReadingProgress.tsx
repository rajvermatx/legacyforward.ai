"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ReadingProgressProps {
  /** Current page path, e.g. "/library/learn/genai/foundations-of-genai" */
  path: string;
  /** Display title for the resume banner */
  title: string;
}

const STORAGE_KEY = "legacyforward-reading-progress";

interface ProgressEntry {
  path: string;
  title: string;
  scrollY: number;
  timestamp: number;
  headingId?: string;
  headingText?: string;
}

function getProgress(): Record<string, ProgressEntry> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(entry: ProgressEntry) {
  const progress = getProgress();
  progress[entry.path] = entry;
  // Keep only last 50 entries
  const entries = Object.values(progress).sort((a, b) => b.timestamp - a.timestamp);
  const trimmed: Record<string, ProgressEntry> = {};
  for (const e of entries.slice(0, 50)) {
    trimmed[e.path] = e;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/** Saves scroll position on the current page. Mount this on detail pages. */
export function ReadingProgressTracker({ path, title }: ReadingProgressProps) {
  useEffect(() => {
    // Restore scroll position on mount
    const progress = getProgress();
    const entry = progress[path];
    if (entry?.scrollY > 200) {
      // Small delay to let content render
      setTimeout(() => {
        window.scrollTo({ top: entry.scrollY, behavior: "instant" });
      }, 100);
    }

    // Record visit immediately on mount (even if user doesn't scroll)
    saveProgress({
      path,
      title,
      scrollY: entry?.scrollY ?? 0,
      timestamp: Date.now(),
      headingId: entry?.headingId,
      headingText: entry?.headingText,
    });

    // Save scroll position periodically
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Find the nearest visible heading for context
        const headings = document.querySelectorAll("h2[id], h3[id]");
        let nearestHeading: { id: string; text: string } | undefined;
        for (const h of headings) {
          const rect = h.getBoundingClientRect();
          if (rect.top < 150) {
            nearestHeading = { id: h.id, text: h.textContent || "" };
          }
        }

        saveProgress({
          path,
          title,
          scrollY: window.scrollY,
          timestamp: Date.now(),
          headingId: nearestHeading?.id,
          headingText: nearestHeading?.text,
        });
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [path, title]);

  return null;
}

/** Shows a "Continue reading" banner if the user has progress on a different page. */
export function ContinueReadingBanner() {
  const [lastRead, setLastRead] = useState<ProgressEntry | null>(null);

  useEffect(() => {
    const progress = getProgress();
    const entries = Object.values(progress)
      .filter((e) => e.path !== window.location.pathname && e.scrollY > 200)
      .sort((a, b) => b.timestamp - a.timestamp);
    if (entries.length > 0) {
      // Only show if within last 7 days
      const recent = entries[0];
      if (Date.now() - recent.timestamp < 7 * 24 * 60 * 60 * 1000) {
        setLastRead(recent);
      }
    }
  }, []);

  if (!lastRead) return null;

  return (
    <div className="bg-navy-900 border-b border-navy-800">
      <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Continue reading:</span>
          <Link href={lastRead.path} className="text-teal-400 hover:text-teal-300 font-medium transition-colors truncate max-w-[300px]">
            {lastRead.title}
          </Link>
          {lastRead.headingText && (
            <span className="hidden sm:inline text-slate-500 truncate max-w-[200px]">
              — {lastRead.headingText}
            </span>
          )}
        </div>
        <button
          onClick={() => setLastRead(null)}
          className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
