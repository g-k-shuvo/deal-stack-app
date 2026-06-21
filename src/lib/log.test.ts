import { describe, it, expect } from "vitest";
import { logEvent } from "@/lib/log";

describe("logEvent", () => {
  it("never throws", () => {
    expect(() => logEvent("test.event", { a: 1, b: "x" })).not.toThrow();
    expect(() => logEvent("bare")).not.toThrow();
  });
});
