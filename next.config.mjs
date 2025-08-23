/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { domains: ["admin.awrabsuiteshotel.com.ng", "hotel.skykode.com.ng"] },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/api/:path*", destination: "https://admin.awrabsuiteshotel.com.ng/api/:path*" },
      ],
    };
  },
};
export default nextConfig;
