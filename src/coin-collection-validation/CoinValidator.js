import { ValidationError } from "../coin-collection-exception/CoinCollectionError";

export class CoinValidator {
  static validateStateName(stateName) {
    const extracted = stateName.toLowerCase().replace(/[^a-z]/g, "");
    if (!extracted) {
      throw new ValidationError(stateName, `Expected "(StateName)" pattern`);
    }
  }
  static validateCoinData(coin) {
    const errors = [];
    const fields = [];

    if (!coin.id || coin.id === "null" || coin.id === "undefined") {
      errors.push("Coin ID is required");
      fields.push(coin.id);
    }
    const stateName = coin.title.match(/\(([^)]+)\)/)?.[1];
    if (!stateName) {
      errors.push("Title must contain title for state name");
      fields.push(coin.title);
    }
    if (!coin.obverse?.thumbnail || coin.obverse.thumbnail === "null") {
      errors.push("Obverse thumbnail is required");
      fields.push(coin.obverse?.thumbnail);
    }
    if (!coin.reverse?.thumbnail || coin.reverse.thumbnail === "null") {
      errors.push("Reverse thumbnail is required");
      fields.push(coin.reverse?.thumbnail);
    }
    const mintYear = parseInt(coin.min_year);
    if (!coin.min_year || isNaN(mintYear) || mintYear < 1000) {
      errors.push("Valid mint year is required (min_year)");
      fields.push(coin.min_year);
    }
    if (errors.length > 0) {
      throw new ValidationError(
        `Failed fields: ${fields.join(", ")}`,
        `Validation failed: ${errors.join(", ")}`,
      );
    }
  }
}
