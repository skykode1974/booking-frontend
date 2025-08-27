// /utils/availability.js
import dayjs from "dayjs";
import { parseToMs } from "./datetime";
import { STATUS } from "./status";

const FENCE_MINUTES = 30;          // 30-minute window
const CHECKIN_HOUR = 12;           // 12:00 pm check-in
const CHECKIN_MINUTE = 0;

export function computeRooms({
  rooms,
  hasDates,
  availableIds,
  now,
  arrival,
  departure,
}) {
  const toMs = (ts) => {
    const v = parseToMs(ts);
    return Number.isFinite(v) ? v : 0;
  };

  const nowMs = Number(now) || Date.now();

  return rooms.map((r) => {
    if (!hasDates) return { ...r, status: STATUS.INACTIVE, remaining_ms: 0 };

    // Cleaning override (future)
    const cleanMs = toMs(r.cleaning_until_raw || r.cleaning_until);
    if (cleanMs > nowMs) {
      return { ...r, status: STATUS.CLEANING, remaining_ms: cleanMs - nowMs };
    }

    // Current/last booking end time (from backend)
    const bookingEndMs = toMs(
      r.departure_at_raw || r._live_departure_ms || r.next_checkout_at || r.check_out
    );

    // If we know a booking end, apply the special same-day rule
    if (bookingEndMs) {
      const dep = dayjs(bookingEndMs);
      const arrDate = dayjs(arrival);

      const msLeft = Math.max(0, bookingEndMs - nowMs);

      // Arrival is strictly after the departure day → free
      if (arrDate.isAfter(dep, "day")) {
        return { ...r, status: STATUS.AVAILABLE, remaining_ms: 0 };
      }

      // Arrival is the same day as the current booking's departure
      if (arrDate.isSame(dep, "day")) {
        // Arrival must be exactly 12:00 pm on that day
        const arrivalAtNoon = arrDate.hour(CHECKIN_HOUR).minute(CHECKIN_MINUTE).second(0).millisecond(0);

        const arrivalOk = arrivalAtNoon.valueOf() >= bookingEndMs;
        const withinFence = msLeft <= FENCE_MINUTES * 60 * 1000;

        if (arrivalOk && withinFence) {
          // Passes both conditions → treat as free
          return { ...r, status: STATUS.AVAILABLE, remaining_ms: 0 };
        }

        // Otherwise still occupied; show countdown to departure
        return { ...r, status: STATUS.OCCUPIED, remaining_ms: msLeft };
      }

      // Arrival is before the departure day → occupied
      return { ...r, status: STATUS.OCCUPIED, remaining_ms: msLeft };
    }

    // No known booking end → fall back to server-provided availability set
    if (availableIds.has(String(r.id))) {
      return { ...r, status: STATUS.AVAILABLE, remaining_ms: 0 };
    }

    // Default (conservative)
    return { ...r, status: STATUS.OCCUPIED, remaining_ms: 0 };
  });
}
