import { OORTStorageClient } from "./OORTStorageClient";

export class CoinRepository {
  constructor(accessKey, secretKey, bucket) {
    this.oort = new OORTStorageClient(accessKey, secretKey, bucket);
  }
  async getCoinByStateName(stateName) {
    return await this.oort.getObject(`coins/${stateName}.json`);
  }

  async putCoinIntoStorage(entity) {
    return await this.oort.putObject(`coins/${entity.stateName}.json`, entity);
  }
}
