// /utils/availability.js
import dayjs from "dayjs";
import { parseToMs } from "./datetime";
import { STATUS, normalizeAdmin } from "./status";

const FENCE_MINUTES = 30;
const CHECKIN_HOUR = 12;
const CHECKIN_MINUTE = 0;

const isMeaningfulAdmin = (s) => {
  const n = String(s || "").toLowerCase();
  return (
    n.includes("pending") ||
    n.includes("confirm") ||
    n.includes("cancel") ||
    n.includes("depart") ||
    n.includes("clean") ||
    n.includes("maint")
  );
};

const pickAdminStatus = (room = {}) =>
  room.admin_status ??
  room.booking_status ??
  room.status_name ??
  (isMeaningfulAdmin(room.status) ? room.status : null) ??
  room.adminStatus ??
  room.bookingStatus ??
  room.statusName ??
  null;

// Day-level inclusive overlap using millisecond comparisons (no plugins)
function overlapsRange(arrival, departure, winFrom, winTo) {
  if (!winFrom || !winTo || !arrival || !departure) return false;
  const aStart = dayjs(arrival).startOf("day").valueOf();
  const dEnd   = dayjs(departure).endOf("day").valueOf();
  const fStart = dayjs(winFrom).startOf("day").valueOf();
  const tEnd   = dayjs(winTo).endOf("day").valueOf();
  return aStart <= tEnd && dEnd >= fStart;
}

export function computeRooms({
  rooms,
  hasDates,
  availableIds,
  now,
  arrival,
  departure,
  unavailableMap = new Map(), // Map<roomId, [{from,to,type}]>
}) {
  const toMs = (ts) => {
    const v = parseToMs(ts);
    return Number.isFinite(v) ? v : 0;
  };
  const nowMs = Number(now) || Date.now();

  const availSet =
    availableIds instanceof Set ? availableIds : new Set(availableIds || []);
  const isAvailableById = (id) => availSet.has(id) || availSet.has(String(id));

  return rooms.map((r) => {
    const roomIdStr = String(r.id);

    // ===== (A) MAINTENANCE ALWAYS WINS =====
    const ranges = unavailableMap.get(roomIdStr) || unavailableMap.get(r.id) || [];

    // "today inside window" check without plugins
    const hasMaintNow =
      !hasDates &&
      ranges.some((w) => {
        const f = w?.from, t = w?.to;
        if (!f || !t) return false;
        const fStart = dayjs(f).startOf("day").valueOf();
        const tEnd   = dayjs(t).endOf("day").valueOf();
        return nowMs >= fStart && nowMs <= tEnd;
      });

    const hasMaintForSelection =
      hasDates &&
      ranges.some((w) => overlapsRange(arrival, departure, w?.from, w?.to));

    // ALSO: if backend already tagged this room as "maintenance"
    const backendSaysMaint = String(r.status || "").toLowerCase() === "maintenance";

    if (hasMaintNow || hasMaintForSelection || backendSaysMaint) {
      // Optional remaining time until maintenance end (only when "now" inside)
      let remain = 0;
      if (hasMaintNow) {
        const ends = ranges
          .map((w) => w?.to)
          .filter(Boolean)
          .map((d) => dayjs(d).endOf("day").valueOf());
        const maxEnd = Math.max(...ends, 0);
        if (maxEnd > nowMs) remain = maxEnd - nowMs;
      }
      return { ...r, status: STATUS.MAINTENANCE, remaining_ms: remain };
    }

    // ===== (B) ADMIN/TRANSACTION STATUSES =====
    const rawAdmin = pickAdminStatus(r);
    const adminNorm = normalizeAdmin(rawAdmin || "");

    if (adminNorm === "CONFIRMED") {
      const bookingEndMs = toMs(
        r.departure_at_raw || r._live_departure_ms || r.next_checkout_at || r.check_out
      );
      const msLeft = bookingEndMs > nowMs ? bookingEndMs - nowMs : 0;
      return { ...r, status: STATUS.OCCUPIED, remaining_ms: msLeft };
    }
    if (adminNorm === "PENDING") {
      return { ...r, status: STATUS.PENDING, remaining_ms: 0 };
    }
    if (adminNorm === "CLEANING") {
      const cleanMs = toMs(r.cleaning_until_raw || r.cleaning_until);
      const msLeft = cleanMs > nowMs ? cleanMs - nowMs : 0;
      return { ...r, status: STATUS.CLEANING, remaining_ms: msLeft };
    }
    if (adminNorm === "CANCELLED" || adminNorm === "DEPARTURE") {
      // fall through as AVAILABLE unless other time rules say otherwise
    }

    // ===== (C) TIME/AVAILABILITY FALLBACKS =====
    if (!hasDates) {
      return { ...r, status: STATUS.INACTIVE, remaining_ms: 0 };
    }

    const cleanMs = toMs(r.cleaning_until_raw || r.cleaning_until);
    if (cleanMs > nowMs) {
      return { ...r, status: STATUS.CLEANING, remaining_ms: cleanMs - nowMs };
    }

    const bookingEndMs = toMs(
      r.departure_at_raw || r._live_departure_ms || r.next_checkout_at || r.check_out
    );

    if (bookingEndMs) {
      const dep = dayjs(bookingEndMs);
      const arrDate = dayjs(arrival);
      const msLeft = Math.max(0, bookingEndMs - nowMs);

      if (arrDate.isAfter(dep, "day")) {
        return { ...r, status: STATUS.AVAILABLE, remaining_ms: 0 };
      }

      if (arrDate.isSame(dep, "day")) {
        const arrivalAtNoon = arrDate
          .hour(CHECKIN_HOUR)
          .minute(CHECKIN_MINUTE)
          .second(0)
          .millisecond(0);

        const arrivalOk = arrivalAtNoon.valueOf() >= bookingEndMs;
        const withinFence = msLeft <= FENCE_MINUTES * 60 * 1000;

        if (arrivalOk && withinFence) {
          return { ...r, status: STATUS.AVAILABLE, remaining_ms: 0 };
        }
        return { ...r, status: STATUS.OCCUPIED, remaining_ms: msLeft };
      }

      return { ...r, status: STATUS.OCCUPIED, remaining_ms: msLeft };
    }

    if (isAvailableById(r.id)) {
      return { ...r, status: STATUS.AVAILABLE, remaining_ms: 0 };
    }

    // blocked by server + no live guest ⇒ Pending
    const liveNow = String(r._occ_status || "").toLowerCase();
    if (!liveNow || liveNow === "vacant" || liveNow === "free" || liveNow === "available") {
      return { ...r, status: STATUS.PENDING, remaining_ms: 0 };
    }

    return { ...r, status: STATUS.OCCUPIED, remaining_ms: 0 };
  });
}
