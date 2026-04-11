"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/app/AppLayout";
import FeatureIntro from "@/components/app/FeatureIntro";
import { InfoLabel } from "@/components/app/Tooltip";

interface Snapshot {
  currentRole?: string;
  currentIndustry?: string;
  yearsExperience?: number;
  narrativeSummary?: string;
  personaType?: string;
  aspirations?: { targetRoles?: string[] };
}

interface CAIIData {
  overallScore: number;
  riskLevel: string;
  occupationTitle: string;
}

interface WinData {
  id: string;
  rawText: string;
  category: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [caii, setCaii] = useState<CAIIData | null>(null);
  const [wins, setWins] = useState<WinData[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("legacyforward_snapshot");
    if (s) {
      try { setSnapshot(JSON.parse(s)); } catch { /* ignore */ }
    }
    const c = localStorage.getItem("legacyforward_caii");
    if (c) {
      try { setCaii(JSON.parse(c)); } catch { /* ignore */ }
    }
    const w = localStorage.getItem("legacyforward_wins");
    if (w) {
      try { setWins(JSON.parse(w)); } catch { /* ignore */ }
    }
  }, []);

  const hasOnboarded = !!snapshot?.currentRole;

  const caiiColor = caii
    ? caii.overallScore >= 60 ? "text-rose-500" : caii.overallScore >= 35 ? "text-amber-500" : "text-emerald-500"
    : "text-slate-300";

  return (
    <AppLayout>
          <FeatureIntro
            id="dashboard"
            title="Welcome to Your Career Dashboard"
            description="This is your command center. Your Career Snapshot summarizes who you are professionally. The CAII score shows how AI impacts your role. Your Roadmap tracks progress toward your target role. Log wins daily to build your review portfolio. Everything here is personalized to YOU — the more you use LegacyForward.ai, the smarter it gets."
            color="indigo"
          />
          {/* Career Snapshot */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
            <div className="text-xs opacity-70 uppercase tracking-wider">Career Snapshot</div>
            {hasOnboarded ? (
              <>
                <div className="text-xl font-bold mt-1">
                  {snapshot!.currentRole}
                  {snapshot!.currentIndustry ? ` — ${snapshot!.currentIndustry}` : ""}
                </div>
                <div className="text-sm opacity-90 mt-2 leading-relaxed max-w-2xl">
                  {snapshot!.narrativeSummary || "Your personalized career story is being generated..."}
                </div>
                {snapshot!.aspirations?.targetRoles?.length ? (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-xs opacity-70">Exploring:</span>
                    {snapshot!.aspirations.targetRoles.map((role, i) => (
                      <span key={i} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{role}</span>
                    ))}
                  </div>
                ) : null}
                {snapshot!.personaType && (
                  <div className="mt-2 inline-block text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">
                    {snapshot!.personaType}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-xl font-bold mt-1">Welcome to LegacyForward.ai</div>
                <div className="text-sm opacity-90 mt-2 leading-relaxed max-w-2xl">
                  Complete your onboarding to get your personalized Career Snapshot, AI Impact Report, and career roadmap.
                </div>
                <Link href="/app/onboarding" className="inline-block mt-4 px-5 py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition">
                  Start Onboarding →
                </Link>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Link href="/app/caii" className="bg-white border border-slate-200 rounded-xl p-5 text-center hover:shadow-md transition">
              <div className="text-xs text-slate-500 uppercase"><InfoLabel label="CAII Score" tooltip="LegacyForward.ai AI Impact Index — measures how much AI can automate your role's tasks, from 0 (no risk) to 100 (highly automatable)." /></div>
              <div className={`text-3xl font-extrabold mt-1 ${caiiColor}`}>
                {caii ? caii.overallScore : "—"}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {caii ? caii.riskLevel.replace("-", " ") : hasOnboarded ? "Generate report →" : "Complete onboarding"}
              </div>
            </Link>
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
              <div className="text-xs text-slate-500 uppercase">Roadmap</div>
              <div className="text-3xl font-extrabold text-slate-300 mt-1">—</div>
              <div className="text-xs text-slate-400 mt-1">Coming in Sprint 3</div>
            </div>
            <Link href="/app/wins" className="bg-white border border-slate-200 rounded-xl p-5 text-center hover:shadow-md transition">
              <div className="text-xs text-slate-500 uppercase">Wins</div>
              <div className={`text-3xl font-extrabold mt-1 ${wins.length > 0 ? "text-indigo-600" : "text-slate-300"}`}>
                {wins.length || "0"}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {wins.length > 0 ? `${wins.filter(w => { const d = new Date(w.createdAt); const now = new Date(); return d > new Date(now.getTime() - 7*24*60*60*1000); }).length} this week` : "Log your first →"}
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {hasOnboarded ? (
              <Link href="/app/caii" className="p-4 bg-rose-50 rounded-xl text-center text-sm font-semibold text-rose-600 hover:bg-rose-100 transition">
                📊 {caii ? "View CAII Report" : "Generate CAII Report"}
              </Link>
            ) : (
              <Link href="/app/onboarding" className="p-4 bg-indigo-50 rounded-xl text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition">
                💬 Start Onboarding
              </Link>
            )}
            <Link href="/app/wins" className="p-4 bg-emerald-50 rounded-xl text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-100 transition">
              🏆 Log a Win
            </Link>
            <Link href="/app/book" className="p-4 bg-amber-50 rounded-xl text-center text-sm font-semibold text-amber-600 hover:bg-amber-100 transition">
              📖 Generate Book
            </Link>
          </div>

          {/* CAII Preview (if available) */}
          {caii && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700">AI Impact Summary</h3>
                <Link href="/app/caii" className="text-xs text-indigo-600 font-semibold hover:underline">View full report →</Link>
              </div>
              <p className="text-sm text-slate-600">
                Your role as <strong>{caii.occupationTitle}</strong> has a CAII score of{" "}
                <strong className={caiiColor}>{caii.overallScore}/100</strong> ({caii.riskLevel.replace("-", " ")} risk).
                Visit the full report to see task-level breakdowns and pivot paths.
              </p>
            </div>
          )}

          {/* Recent Wins */}
          {wins.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700">Recent Wins</h3>
                <Link href="/app/wins" className="text-xs text-indigo-600 font-semibold hover:underline">View all {wins.length} →</Link>
              </div>
              <div className="space-y-2">
                {wins.slice(0, 3).map((win) => (
                  <div key={win.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-400 shrink-0 w-16">
                      {new Date(win.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-xs text-slate-700 flex-1">{win.rawText}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      win.category === "leadership" ? "bg-emerald-50 text-emerald-600" :
                      win.category === "learning" ? "bg-cyan-50 text-cyan-600" :
                      win.category === "innovation" ? "bg-amber-50 text-amber-600" :
                      "bg-indigo-50 text-indigo-600"
                    }`}>{win.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
    </AppLayout>
  );
}
