import { test } from "node:test";
import assert from "node:assert/strict";

import { CoinService } from "../src/coin-collection-service/CoinService.js";
import { CoinRepository } from "../src/coin-collection-repository/CoinRepository.js";
import { ValidationError } from "../src/coin-collection-exception/CoinCollectionError.js";

test("getCoinByStateName returns a coin DTO", async () => {
  const fakeOort = {
    getObject: async (key) => ({
      id: 634,
      stateName: "california",
      obvThumb: "https://example.com/obv.jpg",
      revThumb: "https://example.com/rev.jpg",
      mintYear: 2005,
    }),
    putObject: async () => ({}),
  };

  const repo = new CoinRepository(fakeOort);
  const service = new CoinService(repo);

  const dto = await service.getCoinByStateName("California");

  assert.equal(dto.toJSON().stateName, "california");
  assert.equal(dto.toJSON().mintYear, 2005);
});

test("getCoinByStateName normalizes the state name", async () => {
  let receivedKey = null;
  const fakeOort = {
    getObject: async (key) => {
      receivedKey = key;
      return {
        id: 1,
        stateName: "newyork",
        obvThumb: "",
        revThumb: "",
        mintYear: 2000,
      };
    },
    putObject: async () => ({}),
  };

  const repo = new CoinRepository(fakeOort);
  const service = new CoinService(repo);

  await service.getCoinByStateName("New York");

  assert.equal(receivedKey, "coins/newyork.json");
});

test("getCoinByStateName rejects an empty state name", async () => {
  const fakeOort = {
    getObject: async () => ({}),
    putObject: async () => ({}),
  };

  const repo = new CoinRepository(fakeOort);
  const service = new CoinService(repo);

  await assert.rejects(() => service.getCoinByStateName(""), ValidationError);
});

test("postAllStateCoins stores each valid coin and returns ids", async () => {
  const stored = new Map();
  const fakeOort = {
    getObject: async () => ({}),
    putObject: async (key, obj) => {
      stored.set(key, obj);
      return { key };
    },
  };

  const service = new CoinService(new CoinRepository(fakeOort));

  const items = [
    {
      id: 634,
      title: "Quarter (California)",
      obverse_thumbnail: "https://example.com/obv.jpg",
      reverse_thumbnail: "https://example.com/rev.jpg",
      min_year: 2005,
    },
    {
      id: 635,
      title: "Quarter (New York)",
      obverse_thumbnail: "https://example.com/obv2.jpg",
      reverse_thumbnail: "https://example.com/rev2.jpg",
      min_year: 2001,
    },
  ];

  const ids = await service.postAllStateCoins(items);

  assert.deepEqual(ids, [634, 635]);
  assert.ok(stored.has("coins/california.json"));
  assert.ok(stored.has("coins/newyork.json"));
});

test("postAllStateCoins rejects when any item is invalid", async () => {
  const stored = new Map();
  const fakeOort = {
    getObject: async () => ({}),
    putObject: async (key, obj) => {
      stored.set(key, obj);
      return { key };
    },
  };

  const service = new CoinService(new CoinRepository(fakeOort));

  const badItems = [
    {
      id: null,
      title: "Quarter (California)",
      obverse_thumbnail: "https://example.com/obv.jpg",
      reverse_thumbnail: "https://example.com/rev.jpg",
      min_year: 2005,
    },
  ];

  await assert.rejects(
    () => service.postAllStateCoins(badItems),
    ValidationError,
  );

  assert.equal(stored.size, 0);
});
