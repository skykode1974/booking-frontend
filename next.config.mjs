/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow images served from your Laravel hosts (only needed if you use next/image)
  images: {
    domains: ["admin.awrabsuiteshotel.com.ng", "hotel.skykode.com.ng"],
  },

  // Proxy all /api/* calls to your Laravel API on the admin subdomain
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://admin.awrabsuiteshotel.com.ng/api/:path*",
      },
    ];
  },
};

export default nextConfig;
