"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/app/AppLayout";
import FeatureIntro from "@/components/app/FeatureIntro";
import { InfoLabel } from "@/components/app/Tooltip";
import type { BridgeAnalysis } from "@/lib/agents";

export default function BridgePage() {
  const [analysis, setAnalysis] = useState<BridgeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromRole, setFromRole] = useState("");
  const [toRole, setToRole] = useState("");

  useEffect(() => {
    const s = localStorage.getItem("legacyforward_snapshot");
    if (s) {
      try {
        const snap = JSON.parse(s);
        if (snap.currentRole) setFromRole(snap.currentRole);
        if (snap.aspirations?.targetRoles?.[0]) setToRole(snap.aspirations.targetRoles[0]);
      } catch { /* */ }
    }
  }, []);

  async function analyze() {
    if (!fromRole.trim() || !toRole.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromRole, toRole, marketCode: "US" }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      alert("Failed to analyze.");
    } finally {
      setLoading(false);
    }
  }

  const overlapColor = analysis
    ? analysis.overlapPercent >= 70 ? "text-emerald-600" : analysis.overlapPercent >= 40 ? "text-amber-500" : "text-rose-500"
    : "";

  return (
    <AppLayout>
          <FeatureIntro
            id="bridge"
            title="Bridge Builder — Your Skills Already Travel Further Than You Think"
            description="Career changers often underestimate how much their experience transfers. This tool maps your existing skills to your target role line-by-line, shows where you have a head start, and gives you a clear bridge plan for the gaps. Whether you're a homemaker returning to work, an engineer switching industries, or a veteran entering the civilian workforce — your experience has more value than you realize."
            color="teal"
          />
          <h1 className="text-xl font-bold mb-1">🔧 Bridge Builder</h1>
          <p className="text-sm text-slate-500 mb-4">Translate your skills and find your bridge path</p>

          {!analysis && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Where You Are</label>
                  <input type="text" value={fromRole} onChange={(e) => setFromRole(e.target.value)} placeholder="e.g. Marketing Manager, Mechanical Engineer, Homemaker" className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 mt-1" />
                </div>
                <div className="text-2xl text-indigo-600 font-bold text-center pb-2">→</div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Where You Want to Go</label>
                  <input type="text" value={toRole} onChange={(e) => setToRole(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} placeholder="e.g. Product Manager, DevOps Engineer" className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 mt-1" />
                </div>
              </div>
              <button onClick={analyze} disabled={loading || !fromRole.trim() || !toRole.trim()} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                {loading ? "Analyzing transition..." : "Analyze My Bridge"}
              </button>

              {/* Quick examples */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-slate-400">Try:</span>
                {[
                  ["Homemaker", "Project Manager"],
                  ["Mechanical Engineer", "DevOps Engineer"],
                  ["Teacher", "Instructional Designer"],
                  ["Accountant", "Data Analyst"],
                ].map(([f, t]) => (
                  <button key={f} onClick={() => { setFromRole(f); setToRole(t); }} className="text-xs px-2 py-1 border border-slate-200 rounded-full text-indigo-600 hover:bg-indigo-50">
                    {f} → {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && !analysis && (
            <div className="mt-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 mt-3">Translating skills from {fromRole} to {toRole}...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-4 mt-4">
              {/* From → To */}
              <div className="flex gap-4 items-center">
                <div className="flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Where You Are</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{analysis.fromRole}</div>
                </div>
                <div className="text-3xl text-indigo-600 font-bold">→</div>
                <div className="flex-1 p-4 bg-indigo-50 border-2 border-indigo-500 rounded-xl">
                  <div className="text-[10px] text-indigo-500 uppercase font-semibold tracking-wide">Where You&apos;re Going</div>
                  <div className="text-lg font-bold text-indigo-700 mt-1">{analysis.toRole}</div>
                  <div className={`text-sm font-bold mt-1 ${overlapColor}`}>
                    <InfoLabel label={`${analysis.overlapPercent}% skill overlap`} tooltip="Percentage of skills from your current role that transfer directly to your target role. Above 60% means a smoother transition; below 40% means a bigger bridge to build — but it's still achievable." />
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{analysis.narrative}</p>
              </div>

              {/* Skill Translation Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_30px_1fr] text-xs font-semibold">
                  <div className="px-4 py-2 bg-slate-50 text-slate-500 uppercase">Your Experience</div>
                  <div className="bg-slate-50" />
                  <div className="px-4 py-2 bg-indigo-50 text-indigo-600 uppercase">How It Translates</div>
                </div>
                {analysis.transferableSkills.map((skill, i) => (
                  <div key={i} className="grid grid-cols-[1fr_30px_1fr] border-t border-slate-100">
                    <div className="px-4 py-2.5 text-xs text-slate-700">{skill.sourceSkill}</div>
                    <div className={`flex items-center justify-center font-bold ${
                      skill.transferability === "high" ? "text-emerald-500" : skill.transferability === "medium" ? "text-amber-500" : "text-rose-400"
                    }`}>→</div>
                    <div className="px-4 py-2.5 text-xs text-indigo-700">
                      {skill.targetSkill}
                      {skill.transferability !== "high" && (
                        <span className="text-[10px] text-amber-500 ml-1">({skill.gapAction})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Unfair Advantage + Gap Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-emerald-700 mb-2"><InfoLabel label="💡 Your Unfair Advantage" tooltip="The unique perspective or cross-industry experience that makes you MORE valuable than a typical candidate — not despite your background, but because of it." /></h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{analysis.unfairAdvantage}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-amber-600 mb-2">📚 Skills to Bridge</h3>
                  <div className="space-y-1.5">
                    {analysis.gapSkills.map((skill, i) => (
                      <div key={i} className="text-xs px-3 py-2 bg-amber-50 rounded-lg text-amber-700">{skill}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Steps */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Bridge Steps</h3>
                <div className="space-y-3">
                  {analysis.recommendedSteps.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{step.step}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{step.title}</div>
                        <div className="text-xs text-slate-500">{step.description}</div>
                        <div className="text-[10px] text-indigo-600 mt-0.5">{step.timeframe}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href="/app/roadmap" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-center text-sm font-semibold hover:bg-indigo-700 transition">
                  📌 Generate Roadmap
                </Link>
                <button onClick={() => setAnalysis(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-center text-sm font-semibold hover:bg-slate-200 transition">
                  🔄 Try Another Transition
                </button>
              </div>
            </div>
          )}
    </AppLayout>
  );
}
