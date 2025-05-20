/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Add this to allow dev origins
  experimental: {
    allowedDevOrigins: ["10.34.59.129", "localhost"], // Add your specific IP and localhost
  },
  // Optional: Enable React Strict Mode
  reactStrictMode: true,
};

export default nextConfig;