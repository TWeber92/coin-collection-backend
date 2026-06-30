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
    console.log(entity);

    return CoinDTO.fromEntity(entity);
  }

  async postAllStateCoins(dtos) {
    dtos.map((dto) => CoinValidator.validateCoinData(dto));
    const coinDTOs = dtos.map((dto) => CoinDTO.toDTO(dto));
    const coinEntities = coinDTOs.map((dto) => CoinEntity.fromDto(dto));
    return await this.coinCollectionRepo.saveAll(coinEntities);
  }
}
