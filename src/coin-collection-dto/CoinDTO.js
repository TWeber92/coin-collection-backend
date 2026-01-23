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
      id: dto.id,
      stateName: dto.stateName,
      obvThumb: dto.obvThumb,
      revThumb: dto.revThumb,
      mintYear: dto.mintYear,
    };
  }

  static fromEntity(entity) {
    return new CoinDTO({
      id: entity.id,
      stateName: dto.stateName,
      obvThumb: dto.obvThumb,
      revThumb: dto.revThumb,
      mintYear: dto.mintYear,
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
