import { CoinCollectionError } from "../coin-collection-exception/CoinCollectionError";

export class CoinValidator {
  static validateStateName(stateName) {
    const extracted = stateName.toLowerCase().replace(/[^a-z]/g, "");
    if (!extracted) {
      throw new CoinCollectionError(
        `Invalid StateName format: "${stateName}". Expected "(StateName)" pattern`,
        "ValidatorError",
        "validateStateName",
        400,
      );
    }
    return extracted;
  }
  static validateCoinData(coin) {
    const errors = [];

    if (!coin.id || coin.id === "null" || coin.id === "undefined") {
      errors.push("Coin ID is required");
    }
    const stateName = coin.title.match(/\(([^)]+)\)/)?.[1];
    if (!stateName) {
      errors.push("Title must contain title for state name");
    }
    if (!coin.obverse_thumbnail || coin.obverse_thumbnail === "null") {
      errors.push("Obverse thumbnail is required");
    }
    if (!coin.reverse_thumbnail || coin.reverse_thumbnail === "null") {
      errors.push("Reverse thumbnail is required");
    }
    const mintYear = parseInt(coin.min_year);
    if (!coin.min_year || isNaN(mintYear) || mintYear < 1000) {
      errors.push("Valid mint year is required (min_year)");
    }
    if (errors.length > 0) {
      throw new CoinCollectionError(
        `Validation failed: ${errors.join(", ")}`,
        "ValidatorError",
        "validateCoinData",
        400,
      );
    }

    return {
      id: coin.id,
      stateName,
      obvThumb: coin.obverse_thumbnail,
      revThumb: coin.reverse_thumbnail,
      mintYear,
    };
  }
}
