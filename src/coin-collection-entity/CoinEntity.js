export class CoinEntity {
  #id;
  #stateName;
  #obvThumb;
  #revThumb;
  #mintYear;
  constructor(data) {
    this.#id = data.id;
    this.#stateName = data.stateName;
    this.#obvThumb = data.obvThumb;
    this.#revThumb = data.revThumb;
    this.#mintYear = data.mintYear;
  }

  toJSON() {
    return {
      id: this.#id,
      stateName: this.#stateName,
      obvThumb: this.#obvThumb,
      revThumb: this.#revThumb,
      mintYear: this.#mintYear,
    };
  }
  static from(dto) {
    return new CoinEntity(dto);
  }
}
