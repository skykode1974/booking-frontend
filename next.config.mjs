/** @type {import('next').NextConfig} */

// You may also set this in Vercel → Settings → Environment Variables
const BACKEND =
  process.env.BACKEND_BASE_URL ||
  "https://admin.awrabsuiteshotel.com.ng/public"; // no trailing slash

const nextConfig = {
  reactStrictMode: true,
  images: { domains: ["admin.awrabsuiteshotel.com.ng", "hotel.skykode.com.ng"] },

  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // ✅ Explicit ones (optional, but fine to keep)
        { source: "/api/room-types",                destination: `${BACKEND}/api/room-types` },
        { source: "/api/rooms-by-type",             destination: `${BACKEND}/api/rooms-by-type` },
        { source: "/api/rooms",                     destination: `${BACKEND}/api/rooms` },
        { source: "/api/available-rooms",           destination: `${BACKEND}/api/available-rooms` },
        { source: "/api/rooms-live-overview",       destination: `${BACKEND}/api/rooms-live-overview` },
        { source: "/api/hms/unavailable/by-room",   destination: `${BACKEND}/api/hms/unavailable/by-room` },
        { source: "/api/hms/online-holds/by-room",  destination: `${BACKEND}/api/hms/online-holds/by-room` },

        // 🔥 Catch-all: anything else under /api/* goes to Laravel.
        // Local files like /api/booking-status and /api/booking-by-ref still win precedence.
        { source: "/api/:path*", destination: `${BACKEND}/api/:path*` },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
