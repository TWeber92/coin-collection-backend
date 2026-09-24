import { test } from "node:test";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword } from "../src/coin-collection-auth/password.js";


test("hashPassword + verifyPassword round trip", async () => {
  const hash = await hashPassword("hunter2");

  assert.ok(hash.startsWith("pbkdf2:600000:"));

  assert.equal(await verifyPassword("hunter2", hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
});


test("same password produces different hashes (unique salt)", async () => {
  const hash1 = await hashPassword("hunter2");
  const hash2 = await hashPassword("hunter2");

  assert.notEqual(hash1, hash2);
  assert.equal(await verifyPassword("hunter2", hash1), true);
  assert.equal(await verifyPassword("hunter2", hash2), true);
});


test("verifyPassword throws on unknown algorithm", async () => {
  await assert.rejects(
    () => verifyPassword("hunter2", "bcrypt:abc:def"),
    /Unsupported hash algorithm/,
  );
});