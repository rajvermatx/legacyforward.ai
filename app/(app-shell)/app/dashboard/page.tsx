"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";

interface Snapshot {
  currentRole?: string;
  currentIndustry?: string;
  yearsExperience?: number;
  narrativeSummary?: string;
  personaType?: string;
  aspirations?: { targetRoles?: string[] };
}
interface CAIIData { overallScore: number; riskLevel: string; occupationTitle: string; }
interface WinData { id: string; rawText: string; category: string; createdAt: string; }
interface RoadmapData { overallProgress?: number; estimatedMonths?: number; }

const SETUP_STEPS = [
  { id: "onboarding", label: "Career Snapshot", href: "/app/onboarding", key: "hasSnapshot" },
  { id: "caii", label: "AI Impact Score", href: "/app/caii", key: "hasCAII" },
  { id: "roadmap", label: "Roadmap", href: "/app/roadmap", key: "hasRoadmap" },
  { id: "wins", label: "First Win", href: "/app/wins", key: "hasWins" },
  { id: "book", label: "Career Book", href: "/app/book", key: "hasBook" },
];

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [caii, setCaii] = useState<CAIIData | null>(null);
  const [wins, setWins] = useState<WinData[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [hasBook, setHasBook] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("legacyforward_snapshot");
      if (s) setSnapshot(JSON.parse(s));
      const c = localStorage.getItem("legacyforward_caii");
      if (c) setCaii(JSON.parse(c));
      const w = localStorage.getItem("legacyforward_wins");
      if (w) setWins(JSON.parse(w));
      const r = localStorage.getItem("legacyforward_roadmap");
      if (r) setRoadmap(JSON.parse(r));
      const b = localStorage.getItem("legacyforward_book");
      if (b) { const bk = JSON.parse(b); setHasBook(Array.isArray(bk) && bk.length > 0); }
    } catch { /* ignore */ }
  }, []);

  const hasSnapshot = !!snapshot?.currentRole;
  const hasCAII = !!caii;
  const hasRoadmap = !!roadmap;
  const hasWins = wins.length > 0;
  const setupStatus = { hasSnapshot, hasCAII, hasRoadmap, hasWins, hasBook };
  const setupDone = Object.values(setupStatus).filter(Boolean).length;

  const caiiColor = caii
    ? caii.overallScore >= 60 ? "text-rose-500" : caii.overallScore >= 35 ? "text-amber-500" : "text-emerald-500"
    : "text-slate-300";

  const recentWins = wins.slice(-3).reverse();

  return (
    <AppShell>
      {/* Hero card */}
      <div className={`rounded-2xl p-6 mb-6 ${hasSnapshot ? "bg-gradient-to-br from-navy-900 to-navy-800" : "bg-slate-100 border border-slate-200"}`}>
        {hasSnapshot ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-1">Career Snapshot</div>
                <h1 className="text-xl font-bold text-white">{snapshot?.currentRole}</h1>
                <p className="text-sm text-slate-400 mt-0.5">{snapshot?.currentIndustry} · {snapshot?.yearsExperience || "?"} yrs experience</p>
              </div>
              {snapshot?.personaType && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/30">
                  {snapshot.personaType}
                </span>
              )}
            </div>
            {snapshot?.aspirations?.targetRoles?.[0] && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <span className="text-slate-500">→</span>
                <span className="font-semibold text-teal-300">{snapshot.aspirations.targetRoles[0]}</span>
              </div>
            )}
            {snapshot?.narrativeSummary && (
              <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-2">{snapshot.narrativeSummary}</p>
            )}
            <div className="mt-4 flex gap-2">
              <Link href="/app/onboarding" className="text-xs text-slate-400 hover:text-teal-400 transition">Edit profile →</Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">👋</div>
            <h1 className="text-lg font-bold text-slate-800 mb-1">Welcome to LegacyForward.ai</h1>
            <p className="text-sm text-slate-500 mb-4">Start by building your Career Snapshot. It takes about 5 minutes.</p>
            <Link href="/app/onboarding" className="inline-block px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition">
              Start Onboarding →
            </Link>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/app/caii" className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-md transition group">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">CAII Score</div>
          <div className={`text-3xl font-extrabold ${caiiColor}`}>{caii?.overallScore ?? "—"}</div>
          <div className="text-[10px] text-slate-400 mt-1 group-hover:text-teal-500 transition">{caii ? caii.riskLevel : "Generate report →"}</div>
        </Link>
        <Link href="/app/roadmap" className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-md transition group">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Roadmap</div>
          <div className="text-3xl font-extrabold text-slate-800">{roadmap?.overallProgress ?? "—"}{roadmap ? "%" : ""}</div>
          <div className="text-[10px] text-slate-400 mt-1 group-hover:text-teal-500 transition">{roadmap ? `${roadmap.estimatedMonths || "?"} months` : "Build roadmap →"}</div>
        </Link>
        <Link href="/app/wins" className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-md transition group">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Wins</div>
          <div className={`text-3xl font-extrabold ${wins.length > 0 ? "text-teal-600" : "text-slate-300"}`}>{wins.length || "0"}</div>
          <div className="text-[10px] text-slate-400 mt-1 group-hover:text-teal-500 transition">{wins.length > 0 ? "logged achievements" : "Log your first →"}</div>
        </Link>
      </div>

      {/* Setup checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-slate-700">Your Setup</div>
          <div className="text-xs text-slate-400">{setupDone} of {SETUP_STEPS.length} complete</div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full mb-4">
          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(setupDone / SETUP_STEPS.length) * 100}%` }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {SETUP_STEPS.map((step) => {
            const done = setupStatus[step.key as keyof typeof setupStatus];
            return (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  done
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                }`}
              >
                <span>{done ? "✓" : "○"}</span>
                {step.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent wins */}
      {recentWins.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-slate-700">Recent Wins</div>
            <Link href="/app/wins" className="text-xs text-teal-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentWins.map((win) => (
              <div key={win.id} className="flex items-start gap-3 py-2 border-t border-slate-50 first:border-0">
                <span className="text-[10px] font-bold uppercase tracking-wide text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full mt-0.5 shrink-0">{win.category || "Win"}</span>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{win.rawText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/app/coach" className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition group">
          <div className="text-2xl mb-2">💬</div>
          <div className="text-sm font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition">AI Coach</div>
          <p className="text-xs text-slate-500 leading-relaxed">Get personalized advice based on your snapshot, CAII score, and roadmap.</p>
        </Link>
        <Link href="/app/bridge" className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition group">
          <div className="text-2xl mb-2">🌉</div>
          <div className="text-sm font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition">Bridge Builder</div>
          <p className="text-xs text-slate-500 leading-relaxed">Analyze skill overlap between two roles and find your transferable advantage.</p>
        </Link>
        <Link href="/app/book" className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition group">
          <div className="text-2xl mb-2">📖</div>
          <div className="text-sm font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition">Career Book</div>
          <p className="text-xs text-slate-500 leading-relaxed">Generate your personalized 16-chapter Career Bible from your full profile.</p>
        </Link>
      </div>
    </AppShell>
  );
}
