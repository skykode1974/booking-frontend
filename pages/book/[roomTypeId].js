// pages/book/[roomTypeId].js
"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ActivityWave from "@/components/ActivityWave";
import { FiArrowLeft, FiClock, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const STATUS = {
  INACTIVE: "inactive",
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
};

// Format remaining ms → "2h 14m" / "3d 4h" / "0m"
function formatRemaining(ms) {
  if (!ms || ms <= 0) return "0m";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function BookByTypePage() {
  const router = useRouter();
  const { roomTypeId } = router.query;

  // Optional query: ?type=Deluxe&price=25000
  const roomTypeName = (router.query.type || "").toString();
  const pricePerNight = Number(router.query.price || 0);

  // Dates
  const [arrival, setArrival] = useState(null);
  const [departure, setDeparture] = useState(null);
  const hasDates = !!arrival && !!departure;

  // Rooms + availability
  const [rooms, setRooms] = useState([]); // [{id, room_number, floor, next_checkout_at, cleaning_until}]
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [availableIds, setAvailableIds] = useState(new Set());
  const [fetchingAvail, setFetchingAvail] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Countdown ticker
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Guest modal
  const [guestOpen, setGuestOpen] = useState(false);
  const [guest, setGuest] = useState({ full_name: "", phone: "", email: "" });

  // 1) Fetch all rooms for this type
  useEffect(() => {
    if (!roomTypeId) return;

    async function fetchRooms() {
      setLoadingRooms(true);
      try {
        let list = [];
        try {
          const a = await axios.get("/api/rooms-by-type", { params: { room_type_id: roomTypeId } });
          list = Array.isArray(a.data?.data) ? a.data.data : Array.isArray(a.data) ? a.data : [];
        } catch {
          const b = await axios.get("/api/rooms", { params: { room_type_id: roomTypeId, all: 1 } });
          list = Array.isArray(b.data?.data) ? b.data.data : Array.isArray(b.data) ? b.data : [];
        }

        const normalized = list.map((r) => ({
          id: String(r.id ?? r.room_id ?? r.ID),
          room_number: r.room_number ?? r.name ?? r.number ?? String(r.id),
          floor: r.floor ?? r.level ?? null,
          next_checkout_at: r.next_checkout_at ?? r.occupied_until ?? null,
          cleaning_until: r.cleaning_until ?? null,
          is_available: r.is_available ?? undefined,
        }));

        setRooms(normalized);
      } catch (err) {
        console.error("Fetch rooms error:", err?.response?.data || err.message);
        toast.error("Could not load rooms for this type.");
      } finally {
        setLoadingRooms(false);
      }
    }

    fetchRooms();
  }, [roomTypeId]);

  // 2) Fetch availability when dates picked
  useEffect(() => {
    if (!hasDates || !roomTypeId) return;

    async function fetchAvail() {
      setFetchingAvail(true);
      try {
        const res = await axios.get("/api/available-rooms", {
          params: {
            arrival: dayjs(arrival).format("YYYY-MM-DD"),
            departure: dayjs(departure).format("YYYY-MM-DD"),
            room_type_id: roomTypeId,
          },
        });
        const arr = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        const ids = new Set(arr.map((r) => String(r.id ?? r.room_id ?? r.ID)));
        setAvailableIds(ids);
        setSelectedIds([]); // reset after new check
      } catch (err) {
        console.error("Availability fetch error:", err?.response?.data || err.message);
        toast.error("Could not load availability. Try another date range.");
        setAvailableIds(new Set());
      } finally {
        setFetchingAvail(false);
      }
    }

    fetchAvail();
  }, [hasDates, arrival, departure, roomTypeId]);

  // 3) Compute status per room
  const computedRooms = useMemo(() => {
    return rooms.map((r) => {
      if (!hasDates) return { ...r, status: STATUS.INACTIVE, remaining_ms: 0 };

      // Cleaning overrides
      if (r.cleaning_until) {
        const untilMs = new Date(r.cleaning_until).getTime() - now;
        if (untilMs > 0) return { ...r, status: STATUS.CLEANING, remaining_ms: untilMs };
      }

      // If not in available set → occupied
      if (!availableIds.has(String(r.id))) {
        const occMs = r.next_checkout_at ? new Date(r.next_checkout_at).getTime() - now : 0;
        return { ...r, status: STATUS.OCCUPIED, remaining_ms: occMs > 0 ? occMs : 0 };
      }

      return { ...r, status: STATUS.AVAILABLE, remaining_ms: 0 };
    });
  }, [rooms, hasDates, availableIds, now]);

  // 4) Nights + total
  const nights = useMemo(() => {
    if (!arrival || !departure) return 0;
    return Math.max(dayjs(departure).diff(dayjs(arrival), "day"), 0);
  }, [arrival, departure]);

  const total = useMemo(() => {
    const per = pricePerNight || 0;
    return per * nights * selectedIds.length;
  }, [pricePerNight, nights, selectedIds.length]);

  // Helpers
  function toggleSelect(id, roomStatus) {
    if (!hasDates) return;
    if (roomStatus !== STATUS.AVAILABLE) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openGuestForm() {
    if (!hasDates) return toast.error("Select arrival and departure.");
    if (selectedIds.length === 0) return toast.error("Select at least one available room.");
    setGuestOpen(true);
  }

  function confirmGuestAndPay(e) {
    e?.preventDefault?.();
    if (!guest.full_name.trim() || !guest.phone.trim()) {
      return toast.error("Enter guest full name and phone.");
    }

    const roomIdsInt = selectedIds.map((id) => parseInt(id, 10)).filter(Boolean);

    const bookingPayload = {
      full_name: guest.full_name.trim(),
      phone: guest.phone.trim(),
      email: guest.email.trim(),
      arrival_date: dayjs(arrival).format("YYYY-MM-DD"),
      departure_date: dayjs(departure).format("YYYY-MM-DD"),
      total_amount: total,
      captured_image: "",
      room_id: roomIdsInt[0] || null,
      room_ids: roomIdsInt,
      booking_date: new Date().toISOString().slice(0, 10),
      payment_status: "unpaid",
      amount_paid: 0,
      status: "pending",
      payment_ref: "",
    };

    localStorage.setItem("bookingData", JSON.stringify(bookingPayload));
    setGuestOpen(false);
    router.push("/pay");
  }

  // Wave words
  const WAVE_WORDS = useMemo(() => {
    return [
      "Awrab Suites Hotel",
      roomTypeName ? `${roomTypeName} Rooms` : "Room Booking",
      "Comfort • Security • Style",
      "Fast Wi-Fi • 24/7 Power",
      "Catalodge Dining",
    ];
  }, [roomTypeName]);

  // Map id → room for summary
  const roomsById = useMemo(() => {
    const m = new Map();
    rooms.forEach((r) => m.set(String(r.id), r));
    return m;
  }, [rooms]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <ToastContainer position="top-right" theme="dark" autoClose={2500} />

      {/* Wave header */}
      <div className="relative z-0 pointer-events-none">
        <ActivityWave
          height={220}
          density={26}
          words={WAVE_WORDS}
          palette={["#22c55e", "#0ea5e9", "#f59e0b", "#a855f7", "#ef4444"]}
        />
      </div>

      <div className="relative z-10 -mt-10 mx-auto max-w-7xl px-4 pb-16">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10"
          >
            <FiArrowLeft /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">{roomTypeName || "Room Booking"}</h1>
            <p className="opacity-80">Select your dates to see live availability and pick your room(s).</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LegendPill color="bg-emerald-500/90" label="Available" />
            <LegendPill color="bg-rose-500/90" label="Occupied" />
            <LegendPill color="bg-sky-500/90" label="Cleaning" />
            <LegendPill color="bg-slate-600/90" label="Pick dates first" />
          </div>
        </div>

        {/* Date pickers + price */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm opacity-80">Arrival</label>
            <DatePicker
              selected={arrival}
              onChange={(d) => setArrival(d)}
              placeholderText="Select arrival"
              className="w-full rounded-md border border-blue-400 bg-slate-900 px-3 py-2 placeholder:text-slate-400"
              calendarClassName="custom-datepicker"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm opacity-80">Departure</label>
            <DatePicker
              selected={departure}
              onChange={(d) => setDeparture(d)}
              placeholderText="Select departure"
              className="w-full rounded-md border border-blue-400 bg-slate-900 px-3 py-2 placeholder:text-slate-400"
              calendarClassName="custom-datepicker"
              dateFormat="yyyy-MM-dd"
              minDate={arrival || new Date()}
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-sm opacity-80">Per night</div>
            <div className="text-2xl font-extrabold text-emerald-400">
              ₦{Number(pricePerNight || 0).toLocaleString("en-NG")}
            </div>
            <div className="text-xs opacity-70">
              {nights} night(s) • {selectedIds.length} room(s)
            </div>
          </div>
        </div>

        {/* Rooms grid */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xl font-bold">Rooms</h2>
            {loadingRooms && <span className="text-xs opacity-70">loading…</span>}
            {fetchingAvail && hasDates && <span className="text-xs opacity-70">checking availability…</span>}
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center opacity-80">
              No rooms found for this type.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {computedRooms.map((r) => (
                <RoomCard
                  key={r.id}
                  room={r}
                  hasDates={hasDates}
                  selected={selectedIds.includes(r.id)}
                  onToggle={() => toggleSelect(r.id, r.status)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Summary + Proceed */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <SummaryItem label="Rooms selected" value={selectedIds.length} />
            <SummaryItem label="Nights" value={nights} />
            <SummaryItem
              label="Per night"
              value={`₦${Number(pricePerNight || 0).toLocaleString("en-NG")}`}
            />
            <SummaryItem label="Total" value={`₦${Number(total).toLocaleString("en-NG")}`} strong />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs opacity-70">
              Select green (available) rooms after picking your dates. Occupied shows remaining time; cleaning shows when it frees up.
            </p>
            <button
              onClick={openGuestForm}
              disabled={!hasDates || selectedIds.length === 0 || total <= 0}
              className="rounded-md bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>

      {/* Guest details popup */}
      <GuestDetailsModal
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        guest={guest}
        setGuest={setGuest}
        selectedRooms={selectedIds.map((id) => roomsById.get(id))}
        nights={nights}
        pricePerNight={pricePerNight}
        total={total}
        arrivalDate={arrival ? dayjs(arrival).format("YYYY-MM-DD") : ""}
        departureDate={departure ? dayjs(departure).format("YYYY-MM-DD") : ""}
        onConfirm={confirmGuestAndPay}
      />
    </main>
  );
}

/* ——— Subcomponents ———————————————————————————————————————— */

function LegendPill({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function SummaryItem({ label, value, strong }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className={`text-lg ${strong ? "font-extrabold text-emerald-400" : "font-semibold"}`}>{value}</div>
    </div>
  );
}

function RoomCard({ room, selected, onToggle, hasDates }) {
  const { room_number, floor, status, remaining_ms } = room;

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
      chip = { bg: "bg-rose-500/90", text: `Occupied · ${formatRemaining(remaining_ms)}` };
    } else if (status === STATUS.CLEANING) {
      border = "border-sky-500/40";
      chip = { bg: "bg-sky-500/90", text: `Cleaning · ${formatRemaining(remaining_ms)}` };
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!clickOk}
      className={`group relative overflow-hidden rounded-xl border ${border} bg-white/5 p-4 text-left backdrop-blur-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-sm opacity-70">Room</div>
          <div className="text-xl font-extrabold">#{room_number}</div>
          {floor && <div className="text-xs opacity-70">Floor: {floor}</div>}
        </div>

        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${chip.bg}`}>{chip.text}</span>
      </div>

      {selected && (
        <div className="absolute right-3 top-3 rounded-full bg-emerald-600/90 p-1.5 shadow">
          <FiCheckCircle />
        </div>
      )}

      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

      {!hasDates && (
        <div className="mt-3 flex items-center gap-2 text-xs opacity-70">
          <FiClock /> Select arrival & departure to activate rooms
        </div>
      )}
    </button>
  );
}

function GuestDetailsModal({
  open,
  onClose,
  guest,
  setGuest,
  selectedRooms,
  nights,
  pricePerNight,
  total,
  arrivalDate,
  departureDate,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[95] max-h-[85vh] overflow-auto rounded-t-2xl bg-white text-black shadow-2xl sm:inset-y-0 sm:my-auto sm:mx-auto sm:h-auto sm:max-w-lg sm:rounded-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">Guest Details & Summary</h3>
              <p className="text-xs text-black/60">Confirm your info before payment.</p>
            </div>

            <form onSubmit={onConfirm} className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <input
                  required
                  placeholder="Full name *"
                  value={guest.full_name}
                  onChange={(e) => setGuest((g) => ({ ...g, full_name: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                />
                <input
                  required
                  placeholder="Phone *"
                  value={guest.phone}
                  onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                />
                <input
                  placeholder="Email (optional)"
                  value={guest.email}
                  onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div className="rounded-lg border bg-black/5 p-3 text-sm">
                <div className="mb-2 grid gap-1 sm:grid-cols-2">
                  <div>
                    <div className="opacity-70">Arrival</div>
                    <div className="font-semibold">{arrivalDate}</div>
                  </div>
                  <div>
                    <div className="opacity-70">Departure</div>
                    <div className="font-semibold">{departureDate}</div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="opacity-70">Rooms selected</div>
                  <ul className="max-h-24 overflow-auto">
                    {selectedRooms.map((r) => (
                      <li key={r?.id} className="font-semibold">
                        Room #{r?.room_number}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-1 sm:grid-cols-3">
                  <div>
                    <div className="opacity-70">Nights</div>
                    <div className="font-semibold">{nights}</div>
                  </div>
                  <div>
                    <div className="opacity-70">Per night</div>
                    <div className="font-semibold">
                      ₦{Number(pricePerNight || 0).toLocaleString("en-NG")}
                    </div>
                  </div>
                  <div>
                    <div className="opacity-70">Total</div>
                    <div className="font-extrabold text-emerald-600">
                      ₦{Number(total).toLocaleString("en-NG")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 hover:bg-black/5">
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700">
                  Proceed to Payment
                </button>
              </div>
            </form>

            <div className="border-t p-3 text-center text-xs text-black/60">
              You’ll complete payment on the next screen.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
