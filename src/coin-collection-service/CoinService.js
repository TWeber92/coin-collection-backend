import { CoinDTO } from "../coin-collection-dto/CoinDTO";
import { CoinEntity } from "../coin-collection-entity/CoinEntity";
import { CoinValidator } from "../coin-collection-validation/CoinValidator";

export class CoinService {
  constructor(repo) {
    this.#repo = repo;
  }
  #repo;
  async getCoinByStateName(stateName) {
    CoinValidator.validateStateName(stateName);
    const cleanName = stateName.toLowerCase().replace(/\s+/g, "");
    const data = await this.#repo.getCoinByStateName(cleanName);
    const entity = CoinEntity.from(data);
    return CoinDTO.from(entity.toJSON());
  }

  async postAllStateCoins(dtos) {
    dtos.forEach((dto) => CoinValidator.validateCoinData(dto));
    const coinDTOs = dtos.map((dto) => CoinDTO.fromNumista(dto));
    const coinEntities = coinDTOs.map((dto) => CoinEntity.from(dto.toJSON()));
    await Promise.all(
      coinEntities.map((entity) => this.#repo.putCoinIntoStorage(entity)),
    );
    return coinEntities.map((e) => e.id);
  }
}
