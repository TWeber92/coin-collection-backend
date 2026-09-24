import { test } from "node:test";
import assert from "node:assert/strict";
import { UserRepository } from "../src/coin-collection-repository/UserRepository";
import { ConflictError } from "../src/coin-collection-exception/CoinCollectionError";

test("createUser writes index and user record", async () => {
  const stored = new Map();
  const fakeOort = {
    putObjectIfAbsent: async (key, obj) => { stored.set(key, obj); return { key }; },
    putObject: async (key, obj) => { stored.set(key, obj); return { key }; },
    getObject: async (key) => stored.get(key),
  };

  const repo = new UserRepository(fakeOort);
  const uuid = await repo.createUser("user@example.com", "hash");

  assert.ok(uuid);
  assert.deepEqual(stored.get("email-index/user@example.com.json"), { uuid });
  assert.equal(stored.get(`users/${uuid}.json`).email, "user@example.com");
});

test("createUser throws ConflictError when email taken", async () => {
  const fakeOort = {
    putObjectIfAbsent: async () => {
      const err = new Error("exists");
      err.code = "PreconditionFailed";
      throw err;
    },
    putObject: async () => ({}),
    getObject: async () => ({}),
  };

  const repo = new UserRepository(fakeOort);
  await assert.rejects(
    () => repo.createUser("user@example.com", "hash"),
    ConflictError,
  );
});