import { describe, it, expect } from "vitest";
import { authEvent } from "../../auth/AuthEvent";

describe("authEvent", () => {
  it("calls subscribed callback on emitUnauthenticated", () => {
    const cb = vi.fn();
    authEvent.subscribe(cb);
    authEvent.emitUnauthenticated();
    expect(cb).toHaveBeenCalledOnce();
  });

  it("does nothing if no callback subscribed", () => {
    expect(() => authEvent.emitUnauthenticated()).not.toThrow();
  });
});