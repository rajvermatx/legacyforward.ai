"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({ text, children, position = "top" }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }, [show]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children || (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[9px] font-bold cursor-help hover:bg-indigo-100 hover:text-indigo-600 transition ml-1">
          ?
        </span>
      )}
      {show && (
        <span
          className={`absolute z-50 ${positionClasses[position]} px-3 py-2 bg-slate-900 text-white text-[11px] leading-relaxed rounded-lg shadow-lg max-w-[240px] w-max pointer-events-none`}
        >
          {text}
          <span
            className={`absolute w-2 h-2 bg-slate-900 rotate-45 ${
              position === "top" ? "top-full left-1/2 -translate-x-1/2 -mt-1" :
              position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 -mb-1" :
              position === "left" ? "left-full top-1/2 -translate-y-1/2 -ml-1" :
              "right-full top-1/2 -translate-y-1/2 -mr-1"
            }`}
          />
        </span>
      )}
    </span>
  );
}

// Convenience wrapper: inline label with tooltip
export function InfoLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {label}
      <Tooltip text={tooltip} />
    </span>
  );
}
