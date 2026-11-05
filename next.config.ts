import type { NextConfig } from "next";

// Set in the GitHub Pages workflow, where the site lives under
// /Tongs-Tongues-Companion-App. Left empty everywhere else.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
