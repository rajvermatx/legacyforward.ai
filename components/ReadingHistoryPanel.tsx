"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "legacyforward-reading-progress";

interface ProgressEntry {
  path: string;
  title: string;
  scrollY: number;
  timestamp: number;
  headingId?: string;
  headingText?: string;
}

function getHistory(): ProgressEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, ProgressEntry>;
    return Object.values(raw).sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function sectionLabel(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return "Page";
  // paths under /library/...
  if (parts[0] === "library") {
    const sub = parts[1];
    const subLabels: Record<string, string> = {
      books: "Books",
      toolkit: "Toolkit",
      learn: "Learn",
      cheatsheets: "Quick Reference",
    };
    return subLabels[sub] ?? sub;
  }
  // paths under /framework, /blog, etc.
  const topLabels: Record<string, string> = {
    framework: "Framework",
    blog: "Blog",
  };
  return topLabels[parts[0]] ?? parts[0];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReadingHistoryPanel({ open, onClose }: Props) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setEntries(getHistory());
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog" aria-label="Reading history">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-sm bg-slate-900 border-l border-slate-700 flex flex-col h-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-semibold text-sm">Reading History</span>
            {entries.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-800 rounded-full px-2 py-0.5">{entries.length}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 px-6 text-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm">No reading history yet.<br />Start reading to track your progress.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {entries.map((entry) => (
                <li key={entry.path}>
                  <Link
                    href={entry.path}
                    onClick={onClose}
                    className="flex flex-col gap-1 px-5 py-3.5 hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">
                        {sectionLabel(entry.path)}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0">{timeAgo(entry.timestamp)}</span>
                    </div>
                    <span className="text-sm text-white group-hover:text-teal-300 transition-colors leading-snug">
                      {entry.title}
                    </span>
                    {entry.headingText && (
                      <span className="text-xs text-slate-500 truncate">at: {entry.headingText}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-700">
            <button
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear history
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
