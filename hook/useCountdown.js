// /hooks/useCountdown.js
"use client";
import { useEffect, useMemo, useState } from "react";

export default function useCountdown(initialMs, active) {
  const normalized = useMemo(() => {
    if (initialMs == null) return 0;
    return initialMs < 10_000 ? initialMs * 1000 : initialMs;
  }, [initialMs]);

  const [ms, setMs] = useState(normalized);

  useEffect(() => setMs(normalized), [normalized]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setMs((p) => (p > 0 ? p - 1000 : 0)), 1000);
    return () => clearInterval(id);
  }, [active]);

  return ms;
}
