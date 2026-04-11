"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchEntry {
  title: string;
  slug: string;
  section: string;
  description: string;
  href: string;
  tags?: string[];
}

type Category = "Toolkit" | "Learning Paths" | "Books" | "Quick Reference" | "Framework" | "Pages";

function categorize(href: string): Category {
  if (href.startsWith("/library/toolkit")) return "Toolkit";
  if (href.startsWith("/library/learn")) return "Learning Paths";
  if (href.startsWith("/library/books")) return "Books";
  if (href.startsWith("/library/cheatsheets")) return "Quick Reference";
  if (href.startsWith("/framework")) return "Framework";
  return "Pages";
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open && !index) {
      fetch("/search-index.json")
        .then((r) => r.json())
        .then((data: SearchEntry[]) => setIndex(data))
        .catch(() => setIndex([]));
    }
  }, [open, index]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    function onOpenSearch() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-search", onOpenSearch);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-search", onOpenSearch);
    };
  }, []);

  const filtered = useCallback(() => {
    if (!index || !query.trim()) return [];
    const q = query.toLowerCase();
    return index
      .filter((entry) => {
        const haystack = [entry.title, entry.description, ...(entry.tags || [])]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 20);
  }, [index, query]);

  const results = filtered();

  const grouped: { category: Category; items: SearchEntry[] }[] = [];
  const categoryOrder: Category[] = ["Framework", "Toolkit", "Learning Paths", "Books", "Quick Reference", "Pages"];
  for (const cat of categoryOrder) {
    const items = results.filter((r) => categorize(r.href) === cat);
    if (items.length > 0) grouped.push({ category: cat, items });
  }

  const flatResults = grouped.flatMap((g) => g.items);

  function navigate(entry: SearchEntry) {
    router.push(entry.href);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatResults[activeIndex]) {
      e.preventDefault();
      navigate(flatResults[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "min(20vh, 160px)",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          maxWidth: 620,
          margin: "0 16px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all content..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 18,
              color: "#0f172a",
              fontFamily: "inherit",
            }}
          />
          <kbd
            style={{
              fontSize: 12,
              padding: "2px 8px",
              borderRadius: 6,
              background: "#f8fafc",
              color: "#94a3b8",
              border: "1px solid #e2e8f0",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 400, overflowY: "auto", padding: "8px 0" }}>
          {!query.trim() && (
            <p style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              Type to search across all content
            </p>
          )}

          {query.trim() && flatResults.length === 0 && (
            <p style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              No results found
            </p>
          )}

          {grouped.map((group) => {
            let runningIdx = 0;
            for (const g of grouped) {
              if (g === group) break;
              runningIdx += g.items.length;
            }

            return (
              <div key={group.category}>
                <div
                  style={{
                    padding: "8px 20px 4px",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#94a3b8",
                  }}
                >
                  {group.category}
                </div>
                {group.items.map((item, i) => {
                  const flatIdx = runningIdx + i;
                  const isActive = flatIdx === activeIndex;
                  return (
                    <button
                      key={item.href}
                      data-active={isActive}
                      onClick={() => navigate(item)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        cursor: "pointer",
                        padding: "10px 20px",
                        background: isActive ? "rgba(20, 184, 166, 0.08)" : "transparent",
                        borderLeft: isActive ? "3px solid #14b8a6" : "3px solid transparent",
                        fontFamily: "inherit",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: isActive ? "#0d9488" : "#0f172a",
                        }}
                      >
                        {item.title}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginTop: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.description.length > 100
                            ? item.description.slice(0, 100) + "..."
                            : item.description}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
