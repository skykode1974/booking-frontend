// pages/thank-you.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** ------------ CONFIG: point this to your status endpoint -------------- */
const STATUS_URL = (ref) =>
  `/api/booking-status?payment_ref=${encodeURIComponent(ref)}`;
// If you prefer your older path, use:
// const STATUS_URL = (ref) => `/api/hms/booking/status?payment_ref=${encodeURIComponent(ref)}`;

/** ---------------- helpers ---------------- */
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, "_");
const isConsumed = (s) => norm(s) === "consumed";

function Pill({ label, tone = "default" }) {
  const tones = {
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-blue-100 text-blue-700",
    warn: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    default: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] || tones.default}`}>
      {label}
    </span>
  );
}

function FullScreenLoader({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-800 text-white">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-white/20 border-l-blue-400 mb-4" />
      <p className="text-lg font-semibold text-center px-4">{message}</p>
    </div>
  );
}

/** ---------------- page ---------------- */
export default function ThankYouPage() {
  const [booking, setBooking] = useState(null);
  const [tempStatus, setTempStatus] = useState("awaiting_confirmation"); // temp table status
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);

  const bookingConfirmed = useMemo(() => isConsumed(tempStatus), [tempStatus]);

  // 1) Prime from localStorage (set by your checkout step)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("latest_booking");
      if (raw) {
        const b = JSON.parse(raw);
        setBooking(b);
        setTempStatus(isConsumed(b?.status) ? "consumed" : "awaiting_confirmation");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 2) Poll ONLY the temp row status until it becomes "consumed"
  useEffect(() => {
    if (!booking?.payment_ref || bookingConfirmed) return;
    let t;
    const run = async () => {
      try {
        setChecking(true);
        const r = await fetch(STATUS_URL(booking.payment_ref), { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();           // expect { status: "confirmed" | "consumed" | ... }
          const next = norm(d?.status);
          setTempStatus(isConsumed(next) ? "consumed" : "awaiting_confirmation");
          // Keep localStorage in sync so the receipt page picks it up too
          const raw = localStorage.getItem("latest_booking");
          if (raw) {
            const b = JSON.parse(raw);
            b.status = next;
            localStorage.setItem("latest_booking", JSON.stringify(b));
          }
        }
      } catch {}
      finally { setChecking(false); }
    };
    run();
    t = setInterval(run, 10_000);
    return () => clearInterval(t);
  }, [booking?.payment_ref, bookingConfirmed]);

  const manualRefresh = async () => {
    if (!booking?.payment_ref) return;
    try {
      setChecking(true);
      const r = await fetch(STATUS_URL(booking.payment_ref), { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        const next = norm(d?.status);
        setTempStatus(isConsumed(next) ? "consumed" : "awaiting_confirmation");
      }
    } catch {} finally { setChecking(false); }
  };

  if (loading) return <FullScreenLoader message="Processing your payment… preparing your receipt." />;

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-gray-100 p-6 rounded-lg shadow">
          <p className="text-red-600">⚠️ No booking found.</p>
          <Link href="/" className="text-blue-600 hover:underline block mt-4">← Go to Home</Link>
        </div>
      </div>
    );
  }

  // Payment is confirmed if we reached this page after successful checkout
  const PaymentBadge = <Pill label="Payment: Confirmed" tone="success" />;
  const BookingBadge = bookingConfirmed
    ? <Pill label="Booking: Confirmed" tone="success" />
    : <Pill label="Room: Awaiting Confirmation" tone="warn" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white text-black py-10 px-4 md:px-20">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-2xl border border-blue-100">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-2 rounded-full ${bookingConfirmed ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"} flex items-center justify-center text-3xl`}>
            {bookingConfirmed ? "✔" : "ℹ"}
          </div>
          <h2 className="text-3xl font-extrabold text-blue-800">Awrab Suites Hotels</h2>
          <hr className="mt-2 border-blue-200" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          {PaymentBadge}
          {BookingBadge}
        </div>

        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          {bookingConfirmed ? "🎉 Booking Confirmed" : "✅ Payment Confirmed — Room Awaiting Confirmation"}
        </h1>

        <p className="mb-3 text-gray-700 text-center">
          Dear <strong>{booking.full_name}</strong>, your payment was successful.
          {bookingConfirmed
            ? <> Your booking is now <strong>confirmed</strong>. See details below.</>
            : <> We’ve placed a temporary hold on your selected room(s) while our team verifies your booking.</>}
        </p>

        <div className="space-y-2 text-gray-800 text-center mt-4">
          <p><strong>🔖 Booking Reference:</strong> {booking.payment_ref || "N/A"}</p>
          {booking.phone && <p><strong>📞 Phone:</strong> {booking.phone}</p>}
          {booking.email && <p><strong>📧 Email:</strong> {booking.email}</p>}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href={`/receipt/${encodeURIComponent(booking.payment_ref || "")}`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Open receipt link
          </Link>
          <button onClick={manualRefresh} className="bg-slate-200 px-4 py-2 rounded hover:bg-slate-300">
            {checking ? "Checking…" : "Check status now"}
          </button>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition">
            ← Home
          </Link>
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition">
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}
