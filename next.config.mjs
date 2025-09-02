/** @type {import('next').NextConfig} */
const BACKEND = "https://admin.awrabsuiteshotel.com.ng/public"; // no trailing slash

const nextConfig = {
  reactStrictMode: true,
  images: { domains: ["admin.awrabsuiteshotel.com.ng", "hotel.skykode.com.ng"] },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // 🔵 Rooms & availability used by the booking page
        { source: "/api/rooms-by-type",            destination: `${BACKEND}/api/rooms-by-type` },
        { source: "/api/available-rooms",          destination: `${BACKEND}/api/available-rooms` },
        { source: "/api/rooms-live-overview",      destination: `${BACKEND}/api/rooms-live-overview` },
        { source: "/api/hms/unavailable/by-room",  destination: `${BACKEND}/api/hms/unavailable/by-room` },
        { source: "/api/hms/online-holds/by-room", destination: `${BACKEND}/api/hms/online-holds/by-room` },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
