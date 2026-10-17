import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["packages/**/*.test.ts", "apps/**/*.test.ts"], environment: "node", env: { ADMIN_SESSION_JWT_SECRET: "test-secret", REVALIDATE_SECRET: "test-reval" } },
});
