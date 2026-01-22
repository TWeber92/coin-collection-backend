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

  get id() {
    return this.#id;
  }
  get stateName() {
    return this.#stateName;
  }
  get obvThumb() {
    return this.#obvThumb;
  }
  get revThumb() {
    return this.#revThumb;
  }
  get mintYear() {
    return this.#mintYear;
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
  static fromDto(dto) {
    return new CoinEntity({
      id: dto.id,
      stateName: dto.stateName,
      obvThumb: dto.obvThumb,
      revThumb: dto.revThumb,
      mintYear: dto.mintYear,
    });
  }
}
