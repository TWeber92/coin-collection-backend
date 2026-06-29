import { OORTStorageClient } from "./OORTStorageClient";

export class UserRepo {
  constructor(accessKey, secretKey, bucket, user) {
    this.oort = new OORTStorageClient(accessKey, secretKey, bucket);
  }

  async getUserById(id) {
    const res = await this.oort.getObject(`users/${id}.json`);
    const data = res.Body.transformToString();
    return JSON.parse(data);
  }
  async postUserData(user) {
    return this.putUserData(user);
  }

  async putUserData(user) {
    await this.oort.putObject(`users/${user.id}.json`, user.toJSON());
  }
}
