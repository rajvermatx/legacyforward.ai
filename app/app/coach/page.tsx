"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/app/Sidebar";
import MobileNav from "@/components/app/MobileNav";
import FeatureIntro from "@/components/app/FeatureIntro";
import type { ChatMessage } from "@/lib/app-types";

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(null);
  const [caiiReport, setCaiiReport] = useState<Record<string, unknown> | null>(null);
  const [roadmap, setRoadmap] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = localStorage.getItem("legacyforward_snapshot");
    if (s) try { setSnapshot(JSON.parse(s)); } catch { /* */ }
    const c = localStorage.getItem("legacyforward_caii");
    if (c) try { setCaiiReport(JSON.parse(c)); } catch { /* */ }
    const r = localStorage.getItem("legacyforward_roadmap");
    if (r) try { setRoadmap(JSON.parse(r)); } catch { /* */ }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: history,
          snapshot,
          caiiReport,
          roadmap,
          marketCode: "US",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          agentId: "coach",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  const suggestions = [
    "What should I focus on this week?",
    "How do I position myself for a CX role?",
    "Is my career transition realistic?",
    "Help me prepare for an internal conversation",
  ];

  const caiiScore = caiiReport?.overallScore as number | undefined;
  const caiiColor = caiiScore
    ? caiiScore >= 60 ? "text-rose-500" : caiiScore >= 35 ? "text-amber-500" : "text-emerald-500"
    : "text-slate-300";

  return (
    <div className="h-screen flex bg-white">
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">CA</div>
          <div>
            <div className="text-sm font-semibold">Career Coach</div>
            <div className="text-[10px] text-emerald-500">● Online · GPT-4o-mini</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div style={{padding:"0 0 0 0"}}>
            <FeatureIntro
              id="coach"
              title="Your AI Career Coach Knows You"
              description="Unlike ChatGPT which gives generic advice, this coach has your full profile — your Career Snapshot, CAII score, roadmap progress, and achievements. Ask anything: how to negotiate a transition, what to learn next, how to talk to your manager. Every answer is specific to YOUR situation, not generic career tips."
              color="indigo"
            />
          </div>
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <h2 className="text-lg font-bold text-slate-700 mb-2">Your AI Career Coach</h2>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                I know your Career Snapshot, CAII score, and roadmap. Ask me anything about your career transition.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="px-3 py-2 border border-indigo-200 rounded-full text-xs text-indigo-600 hover:bg-indigo-50 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "gap-3"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">CA</div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-900 rounded-bl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">CA</div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask your career coach anything..."
              className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Context Sidebar (desktop) */}
      <div className="hidden lg:flex w-64 flex-col border-l border-slate-200 bg-slate-50 p-4 text-xs overflow-y-auto">
        <div className="font-bold text-slate-700 mb-3">Your Context</div>

        {/* Snapshot */}
        <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200">
          <div className="font-semibold text-slate-600 mb-1">Career Snapshot</div>
          {snapshot ? (
            <>
              <div className="text-slate-500">{(snapshot.currentRole as string) || "—"}</div>
              <div className="text-slate-400">{(snapshot.yearsExperience as number) || "?"} years exp</div>
              {(snapshot.aspirations as { targetRoles?: string[] })?.targetRoles?.[0] && (
                <div className="text-indigo-600 mt-1">→ {(snapshot.aspirations as { targetRoles: string[] }).targetRoles[0]}</div>
              )}
            </>
          ) : (
            <div className="text-slate-400">Complete onboarding first</div>
          )}
        </div>

        {/* CAII */}
        <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200">
          <div className="font-semibold text-slate-600 mb-1">CAII Score</div>
          {caiiScore ? (
            <div className={`text-2xl font-extrabold ${caiiColor}`}>{caiiScore}/100</div>
          ) : (
            <div className="text-slate-400">Not generated</div>
          )}
        </div>

        {/* Roadmap */}
        <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200">
          <div className="font-semibold text-slate-600 mb-1">Roadmap</div>
          {roadmap ? (
            <>
              <div className="h-1.5 bg-slate-100 rounded-full mb-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(roadmap.overallProgress as number) || 0}%` }} />
              </div>
              <div className="text-slate-500">{(roadmap.overallProgress as number) || 0}% · {(roadmap.estimatedMonths as number) || "?"} months</div>
            </>
          ) : (
            <div className="text-slate-400">Not generated</div>
          )}
        </div>

        {/* Suggestions */}
        <div className="font-semibold text-slate-500 mt-2 mb-2">Quick Questions</div>
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="w-full text-left px-2 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] text-indigo-600 hover:bg-indigo-50 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
