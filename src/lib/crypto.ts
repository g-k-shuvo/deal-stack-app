import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

// AES-256-GCM at-rest encryption for the firm's Anthropic key (PRD NFR-01).
// Format: base64(iv):base64(authTag):base64(ciphertext).

function resolveKey(raw?: string): Buffer {
  const k = raw ?? process.env.APP_ENCRYPTION_KEY;
  if (!k) throw new Error("APP_ENCRYPTION_KEY is not set");
  const decoded = Buffer.from(k, "base64");
  // Accept a raw 32-byte base64 key; otherwise derive 32 bytes via SHA-256.
  return decoded.length === 32 ? decoded : createHash("sha256").update(k).digest();
}

export function encryptSecret(plaintext: string, keyRaw?: string): string {
  const key = resolveKey(keyRaw);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

export function decryptSecret(payload: string, keyRaw?: string): string {
  const key = resolveKey(keyRaw);
  const parts = payload.split(":");
  const [ivB, tagB, dataB] = parts;
  if (parts.length !== 3 || !ivB || !tagB || !dataB) {
    throw new Error("Malformed ciphertext");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB, "base64"));
  decipher.setAuthTag(Buffer.from(tagB, "base64"));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataB, "base64")), decipher.final()]);
  return dec.toString("utf8");
}

/** Masked display form for the UI (never returns the plaintext key). */
export function maskSecret(plaintext: string): string {
  const visible = plaintext.slice(0, 11); // e.g. "sk-ant-api0"
  return `${visible}${"•".repeat(26)}`;
}
