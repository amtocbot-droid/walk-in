const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  typedRoutes: true,
  env: {
    APP_NAME: "Walk In",
    APP_VERSION: "0.1.0",
  },
  // Skip API routes for static export; use Cloudflare Pages Functions instead.
  trailingSlash: true,
};

module.exports = withPWA(nextConfig);
