import { RateLimitError } from "../coin-collection-exception/CoinCollectionError";

export class RateLimitService {
  constructor(repo) {
    this.#repo = repo;
  }
  #repo;
  async checkIp(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = 20;
    const record = await this.#repo.getRecord(ip);
    record.requests = record.requests.filter((t) => now - t < windowMs);
    if (record.requests.length >= limit)
      throw new RateLimitError("Too many requests. Try again later.");
    record.requests.push(now);
    await this.#repo.putRecord(ip, record);
  }
}
