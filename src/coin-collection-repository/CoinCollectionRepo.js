import { OORTStorageClient } from "./OORTStorageClient";

export class CoinCollectionRepo {
  constructor(accessKey, secretKey, bucket) {
    this.oort = new OORTStorageClient(accessKey, secretKey, bucket);
  }
  async getCoinByStateName(stateName) {
    const cleanName = stateName.toLowerCase().replace(/\s+/g, "");
    const res = await this.oort.getObject(`coins/${cleanName}.json`);
    return res.Body.transformToString();
  }

  async saveAll(entities) {
    await Promise.all(
      entities.map((entity) => {
        const cleanName = entity.stateName.toLowerCase().replace(/\s+/g, "");
        return this.oort.putObject(`coins/${cleanName}.json`, entity.toJSON());
      }),
    );
    return entities.map((e) => e.id);
  }
}
