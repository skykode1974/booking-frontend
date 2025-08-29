// /utils/status.js

// Raw admin statuses (normalized from backend strings)
export const ADMIN_STATUS = {
  DEPARTURE: "DEPARTURE",
  CONFIRMED: "CONFIRMED",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  MAINTENANCE: "MAINTENANCE",
  CLEANING: "CLEANING",
  ONLINE_HOLD: "ONLINE_HOLD", // ← awaiting confirmation (online)
};

// UI statuses used inside frontend
export const STATUS = {
  INACTIVE: "INACTIVE",         // no dates selected
  AVAILABLE: "AVAILABLE",       // green
  OCCUPIED: "OCCUPIED",         // red
  CLEANING: "CLEANING",         // sky-blue
  PENDING: "PENDING",           // yellow (back-office pending)
  MAINTENANCE: "MAINTENANCE",   // purple
  ONLINE_HOLD: "ONLINE_HOLD",   // blue (awaiting confirmation)
};

// Visuals
export const STATUS_META = {
  [STATUS.AVAILABLE]:   { label: "Vacant",                 ring: "ring-emerald-500/40", chip: "bg-emerald-600/90",  card: "bg-white/5" },
  [STATUS.OCCUPIED]:    { label: "Occupied",               ring: "ring-red-500/40",     chip: "bg-red-600/90",     card: "bg-white/5" },
  [STATUS.PENDING]:     { label: "Pending",                ring: "ring-amber-500/40",   chip: "bg-amber-500/90",   card: "bg-white/5" },
  [STATUS.MAINTENANCE]: { label: "Under maintenance",      ring: "ring-violet-500/40",  chip: "bg-violet-500/90",  card: "bg-white/5" },
  [STATUS.CLEANING]:    { label: "Cleaning",               ring: "ring-sky-500/40",     chip: "bg-sky-500/90",     card: "bg-white/5" },
  [STATUS.ONLINE_HOLD]: { label: "Awaiting confirmation",  ring: "ring-blue-500/40",    chip: "bg-blue-600/90",    card: "bg-white/5" },
  [STATUS.INACTIVE]:    { label: "Unavailable",            ring: "ring-slate-500/30",   chip: "bg-slate-500/80",   card: "bg-white/5" },
};

// Mapping Admin → UI (front-end behavior)
export const ADMIN_TO_UI = {
  [ADMIN_STATUS.DEPARTURE]:   { uiStatus: STATUS.AVAILABLE,    message: "Vacant" },
  [ADMIN_STATUS.CONFIRMED]:   { uiStatus: STATUS.OCCUPIED,     message: "Occupied" },
  [ADMIN_STATUS.PENDING]:     { uiStatus: STATUS.PENDING,      message: "Pending" },
  [ADMIN_STATUS.CANCELLED]:   { uiStatus: STATUS.AVAILABLE,    message: "Available" },
  [ADMIN_STATUS.MAINTENANCE]: { uiStatus: STATUS.MAINTENANCE,  message: "Under maintenance" },
  [ADMIN_STATUS.CLEANING]:    { uiStatus: STATUS.CLEANING,     message: "Cleaning" },
  [ADMIN_STATUS.ONLINE_HOLD]: { uiStatus: STATUS.ONLINE_HOLD,  message: "Awaiting confirmation" },
};

// Normalize any backend strings to ADMIN_STATUS (handles variants)
export const normalizeAdmin = (s = "") => {
  const n = String(s).trim().toUpperCase();
  if (n.startsWith("DEPARTURE")) return ADMIN_STATUS.DEPARTURE;
  if (n.startsWith("CONFIRMED")) return ADMIN_STATUS.CONFIRMED;
  if (n.startsWith("PENDING")) return ADMIN_STATUS.PENDING;
  if (n.startsWith("CANCEL")) return ADMIN_STATUS.CANCELLED;
  if (n.includes("MAINTENANCE")) return ADMIN_STATUS.MAINTENANCE;
  if (n.startsWith("CLEAN")) return ADMIN_STATUS.CLEANING;

  // Online hold phrasings
  if (n.includes("AWAITING") && (n.includes("CONFIRMATION") || n.includes("VERIFICATION"))) {
    return ADMIN_STATUS.ONLINE_HOLD;
  }
  if (n.includes("ONLINE") && n.includes("HOLD")) return ADMIN_STATUS.ONLINE_HOLD;
  return null;
};

// Small helper the RoomCard uses
export const getUiPresentation = (uiStatus, adminNorm) => {
  let meta = STATUS_META[uiStatus] || STATUS_META[STATUS.INACTIVE];
  if (adminNorm === ADMIN_STATUS.ONLINE_HOLD) {
    meta = { ...meta, label: "Awaiting confirmation" };
  }
  return meta;
};
