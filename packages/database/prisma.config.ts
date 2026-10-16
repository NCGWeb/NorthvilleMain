import { defineConfig } from "prisma/config";

// Load the repo-root .env for the Prisma CLI. Missing in CI, where real
// environment variables are injected instead.
try {
  process.loadEnvFile(new URL("../../.env", import.meta.url));
} catch {
  // no .env, rely on real environment variables
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  // Direct (unpooled) URL for migrations. On Vercel the Neon integration provides DATABASE_URL_UNPOOLED.
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
