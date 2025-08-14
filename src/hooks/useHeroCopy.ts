// src/hooks/useHeroCopy.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { HERO_HEADLINES, HERO_SUBLINES } from "@/content/heroMessages";

type PersistMode = "session" | "day" | "none";

const KEY = "ganhavel.hero.idx";

// Deterministic daily index (same for everyone each day)
function dailyIndex(max: number) {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seed = Number(ymd);
  return seed % Math.max(1, max);
}

export function useHeroCopy(opts?: { autoRotateMs?: number; persist?: PersistMode }) {
  const { autoRotateMs, persist = "session" } = opts || {};
  const max = Math.min(HERO_HEADLINES.length, HERO_SUBLINES.length);

  const initialIdx = useMemo(() => {
    try {
      if (persist === "session") {
        const s = sessionStorage.getItem(KEY);
        if (s !== null) return Number(s) % max;
      }
      if (persist === "day") return dailyIndex(max);
    } catch {}
    return Math.floor(Math.random() * max);
  }, [persist, max]);

  const [idx, setIdx] = useState(initialIdx);
  const timerRef = useRef<number | null>(null);

  // Persist choice for this session
  useEffect(() => {
    if (persist === "session") {
      try { sessionStorage.setItem(KEY, String(idx)); } catch {}
    }
  }, [idx, persist]);

  // Auto-rotate (optional)
  useEffect(() => {
    if (!autoRotateMs) return;
    if (autoRotateMs < 3000) console.warn("autoRotateMs too small; use >= 3000ms for readability.");
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % max);
    }, autoRotateMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRotateMs, max]);

  return {
    idx,
    headline: HERO_HEADLINES[idx % max],
    subline: HERO_SUBLINES[idx % max],
    next: () => setIdx((i) => (i + 1) % max),
    prev: () => setIdx((i) => (i - 1 + max) % max),
  };
}