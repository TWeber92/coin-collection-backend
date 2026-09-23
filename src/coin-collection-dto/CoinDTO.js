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


  toJSON() {
    return {
      id: this.#id,
      stateName: this.#stateName,
      obvThumb: this.#obvThumb,
      revThumb: this.#revThumb,
      mintYear: this.#mintYear,
    };
  }

  static from(entity) {
    return new CoinDTO(entity);
  }

  static fromNumista(numista) {
    return new CoinDTO({
      id: numista.id,
      stateName: numista.title
      .match(/\(([^)]+)\)/)[1]
      .toLowerCase()
      .replace(/\s+/g, ""),
      obvThumb: numista.obverse_thumbnail,
      revThumb: numista.reverse_thumbnail,
      mintYear: numista.min_year,
    });
  }
}
