import { CoinController } from "./coin-collection-controller/CoinController";
import { UserController } from "./coin-collection-controller/UserController";
import { CoinRepository } from "./coin-collection-repository/CoinRepository";
import { UserRepository } from "./coin-collection-repository/UserRepository";
import { OORTStorageClient } from "./coin-collection-repository/OORTStorageClient";
import { CoinService } from "./coin-collection-service/CoinService";
import { UserService } from "./coin-collection-service/UserService";
import { RateLimitController } from "./coin-collection-controller/RateLimitController";
import { RateLimitService } from "./coin-collection-service/RateLimitService";
import { RateLimitRepository } from "./coin-collection-repository/RateLimitRepository";

export class Main {
  constructor(env) {
    this.#oort = new OORTStorageClient(
      env.OORT_ACCESS_KEY,
      env.OORT_SECRET_KEY,
      env.OORT_BUCKET,
    );
    this.#keys = { server: env.SERVER_KEY, pepper: env.PEPPER_KEY };
    this.instantiateControllers();
  }
  #oort;
  #keys;
  #getCoinRepo() {
    return new CoinRepository(this.#oort);
  }
  #getUserRepo() {
    return new UserRepository(this.#oort);
  }
  #getLimitRepo() {
    return new RateLimitRepository(this.#oort);
  }

  #getCoinService() {
    return new CoinService(this.#getCoinRepo());
  }
  #getUserService() {
    return new UserService(this.#getUserRepo());
  }
  #getLimitService() {
    return new RateLimitService(this.#getLimitRepo());
  }

  #getUserController() {
    return new UserController(this.#getUserService(), this.#keys);
  }
  #getCoinController() {
    return new CoinController(this.#getCoinService());
  }
  #getLimitController() {
    return new RateLimitController(this.#getLimitService());
  }

  instantiateControllers() {
    this.coinController = this.#getCoinController();
    this.userController = this.#getUserController();
    this.limitController = this.#getLimitController();
  }
}
