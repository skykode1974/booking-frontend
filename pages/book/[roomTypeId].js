// /pages/book/[roomTypeId].js
"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";

import LegendPill from "../../components/book/LegendPill";
import SummaryItem from "../../components/book/SummaryItem";
import RoomCard from "../../components/book/RoomCard";
import GuestDetailsModal from "../../components/book/GuestDetailsModal";
import MobileTrayDrawer from "../../components/book/MobileTrayDrawer";

import { STATUS } from "../../utils/status";
import { computeRooms } from "../../utils/availability";
import {
  fetchAvailableRooms,
  fetchRoomsByType,
  fetchOccupancyByRoom, // ✅ correct name
} from "../../services/roomsApi";

export default function BookByTypePage() {
  const router = useRouter();
  const { roomTypeId } = router.query;

  const roomTypeName = (router.query.type || "").toString();
  const pricePerNight = Number(router.query.price || 0);

  // Dates
  const [arrival, setArrival] = useState(null);
  const [departure, setDeparture] = useState(null);
  const hasDates = !!arrival && !!departure;

  // Rooms + availability
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [availableIds, setAvailableIds] = useState(new Set());
  const [fetchingAvail, setFetchingAvail] = useState(false);

  // Live occupancy map (room_id -> { dep_iso, sec_left, status })
  const [occMap, setOccMap] = useState(new Map());

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // live tick for countdowns
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Guest modal + selfie (persist)
  const [guestOpen, setGuestOpen] = useState(false);
  const [guest, setGuest] = useState({
    full_name: "",
    phone: "",
    email: "",
    captured_image: "",
  });
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("guest_draft");
      if (s) setGuest(JSON.parse(s));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("guest_draft", JSON.stringify(guest));
    } catch {}
  }, [guest]);

  // Mobile tray
  const [trayOpen, setTrayOpen] = useState(false);

  // 1) fetch rooms + initial occupancy and merge
  useEffect(() => {
    if (!roomTypeId) return;
    (async () => {
      setLoadingRooms(true);
      try {
        const normalized = await fetchRoomsByType(roomTypeId);

        // load occupancy and merge
        let byId = new Map();
        try {
          byId = await fetchOccupancyByRoom();
          setOccMap(byId);
        } catch (e) {
          console.warn("occupancy fetch failed", e?.message || e);
        }

        const merged = normalized.map((r) => {
          const live = byId.get(String(r.id));
          if (!live) return r;
          const liveDepMs = live.dep_iso ? Date.parse(live.dep_iso) : null;
          return {
            ...r,
            departure_at_raw:
              live.dep_iso ||
              r.departure_at_raw ||
              r.next_checkout_at ||
              r.check_out ||
              null,
            _live_departure_ms: liveDepMs,
            _live_secs_left:
              typeof live.sec_left === "number" ? live.sec_left : null,
          };
        });

        setRooms(merged);
      } catch (e) {
        console.error(e);
        toast.error("Could not load rooms for this type.");
      } finally {
        setLoadingRooms(false);
      }
    })();
  }, [roomTypeId]);

  // 2) fetch availability when dates picked
  useEffect(() => {
    if (!hasDates || !roomTypeId) return;
    (async () => {
      setFetchingAvail(true);
      try {
        const ids = await fetchAvailableRooms({ arrival, departure, roomTypeId });
        setAvailableIds(ids);
        setSelectedIds([]);
      } catch (e) {
        console.error(e);
        toast.error("Could not load availability. Try another date range.");
        setAvailableIds(new Set());
      } finally {
        setFetchingAvail(false);
      }
    })();
  }, [hasDates, arrival, departure, roomTypeId]);

  // 3) poll backend occupancy to refresh remaining seconds & departures
  useEffect(() => {
    let timer;
    const run = async () => {
      try {
        const byId = await fetchOccupancyByRoom();
        setOccMap(byId);
        setRooms((prev) =>
          prev.map((r) => {
            const live = byId.get(String(r.id));
            if (!live) return r;
            const liveDepMs = live.dep_iso ? Date.parse(live.dep_iso) : null;
            return {
              ...r,
              departure_at_raw: live.dep_iso || r.departure_at_raw,
              _live_departure_ms: liveDepMs,
              _live_secs_left:
                typeof live.sec_left === "number" ? live.sec_left : null,
            };
          })
        );
      } catch (e) {
        // silent fail; keep UI running
        console.warn("occupancy poll failed", e?.message || e);
      }
    };
    run();
    timer = setInterval(run, 30_000); // every 30s
    return () => clearInterval(timer);
  }, []);

  // compute statuses
  const computedRooms = useMemo(
    () =>
      computeRooms({
        rooms,
        hasDates,
        availableIds,
        now,
        arrival,
        departure,
      }),
    [rooms, hasDates, availableIds, now, arrival, departure]
  );

  // totals
  const nights = useMemo(
    () =>
      !arrival || !departure
        ? 0
        : Math.max(dayjs(departure).diff(dayjs(arrival), "day"), 0),
    [arrival, departure]
  );
  const total = useMemo(
    () => (pricePerNight || 0) * nights * selectedIds.length,
    [pricePerNight, nights, selectedIds.length]
  );

  // helpers
  function toggleSelect(id, roomStatus) {
    if (!hasDates) return;
    if (roomStatus !== STATUS.AVAILABLE) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  function removeSelected(id) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function openGuestForm() {
    if (!hasDates) return toast.error("Select arrival and departure.");
    if (selectedIds.length === 0)
      return toast.error("Select at least one available room.");
    setGuestOpen(true);
  }

  function confirmGuestAndPay(e) {
    e?.preventDefault?.();
    if (!guest.full_name.trim() || !guest.phone.trim())
      return toast.error("Enter guest full name and phone.");

    const roomIdsInt = selectedIds
      .map((id) => parseInt(id, 10))
      .filter((n) => Number.isFinite(n));
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

  // map id -> room
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24">
        {/* Back */}
        <div className="mt-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10"
          >
            <FiArrowLeft aria-hidden />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">
              {roomTypeName || "Room Booking"}
            </h1>
            <p className="opacity-80">
              Select your dates to see live available room(s).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LegendPill color="bg-emerald-500/90" label="Available" />
            <LegendPill color="bg-rose-500/90" label="Occupied" />
            <LegendPill color="bg-sky-500/90" label="Cleaning" />
            <LegendPill color="bg-slate-600/90" label="Pick dates first" />
          </div>
        </div>

        {/* Dates + price */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm opacity-80">Arrival</label>
            <DatePicker
              selected={arrival}
              onChange={setArrival}
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
              onChange={setDeparture}
              placeholderText="Select departure"
              className="w-full rounded-md border border-blue-400 bg-slate-900 px-3 py-2 placeholder:text-slate-400"
              calendarClassName="custom-datepicker"
              dateFormat="yyyy-MM-dd"
              minDate={arrival || new Date()}
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 col-span-2 sm:col-span-1">
            <div className="text-sm opacity-80">Per night</div>
            <div className="text-2xl font-extrabold text-emerald-400">
              ₦{Number(pricePerNight || 0).toLocaleString("en-NG")}
            </div>
            <div className="text-xs opacity-70">
              {nights} night(s) • {selectedIds.length} room(s)
            </div>
          </div>
        </div>

        {/* Rooms */}
        <section className="mb-8">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Rooms</h2>
              {loadingRooms && (
                <span className="text-xs opacity-70">loading…</span>
              )}
              {fetchingAvail && hasDates && (
                <span className="text-xs opacity-70">checking availability…</span>
              )}
            </div>
            <div className="text-[11px] opacity-70">
              Occupied/Cleaning rooms show{" "}
              <span className="font-semibold">Departure</span> inside the card.
            </div>
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

        {/* Desktop summary */}
        <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <SummaryItem label="Rooms selected" value={selectedIds.length} />
            <SummaryItem label="Nights" value={nights} />
            <SummaryItem
              label="Per night"
              value={`₦${Number(pricePerNight || 0).toLocaleString("en-NG")}`}
            />
            <SummaryItem
              label="Total"
              value={`₦${Number(total).toLocaleString("en-NG")}`}
              strong
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs opacity-70">
              Select green (available) rooms after picking your dates. Occupied
              shows remaining time; cleaning shows when it frees up.
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

      {/* MOBILE: tray trigger */}
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

      {/* Guest modal */}
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
