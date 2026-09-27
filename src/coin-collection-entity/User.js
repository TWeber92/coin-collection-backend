import { Collection } from "./Collection";
import { Pin } from "./Pin";

export class User {
  #id;
  #email;
  #pin;
  #createdAt;
  #collection;
  #passwordHash;
  constructor(data) {
    this.#id = data.id;
    this.#email = data.email;
    this.#pin =  Pin.from(data.pin);
    this.#createdAt = data.createdAt;
    this.#passwordHash = data.passwordHash;
    this.#collection = Collection.from(data.collection);
  }

  toJSON() {
    return {
      id: this.#id,
      email: this.#email,
      createdAt: this.#createdAt,
      passwordHash: this.#passwordHash,
      pin: this.#pin.toJSON(),
      collection: this.#collection.toJSON(),
    };
  }
  static from(data){
    return new User(data)
  }
}
