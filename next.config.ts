import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // D'autres options Next.js si besoin
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // ✅ Désactiver le PWA en mode dev
})(nextConfig);
