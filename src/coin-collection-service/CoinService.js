import { CoinDTO } from "../coin-collection-dto/CoinDTO";
import { CoinEntity } from "../coin-collection-entity/CoinEntity";
import { CoinValidator } from "../coin-collection-validation/CoinValidator";

export class CoinService {
  constructor(repo) {
    this.coinCollectionRepo = repo;
  }

  async getCoinByStateName(stateName) {
    CoinValidator.validateStateName(stateName);
    const { success, entity } =
      await this.coinCollectionRepo.getCoinByStateName(stateName);
    return {
      success,
      coin: CoinDTO.fromEntity(entity),
    };
  }

  async postAllStateCoins(entityObjects) {
    const coins = JSON.parse(entityObjects);
    coins.map((entity) => CoinValidator.validateCoinData(entity));
    const coinDTOs = coins.map((entity) => CoinDTO.toDTO(entity));
    const coinEntities = coinDTOs.map((dto) => CoinEntity.fromDto(dto));
    return await this.coinCollectionRepo.saveAll(coinEntities);
  }
}
