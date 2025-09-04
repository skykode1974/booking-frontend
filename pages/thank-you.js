// pages/thank-you.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const ADMIN_URL = (ref) =>
  `/api/hms/booking/admin-status?payment_ref=${encodeURIComponent(ref)}`;

function Pill({ label, tone = "default" }) {
  const tones = {
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-blue-100 text-blue-700",
    warn: "bg-amber-100 text-amber-700",
    default: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] || tones.default}`}>
      {label}
    </span>
  );
}

export default function ThankYouPage() {
  const [booking, setBooking] = useState(null);
  const [adminConfirmed, setAdminConfirmed] = useState(false);
  const [checking, setChecking] = useState(false);

  // Seed from localStorage (set during checkout)
  useEffect(() => {
    const saved = localStorage.getItem("latest_booking");
    if (saved) setBooking(JSON.parse(saved));
  }, []);

  // Poll ONLY whether admin has rebooked into original table
  useEffect(() => {
    if (!booking?.payment_ref || adminConfirmed) return;
    let t;
    const run = async () => {
      try {
        setChecking(true);
        const r = await fetch(ADMIN_URL(booking.payment_ref), { cache: "no-store" });
        if (r.ok) {
          const d = await r.json().catch(() => ({}));
          setAdminConfirmed(!!d?.admin_confirmed);
        } else if (r.status === 404) {
          setAdminConfirmed(false);
        }
      } catch {/* ignore transient errors */}
      finally { setChecking(false); }
    };
    run();
    t = setInterval(run, 8_000);
    return () => clearInterval(t);
  }, [booking?.payment_ref, adminConfirmed]);

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

  const PaymentBadge = <Pill label="Payment: Confirmed" tone="success" />;
  const BookingBadge = adminConfirmed
    ? <Pill label="Booking: Confirmed" tone="success" />
    : <Pill label="Room: Awaiting Confirmation" tone="warn" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white text-black py-10 px-4 md:px-20">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-2xl border border-blue-100">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-2 rounded-full ${adminConfirmed ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"} flex items-center justify-center text-3xl`}>
            {adminConfirmed ? "✔" : "ℹ"}
          </div>
          <h2 className="text-3xl font-extrabold text-blue-800">Awrab Suites Hotels</h2>
          <hr className="mt-2 border-blue-200" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          {PaymentBadge}
          {BookingBadge}
        </div>

        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          {adminConfirmed ? "🎉 Booking Confirmed" : "✅ Payment Confirmed — Room Awaiting Confirmation"}
        </h1>

        <p className="mb-3 text-gray-700 text-center">
          Dear <strong>{booking.full_name}</strong>, your payment was successful.
          {adminConfirmed
            ? <> Your booking is now <strong>confirmed</strong>. See details below.</>
            : <> We’ve placed a temporary hold on your room(s) while our team verifies your booking.</>}
        </p>

        <div className="space-y-2 text-gray-800 text-center mt-4">
          <p><strong>🔖 Booking Reference:</strong> {booking.payment_ref}</p>
          {booking.phone && <p><strong>📞 Phone:</strong> {booking.phone}</p>}
          {booking.email && <p><strong>📧 Email:</strong> {booking.email}</p>}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href={`/receipt/${encodeURIComponent(booking.payment_ref)}`}
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded">
            Open receipt link
          </Link>
          <button
            onClick={async () => {
              try {
                setChecking(true);
                const r = await fetch(ADMIN_URL(booking.payment_ref), { cache: "no-store" });
                if (r.ok) {
                  const d = await r.json().catch(() => ({}));
                  setAdminConfirmed(!!d?.admin_confirmed);
                } else if (r.status === 404) setAdminConfirmed(false);
              } finally { setChecking(false); }
            }}
            className="bg-slate-200 px-4 py-2 rounded hover:bg-slate-300"
          >
            {checking ? "Checking…" : "Check status now"}
          </button>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            ← Home
          </Link>
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded">
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}
