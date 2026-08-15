const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone server output for Docker / VPS / EC2 deployments.
  // Cloudflare Pages uses next.config.cloudflare.js (see build:cloudflare).
  output: "standalone",
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
  // Prisma engines/client are resolved at runtime, not bundled.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "prisma", "pg"],
};

module.exports = withPWA(nextConfig);
