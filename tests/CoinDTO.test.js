import { test } from "node:test";
import assert from "node:assert/strict";
import { CoinDTO } from "../src/coin-collection-dto/CoinDTO.js";

test("fromNumista transforms API shape to coin shape", () => {
  const numista = {
    id: 604,
    title: '¼ Dollar "Washington Quarter" (Delaware)',
    obverse: {
      thumbnail: "https://en.numista.com/catalogue/photos/etats-unis/65b804c3538858.16931475-180.jpg",
    },
    reverse: {
      thumbnail: "https://en.numista.com/catalogue/photos/etats-unis/65b804c4327c86.31595545-180.jpg",
    },
    min_year: 1999,
  };

  const data = CoinDTO.fromNumista(numista).toJSON();

  assert.equal(data.id, 604);
  assert.equal(data.stateName, "delaware");
  assert.equal(data.obvThumb, numista.obverse.thumbnail);
  assert.equal(data.revThumb, numista.reverse.thumbnail);
  assert.equal(data.mintYear, 1999);
});

test("fromNumista normalizes multi-word state names", () => {
  const numista = {
    id: 1,
    title: '¼ Dollar "Washington Quarter" (New York)',
    obverse: { thumbnail: "" },
    reverse: { thumbnail: "" },
    min_year: 2001,
  };

  assert.equal(CoinDTO.fromNumista(numista).toJSON().stateName, "newyork");
});