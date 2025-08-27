// /components/book/RoomCard.jsx
"use client";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { STATUS } from "../../utils/status";
import { fmtSqlDateTime, formatMsLeft } from "../../utils/datetime";
import useCountdown from "./useCountdown";
export default function RoomCard({ room, selected, onToggle, hasDates }) {
  const { room_number, status, remaining_ms } = room;

  const depRaw = room.departure_at_raw || room.next_checkout_at || room.check_out || null;
  const cleanRaw = room.cleaning_until_raw || room.cleaning_until || null;

  // visuals
  let border = "border-white/10";
  let chip = { bg: "bg-slate-600/90", text: "Pick dates" };
  let clickOk = false;

  if (hasDates) {
    if (status === STATUS.AVAILABLE) {
      border = "border-emerald-500/40";
      chip = { bg: "bg-emerald-500/90", text: "Available" };
      clickOk = true;
    } else if (status === STATUS.OCCUPIED) {
      border = "border-rose-500/40";
      chip = { bg: "bg-rose-500/90", text: "Occupied" };
    } else if (status === STATUS.CLEANING) {
      border = "border-sky-500/40";
      chip = { bg: "bg-sky-500/90", text: "Cleaning" };
    }
  }

  const showCountdown =
  (status === STATUS.OCCUPIED || status === STATUS.CLEANING) &&
   (remaining_ms || 0) > 0;
  const msLeft = useCountdown(remaining_ms || 0, showCountdown);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!clickOk}
      className={`group relative overflow-hidden rounded-xl border ${border} bg-white/5 p-3 text-left backdrop-blur-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {/* selection check */}
      {selected && (
        <div className="absolute right-2.5 top-2.5 rounded-full bg-emerald-600/90 p-1.5 shadow">
          <FiCheckCircle />
        </div>
      )}

      {/* tiny countdown */}
      {showCountdown && (
        <div
          className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
            status === STATUS.OCCUPIED ? "bg-rose-600/90" : "bg-sky-600/90"
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
          <div className="text-2xl font-extrabold leading-none">{room_number}</div>

          {/* Always show departure if present */}
          {depRaw && (
            <div className="mt-1 text-[11px] opacity-70">
              Departure: {fmtSqlDateTime(depRaw)}
            </div>
          )}

          {/* Show cleaning end only when status is cleaning */}
          {status === STATUS.CLEANING && cleanRaw && (
            <div className="mt-1 text-[11px] opacity-70">
              Done cleaning: {fmtSqlDateTime(cleanRaw)}
            </div>
          )}
        </div>

        <div className="mt-4">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white ${chip.bg}`}>
            {chip.text}
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
