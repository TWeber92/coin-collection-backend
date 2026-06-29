import { OORTStorageClient } from "./OORTStorageClient";

export class AuthRepository {
  constructor(accessKey, secretKey, bucket, user) {
    this.oort = new OORTStorageClient(accessKey, secretKey, bucket);
  }

  async getAuthDataByPath(path) {
    const res = await this.oort.getObject(`auth/${path}.json`);
    const data = res.Body.transformToString();
    return JSON.parse(data);
  }
  async postAuthDataByPath(entity, path) {
    await this.oort.putObject(`auth/${path}.json`, entity);
  }
  async deleteTempDataByPath(entity, path) {
    await this.oort.putObject(`auth/${path}.json`, entity);
  }
}
