import { OORTStorageClient } from "./OORTStorageClient";

export class CoinCollectionRepo {
  constructor(accessKey, secretKey, bucket) {
    this.oort = new OORTStorageClient(accessKey, secretKey, bucket);
    this.bucket = bucket;
    console.log("Creating OORT client with bucket:", bucket);
  }

  async saveAll(entities) {
    await Promise.all(
      entities.map((entity) => {
        const cleanName = entity.stateName.toLowerCase().replace(/\s+/g, "");
        return this.oort.putObject(`coins/${cleanName}.json`, entity.toJSON());
      }),
    );
    return {
      success: true,
      ids: entities.map((e) => e.id),
    };
  }

  async getCoinByStateName(stateName) {
    const cleanName = stateName.toLowerCase().replace(/\s+/g, "");
    const response = await this.oort.getObject(`coins/${cleanName}.json`);
    const entity = await response.Body.transformToString();
    return {
      success: true,
      entity: JSON.parse(entity),
    };
  }
}
