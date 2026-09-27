import { CoinController } from "./coin-collection-controller/CoinController";
import { UserController } from "./coin-collection-controller/UserController";
import { CoinRepository } from "./coin-collection-repository/CoinRepository";
import { UserRepository } from "./coin-collection-repository/UserRepository";
import { OORTStorageClient } from "./coin-collection-repository/OORTStorageClient";
import { CoinService } from "./coin-collection-service/CoinService";
import { UserService } from "./coin-collection-service/UserService";

export class Main {
  constructor(env) {
    this.#oort = new OORTStorageClient(
      env.OORT_ACCESS_KEY,
      env.OORT_SECRET_KEY,
      env.OORT_BUCKET,
    )
    this.#serverKey = env.SERVER_KEY
    this.instantiateControllers();
  }
  #oort
  #serverKey
  #getCoinRepo() {
    return new CoinRepository(this.#oort);
  }
  #getUserRepo() {
    return new UserRepository(this.#oort);
  }

  #getCoinService() {
    return new CoinService(this.#getCoinRepo());
  }
  #getUserService() {
    return new UserService(this.#getUserRepo());
  }
  
  #getUserController() {
    return new UserController(this.#getUserService(), this.#serverKey);
  }
  #getCoinController() {
    return new CoinController(this.#getCoinService());
  }

  instantiateControllers() {
    this.coinController = this.#getCoinController();
    this.userController = this.#getUserController();
  }
}
