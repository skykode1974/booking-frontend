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
  fetchOccupancyByRoom,
  fetchUnavailableByRoom,
  fetchOnlineHoldsByRoom,
} from "../../services/roomsApi";

// helper: meaningless live statuses
const isMeaninglessStatus = (s) => {
  const n = String(s || "").trim().toLowerCase();
  return !n || n === "vacant" || n === "available" || n === "free";
};
const pickLiveStatus = (live) =>
  live?.status ??
  live?.transaction_status ??
  live?.booking_status ??
  live?.state ??
  live?.status_name ??
  live?.statusName ??
  live?.bookingStatus ??
  null;
const pickLivePayment = (live) =>
  live?.payment_status ?? live?.paymentStatus ?? live?.pay_status ?? null;

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

  // Maintenance windows by room
  const [unavailMap, setUnavailMap] = useState(new Map());

  // Online-hold set (Awaiting confirmation)
  const [onlineHoldSet, setOnlineHoldSet] = useState(new Set());

  // Live occupancy map
  const [occMap, setOccMap] = useState(new Map());

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // live tick
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Mobile check for portal behavior
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Guest modal + selfie
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

  // 1) fetch rooms + initial occupancy and merge (ABORTABLE)
  useEffect(() => {
    if (!roomTypeId) return;
    const ctrl = new AbortController();
    const { signal } = ctrl;

    (async () => {
      setLoadingRooms(true);
      try {
        const normalized = await fetchRoomsByType(roomTypeId, { signal });

        // load occupancy and merge
        let byId = new Map();
        try {
          byId = await fetchOccupancyByRoom({ signal });
          setOccMap(byId);
        } catch (e) {
          if (e?.name !== "CanceledError") {
            console.warn("occupancy fetch failed", e?.message || e);
          }
        }

        if (signal.aborted) return;

        const merged = normalized.map((r) => {
          const live = byId.get(String(r.id)) ?? byId.get(Number(r.id)) ?? null;
          if (!live) return r;

          const liveDepMs = live.dep_iso ? Date.parse(live.dep_iso) : null;
          const liveStatus = pickLiveStatus(live);
          const livePayment = pickLivePayment(live);

          const admin_status =
            r.admin_status ??
            (!isMeaninglessStatus(liveStatus) ? liveStatus : null) ??
            null;

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

            admin_status,
            payment_status: livePayment ?? r.payment_status ?? null,
            _occ_status: liveStatus || null,
          };
        });

        if (!signal.aborted) setRooms(merged);
      } catch (e) {
        if (e?.name !== "CanceledError") {
          console.error(e);
          toast.error("Could not load rooms for this type.");
        }
      } finally {
        if (!signal.aborted) setLoadingRooms(false);
      }
    })();

    return () => ctrl.abort();
  }, [roomTypeId]);

  // 2) availability + maintenance + online holds when dates picked (PARALLEL + ABORT)
  useEffect(() => {
    if (!hasDates || !roomTypeId) {
      setAvailableIds(new Set());
      setUnavailMap(new Map());
      setOnlineHoldSet(new Set());
      return;
    }

    const ctrl = new AbortController();
    const { signal } = ctrl;

    (async () => {
      setFetchingAvail(true);
      try {
        const from = dayjs(arrival).format("YYYY-MM-DD");
        const to = dayjs(departure).format("YYYY-MM-DD");

        const [ids, map, holds] = await Promise.all([
          fetchAvailableRooms({ arrival, departure, roomTypeId, signal }),
          fetchUnavailableByRoom({ roomTypeId, from, to, signal }),
          fetchOnlineHoldsByRoom({ roomTypeId, from, to, signal }),
        ]);

        if (signal.aborted) return;

        setAvailableIds(ids);
        setUnavailMap(map);
        setOnlineHoldSet(holds);
        setSelectedIds([]); // reset selection when range changes
      } catch (e) {
        if (e?.name !== "AbortError" && e?.name !== "CanceledError") {
          console.error(e);
          toast.error("Could not load availability. Try another date range.");
          setAvailableIds(new Set());
          setUnavailMap(new Map());
          setOnlineHoldSet(new Set());
        }
      } finally {
        if (!signal.aborted) setFetchingAvail(false);
      }
    })();

    return () => ctrl.abort();
  }, [hasDates, arrival, departure, roomTypeId]);

  // 2b) when no dates picked, still fetch "active now" maintenance (for purple)
  useEffect(() => {
    if (hasDates || !roomTypeId) return;
    const ctrl = new AbortController();
    const { signal } = ctrl;

    (async () => {
      try {
        const today = dayjs().format("YYYY-MM-DD");
        const map = await fetchUnavailableByRoom({ roomTypeId, from: today, to: today, signal });
        if (!signal.aborted) setUnavailMap(map);
      } catch {
        if (!signal.aborted) setUnavailMap(new Map());
      }
      if (!signal.aborted) setOnlineHoldSet(new Set());
    })();

    return () => ctrl.abort();
  }, [hasDates, roomTypeId]);

  // 3) poll backend occupancy to refresh remaining seconds & departures
  useEffect(() => {
    let timer;
    const run = async () => {
      try {
        const byId = await fetchOccupancyByRoom();
        setOccMap(byId);
        setRooms((prev) =>
          prev.map((r) => {
            const live = byId.get(String(r.id)) ?? byId.get(Number(r.id)) ?? null;
            if (!live) return r;

            const liveDepMs = live.dep_iso ? Date.parse(live.dep_iso) : null;
            const liveStatus = pickLiveStatus(live);
            const livePayment = pickLivePayment(live);

            const admin_status =
              r.admin_status ??
              (!isMeaninglessStatus(liveStatus) ? liveStatus : null) ??
              null;

            return {
              ...r,
              departure_at_raw: live.dep_iso || r.departure_at_raw,
              _live_departure_ms: liveDepMs,
              _live_secs_left:
                typeof live.sec_left === "number" ? live.sec_left : null,

              admin_status,
              payment_status: livePayment ?? r.payment_status ?? null,
              _occ_status: liveStatus || null,
            };
          })
        );
      } catch (e) {
        console.warn("occupancy poll failed", e?.message || e);
      }
    };
    run();
    timer = setInterval(run, 30_000);
    return () => clearInterval(timer);
  }, []);

  // compute statuses (honors maintenance + online holds)
  const computedRooms = useMemo(
    () =>
      computeRooms({
        rooms,
        hasDates,
        availableIds,
        now,
        arrival,
        departure,
        unavailableMap: unavailMap,
        onlineHoldSet,
      }),
    [rooms, hasDates, availableIds, now, arrival, departure, unavailMap, onlineHoldSet]
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
    if (fetchingAvail) return; // block clicks during refresh
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
          {/* Hide title+subtitle on mobile, keep on desktop */}
          <div className="hidden md:block">
            <h1 className="text-3xl font-extrabold">
              {roomTypeName || "Room Booking"} Rooms
            </h1>
            <p className="opacity-80">
              Select your dates to see live available room(s).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LegendPill color="bg-emerald-500/90" label="Available" />
            <LegendPill color="bg-rose-500/90" label="Occupied" />
            <LegendPill color="bg-sky-500/90" label="Cleaning" />
            <LegendPill color="bg-amber-500/90" label="Pending" />
            <LegendPill color="bg-blue-500/90" label="Awaiting confirmation" />
            <LegendPill color="bg-violet-500/90" label="Maintenance" />
            <LegendPill color="bg-slate-600/90" label="Pick dates first" />
          </div>
        </div>

        {/* Dates + price */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm opacity-80">Arrival</label>
            {/* Arrival */}
<DatePicker
  selected={arrival}
  onChange={setArrival}
  placeholderText="Select arrival"
  className="w-full rounded-md border border-blue-400 bg-slate-900 px-3 py-2 placeholder:text-slate-400"
  calendarClassName="custom-datepicker"
  dateFormat="yyyy-MM-dd"
  minDate={new Date()}
  withPortal={isMobile}           // mobile overlay = no edge clipping
  shouldCloseOnSelect
  showPopperArrow={false}
  fixedHeight
  monthsShown={1}
/>
          </div>
          <div>
            <label className="mb-1 block text-sm opacity-80">Departure</label>
            {/* Departure */}
<DatePicker
  selected={departure}
  onChange={setDeparture}
  placeholderText="Select departure"
  className="w-full rounded-md border border-blue-400 bg-slate-900 px-3 py-2 placeholder:text-slate-400"
  calendarClassName="custom-datepicker"
  dateFormat="yyyy-MM-dd"
  minDate={arrival || new Date()}
  withPortal={isMobile}           // mobile overlay = no edge clipping
  shouldCloseOnSelect
  showPopperArrow={false}
  fixedHeight
  monthsShown={1}
/>
          </div>

          {/* Price card */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 col-span-2 sm:col-span-1">
            {/* MOBILE: room type + price side-by-side */}
            <div className="md:hidden flex items-baseline justify-between gap-2 mb-1">
              <div className="text-base font-bold truncate">
                {roomTypeName || "Room Booking"} Rooms
              </div>
              <div className="text-xl font-extrabold text-emerald-400">
                ₦{Number(pricePerNight || 0).toLocaleString("en-NG")}
              </div>
            </div>
            {/* MOBILE hint */}
            <div className="md:hidden text-[11px] opacity-70 mb-2">Per night</div>

            {/* DESKTOP: stacked */}
            <div className="hidden md:block">
              <div className="text-sm opacity-80">Per night</div>
              <div className="text-2xl font-extrabold text-emerald-400">
                ₦{Number(pricePerNight || 0).toLocaleString("en-NG")}
              </div>
            </div>

            {/* Meta (both) */}
            <div className="text-xs opacity-70">
              {nights} night(s) • {selectedIds.length} room(s)
            </div>
          </div>
        </div>

        {/* Rooms */}
        <section className="mb-8">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              
              {loadingRooms && (
                <span className="text-xs opacity-70">loading…</span>
              )}
              {fetchingAvail && hasDates && (
                <span className="text-xs opacity-70">checking availability…</span>
              )}
            </div>
            {/* Helper text removed */}
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center opacity-80">
              No rooms found for this type.
            </div>
          ) : (
            <div
              className={`grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 ${
                fetchingAvail ? "opacity-60 pointer-events-none" : ""
              }`}
            >
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
              disabled={
                fetchingAvail || !hasDates || selectedIds.length === 0 || total <= 0
              }
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

      {/* Global tweak for datepicker overlay */}
      <style jsx global>{`
        .react-datepicker-popper { z-index: 50; }
        .react-datepicker__portal { z-index: 60; background: rgba(2, 6, 23, 0.55); }
        @media (max-width: 767px) {
          .react-datepicker__portal .react-datepicker {
            width: 100vw;
            max-width: 100vw;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
        }
      `}</style>
    </main>
  );
}
