import { test } from "node:test";
import assert from "node:assert/strict";
import { UserRepository } from "../src/coin-collection-repository/UserRepository";
import { ConflictError } from "../src/coin-collection-exception/CoinCollectionError";
import { User } from "../src/coin-collection-entity/User";

function makeEntity(overrides = {}) {
  return User.from({
    id: "test-uuid",
    email: "user@example.com",
    passwordHash: "hash",
    collection: { favorites: [], archive: [] },
    createdAt: new Date().toISOString(),
    pin: { pinHash: null, expiresAt: null, attempts: 0, requests: [] },
    ...overrides,
  });
}

test("createUser writes index and user record", async () => {
  const stored = new Map();
  const fakeOort = {
    getObject: async () => {
      const err = new Error("missing");
      err.code = "NoSuchObjectStat";
      throw err;
    },
    putObject: async (key, obj) => {
      stored.set(key, obj.toJSON ? obj.toJSON() : obj);
      return { key };
    },
  };

  const repo = new UserRepository(fakeOort);
  await repo.createUser(makeEntity());

  assert.deepEqual(stored.get("email-index/user@example.com.json"), {
    uuid: "test-uuid",
  });
  assert.equal(stored.get("users/test-uuid.json").email, "user@example.com");
});

test("createUser throws ConflictError when email taken", async () => {
  const fakeOort = {
    getObject: async () => ({ uuid: "existing-uuid" }),
    putObject: async () => ({}),
  };

  const repo = new UserRepository(fakeOort);
  await assert.rejects(() => repo.createUser(makeEntity()), ConflictError);
});
