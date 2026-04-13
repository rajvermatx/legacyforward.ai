"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STAGES = [
  { id: 1, label: "About you" },
  { id: 2, label: "Your experience" },
  { id: 3, label: "Where you want to go" },
  { id: 4, label: "Your skills" },
  { id: 5, label: "AI readiness" },
];

interface FormData {
  currentRole: string; companyType: string; industry: string; yearsInRole: string;
  totalYearsExperience: string; previousRoles: { title: string; org: string; years: string }[];
  targetRole: string; targetIndustry: string; timeline: string; priorities: string[];
  skills: string; proficiency: string; aiLevel: string; aiTools: string[];
  companyAdopting: string; aiSentiment: string;
}

const INIT: FormData = {
  currentRole: "", companyType: "", industry: "", yearsInRole: "",
  totalYearsExperience: "", previousRoles: [{ title: "", org: "", years: "" }],
  targetRole: "", targetIndustry: "", timeline: "", priorities: [],
  skills: "", proficiency: "", aiLevel: "", aiTools: [],
  companyAdopting: "", aiSentiment: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (u: Partial<FormData>) => setForm((p) => ({ ...p, ...u }));

  function toggleMulti(field: "priorities" | "aiTools", value: string) {
    setForm((p) => ({ ...p, [field]: p[field].includes(value) ? p[field].filter((v) => v !== value) : [...p[field], value] }));
  }

  function updateRole(i: number, key: string, value: string) {
    setForm((p) => { const r = [...p.previousRoles]; r[i] = { ...r[i], [key]: value }; return { ...p, previousRoles: r }; });
  }

  function canAdvance() {
    if (stage === 1) return !!(form.currentRole && form.companyType && form.industry);
    if (stage === 2) return !!form.totalYearsExperience;
    if (stage === 3) return !!(form.targetRole && form.timeline);
    if (stage === 4) return !!form.skills;
    if (stage === 5) return !!(form.aiLevel && form.aiSentiment);
    return false;
  }

  async function handleFinish() {
    setIsSubmitting(true); setError("");
    const wh = form.previousRoles.filter((r) => r.title).map((r) => `${r.title} at ${r.org || "?"} (${r.years || "?"} yrs)`).join(", ");
    const summary = `I am a ${form.currentRole} (${form.yearsInRole || "?"} yrs in role) at a ${form.companyType} in ${form.industry}. Total experience: ${form.totalYearsExperience} years. Prior roles: ${wh || "none"}. Goal: ${form.targetRole}${form.targetIndustry ? ` in ${form.targetIndustry}` : ""} within ${form.timeline}. Priorities: ${form.priorities.join(", ") || "not specified"}. Skills: ${form.skills}. Proficiency: ${form.proficiency || "not specified"}. AI level: ${form.aiLevel}. Tools: ${form.aiTools.join(", ") || "none"}. Org adoption: ${form.companyAdopting || "unknown"}. Sentiment: ${form.aiSentiment}.`;
    try {
      const cr = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: summary, conversationHistory: [], marketCode: "US" }) });
      const cd = await cr.json();
      const history = [
        { role: "user", content: summary, timestamp: new Date().toISOString() },
        { role: "assistant", content: cd.message, agentId: "onboarding", timestamp: new Date().toISOString() },
      ];
      const sr = await fetch("/api/snapshot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationHistory: history }) });
      const snapshot = await sr.json();
      localStorage.setItem("legacyforward_snapshot", JSON.stringify(snapshot));
      localStorage.setItem("legacyforward_onboarding", JSON.stringify({ messages: history, stage: 5, complete: true, updatedAt: new Date().toISOString() }));
      router.push("/app/dashboard");
    } catch { setError("Something went wrong. Please try again."); setIsSubmitting(false); }
  }

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";
  const sel = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";
  const chip = (on: boolean) => `px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition ${on ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`;
  const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="flex h-full bg-white">
      {/* Progress sidebar */}
      <div className="hidden md:flex w-60 flex-col bg-navy-900 border-r border-navy-800 p-6 shrink-0">
        <div className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold mb-1">Career Navigator</div>
        <div className="text-base font-bold text-white mb-6">Your First Session</div>
        <div className="flex flex-col">
          {STAGES.map((s) => (
            <div key={s.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${s.id < stage ? "bg-emerald-500 text-white" : s.id === stage ? "bg-teal-500 text-white" : "bg-navy-800 text-slate-500 border border-navy-700"}`}>
                  {s.id < stage ? "✓" : s.id}
                </div>
                {s.id < STAGES.length && <div className={`w-px flex-1 min-h-[20px] ${s.id < stage ? "bg-emerald-500/50" : "bg-navy-700"}`} />}
              </div>
              <div className="pb-5">
                <span className={`text-xs leading-6 ${s.id === stage ? "text-teal-400 font-semibold" : s.id < stage ? "text-emerald-400" : "text-slate-500"}`}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-navy-800 rounded-lg border border-navy-700">
          <div className="text-[10px] font-semibold text-amber-400 mb-1">Tip</div>
          <div className="text-[11px] text-slate-400 leading-relaxed">The more you share, the more personalized your roadmap and Career Book will be.</div>
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile progress bar */}
        <div className="md:hidden px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600">Step {stage} of {STAGES.length}</span>
            <span className="text-xs text-teal-600 font-semibold">{STAGES[stage - 1].label}</span>
          </div>
          <div className="h-1 bg-slate-200 rounded"><div className="h-full bg-teal-500 rounded transition-all" style={{ width: `${(stage / STAGES.length) * 100}%` }} /></div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-1">Step {stage} of {STAGES.length}</div>
              <h1 className="text-2xl font-bold text-slate-900">{STAGES[stage - 1].label}</h1>
            </div>

            {stage === 1 && (
              <div className="space-y-4">
                <div><label className={lbl}>Current Role / Title <span className="text-rose-400">*</span></label><input className={inp} placeholder="e.g. Senior Enterprise Architect" value={form.currentRole} onChange={(e) => set({ currentRole: e.target.value })} /></div>
                <div><label className={lbl}>Organization Type <span className="text-rose-400">*</span></label>
                  <select className={sel} value={form.companyType} onChange={(e) => set({ companyType: e.target.value })}>
                    <option value="">Select type...</option>
                    <option>Federal Government</option><option>State / Local Government</option>
                    <option>Large Enterprise (1000+ employees)</option><option>Mid-size Company (100–999)</option>
                    <option>Startup (&lt;100)</option><option>Non-profit</option><option>Consulting / Agency</option>
                  </select>
                </div>
                <div><label className={lbl}>Industry <span className="text-rose-400">*</span></label><input className={inp} placeholder="e.g. Defense, Financial Services, Healthcare IT" value={form.industry} onChange={(e) => set({ industry: e.target.value })} /></div>
                <div><label className={lbl}>Years in Current Role</label><input className={inp} type="number" min="0" placeholder="e.g. 3" value={form.yearsInRole} onChange={(e) => set({ yearsInRole: e.target.value })} /></div>
              </div>
            )}

            {stage === 2 && (
              <div className="space-y-5">
                <div><label className={lbl}>Total Years of Professional Experience <span className="text-rose-400">*</span></label><input className={inp} type="number" min="0" placeholder="e.g. 18" value={form.totalYearsExperience} onChange={(e) => set({ totalYearsExperience: e.target.value })} /></div>
                <div>
                  <label className={lbl}>Previous Roles</label>
                  <div className="space-y-3">
                    {form.previousRoles.map((role, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input className={inp} placeholder="Title" value={role.title} onChange={(e) => updateRole(i, "title", e.target.value)} />
                          <input className={inp} placeholder="Org" value={role.org} onChange={(e) => updateRole(i, "org", e.target.value)} />
                          <input className={inp} type="number" min="0" placeholder="Yrs" value={role.years} onChange={(e) => updateRole(i, "years", e.target.value)} />
                        </div>
                        {form.previousRoles.length > 1 && <button onClick={() => setForm((p) => ({ ...p, previousRoles: p.previousRoles.filter((_, j) => j !== i) }))} className="text-slate-400 hover:text-rose-400 transition mt-2.5 text-lg leading-none">×</button>}
                      </div>
                    ))}
                  </div>
                  {form.previousRoles.length < 5 && <button onClick={() => setForm((p) => ({ ...p, previousRoles: [...p.previousRoles, { title: "", org: "", years: "" }] }))} className="mt-2 text-xs text-teal-600 font-semibold hover:underline">+ Add another role</button>}
                </div>
              </div>
            )}

            {stage === 3 && (
              <div className="space-y-4">
                <div><label className={lbl}>Target Role / Title <span className="text-rose-400">*</span></label><input className={inp} placeholder="e.g. Chief AI Officer, AI Product Manager" value={form.targetRole} onChange={(e) => set({ targetRole: e.target.value })} /></div>
                <div><label className={lbl}>Target Industry (optional)</label><input className={inp} placeholder="e.g. Private Sector Tech, Healthcare" value={form.targetIndustry} onChange={(e) => set({ targetIndustry: e.target.value })} /></div>
                <div><label className={lbl}>Timeline <span className="text-rose-400">*</span></label>
                  <select className={sel} value={form.timeline} onChange={(e) => set({ timeline: e.target.value })}>
                    <option value="">Select timeline...</option>
                    <option>Within 6 months</option><option>6–12 months</option><option>1–2 years</option><option>2+ years</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Top Priorities (select all that apply)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["Higher salary", "Better title", "Work-life balance", "More impact", "New skills", "Remote work", "Leadership role"].map((p) => (
                      <button key={p} type="button" onClick={() => toggleMulti("priorities", p)} className={chip(form.priorities.includes(p))}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stage === 4 && (
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Your Key Skills <span className="text-rose-400">*</span></label>
                  <p className="text-xs text-slate-400 mb-2">Enter skills separated by commas</p>
                  <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-400 transition resize-none" rows={3} placeholder="e.g. Enterprise Architecture, Cloud Strategy, Stakeholder Management, Python, AI/ML" value={form.skills} onChange={(e) => set({ skills: e.target.value })} />
                </div>
                <div><label className={lbl}>Overall Technical Proficiency</label>
                  <select className={sel} value={form.proficiency} onChange={(e) => set({ proficiency: e.target.value })}>
                    <option value="">Select level...</option>
                    <option>Beginner — mostly soft skills and domain knowledge</option>
                    <option>Intermediate — comfortable with tools and some coding</option>
                    <option>Advanced — strong technical depth, can build solutions</option>
                    <option>Expert — deep technical specialist</option>
                  </select>
                </div>
              </div>
            )}

            {stage === 5 && (
              <div className="space-y-4">
                <div><label className={lbl}>Your AI Awareness Level <span className="text-rose-400">*</span></label>
                  <select className={sel} value={form.aiLevel} onChange={(e) => set({ aiLevel: e.target.value })}>
                    <option value="">Select level...</option>
                    <option>Aware — I know AI exists and is impactful</option>
                    <option>Experimenting — I use AI tools occasionally</option>
                    <option>Practitioner — I use AI tools regularly in my work</option>
                    <option>Builder — I design or implement AI solutions</option>
                    <option>Leader — I set AI strategy for my org</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>AI Tools You Use (select all that apply)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["ChatGPT", "Claude", "Copilot", "Gemini", "Midjourney", "Perplexity", "Custom GPTs", "None yet"].map((t) => (
                      <button key={t} type="button" onClick={() => toggleMulti("aiTools", t)} className={chip(form.aiTools.includes(t))}>{t}</button>
                    ))}
                  </div>
                </div>
                <div><label className={lbl}>Is your organization actively adopting AI?</label>
                  <select className={sel} value={form.companyAdopting} onChange={(e) => set({ companyAdopting: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Yes, aggressively</option><option>Yes, cautiously</option><option>Exploring / pilot phase</option><option>Not yet</option><option>Resistant / restricted</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>How do you feel about AI&apos;s impact on your career? <span className="text-rose-400">*</span></label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["Excited — huge opportunity", "Optimistic — net positive", "Cautious — watching closely", "Concerned — worried about displacement", "Overwhelmed — not sure where to start"].map((s) => (
                      <button key={s} type="button" onClick={() => set({ aiSentiment: s })} className={chip(form.aiSentiment === s)}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600">{error}</div>}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <button onClick={() => setStage((s) => Math.max(1, s - 1))} disabled={stage === 1} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed">← Back</button>
          <div className="flex items-center gap-1.5">
            {STAGES.map((s) => <div key={s.id} className={`w-1.5 h-1.5 rounded-full transition-colors ${s.id === stage ? "bg-teal-500" : s.id < stage ? "bg-emerald-400" : "bg-slate-200"}`} />)}
          </div>
          {stage < STAGES.length ? (
            <button onClick={() => setStage((s) => s + 1)} disabled={!canAdvance()} className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
          ) : (
            <button onClick={handleFinish} disabled={!canAdvance() || isSubmitting} className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
              {isSubmitting ? "Building your profile..." : "Finish →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
