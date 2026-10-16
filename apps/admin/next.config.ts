import type { NextConfig } from "next";

try {
  process.loadEnvFile(new URL("../../.env", import.meta.url));
} catch {
  // production uses real env vars
}

const nextConfig: NextConfig = {
  transpilePackages: ["@northville/ui", "@northville/core", "@northville/auth", "@northville/database", "@northville/content"],
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
  // Admin is private. Keep it out of search engines and out of frames.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "X-Frame-Options", value: "DENY" }, { key: "Referrer-Policy", value: "same-origin" }] }];
  },
  // Local dev only: uploads are written under apps/web/public, so the admin proxies them to the site.
  async rewrites() {
    const web = process.env.WEB_URL ?? "http://localhost:3000";
    return [{ source: "/uploads/:path*", destination: `${web}/uploads/:path*` }, { source: "/seed/:path*", destination: `${web}/seed/:path*` }];
  },
};

export default nextConfig;
