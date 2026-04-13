"use client";

import { useState, useEffect } from "react";

interface AppDataStatus {
  hasSnapshot: boolean;
  hasCAII: boolean;
  hasRoadmap: boolean;
  hasBook: boolean;
  winsCount: number;
}

export function useAppDataStatus(): AppDataStatus {
  const [status, setStatus] = useState<AppDataStatus>({
    hasSnapshot: false,
    hasCAII: false,
    hasRoadmap: false,
    hasBook: false,
    winsCount: 0,
  });

  useEffect(() => {
    try {
      const snapshot = localStorage.getItem("legacyforward_snapshot");
      const caii = localStorage.getItem("legacyforward_caii");
      const roadmap = localStorage.getItem("legacyforward_roadmap");
      const book = localStorage.getItem("legacyforward_book");
      const wins = localStorage.getItem("legacyforward_wins");

      let winsCount = 0;
      if (wins) {
        try {
          const parsed = JSON.parse(wins);
          winsCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch { /* ignore */ }
      }

      setStatus({
        hasSnapshot: !!snapshot,
        hasCAII: !!caii,
        hasRoadmap: !!roadmap,
        hasBook: !!book,
        winsCount,
      });
    } catch { /* localStorage not available */ }
  }, []);

  return status;
}
