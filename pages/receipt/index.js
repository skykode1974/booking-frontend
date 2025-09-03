// pages/receipt/index.js
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, "_");
const statusIsConfirmed = (s) => ["consumed", "confirmed"].includes(norm(s));

function Badge({ ok }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {ok ? "Confirmed" : "Awaiting confirmation"}
    </span>
  );
}

export default function ReceiptByRef() {
  const router = useRouter();

  const [ref, setRef] = useState("");
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("awaiting_confirmation");
  const [checking, setChecking] = useState(false);

  const isConfirmed = useMemo(() => statusIsConfirmed(status), [status]);

  // derive ref from URL after mount
  useEffect(() => {
    const qRef =
      (router.query?.ref && String(router.query.ref)) ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("ref")
        : "") ||
      "";
    setRef(qRef);
  }, [router.query?.ref]);

  // load booking
  useEffect(() => {
    if (!ref) return;
    (async () => {
      try {
        const r = await fetch(`/api/booking-by-ref?payment_ref=${encodeURIComponent(ref)}`);
        if (r.ok) {
          const d = await r.json();
          if (d?.booking) {
            setBooking(d.booking);
            setStatus(norm(d.booking.status || "awaiting_confirmation"));
          }
        }
      } catch {}
    })();
  }, [ref]);

  // poll until consumed|confirmed
  useEffect(() => {
    if (!ref || isConfirmed) return;
    let t;
    const run = async () => {
      try {
        setChecking(true);
        const r = await fetch(`/api/booking-status?payment_ref=${encodeURIComponent(ref)}`);
        if (r.ok) {
          const d = await r.json();
          if (d?.status) setStatus(norm(d.status));
        }
      } catch {} finally {
        setChecking(false);
      }
    };
    run();
    t = setInterval(run, 10_000);
    return () => clearInterval(t);
  }, [ref, isConfirmed]);

  // simple local notification when confirmed
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!isConfirmed || !ref) return;
    const title = "✅ Booking Confirmed";
    const body = `Reference ${ref} has been confirmed.`;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") new Notification(title, { body });
      });
    }
  }, [isConfirmed, ref]);

  const manualRefresh = async () => {
    if (!ref) return;
    try {
      setChecking(true);
      const r = await fetch(`/api/booking-status?payment_ref=${encodeURIComponent(ref)}`);
      if (r.ok) {
        const d = await r.json();
        if (d?.status) setStatus(norm(d.status));
      }
    } catch {} finally {
      setChecking(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied");
    } catch {
      alert("Could not copy link");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white text-black py-10 px-4 md:px-20">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-2xl border border-blue-100">
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-2 rounded-full ${
              isConfirmed ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
            } flex items-center justify-center text-3xl`}
          >
            {isConfirmed ? "✔" : "ℹ"}
          </div>
          <h2 className="text-3xl font-extrabold text-blue-800">Awrab Suites Hotels</h2>
          <hr className="mt-2 border-blue-200" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge ok={isConfirmed} />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          {isConfirmed ? "🎉 Booking Confirmed" : "✅ Payment Received — Awaiting Confirmation"}
        </h1>

        {booking?.bookings ? (
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
                {booking.bookings.map((it, i) => (
                  <tr key={i} className="bg-white hover:bg-blue-50">
                    <td className="border border-blue-200 px-3 py-2">{it.room_number}</td>
                    <td className="border border-blue-200 px-3 py-2">{it.room_type}</td>
                    <td className="border border-blue-200 px-3 py-2">{booking.arrival_date}</td>
                    <td className="border border-blue-200 px-3 py-2">{booking.departure_date}</td>
                    <td className="border border-blue-200 px-3 py-2 capitalize">
                      {it.status ? it.status : isConfirmed ? "Confirmed" : "Awaiting confirmation"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="space-y-2 text-gray-800 text-center mt-4">
          <p><strong>🔖 Booking Reference:</strong> {ref || "—"}</p>
          {booking?.phone && <p><strong>📞 Phone:</strong> {booking.phone}</p>}
          {booking?.email && <p><strong>📧 Email:</strong> {booking.email}</p>}
        </div>

        <div className="mt-8 flex gap-3 justify-center">
          <button onClick={manualRefresh} className="bg-slate-200 px-4 py-2 rounded hover:bg-slate-300">
            {checking ? "Checking…" : "Check status now"}
          </button>
          <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            🖨️ Print
          </button>
          <button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Copy link
          </button>
          <Link href="/" className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
