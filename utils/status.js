// /utils/status.js

// Admin statuses coming directly from backend DB (UPPERCASE)
export const ADMIN_STATUS = Object.freeze({
  DEPARTURE: "DEPARTURE",
  CONFIRMED: "CONFIRMED",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  MAINTENANCE: "MAINTENANCE",
  CLEANING: "CLEANING",
});

// UI statuses used inside frontend
export const STATUS = Object.freeze({
  INACTIVE: "INACTIVE",     // no dates selected
  AVAILABLE: "AVAILABLE",   // green
  OCCUPIED: "OCCUPIED",     // red
  CLEANING: "CLEANING",     // blue
  PENDING: "PENDING",       // yellow
  MAINTENANCE: "MAINTENANCE"// purple
});

// UI colors/labels (now includes `card` background tint)
export const STATUS_META = Object.freeze({
  [STATUS.AVAILABLE]:   { label: "Vacant",             ring: "ring-emerald-500/40", chip: "bg-emerald-600/90",  card: "bg-emerald-500/10" },
  [STATUS.OCCUPIED]:    { label: "Occupied",           ring: "ring-red-500/40",     chip: "bg-red-600/90",      card: "bg-rose-500/10" },
  [STATUS.PENDING]:     { label: "Pending",            ring: "ring-amber-500/40",   chip: "bg-amber-500/90",    card: "bg-amber-500/10" },
  [STATUS.MAINTENANCE]: { label: "Under maintenance",  ring: "ring-violet-500/40",  chip: "bg-violet-500/90",   card: "bg-violet-500/10" },
  [STATUS.CLEANING]:    { label: "Cleaning",           ring: "ring-sky-500/40",     chip: "bg-sky-500/90",      card: "bg-sky-500/10" },
  [STATUS.INACTIVE]:    { label: "Unavailable",        ring: "ring-slate-500/30",   chip: "bg-slate-500/80",    card: "bg-white/5" }
});

// Admin → UI rules + explicit chip message per status
export const ADMIN_TO_UI = Object.freeze({
  [ADMIN_STATUS.DEPARTURE]:   { uiStatus: STATUS.AVAILABLE,   message: "Vacant" },
  [ADMIN_STATUS.CONFIRMED]:   { uiStatus: STATUS.OCCUPIED,    message: "Occupied" },
  [ADMIN_STATUS.PENDING]:     { uiStatus: STATUS.PENDING,     message: "Pending" },
  [ADMIN_STATUS.CANCELLED]:   { uiStatus: STATUS.AVAILABLE,   message: "Available" },
  [ADMIN_STATUS.MAINTENANCE]: { uiStatus: STATUS.MAINTENANCE, message: "Under maintenance" },
  [ADMIN_STATUS.CLEANING]:    { uiStatus: STATUS.CLEANING,    message: "Cleaning" }
});

// Centralized bookability
const BOOKABLE_BY_STATUS = Object.freeze({
  [STATUS.AVAILABLE]: true,
  [STATUS.INACTIVE]: false,
  [STATUS.OCCUPIED]: false,
  [STATUS.PENDING]: false,
  [STATUS.MAINTENANCE]: false,
  [STATUS.CLEANING]: false
});

export const isBookable = (s) => !!BOOKABLE_BY_STATUS[s];

// Normalize backend strings to ADMIN_STATUS (handles variants)
// Replace your existing normalizeAdmin with this:
export const normalizeAdmin = (s = "") => {
  const n = String(s).trim().toUpperCase();
  if (!n) return null;

  // PENDING variants (broad catch)
  if (n === "PENDING") return ADMIN_STATUS.PENDING;
  if (n.includes("PEND")) return ADMIN_STATUS.PENDING;     // "Pending", "Pending Payment"
  if (n.includes("AWAIT")) return ADMIN_STATUS.PENDING;    // "Awaiting Approval/Payment"
  if (n.includes("UNPAID")) return ADMIN_STATUS.PENDING;   // "Unpaid"
  if (n.includes("HOLD")) return ADMIN_STATUS.PENDING;     // "On Hold"

  if (n.startsWith("DEPARTURE")) return ADMIN_STATUS.DEPARTURE;
  if (n.startsWith("CONFIRMED")) return ADMIN_STATUS.CONFIRMED;
  if (n.includes("MAINTENANCE")) return ADMIN_STATUS.MAINTENANCE;
  if (n.startsWith("CLEAN")) return ADMIN_STATUS.CLEANING;
  if (n.startsWith("CANCEL")) return ADMIN_STATUS.CANCELLED; // CANCEL/CANCELED/CANCELLED

  return null;
};


// Given uiStatus + admin status, return visuals with label override
export const getUiPresentation = (uiStatus, adminNorm = null) => {
  const base = STATUS_META[uiStatus] || STATUS_META[STATUS.INACTIVE];
  const override = adminNorm && ADMIN_TO_UI[adminNorm] ? ADMIN_TO_UI[adminNorm].message : null;
  return { ...base, label: override || base.label };
};
