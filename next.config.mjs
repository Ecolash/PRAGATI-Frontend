/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow cross-origin requests from LAN devices in development
  allowedDevOrigins: [
    "10.145.70.30", // Your Mac's LAN IP
    "localhost", // Local access
    "127.0.0.1", // Local access
  ],
};

export default nextConfig;
