export class RateLimitRepository {
  constructor(oort) {
    this.#oort = oort;
  }
  #oort;

  #key(ip) {
    return `rate-limits/${ip.replace(/:/g, "-")}.json`;
  }

  async getRecord(ip) {
    try {
        console.log(ip);
        
      return await this.#oort.getObject(this.#key(ip));
    } catch (error) {
      if (error.code === "NoSuchObjectStat") return { requests: [] };
      throw error;
    }
  }

  async putRecord(ip, record) {
    await this.#oort.putObject(this.#key(ip), record);
  }
}
