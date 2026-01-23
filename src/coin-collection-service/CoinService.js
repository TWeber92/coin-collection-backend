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

  async postAllStateCoins(DtoObjects) {
    const coins = JSON.parse(DtoObjects);
    coins.map((dto) => CoinValidator.validateCoinData(dto));
    // const coinDTOs = coins.map((dto) => CoinDTO.toDTO(coin));
    const coinEntities = coins.map((dto) => CoinEntity.fromDto(dto));
    return await this.coinCollectionRepo.saveAll(coinEntities);
  }
}
