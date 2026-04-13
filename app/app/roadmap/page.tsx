"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/app/AppLayout";
import FeatureIntro from "@/components/app/FeatureIntro";
import { InfoLabel } from "@/components/app/Tooltip";
import type { RoadmapData, Milestone } from "@/lib/agents";

function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  const isComplete = milestone.status === "completed";
  const isCurrent = milestone.status === "in_progress";

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center w-10 shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isComplete
              ? "bg-emerald-500 text-white"
              : isCurrent
              ? "bg-teal-600 text-white ring-4 ring-teal-100"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {isComplete ? "✓" : index + 1}
        </div>
        <div
          className={`w-0.5 flex-1 min-h-[20px] ${
            isComplete ? "bg-emerald-500" : isCurrent ? "bg-indigo-300" : "bg-slate-200"
          }`}
        />
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-4 rounded-xl p-4 ${
          isComplete
            ? "bg-emerald-50 border border-emerald-200 opacity-80"
            : isCurrent
            ? "bg-white border-2 border-teal-500 shadow-md"
            : "bg-slate-50 border border-dashed border-slate-300 opacity-70"
        }`}
      >
        <div className="flex justify-between items-start">
          <div
            className={`text-sm font-semibold ${
              isComplete ? "text-emerald-600" : isCurrent ? "text-teal-700" : "text-slate-500"
            }`}
          >
            {isComplete ? "✓ " : isCurrent ? "▶ " : ""}
            {milestone.title}
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              isComplete
                ? "bg-emerald-100 text-emerald-600"
                : isCurrent
                ? "bg-indigo-100 text-teal-600"
                : "text-slate-500"
            }`}
          >
            {isComplete ? "Done" : isCurrent ? "In Progress" : milestone.targetDate}
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-1">{milestone.description}</p>

        {isCurrent && milestone.progress > 0 && (
          <div className="mt-2">
            <div className="h-1.5 bg-slate-100 rounded-full">
              <div
                className="h-full bg-teal-600 rounded-full transition-all"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{milestone.progress}% complete</div>
          </div>
        )}

        {/* Skills */}
        {milestone.skills?.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {milestone.skills.map((skill, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-teal-600 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Resources */}
        {isCurrent && milestone.resources?.length > 0 && (
          <div className="mt-2 p-2 bg-slate-50 rounded-lg">
            <div className="text-[10px] font-semibold text-slate-500 mb-1">Resources</div>
            {milestone.resources.map((r, i) => (
              <div key={i} className="text-xs text-teal-600 hover:underline">
                📚{" "}
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
                ) : (
                  r.title
                )}{" "}
                <span className="text-slate-400">({r.provider})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");

  // Load from localStorage
  useEffect(() => {
    const cached = localStorage.getItem("legacyforward_roadmap");
    if (cached) {
      try { setRoadmap(JSON.parse(cached)); } catch { /* ignore */ }
    }
    const snapshot = localStorage.getItem("legacyforward_snapshot");
    if (snapshot) {
      try {
        const s = JSON.parse(snapshot);
        if (s.currentRole) setCurrentRole(s.currentRole);
        if (s.aspirations?.targetRoles?.[0]) setTargetRole(s.aspirations.targetRoles[0]);
      } catch { /* ignore */ }
    }
  }, []);

  async function generate() {
    if (!currentRole.trim() || !targetRole.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole, targetRole, marketCode: "US" }),
      });
      const data = await res.json();
      setRoadmap(data);
      localStorage.setItem("legacyforward_roadmap", JSON.stringify(data));
    } catch {
      alert("Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
          <FeatureIntro
            id="roadmap"
            title="Your Personalized Career Roadmap"
            description="This is your step-by-step plan from where you are to where you want to be. Each milestone includes the skills you need to learn, specific courses to take, and realistic timelines. As you complete milestones, your progress percentage updates. The roadmap adapts based on your CAII report — it prioritizes skills that make you more AI-resilient."
            color="amber"
          />
          <h1 className="text-xl font-bold mb-1">📌 Your Career Roadmap</h1>

          {!roadmap && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mt-4">
              <p className="text-sm text-slate-600 mb-4">
                Map your path from where you are to where you want to be.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Current Role</label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Marketing Manager"
                    className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-300 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generate()}
                    placeholder="e.g. Customer Experience Lead"
                    className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-300 mt-1"
                  />
                </div>
              </div>
              <button
                onClick={generate}
                disabled={loading || !currentRole.trim() || !targetRole.trim()}
                className="w-full py-3 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                {loading ? "Generating roadmap..." : "Generate Roadmap"}
              </button>
            </div>
          )}

          {loading && !roadmap && (
            <div className="mt-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 mt-3">Planning your path from {currentRole} to {targetRole}...</p>
            </div>
          )}

          {roadmap && (
            <div className="mt-4 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">
                    {roadmap.currentRole} → <span className="font-semibold text-teal-600">{roadmap.targetRole}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-emerald-500">{roadmap.overallProgress}%</div>
                  <div className="text-xs text-slate-500">Est. {roadmap.estimatedMonths} months</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-slate-100 rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all"
                  style={{ width: `${Math.max(roadmap.overallProgress, 2)}%` }}
                />
              </div>

              {/* Narrative */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{roadmap.narrative}</p>
              </div>

              {/* Skill Gaps */}
              {roadmap.skillGaps?.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3"><InfoLabel label="Skill Gaps" tooltip="Skills you need for your target role but don't have yet. Priority indicates impact: high-priority gaps should be addressed first as they're most important for your target role." /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {roadmap.skillGaps.map((gap, i) => (
                      <div key={i} className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-700">{gap.skill}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{gap.currentLevel}</span>
                          <span className="text-[10px]">→</span>
                          <span className="text-[10px] text-teal-600 font-semibold">{gap.targetLevel}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                              gap.priority === "high"
                                ? "bg-rose-50 text-rose-500"
                                : gap.priority === "medium"
                                ? "bg-amber-50 text-amber-500"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {gap.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Milestones</h3>
                {roadmap.milestones.map((m, i) => (
                  <MilestoneCard key={m.id} milestone={m} index={i} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href="/app/coach" className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-center text-sm font-semibold hover:bg-teal-700 transition">
                  💬 Discuss with Coach
                </Link>
                <button
                  onClick={() => { setRoadmap(null); localStorage.removeItem("legacyforward_roadmap"); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-center text-sm font-semibold hover:bg-slate-200 transition"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}
    </AppLayout>
  );
}
