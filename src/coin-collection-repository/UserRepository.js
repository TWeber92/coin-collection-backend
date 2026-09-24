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
  let index;
  try {
    index = await this.#oort.getObject(indexKey);
  } catch (err) {
    if (err.code === "NoSuchObjectStat") return null;   // email not found
    throw err;                                          // real error
  }
  return await this.#oort.getObject(`users/${index.uuid}.json`);
}

  async getUserByUuid(uuid) {
    const userKey = `users/${uuid}.json`;
    return await this.#oort.getObject(userKey);
  }
}
