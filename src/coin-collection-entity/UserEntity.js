export class UserEntity {
  #id;
  #email;
  #collection;
  #roles;
  #permissions;
  constructor(data) {
    this.#id = data.id;
    this.#email = data.email;
    this.#collection = data.collection;
    this.#roles = data.roles;
    this.#permissions = data.permissions;
  }
  toJSON() {
    return {
      id: this.#id,
      email: this.#email,
      collection: this.#collection,
      roles: this.#roles,
      permissions: this.#permissions,
    };
  }
  static fromDTO(dto) {
    return new UserEntity({
      id: dto.id,
      email: dto.email,
      collection: dto.collection,
      roles: dto.roles,
      permissions: dto.permissions,
    });
  }
}
