import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "../index";

describe("api.req - error handling", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns a pending promise on 401", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401, statusText: "Unauthorized" }),
    );

    const result = await Promise.race([
      api.problems.list({ hidden: false }).then(() => "resolved"),
      new Promise<string>(resolve => setTimeout(() => resolve("timeout"), 100)),
    ]);
    expect(result).toBe("timeout");
  });

  it("re-throws error text on non-ok status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("Custom error message", { status: 400 }),
    );

    await expect(
      api.problems.list({ hidden: false }),
    ).rejects.toThrow("Custom error message");
  });

  it("returns parsed JSON on success", async () => {
    const data = [{ id: 1, title: "Test", platform: "LEETCODE", problemNumber: "1", url: "", categoryId: 1, categoryName: "Cat", hidden: false, createdAt: "2026-01-01", difficulty: null }];
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    const result = await api.problems.list({ hidden: false });
    expect(result).toEqual(data);
  });
});