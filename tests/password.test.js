import { test } from "node:test";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword } from "../src/coin-collection-auth/password.js";


const PEPPER = "test-pepper";

test("hashPassword + verifyPassword round trip", async () => {
  const hash = await hashPassword("hunter2", PEPPER);
  assert.ok(hash.startsWith("pbkdf2:100000:"));
  assert.equal(await verifyPassword("hunter2", hash, PEPPER), true);
  assert.equal(await verifyPassword("wrong", hash, PEPPER), false);
});


test("same password produces different hashes (unique salt)", async () => {
  const hash1 = await hashPassword("hunter2", PEPPER);
  const hash2 = await hashPassword("hunter2", PEPPER);
  assert.notEqual(hash1, hash2);
  assert.equal(await verifyPassword("hunter2", hash1, PEPPER), true);
  assert.equal(await verifyPassword("hunter2", hash2, PEPPER), true);
});


test("verifyPassword throws on unknown algorithm", async () => {
  await assert.rejects(
    () => verifyPassword("hunter2", "bcrypt:abc:def", PEPPER),
    /Unsupported hash algorithm/,
  );
});