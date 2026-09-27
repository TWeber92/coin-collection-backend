export class Collection {
  #collection;
  constructor(data) {
    this.#collection = data;
  }
  toJSON() {
    return {
      favorites: this.#collection.favorites,
      archive: this.#collection.archive
    };
  }
  static from(data) {
    return new Collection(data);
  }
}
