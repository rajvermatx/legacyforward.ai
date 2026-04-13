"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/app/AppShell";
import FeatureIntro from "@/components/app/FeatureIntro";
import { InfoLabel } from "@/components/app/Tooltip";

interface Win {
  id: string;
  rawText: string;
  category: string;
  impactMetrics: string[];
  starFormat: { situation: string; task: string; action: string; result: string };
  tags: string[];
  source: string;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  leadership: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Leadership" },
  technical: { bg: "bg-indigo-50", text: "text-teal-600", label: "Technical" },
  collaboration: { bg: "bg-blue-50", text: "text-blue-600", label: "Collaboration" },
  delivery: { bg: "bg-purple-50", text: "text-purple-600", label: "Delivery" },
  innovation: { bg: "bg-amber-50", text: "text-amber-600", label: "Innovation" },
  learning: { bg: "bg-cyan-50", text: "text-cyan-600", label: "Learning" },
};

function WinCard({ win }: { win: Win }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_COLORS[win.category] || CATEGORY_COLORS.delivery;
  const date = new Date(win.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400" suppressHydrationWarning>{date}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cat.bg} ${cat.text}`}>
              {cat.label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
              via {win.source}
            </span>
          </div>
          <div className="text-sm text-slate-700">{win.rawText}</div>

          {/* STAR Format (expandable) */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-teal-600 font-semibold mt-2 hover:underline"
          >
            {expanded ? "Hide" : "Show"} STAR Format ▾
          </button>

          {expanded && (
            <div className="mt-2 p-3 bg-slate-50 rounded-lg border-l-3 border-indigo-500" style={{ borderLeftWidth: 3, borderLeftColor: "#4F46E5" }}>
              <div className="text-[10px] text-teal-600 font-semibold mb-1"><InfoLabel label="STAR Format" tooltip="Situation-Task-Action-Result: the standard structure used in performance reviews and job interviews to communicate impact clearly. AI auto-generates this from your raw notes." /></div>
              <div className="text-[11px] text-slate-700 leading-relaxed space-y-0.5">
                <div><strong>S:</strong> {win.starFormat.situation}</div>
                <div><strong>T:</strong> {win.starFormat.task}</div>
                <div><strong>A:</strong> {win.starFormat.action}</div>
                <div><strong>R:</strong> {win.starFormat.result}</div>
              </div>
            </div>
          )}

          {/* Metrics + Tags */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {win.impactMetrics.map((m, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                📈 {m}
              </span>
            ))}
            {win.tags.map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-teal-600 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WinsPage() {
  const [wins, setWins] = useState<Win[]>([]);
  const [input, setInput] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [filter, setFilter] = useState("all");
  const [summary, setSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("legacyforward_wins");
    if (stored) {
      try { setWins(JSON.parse(stored)); } catch { /* */ }
    }
  }, []);

  // Save to localStorage
  function saveWins(updated: Win[]) {
    setWins(updated);
    localStorage.setItem("legacyforward_wins", JSON.stringify(updated));
  }

  async function logWin() {
    if (!input.trim() || isLogging) return;
    setIsLogging(true);
    try {
      const res = await fetch("/api/wins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, source: "app" }),
      });
      const win = await res.json();
      saveWins([win, ...wins]);
      setInput("");
      inputRef.current?.focus();
    } catch {
      alert("Failed to log win.");
    } finally {
      setIsLogging(false);
    }
  }

  async function generateSummary() {
    if (wins.length === 0) return;
    setGeneratingSummary(true);
    setSummary(null);
    try {
      const res = await fetch("/api/wins/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wins, period: "FY 2026" }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      alert("Failed to generate summary.");
    } finally {
      setGeneratingSummary(false);
    }
  }

  const filteredWins = filter === "all" ? wins : wins.filter((w) => w.category === filter);
  const categories = [...new Set(wins.map((w) => w.category))];

  return (
    <AppShell>
          <FeatureIntro
            id="wins"
            title="Your Achievement Journal — Never Forget a Win"
            description="Most people lose track of their accomplishments between performance reviews. Log wins here as they happen — AI automatically formats them into STAR stories (Situation, Task, Action, Result) and organizes them by category. When review season comes, generate a ready-to-submit PMAP summary in seconds instead of scrambling to remember what you did all year."
            color="emerald"
          />
          <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold">🏆 Wins Tracker</h1>
              <p className="text-sm text-slate-500">{wins.length} achievements logged · FY 2026</p>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{CATEGORY_COLORS[c]?.label || c}</option>
                ))}
              </select>
              {wins.length > 0 && (
                <button
                  onClick={generateSummary}
                  disabled={generatingSummary}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {generatingSummary ? "Generating..." : <><InfoLabel label="📊 PMAP Summary" tooltip="Performance Management Appraisal Plan — AI generates a structured, evidence-based self-assessment from all your logged wins, ready to paste into your annual review." /></>}
                </button>
              )}
            </div>
          </div>

          {/* Quick Capture */}
          <div className="flex gap-2 mb-6 p-4 bg-indigo-50 rounded-xl border border-dashed border-indigo-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && logWin()}
              placeholder="What did you accomplish today?"
              disabled={isLogging}
              className="flex-1 bg-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-300 border border-slate-200 disabled:opacity-50"
            />
            <button
              onClick={logWin}
              disabled={!input.trim() || isLogging}
              className="px-5 py-3 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
            >
              {isLogging ? "..." : "+ Log Win"}
            </button>
          </div>

          {/* PMAP Summary */}
          {summary && (
            <div className="mb-6 bg-white border border-emerald-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-emerald-700"><InfoLabel label="📊 PMAP Review Summary" tooltip="AI-generated self-assessment based on all your logged wins. Each achievement is translated into the STAR format and grouped by theme — ready to copy into your performance review." /></h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    alert("Copied to clipboard!");
                  }}
                  className="text-xs text-teal-600 font-semibold hover:underline"
                >
                  📋 Copy
                </button>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          )}

          {/* Win Cards */}
          {filteredWins.length === 0 && !isLogging && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🏆</div>
              <h2 className="text-lg font-bold text-slate-700 mb-2">No wins logged yet</h2>
              <p className="text-sm text-slate-500">
                Start capturing your achievements. AI will auto-categorize and STAR-format them for your review.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filteredWins.map((win) => (
              <WinCard key={win.id} win={win} />
            ))}
          </div>

          {/* Category Summary */}
          {wins.length >= 3 && (
            <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Achievement Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(CATEGORY_COLORS).map(([key, val]) => {
                  const count = wins.filter((w) => w.category === key).length;
                  if (count === 0) return null;
                  return (
                    <div key={key} className={`${val.bg} rounded-lg p-3 text-center`}>
                      <div className={`text-xl font-bold ${val.text}`}>{count}</div>
                      <div className="text-[10px] text-slate-600">{val.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
    </AppShell>
  );
}
