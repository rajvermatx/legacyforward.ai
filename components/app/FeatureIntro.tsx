"use client";

import { useState, useEffect } from "react";

interface FeatureIntroProps {
  id: string; // unique key for localStorage, e.g. "dashboard", "caii"
  title: string;
  description: string;
  color?: "indigo" | "rose" | "amber" | "emerald" | "purple" | "teal";
}

const COLORS = {
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", title: "text-indigo-700", text: "text-indigo-900", icon: "text-indigo-400", btn: "text-indigo-600 hover:text-indigo-800" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", title: "text-rose-700", text: "text-rose-900", icon: "text-rose-400", btn: "text-rose-600 hover:text-rose-800" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-700", text: "text-amber-900", icon: "text-amber-400", btn: "text-amber-600 hover:text-amber-800" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-700", text: "text-emerald-900", icon: "text-emerald-400", btn: "text-emerald-600 hover:text-emerald-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", title: "text-purple-700", text: "text-purple-900", icon: "text-purple-400", btn: "text-purple-600 hover:text-purple-800" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", title: "text-teal-700", text: "text-teal-900", icon: "text-teal-400", btn: "text-teal-600 hover:text-teal-800" },
};

export default function FeatureIntro({ id, title, description, color = "indigo" }: FeatureIntroProps) {
  const [dismissed, setDismissed] = useState(true); // hidden by default to prevent flash

  useEffect(() => {
    const key = `legacyforward_intro_${id}`;
    setDismissed(localStorage.getItem(key) === "dismissed");
  }, [id]);

  function dismiss() {
    localStorage.setItem(`legacyforward_intro_${id}`, "dismissed");
    setDismissed(true);
  }

  if (dismissed) return null;

  const c = COLORS[color];

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 mb-6 relative`}>
      <div className="flex gap-3">
        <div className={`text-lg ${c.icon} mt-0.5`}>💡</div>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${c.title} mb-1`}>{title}</div>
          <p className={`text-xs ${c.text} leading-relaxed opacity-80`}>{description}</p>
        </div>
        <button
          onClick={dismiss}
          className={`text-xs font-semibold ${c.btn} whitespace-nowrap self-start`}
        >
          Got it ✕
        </button>
      </div>
    </div>
  );
}
