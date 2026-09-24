import { test } from "node:test";
import assert from "node:assert/strict";

import { UserService } from "../src/coin-collection-service/UserService.js";
import { ValidationError } from "../src/coin-collection-exception/CoinCollectionError.js";


function makeFakeRepo() {
  const stored = new Map();
  return {
    createUser: async (email, passwordHash) => {
      const uuid = "test-uuid-1234";
      stored.set("email-index/" + email + ".json", { uuid });
      stored.set("users/" + uuid + ".json", { uuid, email, passwordHash });
      return uuid;
    },
    _stored: stored,
  };
}


test("signup normalizes email and hashes password", async () => {
  const repo = makeFakeRepo();
  const service = new UserService(repo);

  const result = await service.signup("User@Example.COM ", "hunter2hunter2");

  assert.equal(result.email, "user@example.com");
  assert.ok(result.uuid);

  const userRecord = repo._stored.get("users/" + result.uuid + ".json");
  assert.ok(userRecord.passwordHash.startsWith("pbkdf2:"));
  assert.notEqual(userRecord.passwordHash, "hunter2hunter2");
});


test("signup rejects short password", async () => {
  const repo = makeFakeRepo();
  const service = new UserService(repo);

  await assert.rejects(
    () => service.signup("user@example.com", "short"),
    ValidationError,
  );
});


test("signup rejects invalid email", async () => {
  const repo = makeFakeRepo();
  const service = new UserService(repo);

  await assert.rejects(
    () => service.signup("not-an-email", "hunter2hunter2"),
    ValidationError,
  );
});