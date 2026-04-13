"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

function TextToSpeechInner() {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef<string>("");

  useEffect(() => {
    if ("speechSynthesis" in window) {
      // Pre-load voices (required on Android Chrome and iOS Safari)
      const load = () => window.speechSynthesis.getVoices();
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => {
      window.speechSynthesis?.cancel();
      stopKeepAlive();
    };
  }, []);

  if (!("speechSynthesis" in window)) return null;

  function startKeepAlive() {
    stopKeepAlive();
    // Chrome/Android bug: speechSynthesis stops after ~15s
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  function stopKeepAlive() {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }

  function buildUtterance(text: string) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    u.pitch = 1;
    u.volume = 1;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find(v => v.lang.startsWith("en") && !v.name.includes("Google"));
    if (en) u.voice = en;

    u.onstart = () => { setState("playing"); startKeepAlive(); };
    u.onend = () => { setState("idle"); stopKeepAlive(); };
    u.onerror = (e) => {
      if (e.error === "interrupted") return;
      setState("idle");
      stopKeepAlive();
    };
    return u;
  }

  function getText() {
    const el = document.querySelector(".prose") ?? document.querySelector("main");
    return el?.textContent?.trim() ?? "";
  }

  function play() {
    const text = getText();
    if (!text) return;
    textRef.current = text;

    window.speechSynthesis.cancel();
    setState("playing");
    startKeepAlive();

    // Small delay after cancel() lets Android reset cleanly
    setTimeout(() => {
      const u = buildUtterance(textRef.current);
      window.speechSynthesis.speak(u);
    }, 50);
  }

  function pause() {
    window.speechSynthesis.pause();
    stopKeepAlive();
    setState("paused");
  }

  function resume() {
    window.speechSynthesis.resume();
    startKeepAlive();
    setState("playing");
  }

  function stop() {
    window.speechSynthesis.cancel();
    stopKeepAlive();
    setState("idle");
  }

  return (
    <div className="flex items-center gap-3 mb-6 p-3 rounded-lg border border-slate-200 bg-slate-50 w-full">
      <div className="flex items-center gap-2 flex-1">
        <svg className="w-5 h-5 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <span className="text-sm font-medium text-slate-700">
          {state === "idle" ? "Listen to this article" : state === "playing" ? "Playing..." : "Paused"}
        </span>
      </div>

      {state !== "playing" && (
        <button onClick={state === "paused" ? resume : play}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-md transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          {state === "paused" ? "Resume" : "Play"}
        </button>
      )}
      {state === "playing" && (
        <button onClick={pause}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-md transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          Pause
        </button>
      )}
      {state !== "idle" && (
        <button onClick={stop}
          className="px-3 py-1.5 border border-slate-300 hover:border-slate-400 text-slate-600 text-sm font-semibold rounded-md transition-colors">
          Stop
        </button>
      )}
    </div>
  );
}

// Export as a dynamic component with SSR disabled so it never runs on the server.
// This eliminates the hydration mismatch from the mounted/window check.
export default dynamic(() => Promise.resolve(TextToSpeechInner), { ssr: false });
