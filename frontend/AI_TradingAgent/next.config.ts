import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output only for Docker container builds, not on Vercel
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;

