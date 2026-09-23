import { OORTStorageClient } from "./OORTStorageClient";

export class CoinRepository {
  constructor(oort) {
    this.#oort = oort;
  }
  #oort
  async getCoinByStateName(stateName) {
    return await this.#oort.getObject(`coins/${stateName}.json`);
  }

  async putCoinIntoStorage(entity) {
    return await this.#oort.putObject(`coins/${entity.toJSON().stateName}.json`, entity);
  }
}
