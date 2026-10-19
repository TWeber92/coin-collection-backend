import { test } from "node:test";
import assert from "node:assert/strict";
import { UserService } from "../src/coin-collection-service/UserService.js";
import { ValidationError } from "../src/coin-collection-exception/CoinCollectionError.js";

const PEPPER = "test-pepper";

function makeFakeRepo() {
  const stored = new Map();
  return {
    createUser: async (entity) => {
      const data = entity.toJSON();
      stored.set("email-index/" + data.email + ".json", { uuid: data.id });
      stored.set("users/" + data.id + ".json", data);
      return data.id;
    },
    _stored: stored,
  };
}

test("signup normalizes email and hashes password", async () => {
  const repo = makeFakeRepo();
  const service = new UserService(repo);

  const dto = await service.signup(
    "User@Example.COM ",
    "hunter2hunter2",
    { favorites: [], archive: [] },
    PEPPER,
  );

  const data = dto.toJSON();
  assert.equal(data.email, "user@example.com");
  assert.ok(data.id);

  const userRecord = repo._stored.get("users/" + data.id + ".json");
  assert.ok(userRecord.passwordHash.startsWith("pbkdf2:"));
  assert.notEqual(userRecord.passwordHash, "hunter2hunter2");
});

test("signup rejects short password", async () => {
  const service = new UserService(makeFakeRepo());
  await assert.rejects(
    () => service.signup("user@example.com", "short", {}, PEPPER),
    ValidationError,
  );
});

test("signup rejects invalid email", async () => {
  const service = new UserService(makeFakeRepo());
  await assert.rejects(
    () => service.signup("not-an-email", "hunter2hunter2", {}, PEPPER),
    ValidationError,
  );
});