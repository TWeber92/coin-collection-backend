import {
  AuthenticationError,
  NotFoundError,
} from "../coin-collection-exception/CoinCollectionError";

export class AuthService {
  #authRepo;
  constructor(authRepo) {
    this.#authRepo = authRepo;
  }

  async getAuthDataByKey({ lookupKey, path }) {
    const entity = await this.#authRepo.getAuthDataByPath(path);
    const id = entity[lookupKey];
    if (!id) throw new NotFoundError("login could not be found.");
    return { id };
  }
  async getAuthDataByValue({ value, path }) {
    const entity = await this.#authRepo.getAuthDataByPath(path);
    const entry = Object.entries(entity).find(([k, v]) => v === value) || null;
    if (!entry) throw NotFoundError(path, value);
    return { id: entry[0] };
  }
  async postAuthData({ lookupKey, sub, path }) {
    //signup - data.json
    const entity = await this.#authRepo.getAuthDataByPath(path);
    await this.#authRepo.postAuthDataByPath(
      { ...entity, [lookupKey]: sub },
      path,
    );
  }
  async postAuthTempData({ lookupKey, sub, path }) {
    //pin - temp.json
    this.updateAuthTempData({ lookupKey, sub, path });
  }
  async updateAuthData({ lookupKey, sub, path }) {
    //forgot password reset email+pass:uuid
    //data.json
    const entity = await this.#authRepo.getAuthDataByPath(path);
    if (entity[lookupKey])
      throw new AuthenticationError(
        "New password must be different from current password.",
        "UserController/UserService/",
      );
    //unlikely to not find already found recovery by now
    const remove = await this.getAuthDataByValue({ value: sub, path });
    delete entity[remove.id];
    await this.#authRepo.postAuthDataByPath(
      { ...entity, [lookupKey]: sub },
      path,
    );
  }
  async updateAuthTempData({ lookupKey, sub, path }) {
    //temp.json - opposing semantics pins are temp post but always updating
    const entity = await this.#authRepo.getAuthDataByPath(path);
    entity[lookupKey] = sub;
    await this.#authRepo.postAuthDataByPath({ entity }, path);
  }
  async deleteTempAuthData(lookupKey, path) {
    const entity = await this.#authRepo.getAuthDataByPath(path);
    if (entity[lookupKey]) delete entity[lookupKey];
    await this.#authRepo.deleteTempData(entity, path);
  }
}
