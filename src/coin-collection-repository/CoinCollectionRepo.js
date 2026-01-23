import { OORTStorageClient } from "./OORTStorageClient";

export class CoinCollectionRepo {
  constructor(accessKey, secretKey, bucket) {
    this.oort = new OORTStorageClient(accessKey, secretKey, bucket);
    this.bucket = bucket;
    console.log("Creating OORT client with bucket:", bucket);
  }

  async saveAll(entities) {
    const ids = [];
    for (const entity of entities) {
      const cleanName = entity.stateName.toLowerCase().replace(/\s+/g, "");
      await this.oort.putObject(`coins/${cleanName}.json`, entity.toJSON());
      ids.push(entity.id);
    }
    return ids;
  }
  async getCoinByStateName(stateName) {
    const cleanName = stateName.toLowerCase().replace(/\s+/g, "");
    const key = `coins/${cleanName}.json`;
    return await this.oort.getObject(key);
  }
}
