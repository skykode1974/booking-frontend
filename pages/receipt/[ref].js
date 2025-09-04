// pages/receipt/[ref].js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const ADMIN_URL  = (ref) => `/api/hms/booking/admin-status?payment_ref=${encodeURIComponent(ref)}`;
const DETAIL_URL = (ref) => `/api/booking-by-ref?payment_ref=${encodeURIComponent(ref)}`;

const Pill = ({ label, tone = "default" }) => {
  const tones = {
    success: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    default: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] || tones.default}`}>
      {label}
    </span>
  );
};

function extractRoomTokens(val) {
  const out = [];
  const add = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return;
    const digits = s.replace(/\D+/g, "");
    out.push(digits || s);
  };
  if (Array.isArray(val)) val.forEach(add);
  else if (val != null) {
    let s = String(val);
    try { const j = JSON.parse(s); if (Array.isArray(j)) j.forEach(add); else add(s); }
    catch { s.split(",").forEach((p) => add(p)); }
  }
  return Array.from(new Set(out));
}
const parseRoomType = (v) => Array.isArray(v) ? v.join(", ") : String(v ?? "");

export default function ReceiptByRef() {
  const { query } = useRouter();
  const ref = (query.ref || "").toString();

  const [detail, setDetail] = useState(null);
  const [adminConfirmed, setAdminConfirmed] = useState(false);
  const [checking, setChecking] = useState(false);

  // Load details (for table)
  useEffect(() => {
    if (!ref) return;
    (async () => {
      try {
        const r = await fetch(DETAIL_URL(ref), { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          setDetail(d?.booking || d);
        }
      } catch {}
    })();
  }, [ref]);

  // Poll admin confirmation
  useEffect(() => {
    if (!ref || adminConfirmed) return;
    let t;
    const run = async () => {
      try {
        setChecking(true);
        const r = await fetch(ADMIN_URL(ref), { cache: "no-store" });
        if (r.ok) {
          const d = await r.json().catch(() => ({}));
          setAdminConfirmed(!!d?.admin_confirmed);
        } else if (r.status === 404) {
          setAdminConfirmed(false);
        }
      } catch {}
      finally { setChecking(false); }
    };
    run();
    t = setInterval(run, 8_000);
    return () => clearInterval(t);
  }, [ref, adminConfirmed]);

  const PaymentBadge = <Pill label="Payment: Confirmed" tone="success" />;
  const BookingBadge = adminConfirmed
    ? <Pill label="Booking: Confirmed" tone="success" />
    : <Pill label="Room: Awaiting Confirmation" tone="warn" />;

  if (!ref) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div>Missing reference.</div>
      </main>
    );
  }

  if (!detail && !adminConfirmed) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-xl font-bold mb-2">Receipt not found</h1>
          <p className="text-sm text-gray-600">We couldn’t find a booking with reference <strong>{ref}</strong>.</p>
          <Link href="/receipt" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">
            Try another reference
          </Link>
        </div>
      </div>
    );
  }

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

        <div className="flex items-center justify-center gap-2 mb-2">
          {PaymentBadge}
          {BookingBadge}
        </div>

        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          {adminConfirmed ? "🎉 Booking Confirmed" : "✅ Payment Confirmed — Room Awaiting Confirmation"}
        </h1>

        {(detail?.bookings?.length || 0) > 0 && (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-blue-200 text-sm rounded overflow-hidden">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="border border-blue-300 px-3 py-2">Room No</th>
                  <th className="border border-blue-300 px-3 py-2">Room Type</th>
                  <th className="border border-blue-300 px-3 py-2">Arrival</th>
                  <th className="border border-blue-300 px-3 py-2">Departure</th>
                  <th className="border border-blue-300 px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.bookings.map((it, i) => {
                  const roomNo = extractRoomTokens(it.room_number ?? it.room_no ?? it.room).join(", ") || "-";
                  const roomType = it.room_type ?? parseRoomType(detail.room_type) ?? "-";
                  return (
                    <tr key={i} className="bg-white hover:bg-blue-50">
                      <td className="border border-blue-200 px-3 py-2">{roomNo}</td>
                      <td className="border border-blue-200 px-3 py-2">{roomType}</td>
                      <td className="border border-blue-200 px-3 py-2">{detail?.arrival_date || "-"}</td>
                      <td className="border border-blue-200 px-3 py-2">{detail?.departure_date || "-"}</td>
                      <td className="border border-blue-200 px-3 py-2">
                        {adminConfirmed ? "Confirmed" : "Awaiting confirmation"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={async () => {
              try {
                setChecking(true);
                const r = await fetch(ADMIN_URL(ref), { cache: "no-store" });
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
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            🖨️ Print
          </button>
          <Link href="/" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
