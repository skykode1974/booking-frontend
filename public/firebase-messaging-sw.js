// public/firebase-messaging-sw.js

// Keep the SW always fresh
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());

// Use compat build in the worker (simplest)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// 🔴 Paste your public Firebase config (public, safe). It must be LITERAL here.
firebase.initializeApp({
  apiKey: "AIzaSyCfBzLf5-VD_dibFG27__BR-4XhI0dw0d0",
  authDomain: "awrab-suites-hotel.firebaseapp.com",
  projectId: "awrab-suites-hotel",
  storageBucket: "awrab-suites-hotel.firebasestorage.app",
  messagingSenderId: "597083098886",
  appId: "1:597083098886:web:244cfae6c0e7976018d887",
});

const messaging = firebase.messaging();

// Show notification when app is in **background**
messaging.onBackgroundMessage((payload) => {
  const data = payload?.notification || {};
  const title = data.title || "Awrab Suites";
  const body = data.body || "You have an update.";
  const icon = data.icon || "/icons/icon-192.png";
  const tag  = data.tag  || "hms-update";
  // Optional deep link
  const clickAction = (payload?.data && (payload.data.click_action || payload.data.url)) || "/";

  self.registration.showNotification(title, {
    body,
    icon,
    tag,
    data: { url: clickAction },
  });
});

// Open your site when the user taps the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then((clientsArr) => {
      const had = clientsArr.find((c) => c.url.includes(url));
      if (had) return had.focus();
      return self.clients.openWindow(url);
    })
  );
});
