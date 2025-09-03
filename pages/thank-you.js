// pages/thank-you.js
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, "_");
const isConsumed = (s) => norm(s) === "consumed";

function FullScreenLoader({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-800 text-white">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-white/20 border-l-blue-400 mb-4" />
      <p className="text-lg font-semibold text-center px-4">{message}</p>
    </div>
  );
}

export default function ThankYouPage() {
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("awaiting_confirmation");
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);

  const uiConfirmed = useMemo(() => isConsumed(status), [status]);

  // Fast path: from localStorage (set by your pay flow)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("latest_booking");
      if (stored) {
        const b = JSON.parse(stored);
        setBooking(b);
        setStatus(isConsumed(b.status) ? "consumed" : "awaiting_confirmation");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll ONLY the status endpoint until it becomes "consumed".
  useEffect(() => {
    if (!booking?.payment_ref || uiConfirmed) return;
    let t;
    const run = async () => {
      try {
        setChecking(true);
        const r = await fetch(`/api/booking-status?payment_ref=${encodeURIComponent(booking.payment_ref)}`);
        if (r.ok) {
          const d = await r.json();
          const next = norm(d?.status);
          setStatus(isConsumed(next) ? "consumed" : "awaiting_confirmation");
        }
      } catch {} finally {
        setChecking(false);
      }
    };
    run();
    t = setInterval(run, 10_000);
    return () => clearInterval(t);
  }, [booking?.payment_ref, uiConfirmed]);

  const manualRefresh = async () => {
    if (!booking?.payment_ref) return;
    try {
      setChecking(true);
      const r = await fetch(`/api/booking-status?payment_ref=${encodeURIComponent(booking.payment_ref)}`);
      if (r.ok) {
        const d = await r.json();
        const next = norm(d?.status);
        setStatus(isConsumed(next) ? "consumed" : "awaiting_confirmation");
      }
    } catch {} finally {
      setChecking(false);
    }
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

  const Badge = () => (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        uiConfirmed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {uiConfirmed ? "Confirmed" : "Awaiting confirmation"}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white text-black py-10 px-4 md:px-20">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-2xl border border-blue-100">
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-2 rounded-full ${
              uiConfirmed ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
            } flex items-center justify-center text-3xl`}
          >
            {uiConfirmed ? "✔" : "ℹ"}
          </div>
          <h2 className="text-3xl font-extrabold text-blue-800">Awrab Suites Hotels</h2>
          <hr className="mt-2 border-blue-200" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          {uiConfirmed ? "🎉 Booking Confirmed" : "✅ Payment Received — Awaiting Confirmation"}
        </h1>

        <p className="mb-3 text-gray-700 text-center">
          Dear <strong>{booking.full_name}</strong>, your payment was successful.
          {uiConfirmed ? (
            <> Your booking is now <strong>confirmed</strong>. See details below.</>
          ) : (
            <> We’ve placed a temporary hold on your selected room(s) and your booking is <strong>awaiting confirmation</strong> by our team.</>
          )}
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
          <button
            onClick={manualRefresh}
            className="bg-slate-200 px-4 py-2 rounded hover:bg-slate-300"
          >
            {checking ? "Checking…" : "Check status now"}
          </button>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition">
            ← Go to Home
          </Link>
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition">
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
 