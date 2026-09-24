import { ConflictError } from "../coin-collection-exception/CoinCollectionError";

export class UserRepository {
  #oort;

  constructor(oort) {
    this.#oort = oort;
  }

  async createUser(email, passwordHash) {
    const uuid = crypto.randomUUID();
    const indexKey = `email-index/${email}.json`;
    const userKey = `users/${uuid}.json`;
    try {
      const exists = await this.#oort.getObject(indexKey);
      if (exists) throw new ConflictError("User", { email });
    } catch (error) {
      if (error.code !== "NoSuchObjectStat") throw error;
      await this.#oort.putObject(indexKey, { uuid });
      await this.#oort.putObject(userKey, {
        uuid,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      });
    }
    return uuid;
  }

  async getUserByEmail(email) {
    const indexKey = `email-index/${email}.json`;
    const index = await this.#oort.getObject(indexKey);
    const userKey = `users/${index.uuid}.json`;
    return await this.#oort.getObject(userKey);
  }

  async getUserByUuid(uuid) {
    const userKey = `users/${uuid}.json`;
    return await this.#oort.getObject(userKey);
  }
}
