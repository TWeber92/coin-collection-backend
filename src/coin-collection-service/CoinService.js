import { CoinDTO } from "../coin-collection-dto/CoinDTO";
import { CoinEntity } from "../coin-collection-entity/CoinEntity";
import { CoinValidator } from "../coin-collection-validation/CoinValidator";

export class CoinService {
  constructor(repo) {
    this.coinCollectionRepo = repo;
  }

  async getCoinByStateName(stateName) {
    CoinValidator.validateStateName(stateName);
    const entity = await this.coinCollectionRepo.getCoinByStateName(stateName);
    return entity ? CoinDTO.toDTO(entity) : null;
  }

  async postAllStateCoins(rawObjects) {
    const coins = JSON.parse(rawObjects);
    coins.map((coin) => CoinValidator.validateCoinData(coin));
    const coinDTOs = coins.map((coin) => CoinDTO.toDTO(coin));
    const coinEntities = coinDTOs.map((coin) => CoinEntity.fromDto(coin));
    return await this.coinCollectionRepo.saveAll(coinEntities);
  }
}
