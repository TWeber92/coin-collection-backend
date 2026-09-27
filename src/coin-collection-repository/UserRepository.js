import { ConflictError } from "../coin-collection-exception/CoinCollectionError";

export class UserRepository {
  #oort;

  constructor(oort) {
    this.#oort = oort;
  }

  async getUserByUuid(uuid) {
    const userKey = `users/${uuid}.json`;
    return await this.#oort.getObject(userKey);
  }

  async createUser(entity) {
    const email = entity.toJSON().email;
    const uuid = entity.toJSON().id;
    const indexKey = `email-index/${email}.json`;
    const userKey = `users/${uuid}.json`;
    try {
      const exists = await this.#oort.getObject(indexKey);
      if (exists) throw new ConflictError("User", { email });
    } catch (error) {
      if (error.code !== "NoSuchObjectStat") throw error;
      await this.#oort.putObject(indexKey, { uuid });
      await this.#oort.putObject(userKey, entity);
    }
  }
  async getUserByEmail(email) {
    let index;
    const indexKey = `email-index/${email}.json`;
    try {
      index = await this.#oort.getObject(indexKey);
    } catch (error) {
      if (error.code === "NoSuchObjectStat") return null; // email not found
      throw error; // real error
    }
    const userKey = `users/${index.uuid}.json`;
    return await this.#oort.getObject(userKey);
  }
  async getEmailIndex(email) {
    let index;
    const indexKey = `email-index/${email}.json`;
    try {
      index = await this.#oort.getObject(indexKey);
    } catch (error) {
      if (error.code === "NoSuchObjectStat") return null;
      throw error;
    }
    return index;
  }
  async putUser(entity) {
    const uuid = entity.toJSON().id;
    const userKey = `users/${uuid}.json`;
    await this.#oort.putObject(userKey, entity);
  }
}
