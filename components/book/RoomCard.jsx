// /components/book/RoomCard.jsx
"use client";

import { FiCheckCircle, FiClock } from "react-icons/fi";
import {
  STATUS,
  ADMIN_STATUS,
  normalizeAdmin,
  getUiPresentation,
} from "../../utils/status";
import { fmtSqlDateTime, formatMsLeft } from "../../utils/datetime";
import useCountdown from "./useCountdown";

// Consider only meaningful booking/admin strings from DB
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

// Pull admin-like value; if admin_status missing, use a meaningful `status`
const pickRawAdmin = (room = {}) =>
  room.admin_status ??
  room.booking_status ??
  room.status_name ??
  (isMeaningfulAdmin(room.status) ? room.status : null) ??
  room.adminStatus ??
  room.bookingStatus ??
  room.statusName ??
  null;

export default function RoomCard({ room, selected, onToggle, hasDates }) {
  // Upstream computeRooms decided base UI status
  let uiStatus = room?.status || STATUS.INACTIVE;

  // Safety: apply admin override if present
  const rawAdmin = pickRawAdmin(room);
  const adminNorm = normalizeAdmin(rawAdmin || "");
  if (adminNorm === ADMIN_STATUS.PENDING) uiStatus = STATUS.PENDING;
  if (adminNorm === ADMIN_STATUS.MAINTENANCE) uiStatus = STATUS.MAINTENANCE;
  if (adminNorm === ADMIN_STATUS.CLEANING) uiStatus = STATUS.CLEANING;
  if (adminNorm === ADMIN_STATUS.DEPARTURE) uiStatus = STATUS.AVAILABLE;
  if (adminNorm === ADMIN_STATUS.CANCELLED) uiStatus = STATUS.AVAILABLE;
  if (adminNorm === ADMIN_STATUS.CONFIRMED) uiStatus = STATUS.OCCUPIED;

  // Countdown for occupied/cleaning
  const remaining_ms =
    Number.isFinite(room?.remaining_ms) && room.remaining_ms > 0
      ? room.remaining_ms
      : 0;
  const showCountdown =
    (uiStatus === STATUS.OCCUPIED || uiStatus === STATUS.CLEANING) &&
    remaining_ms > 0;
  const msLeft = useCountdown(remaining_ms, showCountdown);

  // Dates for small text
  const depRaw =
    room?.departure_at_raw || room?.next_checkout_at || room?.check_out || null;
  const cleanRaw = room?.cleaning_until_raw || room?.cleaning_until || null;

  // Visuals
  const meta = getUiPresentation(hasDates ? uiStatus : STATUS.INACTIVE, adminNorm);
  const clickOk = hasDates && uiStatus === STATUS.AVAILABLE;
  const handleClick = () => {
    if (clickOk && typeof onToggle === "function") onToggle();
  };

  const displayRoom =
    room?.room_number || room?.number || room?.name || room?.id;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!clickOk}
      className={`group relative overflow-hidden rounded-xl border border-white/10 ${meta.card} p-3 text-left backdrop-blur-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 ${meta.ring}`}
    >
      {/* selected checkmark */}
      {selected && (
        <div className="absolute right-2.5 top-2.5 rounded-full bg-emerald-600/90 p-1.5 shadow">
          <FiCheckCircle />
        </div>
      )}

      {/* tiny countdown when relevant */}
      {showCountdown && (
        <div
          className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
            uiStatus === STATUS.OCCUPIED ? "bg-rose-600/90" : "bg-sky-600/90"
          }`}
          title="Time remaining until free"
        >
          {formatMsLeft(msLeft)}
        </div>
      )}

      {/* subtle glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/5 blur-2xl" />

      {/* CONTENT */}
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="text-2xl font-extrabold leading-none">
            {displayRoom}
          </div>

          {/* departure / cleaning info */}
          {depRaw && (
            <div className="mt-1 text-[11px] opacity-70">
              Departure: {fmtSqlDateTime(depRaw)}
            </div>
          )}
          {uiStatus === STATUS.CLEANING && cleanRaw && (
            <div className="mt-1 text-[11px] opacity-70">
              Done cleaning: {fmtSqlDateTime(cleanRaw)}
            </div>
          )}
        </div>

        <div className="mt-4">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white ${meta.chip}`}>
            {meta.label}
          </span>
        </div>

        {!hasDates && (
          <div className="mt-2 flex items-center gap-2 text-[11px] opacity-70">
            <FiClock /> Select arrival &amp; departure to activate rooms
          </div>
        )}
      </div>
    </button>
  );
}
