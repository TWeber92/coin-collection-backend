export class CoinDTO {
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
      id: this.id,
      stateName: this.stateName,
      obvThumb: this.obvThumb,
      revThumb: this.revThumb,
      mintYear: this.mintYear,
    };
  }

  static fromEntity(entity) {
    return new CoinDTO({
      id: entity.id,
      stateName: entity.stateName,
      obvThumb: entity.obvThumb,
      revThumb: entity.revThumb,
      mintYear: entity.mintYear,
    });
  }

  static toDTO(entity) {
    return new CoinDTO({
      id: entity.id,
      stateName: entity.title.match(/\(([^)]+)\)/)?.[1],
      obvThumb: entity.obverse_thumbnail,
      revThumb: entity.reverse_thumbnail,
      mintYear: entity.min_year,
    });
  }
}
