import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret, maskSecret } from "@/lib/crypto";

const KEY = Buffer.from("0123456789abcdef0123456789abcdef").toString("base64"); // 32 bytes
const OTHER = Buffer.from("ffffffffffffffffffffffffffffffff").toString("base64");

describe("crypto", () => {
  it("round-trips a secret with a 32-byte key", () => {
    const ct = encryptSecret("sk-ant-secret-value", KEY);
    expect(ct).not.toContain("sk-ant-secret-value");
    expect(ct.split(":")).toHaveLength(3);
    expect(decryptSecret(ct, KEY)).toBe("sk-ant-secret-value");
  });

  it("derives a key via sha256 when input is not 32 bytes", () => {
    const ct = encryptSecret("hello", "short-passphrase");
    expect(decryptSecret(ct, "short-passphrase")).toBe("hello");
  });

  it("fails to decrypt with the wrong key (GCM auth)", () => {
    const ct = encryptSecret("hello", KEY);
    expect(() => decryptSecret(ct, OTHER)).toThrow();
  });

  it("throws on malformed ciphertext", () => {
    expect(() => decryptSecret("not-valid", KEY)).toThrow("Malformed");
  });

  it("throws when no key is configured", () => {
    const prev = process.env.APP_ENCRYPTION_KEY;
    delete process.env.APP_ENCRYPTION_KEY;
    expect(() => encryptSecret("x")).toThrow("APP_ENCRYPTION_KEY");
    if (prev !== undefined) process.env.APP_ENCRYPTION_KEY = prev;
  });

  it("masks a secret without revealing it", () => {
    const masked = maskSecret("sk-ant-api03-abcdef");
    expect(masked.startsWith("sk-ant-api0")).toBe(true);
    expect(masked).toContain("•");
    expect(masked).not.toContain("abcdef");
  });
});
