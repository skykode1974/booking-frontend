// /lib/echo.js
import Pusher from "pusher-js";
import Echo from "laravel-echo";

let echo;

export function getEcho() {
  if (echo) return echo;
  if (typeof window === "undefined") return null;

  window.Pusher = Pusher;
  echo = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER, // if using Pusher
    wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || window.location.hostname,
    wsPort: Number(process.env.NEXT_PUBLIC_PUSHER_PORT || 6001),
    wssPort: Number(process.env.NEXT_PUBLIC_PUSHER_PORT || 6001),
    forceTLS: !!process.env.NEXT_PUBLIC_PUSHER_TLS,
    encrypted: !!process.env.NEXT_PUBLIC_PUSHER_TLS,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
  });
  return echo;
}
