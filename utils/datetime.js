// /utils/datetime.js
import dayjs from "dayjs";

export function formatMsLeft(ms) {
  if (ms == null || isNaN(ms)) return "—";
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  let r = total % 86400;
  const h = Math.floor(r / 3600); r %= 3600;
  const m = Math.floor(r / 60);
  const s = r % 60;
  const p2 = (n) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${p2(h)}:${p2(m)}` : `${p2(h)}:${p2(m)}:${p2(s)}`;
}

// Accepts "YYYY-MM-DD HH:mm[:ss]" or ISO, returns "YYYY-MM-DD HH:mm"
export function fmtSqlDateTime(ts) {
  if (!ts) return "";
  const s = typeof ts === "string" && !ts.includes("T") ? ts.replace(" ", "T") : ts;
  const d = dayjs(s);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : String(ts);
}

// Robust parser -> ms (0 if invalid)
export function parseToMs(ts) {
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const isoish = ts.includes("T") ? ts : ts.replace(" ", "T");
    const ms = Date.parse(isoish);
    if (!Number.isNaN(ms)) return ms;
    const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, y, mo, d, h, mi, s = "0"] = m;
      return new Date(+y, +mo - 1, +d, +h, +mi, +s).getTime();
    }
  }
  return 0;
}
