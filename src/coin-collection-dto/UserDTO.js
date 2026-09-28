import { CollectionDTO } from "./CollectionDTO";

export class UserDTO {
  #id;
  #email;
  #createdAt;
  #collection;
  constructor(data) {
    this.#id = data.id;
    this.#email = data.email;
    this.#createdAt = data.createdAt;
    this.#collection = CollectionDTO.from(data.collection);
  }
  get createdAt() {
    return this.#createdAt;
  }

  toJSON() {
    return {
      id: this.#id,
      email: this.#email,
      collection: this.#collection.toJSON(),
    };
  }
  static from(data) {
    return new UserDTO(data);
  }
}