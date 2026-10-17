import type { NextConfig } from "next";

// One .env at the repo root serves both apps. On Vercel real env vars are used instead.
try {
  process.loadEnvFile(new URL("../../.env", import.meta.url));
} catch {
  // no root .env (production)
}

const SITE = (process.env.SITE_URL ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Styles ship inside the HTML, so the first screen can paint without waiting for a stylesheet.
  experimental: { inlineCss: true },
  // Workspace packages ship TypeScript source, so Next compiles them.
  transpilePackages: ["@northville/ui", "@northville/core", "@northville/auth", "@northville/database", "@northville/content"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // The default vercel.app address would show a second copy of the site. Send it to the real address.
  async redirects() {
    if (!SITE.startsWith("https://") || SITE.endsWith(".vercel.app")) return [];
    return [{ source: "/:path*", has: [{ type: "host", value: "northville-web.vercel.app" }], destination: `${SITE}/:path*`, permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/seed/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/uploads/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
