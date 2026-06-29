export class UserDTO {
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

  static fromEntity(entity) {
    return new UserDTO({
      id: entity.id,
      email: entity.email,
      collection: entity.collection,
      roles: entity.roles,
      permissions: entity.permissions,
    });
  }
  static fromDTO(dto) {
    return new UserDTO({
      id: dto.sub,
      email: dto.email.toLowerCase().replace(/[^a-z0-9@.-]/g, ""),
      collection: dto.collection,
      roles: ["user"],
      permissions: ["read:getcoin, read:getuser"],
    });
  }
}
