import { test } from "node:test";
import assert from "node:assert/strict";
import { handler } from "../coin-collection-proxy/functions/postCoins.js";
import { AuthenticationError } from "../src/coin-collection-exception/CoinCollectionError.js";

const env = {
  EMAIL_ADMIN: "admin@example.com",
  EMAIL_PASS: "secret",
  OORT_ACCESS_KEY: "x",
  OORT_SECRET_KEY: "y",
  OORT_BUCKET: "z",
  SERVER_KEY: "key",
  PEPPER_KEY: "pepper",
};

function basicAuth(user, pass) {
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

const baseEvent = {
  headers: {},
  body: "{}",
  path: "/api/postCoins",
  httpMethod: "POST",
};

test("postCoins rejects missing auth header", async () => {
  await assert.rejects(() => handler(baseEvent, env), AuthenticationError);
});

test("postCoins rejects malformed auth header", async () => {
  const event = { ...baseEvent, headers: { authorization: "Bearer abc" } };
  await assert.rejects(() => handler(event, env), AuthenticationError);
});

test("postCoins rejects wrong credentials", async () => {
  const event = {
    ...baseEvent,
    headers: { authorization: basicAuth("admin@example.com", "wrong") },
  };
  await assert.rejects(() => handler(event, env), AuthenticationError);
});