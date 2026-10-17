import { describe, expect, it, vi } from "vitest";

vi.mock("@northville/database", () => ({ prisma: {} }));

import { createSessionToken, hashPassword, verifyPassword, verifySessionToken } from "./index";

describe("sessions", () => {
  it("round-trips the user and the session version", async () => {
    const token = await createSessionToken("u1", "secret-secret-secret", 3);
    expect(await verifySessionToken(token, "secret-secret-secret")).toEqual({ userId: "u1", version: 3 });
  });
  it("rejects a token signed with another secret", async () => {
    const token = await createSessionToken("u1", "secret-secret-secret");
    expect(await verifySessionToken(token, "other-secret-secret-x")).toBeNull();
  });
  it("treats an old token with no version as version 0", async () => {
    const token = await createSessionToken("u1", "secret-secret-secret");
    expect((await verifySessionToken(token, "secret-secret-secret"))?.version).toBe(0);
  });
});

describe("passwords", () => {
  it("verifies the right password only", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
