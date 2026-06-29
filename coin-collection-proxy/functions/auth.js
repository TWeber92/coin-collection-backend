import {
  AuthenticationError,
  CoinCollectionError,
} from "../../src/coin-collection-exception/CoinCollectionError";

export async function getHMAC(email, password, SERVER_KEY) {
  return handleAuthentication(async () => {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBuffer(SERVER_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${email}+${password}`),
    );
    return bufferToHex(signature);
  });
}
export const bufferToHex = (buf) => {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
export const hexToBuffer = (hex) => {
  return new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
};
export async function encrypt(plaintext, SERVER_KEY) {
  return handleAuthentication(async () => {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBuffer(SERVER_KEY),
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded,
    );
    return bufferToHex(iv) + "." + bufferToHex(ciphertext);
  });
}
export async function decrypt(cookie, SERVER_KEY) {
  return handleAuthentication(async () => {
    const match = cookie.match(/auth=([^;]+)/);
    if (!match)
      throw new AuthenticationError(
        "Cookie does not exist, or no match found",
        "auth.js/decrypt",
      );
    const token = match[1];
    const [ivHex, cipherHex] = token.split(".");
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBuffer(SERVER_KEY),
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    const iv = hexToBuffer(ivHex);
    const ciphertext = hexToBuffer(cipherHex);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(decrypted);
  });
}
export async function handleAuthentication(fn) {
  try {
    return await fn();
  } catch (error) {
    throw error instanceof CoinCollectionError
      ? error
      : new AuthenticationError(error.message, "auth.js/decrypt");
  }
}
