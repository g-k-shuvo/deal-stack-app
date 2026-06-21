import { describe, it, expect } from "vitest";
import { formatUSD, formatUSDCompact } from "@/lib/util/currency";

describe("currency", () => {
  it("formats USD", () => {
    expect(formatUSD(4_200_000)).toBe("$4,200,000");
    expect(formatUSD(0)).toBe("$0");
  });
  it("returns em dash for non-finite", () => {
    expect(formatUSD(NaN)).toBe("—");
    expect(formatUSDCompact(Infinity)).toBe("—");
  });
  it("formats compact", () => {
    expect(formatUSDCompact(4_200_000)).toBe("$4.2M");
    expect(formatUSDCompact(840_000)).toBe("$840.0K");
    expect(formatUSDCompact(500)).toBe("$500");
  });
});
