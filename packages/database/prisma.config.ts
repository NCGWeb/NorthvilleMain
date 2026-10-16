import { defineConfig, env } from "prisma/config";

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
  datasource: { url: env("DIRECT_URL") },
});
