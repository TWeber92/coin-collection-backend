import { bufferToHex, hexToBuffer } from "./session.js";

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 600000;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return `pbkdf2:${iterations}:${bufferToHex(salt)}:${bufferToHex(hash)}`;
}

export async function verifyPassword(password, stored) {
  const [algo, iterStr, saltHex, hashHex] = stored.split(":");
  if (algo !== "pbkdf2") {
    throw new Error(`Unsupported hash algorithm: ${algo}`);
  }
  const iterations = parseInt(iterStr, 10);
  const salt = hexToBuffer(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return bufferToHex(hash) === hashHex;
}