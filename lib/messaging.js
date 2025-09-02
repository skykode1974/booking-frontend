// lib/messaging.js
import { firebaseApp } from "./firebase";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

/**
 * Ask for permission, get an FCM token (with your VAPID public key),
 * register the service worker, and POST the token to your backend.
 *
 * @param {Object} opts
 * @param {string} [opts.bookingRef] - optional ref to tie this device to a booking
 * @param {string} [opts.email]      - optional email for convenience on server
 * @param {string} [opts.phone]      - optional phone for convenience on server
 * @returns {Promise<string|null>}   - FCM token or null
 */
export async function subscribeForPush({ bookingRef, email, phone } = {}) {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) return null;

  // 1) Permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  // 2) Check browser support (Safari/old browsers)
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  // 3) Get token (waiting for our SW to be ready)
  const messaging = getMessaging(firebaseApp);
  const swReg = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FB_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  }).catch(() => null);

  if (!token) return null;

  // 4) Send token to your backend (store/associate device)
  try {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        booking_ref: bookingRef || null,
        email: email || null,
        phone: phone || null,
        platform: navigator.userAgent || "",
      }),
    });
  } catch {
    // non-blocking; token is still obtained
  }

  return token;
}

/**
 * Listen to foreground messages (when the page is open).
 * @param {(payload: any) => void} handler
 * @returns {() => void} unsubscribe
 */
export async function listenForegroundMessages(handler) {
  const supported = await isSupported().catch(() => false);
  if (!supported) return () => {};
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, handler);
}
