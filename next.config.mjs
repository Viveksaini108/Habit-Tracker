/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  // Emits .next/standalone — a self-contained server used by the Dockerfile
  // (node server.js). Plain `npm start` keeps working exactly as before.
  output: 'standalone',
};

export default nextConfig;
