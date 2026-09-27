import { CollectionDTO } from "./CollectionDTO";
import { PinDTO } from "./PinDTO";

export class UserDTO {
  #id;
  #email;
  #pin;
  #createdAt;
  #collection;
  constructor(data) {
    this.#id = data.id;
    this.#email = data.email;
    this.#createdAt = data.createdAt;
    this.#pin = PinDTO.from(data);
    this.#collection = CollectionDTO.from(data.collection);
  }
  get createdAt() {
    return this.#createdAt;
  }
  get pin() {
    return this.#pin
  }

  toJSON() {
    return {
      id: this.#id,
      email: this.#email,
      pin: this.#pin.toJSON(),
      collection: this.#collection.toJSON(),
    };
  }
  static from(data) {
    return new UserDTO(data);
  }
}