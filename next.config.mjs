/** @type {import('next').NextConfig} */

// Read once at build time (set on Vercel → Project → Settings → Environment Variables)
const BACKEND = process.env.BACKEND_BASE_URL || "https://admin.awrabsuiteshotel.com.ng/public"; // no trailing slash

const nextConfig = {
  reactStrictMode: true,
  images: { domains: ["admin.awrabsuiteshotel.com.ng", "hotel.skykode.com.ng"] },

  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // 🔵 Home page room types
        { source: "/api/room-types",              destination: `${BACKEND}/api/room-types` },

        // 🔵 Booking page data
        { source: "/api/rooms-by-type",           destination: `${BACKEND}/api/rooms-by-type` },
        { source: "/api/rooms",                   destination: `${BACKEND}/api/rooms` }, // fallback path used by FE
        { source: "/api/available-rooms",         destination: `${BACKEND}/api/available-rooms` },
        { source: "/api/rooms-live-overview",     destination: `${BACKEND}/api/rooms-live-overview` },
        { source: "/api/hms/unavailable/by-room", destination: `${BACKEND}/api/hms/unavailable/by-room` },
        { source: "/api/hms/online-holds/by-room",destination: `${BACKEND}/api/hms/online-holds/by-room` },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
