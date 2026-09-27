export class CollectionDTO {
  #favorites;
  #archive;
  constructor(data) {
    this.#favorites = data.favorites;
    this.#archive = data.archive;
  }

  toJSON() {
    return {
      favorites: this.#favorites,
      archive: this.#archive,
    };
  }
  static from(data) {
    return new CollectionDTO(data);
  }
}
