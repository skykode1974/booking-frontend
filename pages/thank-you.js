// pages/thank-you.js
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/router";

// ---------- helpers ----------
const normalize = (s) => String(s || "").toLowerCase().replace(/\s+/g, "_");
const statusIsConfirmed = (s) => ["consumed", "confirmed"].includes(normalize(s));
// -----------------------------

function FullScreenLoader({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-800 text-white">
      <div className="loader animate-spin rounded-full h-14 w-14 border-t-4 border-blue-400 border-opacity-50 mb-4"></div>
      <p className="text-lg font-semibold text-center px-4">{message}</p>
      <style jsx>{`
        .loader { border: 4px solid rgba(255,255,255,0.2); border-left-color: #00c6ff; }
      `}</style>
    </div>
  );
}

export default function ThankYouPage() {
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // status handling
  const [status, setStatus] = useState("awaiting_confirmation");
  const [checking, setChecking] = useState(false);

  // push + firebase loader flags
  const [pushEnabled, setPushEnabled] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // to avoid duplicate local notifications
  const notifiedRef = useRef(false);

  /** ---------- 1) Load from localStorage (fast path) ---------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("latest_booking");
      if (stored) {
        const b = JSON.parse(stored);
        setBooking(b);
        const initial = normalize(b.status || b.overall_status || b.payment_status || "awaiting_confirmation");
        setStatus(initial);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** ---------- 2) If opened via ?ref=..., fetch booking ---------- */
  useEffect(() => {
    if (booking) return;
    const ref = router.query?.ref;
    if (!ref) return;
    (async () => {
      try {
        const r = await fetch(`/api/booking-by-ref?payment_ref=${encodeURIComponent(ref)}`);
        if (r.ok) {
          const d = await r.json();
          if (d?.booking) {
            setBooking(d.booking);
            setStatus(normalize(d.booking.status || "awaiting_confirmation"));
          }
        }
      } catch {}
    })();
  }, [router.query?.ref, booking]);

  /** ---------- 3) Poll status while awaiting confirmation ---------- */
  useEffect(() => {
    if (!booking?.payment_ref) return;
    let timer = null;

    const refreshDetailsIfConfirmed = async () => {
      if (!booking?.payment_ref) return;
      try {
        const r = await fetch(`/api/booking-by-ref?payment_ref=${encodeURIComponent(booking.payment_ref)}`);
        if (r.ok) {
          const d = await r.json();
          if (d?.booking) setBooking(d.booking);
        }
      } catch {}
    };

    const check = async () => {
      try {
        setChecking(true);
        const res = await fetch(`/api/booking-status?payment_ref=${encodeURIComponent(booking.payment_ref)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.status) {
            const next = normalize(data.status);
            setStatus(next);
            if (statusIsConfirmed(next)) {
              // once it flips, fetch full details so the receipt text is perfect
              await refreshDetailsIfConfirmed();
            }
          }
        }
      } catch {} finally {
        setChecking(false);
      }
    };

    if (!statusIsConfirmed(status)) {
      check();
      timer = setInterval(check, 10_000);
    }
    return () => timer && clearInterval(timer);
  }, [booking?.payment_ref, status]);

  /** ---------- 4) Local popup (Notification API) when confirmed ---------- */
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!statusIsConfirmed(status)) return;
    if (notifiedRef.current) return; // already shown

    const title = "✅ Booking Confirmed";
    const body  = `Reference ${booking?.payment_ref || ""} has been confirmed.`;
    const icon  = "/icons/icon-192.png";

    const show = () => {
      try {
        new Notification(title, { body, icon });
        notifiedRef.current = true;
      } catch {}
    };

    if (Notification.permission === "granted") {
      show();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") show();
      });
    }
  }, [status, booking?.payment_ref]);

  /** ---------- 5) Firebase CDN script ready callback ---------- */
  const onFirebaseReady = () => setFirebaseReady(true);

  /** ---------- 6) Enable Push (FCM via CDN, no npm) ---------- */
  async function enablePush() {
    if (!booking?.payment_ref) return;

    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      alert("Push not supported on this device/browser.");
      return;
    }

    // If we already enabled and have a token, no need to run again
    const existing = localStorage.getItem("fcm_token");
    if (existing) {
      setPushEnabled(true);
      return;
    }

    // Guard: basic env presence
    const hasEnv =
      process.env.NEXT_PUBLIC_FB_API_KEY &&
      process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FB_APP_ID &&
      process.env.NEXT_PUBLIC_FB_VAPID_KEY;
    if (!hasEnv) {
      alert("Push is not configured on this site.");
      return;
    }

    try {
      // 1) Register our SW (idempotent)
      const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

      // 2) Wait until Firebase compat scripts finished loading
      if (!firebaseReady || !window.firebase) {
        await new Promise((res) => setTimeout(res, 300));
      }
      if (!window.firebase) {
        alert("Firebase failed to load.");
        return;
      }

      // 3) Initialize firebase in-page from env (safe for client)
      const fbConfig = {
        apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FB_APP_ID,
      };
      if (!window.firebase.apps?.length) window.firebase.initializeApp(fbConfig);

      // 4) Let SW know too (optional)
      if (reg.active) {
        try { reg.active.postMessage({ type: "INIT_FB", config: fbConfig }); } catch {}
      }

      // 5) Ask for permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // 6) Get FCM token
      const messaging = window.firebase.messaging();
      const token = await messaging.getToken({
        vapidKey: process.env.NEXT_PUBLIC_FB_VAPID_KEY,
        serviceWorkerRegistration: reg,
      });

      if (!token) throw new Error("No FCM token created.");

      // 7) Send token to your backend (associate with booking ref)
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_ref: booking.payment_ref,
          token,
          email: booking.email || null,
          phone: booking.phone || null,
          platform: navigator.userAgent || "",
        }),
      });

      // 8) Save locally to avoid asking again
      localStorage.setItem("fcm_token", token);
      setPushEnabled(true);

      // 9) Foreground listener (optional)
      messaging.onMessage((payload) => {
        const title = payload?.notification?.title || "Booking update";
        const body  = payload?.notification?.body  || "";
        console.log("FCM foreground:", title, body, payload);
      });
    } catch (e) {
      console.error("Enable push failed:", e);
      alert("Could not enable push notifications.");
    }
  }

  /** ---------- Manual refresh button ---------- */
  const manualRefresh = async () => {
    if (!booking?.payment_ref) return;
    try {
      setChecking(true);
      const res = await fetch(`/api/booking-status?payment_ref=${encodeURIComponent(booking.payment_ref)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.status) {
          const next = normalize(data.status);
          setStatus(next);
          if (statusIsConfirmed(next)) {
            try {
              const r = await fetch(`/api/booking-by-ref?payment_ref=${encodeURIComponent(booking.payment_ref)}`);
              if (r.ok) {
                const d = await r.json();
                if (d?.booking) setBooking(d.booking);
              }
            } catch {}
          }
        }
      }
    } catch {} finally {
      setChecking(false);
    }
  };

  const isConfirmed = statusIsConfirmed(status);

  // If we already have a token saved, reflect button state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("fcm_token");
      if (t) setPushEnabled(true);
    }
  }, []);

  if (isLoading) {
    return <FullScreenLoader message="Processing your payment… preparing your receipt." />;
  }

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

  const StatusBadge = () => (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isConfirmed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {isConfirmed ? "Confirmed" : "Awaiting confirmation"}
    </span>
  );

  return (
    <>
      {/* Firebase (CDN) – no npm install needed */}
      <Script
        src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
        strategy="afterInteractive"
        onLoad={onFirebaseReady}
      />
      <Script
        src="https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
        strategy="afterInteractive"
        onLoad={onFirebaseReady}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white text-black py-10 px-4 md:px-20 print:bg-white font-sans animate-fade-in">
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-2xl border border-blue-100 print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-6">
            <div
              className={`w-16 h-16 mx-auto mb-2 rounded-full ${
                isConfirmed ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
              } flex items-center justify-center text-3xl print:hidden`}
            >
              {isConfirmed ? "✔" : "ℹ"}
            </div>
            <h2 className="text-3xl font-extrabold text-blue-800 print:text-black">
              Awrab Suites Hotels
            </h2>
            <hr className="mt-2 border-blue-200 print:border-black" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <StatusBadge />
          </div>

          <h1 className="text-2xl font-bold mb-4 text-blue-700 print:text-black text-center">
            {isConfirmed ? "🎉 Booking Confirmed" : "✅ Payment Received — Awaiting Confirmation"}
          </h1>

          <p className="mb-3 text-gray-700 print:text-black text-center">
            Dear <strong>{booking.full_name}</strong>, your payment was successful.
            {isConfirmed ? (
              <> Your booking is now <strong>confirmed</strong>. See details below.</>
            ) : (
              <> We’ve placed a temporary hold on your selected room(s) and your booking is <strong>awaiting confirmation</strong> by our team.</>
            )}
          </p>

          {!isConfirmed && (
            <div className="mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-200 p-3 rounded text-center print:hidden">
              {booking.email ? (
                <>📩 We’ll email <strong>{booking.email}</strong> when it’s confirmed.</>
              ) : (
                <>📩 We’ll notify you when it’s confirmed.</>
              )}
              {booking.phone && <> 📱 We may also SMS <strong>{booking.phone}</strong>.</>}
              <div className="mt-2 opacity-80">This page checks for updates automatically.</div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={enablePush}
                  disabled={pushEnabled}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {pushEnabled ? "Push enabled" : "Enable push alerts"}
                </button>
                <button
                  onClick={manualRefresh}
                  className="inline-flex items-center justify-center rounded-md bg-slate-200 px-3 py-1.5 text-slate-900 font-semibold hover:bg-slate-300"
                >
                  {checking ? "Checking…" : "Check status now"}
                </button>
              </div>
            </div>
          )}

          {/* Room Booking View */}
          {booking.bookings ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-blue-200 text-sm md:text-base rounded overflow-hidden print:text-sm">
                <thead className="bg-blue-500 text-white print:bg-gray-300 print:text-black">
                  <tr>
                    <th className="border border-blue-300 px-3 py-2">Room No</th>
                    <th className="border border-blue-300 px-3 py-2">Room Type</th>
                    <th className="border border-blue-300 px-3 py-2">Arrival</th>
                    <th className="border border-blue-300 px-3 py-2">Departure</th>
                    <th className="border border-blue-300 px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.bookings?.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-blue-50 print:hover:bg-white">
                      <td className="border border-blue-200 px-3 py-2">{item.room_number}</td>
                      <td className="border border-blue-200 px-3 py-2">{item.room_type}</td>
                      <td className="border border-blue-200 px-3 py-2">{booking.arrival_date}</td>
                      <td className="border border-blue-200 px-3 py-2">{booking.departure_date}</td>
                      <td className="border border-blue-200 px-3 py-2 capitalize">
                        {item.status ? item.status : (isConfirmed ? "Confirmed" : "Awaiting confirmation")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Activity booking fallback
            <div className="text-center mt-6">
              <p className="mb-1 text-gray-800 print:text-black">
                <strong>Date:</strong> {booking.booking_date}
              </p>
              <p className="font-semibold mb-2">Activities Booked:</p>
              <ul className="list-disc list-inside mb-4 text-left max-w-sm mx-auto print:text-black">
                {booking.activities?.map((a, i) => (
                  <li key={i} className="capitalize">
                    {a.activity_type} – ₦{(a.price ?? 0).toLocaleString()}
                  </li>
                ))}
              </ul>
              <p className="text-green-700 font-bold">
                💰 Total Paid: ₦{(booking.activities?.reduce((s, a) => s + (a.price ?? 0), 0) || 0).toLocaleString()}
              </p>
            </div>
          )}

          <div className="space-y-2 text-gray-800 print:text-black text-center mt-4">
            <p><strong>🔖 Booking Reference:</strong> {booking.payment_ref || "N/A"}</p>
            <p><strong>📞 Phone:</strong> {booking.phone}</p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 justify-center print:hidden">
            <Link
              href={`/receipt/${encodeURIComponent(booking.payment_ref || "")}`}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition"
            >
              Open receipt link
            </Link>

            <button
              onClick={() => {
                try {
                  const href = `${window.location.origin}/receipt/${encodeURIComponent(booking.payment_ref || "")}`;
                  navigator.clipboard.writeText(href);
                  alert("Receipt link copied");
                } catch {
                  alert("Could not copy link");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
              Copy link
            </button>

            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
              ← Go to Home
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition"
            >
              🖨️ Print Receipt
            </button>
          </div>
        </div>

        <style jsx>{`
          .animate-fade-in { animation: fadeIn 1s ease-in-out; }
          @keyframes fadeIn { from {opacity:0; transform:translateY(20px)} to {opacity:1; transform:translateY(0)} }
        `}</style>
      </div>
    </>
  );
}
