"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";
import FeatureIntro from "@/components/app/FeatureIntro";
import { InfoLabel } from "@/components/app/Tooltip";
import type { CAIIReport } from "@/lib/agents";

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 60 ? "#F43F5E" : score >= 35 ? "#F59E0B" : "#10B981";
  const label =
    score >= 70
      ? "High Risk"
      : score >= 50
      ? "Medium-High"
      : score >= 30
      ? "Medium"
      : "Low Risk";

  return (
    <div className="text-center">
      <div
        className="w-36 h-36 rounded-full border-[6px] flex flex-col items-center justify-center mx-auto"
        style={{ borderColor: color }}
      >
        <div className="text-5xl font-black" style={{ color }}>
          {score}
        </div>
        <div className="text-xs font-semibold" style={{ color }}>
          {label}
        </div>
      </div>
      <div className="mt-3 h-2 bg-slate-100 rounded-full max-w-48 mx-auto overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, #10B981, #F59E0B, #F43F5E)`,
          }}
        />
      </div>
      <div className="flex justify-between max-w-48 mx-auto mt-1 text-[10px] text-slate-400">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

function TaskBar({
  task,
  score,
  risk,
}: {
  task: string;
  score: number;
  risk: string;
}) {
  const bg =
    risk === "high"
      ? "bg-rose-50"
      : risk === "medium"
      ? "bg-amber-50"
      : "bg-emerald-50";
  const textColor =
    risk === "high"
      ? "text-rose-600"
      : risk === "medium"
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className={`flex justify-between items-center px-3 py-2 ${bg} rounded-lg`}>
      <span className="text-xs text-slate-700">{task}</span>
      <span className={`text-xs font-bold ${textColor}`}>{score}</span>
    </div>
  );
}

export default function CAIIPage() {
  const [report, setReport] = useState<CAIIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");

  // Check localStorage for snapshot
  useEffect(() => {
    const snapshot = localStorage.getItem("legacyforward_snapshot");
    if (snapshot) {
      try {
        const parsed = JSON.parse(snapshot);
        if (parsed.currentRole) {
          setRole(parsed.currentRole);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  async function generateReport() {
    if (!role.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/caii", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, marketCode: "US" }),
      });
      const data = await res.json();
      setReport(data);
      localStorage.setItem("legacyforward_caii", JSON.stringify(data));
    } catch {
      alert("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Load cached report
  useEffect(() => {
    const cached = localStorage.getItem("legacyforward_caii");
    if (cached) {
      try {
        setReport(JSON.parse(cached));
        const snapshot = localStorage.getItem("legacyforward_snapshot");
        if (snapshot) {
          const parsed = JSON.parse(snapshot);
          if (parsed.currentRole) setRole(parsed.currentRole);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <AppShell>
          <FeatureIntro
            id="caii"
            title="How AI Impacts Your Specific Role"
            description="Your CAII (LegacyForward.ai AI Impact Index) score shows which of your daily tasks AI can automate and which remain uniquely human. Unlike generic AI predictions, this analysis breaks down YOUR role task by task, then recommends specific skills to learn and alternative roles to consider. The score updates monthly as AI capabilities evolve."
            color="rose"
          />
          <h1 className="text-xl font-bold mb-1">📊 <InfoLabel label="AI Impact Report" tooltip="Powered by the CAII scoring engine — analyzes your occupation's tasks against 12 AI capability dimensions including text generation, data analysis, pattern recognition, and more." /></h1>

          {/* Generate form */}
          {!report && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mt-4">
              <p className="text-sm text-slate-600 mb-4">
                Enter your current job title to see how AI impacts your role.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generateReport()}
                  placeholder="e.g. Marketing Manager, Software Developer, Teacher..."
                  className="flex-1 bg-slate-100 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-300"
                />
                <button
                  onClick={generateReport}
                  disabled={loading || !role.trim()}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : "Generate Report"}
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && !report && (
            <div className="mt-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 mt-3">
                Analyzing {role} across 12 AI capability dimensions...
              </p>
            </div>
          )}

          {/* Report */}
          {report && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-500">
                {report.occupationTitle} — Confidence: {report.confidence.toUpperCase()}
              </p>

              {/* Score + Narrative */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: report.overallScore >= 60 ? "#F43F5E" : report.overallScore >= 35 ? "#F59E0B" : "#10B981" }}>
                  <ScoreGauge score={report.overallScore} />
                </div>
                <div
                  className="rounded-xl p-5 border"
                  style={{
                    background: report.overallScore >= 50 ? "#FFFBEB" : "#ECFDF5",
                    borderColor: report.overallScore >= 50 ? "#FDE68A" : "#A7F3D0",
                  }}
                >
                  <div className="text-sm font-semibold mb-2" style={{ color: report.overallScore >= 50 ? "#F59E0B" : "#10B981" }}>
                    ⚠ What This Means
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {report.narrative}
                  </p>
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-rose-600 mb-3">
                    ⚠ <InfoLabel label="Tasks at Risk" tooltip="Tasks scoring 35+ out of 100. AI can already assist with or fully automate these. Focus on supervising AI for these tasks rather than doing them manually." />
                  </h3>
                  <div className="space-y-2">
                    {report.taskScores
                      .filter((t) => t.risk === "high" || t.risk === "medium")
                      .sort((a, b) => b.score - a.score)
                      .map((t, i) => (
                        <TaskBar key={i} task={t.task} score={t.score} risk={t.risk} />
                      ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-emerald-600 mb-3">
                    ✓ <InfoLabel label="Tasks That Stay Human" tooltip="Tasks scoring below 35. These require emotional intelligence, creative judgment, or physical presence that AI cannot replicate. These are your strengths to lean into." />
                  </h3>
                  <div className="space-y-2">
                    {report.taskScores
                      .filter((t) => t.risk === "low")
                      .sort((a, b) => a.score - b.score)
                      .map((t, i) => (
                        <TaskBar key={i} task={t.task} score={t.score} risk={t.risk} />
                      ))}
                  </div>
                </div>
              </div>

              {/* Skills + Pivots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-teal-600 mb-3">
                    📚 Learn These to Stay Ahead
                  </h3>
                  <div className="space-y-2">
                    {report.skillsToLearn.map((skill, i) => (
                      <div
                        key={i}
                        className="text-xs px-3 py-2 bg-indigo-50 rounded-lg text-teal-700"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-amber-600 mb-3">
                    🔀 <InfoLabel label="Smart Pivot Paths" tooltip="Alternative roles where your existing skills have high overlap. The match percentage shows how many of your current skills transfer directly. Higher match = easier transition." />
                  </h3>
                  <div className="space-y-2">
                    {report.pivotPaths.map((pivot, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs px-3 py-2 bg-amber-50 rounded-lg"
                      >
                        <span>{pivot.role}</span>
                        <span className="font-bold text-emerald-600">
                          {pivot.matchPercent}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <Link
                  href="/app/dashboard"
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-center text-sm font-semibold hover:bg-teal-700 transition"
                >
                  📖 Go to Dashboard
                </Link>
                <button
                  onClick={() => { setReport(null); localStorage.removeItem("legacyforward_caii"); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-center text-sm font-semibold hover:bg-slate-200 transition"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}
    </AppShell>
  );
}
