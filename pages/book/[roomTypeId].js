// pages/book/[roomTypeId].js
"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ActivityWave from "@/components/ActivityWave";
import { FiArrowLeft, FiClock, FiCheckCircle, FiShoppingCart, FiX, FiTrash2, FiCamera } from "react-icons/fi";
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

  // Guest modal + selfie
  const [guestOpen, setGuestOpen] = useState(false);
  const [guest, setGuest] = useState({ full_name: "", phone: "", email: "", captured_image: "" });

  // Mobile tray
  const [trayOpen, setTrayOpen] = useState(false);

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
  function removeSelected(id) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
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
      captured_image: guest.captured_image || "",
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

  // Map id → room for summary/tray
  const roomsById = useMemo(() => {
    const m = new Map();
    rooms.forEach((r) => m.set(String(r.id), r));
    return m;
  }, [rooms]);

  const selectedRoomObjs = useMemo(
    () => selectedIds.map((id) => roomsById.get(id)).filter(Boolean),
    [selectedIds, roomsById]
  );

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

      <div className="relative z-10 -mt-10 mx-auto max-w-7xl px-4 pb-24">
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

        {/* Rooms grid (➡️ up to 6 per row on XXL) */}
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
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">

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

        {/* Desktop Summary + Proceed */}
        <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 p-4">
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

      {/* MOBILE: Floating Tray Button */}
      <button
        onClick={() => setTrayOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-50 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-4 py-3 flex items-center gap-2"
        aria-label="Open booking tray"
      >
        <FiShoppingCart />
        <span className="text-sm font-semibold">Tray</span>
        {selectedIds.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white text-emerald-700 text-xs font-bold w-6 h-6">
            {selectedIds.length}
          </span>
        )}
      </button>

      {/* MOBILE: Tray Drawer */}
      <MobileTrayDrawer
        open={trayOpen}
        onClose={() => setTrayOpen(false)}
        selectedRooms={selectedRoomObjs}
        nights={nights}
        pricePerNight={pricePerNight}
        total={total}
        arrivalDate={arrival ? dayjs(arrival).format("YYYY-MM-DD") : ""}
        departureDate={departure ? dayjs(departure).format("YYYY-MM-DD") : ""}
        onRemoveRoom={(id) => removeSelected(String(id))}
        onProceed={() => {
          setTrayOpen(false);
          openGuestForm();
        }}
      />

      {/* Guest details popup (with selfie capture) */}
      <GuestDetailsModal
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        guest={guest}
        setGuest={setGuest}
        selectedRooms={selectedRoomObjs}
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
      className={`group relative overflow-hidden rounded-xl border ${border} bg-white/5 p-3 text-left backdrop-blur-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {/* selection check */}
      {selected && (
        <div className="absolute right-2.5 top-2.5 rounded-full bg-emerald-600/90 p-1.5 shadow">
          <FiCheckCircle />
        </div>
      )}

      {/* subtle glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/5 blur-2xl" />

      {/* CONTENT: number on top, status at bottom */}
      <div className="flex h-full flex-col justify-between">
        <div>
          {/* 👇 ONLY number (remove the word “Room” & the # symbol) */}
          <div className="text-2xl font-extrabold leading-none">{room_number}</div>
          {/* Optional: show floor in tiny text (remove if you want tighter cards) */}
          {floor && <div className="mt-1 text-[11px] opacity-60">Floor {floor}</div>}
        </div>

        <div className="mt-4">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white ${chip.bg}`}>
            {chip.text}
          </span>
        </div>

        {!hasDates && (
          <div className="mt-2 flex items-center gap-2 text-[11px] opacity-70">
            <FiClock /> Select arrival & departure to activate rooms
          </div>
        )}
      </div>
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
  const fileRef = useRef(null);

  function onPickSelfie() {
    fileRef.current?.click();
  }
  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setGuest((g) => ({ ...g, captured_image: reader.result }));
    };
    reader.readAsDataURL(file);
  }

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
            className="fixed inset-x-0 bottom-0 z-[95] max-h-[90vh] overflow-auto rounded-t-2xl bg-white text-black shadow-2xl sm:inset-y-0 sm:my-auto sm:mx-auto sm:h-auto sm:max-w-lg sm:rounded-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">Guest Details & Summary</h3>
              <p className="text-xs text-black/60">Optionally capture a selfie for faster check-in.</p>
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

                {/* Selfie capture */}
                <div className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Capture Face (optional)</div>
                    {guest.captured_image ? (
                      <button
                        type="button"
                        onClick={() => setGuest((g) => ({ ...g, captured_image: "" }))}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  {guest.captured_image ? (
                    <img
                      src={guest.captured_image}
                      alt="Captured"
                      className="h-24 w-24 rounded object-cover border"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={onPickSelfie}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
                    >
                      <FiCamera /> Use Camera
                    </button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
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
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
                >
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

function MobileTrayDrawer({
  open,
  onClose,
  selectedRooms,
  nights,
  pricePerNight,
  total,
  arrivalDate,
  departureDate,
  onRemoveRoom,
  onProceed,
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
            className="fixed inset-x-0 bottom-0 z-[95] rounded-t-2xl bg-white text-black shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">Booking Tray</div>
              <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
                <FiX />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-auto p-4">
              {selectedRooms.length === 0 ? (
                <div className="text-sm text-black/70">No rooms selected yet.</div>
              ) : (
                <div className="space-y-3">
                  {selectedRooms.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 border-b border-black/10 pb-2"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">Room #{r.room_number}</div>
                        <div className="text-xs text-black/60">
                          ₦{Number(pricePerNight || 0).toLocaleString("en-NG")} / night
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveRoom(r.id)}
                        className="p-1 rounded border border-black/20 hover:bg-black/5 text-red-500"
                        aria-label="Remove room"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="opacity-70">Arrival</div>
                  <div className="font-semibold">{arrivalDate || "-"}</div>
                </div>
                <div>
                  <div className="opacity-70">Departure</div>
                  <div className="font-semibold">{departureDate || "-"}</div>
                </div>
                <div>
                  <div className="opacity-70">Nights</div>
                  <div className="font-semibold">{nights}</div>
                </div>
                <div>
                  <div className="opacity-70">Rooms</div>
                  <div className="font-semibold">{selectedRooms.length}</div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Total</div>
                <div className="font-bold text-emerald-600">
                  ₦{Number(total || 0).toLocaleString("en-NG")}
                </div>
              </div>
              <button
                onClick={onProceed}
                disabled={selectedRooms.length === 0 || total <= 0}
                className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
              >
                Proceed
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
