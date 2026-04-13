"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/app-types";

const STAGES = [
  { id: 1, label: "Tell me about yourself" },
  { id: 2, label: "Your experience" },
  { id: 3, label: "Where do you want to go?" },
  { id: 4, label: "Your skills" },
  { id: 5, label: "AI readiness" },
];

export default function OnboardingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved conversation or start fresh
  useEffect(() => {
    const saved = localStorage.getItem("legacyforward_onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.messages?.length > 0) {
          setMessages(data.messages);
          setCurrentStage(data.stage || 1);
          if (data.complete) setIsComplete(true);
          return;
        }
      } catch { /* start fresh */ }
    }

    // Fresh start
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I'm your LegacyForward.ai coach. I'm here to learn about you and build your personalized Career Snapshot. This will take about 10 minutes and feel like a conversation, not a form.\n\nLet's start — can you tell me about your current role, the type of company you work for, and how long you've been in this position?",
        agentId: "onboarding",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: updatedHistory,
          marketCode: "US",
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.message.replace("[ONBOARDING_COMPLETE]", "").trim(),
        agentId: "onboarding",
        timestamp: new Date().toISOString(),
      };

      const allMessages = [...updatedHistory, assistantMsg];
      setMessages(allMessages);

      // Advance stage estimate based on message count
      const userMsgCount = allMessages.filter(m => m.role === "user").length;
      let newStage = 1;
      if (userMsgCount > 8) newStage = 5;
      else if (userMsgCount > 6) newStage = 4;
      else if (userMsgCount > 4) newStage = 3;
      else if (userMsgCount > 2) newStage = 2;
      setCurrentStage(newStage);

      // Save conversation to localStorage after every exchange
      localStorage.setItem("legacyforward_onboarding", JSON.stringify({
        messages: allMessages,
        stage: newStage,
        complete: data.isComplete,
        updatedAt: new Date().toISOString(),
      }));

      if (data.isComplete) {
        setIsComplete(true);
        // Extract and save Career Snapshot
        try {
          const snapshotRes = await fetch("/api/snapshot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationHistory: allMessages }),
          });
          const snapshot = await snapshotRes.json();
          localStorage.setItem("legacyforward_snapshot", JSON.stringify(snapshot));
        } catch {
          // snapshot extraction failed, user can still proceed
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Progress */}
      <div className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-slate-50 p-6">
        <div className="text-lg font-bold text-teal-600 mb-6">
          LegacyForward.ai
        </div>
        <div className="text-sm font-semibold text-slate-700 mb-4">
          Your First Session
        </div>
        <div className="flex flex-col gap-1">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    stage.id < currentStage
                      ? "bg-emerald-500 text-white"
                      : stage.id === currentStage
                      ? "bg-teal-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {stage.id < currentStage ? "✓" : stage.id}
                </div>
                {stage.id < 5 && (
                  <div
                    className={`w-0.5 h-4 ${
                      stage.id < currentStage
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs ${
                  stage.id === currentStage
                    ? "text-teal-600 font-semibold"
                    : stage.id < currentStage
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-3">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-xs font-semibold text-amber-600">Tip</div>
            <div className="text-xs text-slate-700 mt-1">
              The more you share, the more personalized your Career Book will be!
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={() => {
                localStorage.removeItem("legacyforward_onboarding");
                window.location.reload();
              }}
              className="w-full text-xs text-slate-400 hover:text-rose-500 transition py-1"
            >
              Start over
            </button>
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Your First Session</span>
            <span className="text-xs text-teal-600 font-semibold">
              Step {currentStage} of 5
            </span>
          </div>
          <div className="h-1 bg-slate-100 rounded">
            <div
              className="h-full bg-teal-600 rounded transition-all"
              style={{ width: `${(currentStage / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "gap-3"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    CA
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-900 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                CA
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Complete banner */}
        {isComplete && (
          <div className="mx-4 mb-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <div className="text-sm font-semibold text-emerald-700">
              Onboarding Complete!
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Your Career Snapshot has been created.
            </p>
            <a
              href="/app/dashboard"
              className="inline-block mt-3 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition"
            >
              Go to Dashboard →
            </a>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder={
                isComplete
                  ? "Onboarding complete! Head to your dashboard."
                  : "Type your response..."
              }
              disabled={isComplete || isLoading}
              className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isComplete || isLoading}
              className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
