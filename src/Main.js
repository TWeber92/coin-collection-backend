import { AuthController } from "./coin-collection-controller/AuthController";
import { CoinController } from "./coin-collection-controller/CoinController";
import { UserController } from "./coin-collection-controller/UserController";
import { AuthRepository } from "./coin-collection-repository/AuthRepository";
import { CoinRepository } from "./coin-collection-repository/CoinRepository";
import { UserRepository } from "./coin-collection-repository/UserRepository";
import { AuthService } from "./coin-collection-service/AuthService";
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
    this.instantiateControllers();
  }
  #oort
  #getCoinRepo() {
    return new CoinRepository(this.#oort);
  }
  #getUserRepo() {
    return new UserRepository(this.#oort);
  }
  #getAuthRepo() {
    return new AuthRepository(this.#oort);
  }

  #getCoinService() {
    return new CoinService(this.#getCoinRepo());
  }
  #getUserService() {
    return new UserService(this.#getUserRepo());
  }
  #getAuthService() {
    return new AuthService(this.#getAuthRepo());
  }

  #getAuthController() {
    return new AuthController(this.#getAuthService());
  }
  #getUserController() {
    return new UserController(this.#getUserService());
  }
  #getCoinController() {
    return new CoinController(this.#getCoinService());
  }

  instantiateControllers() {
    this.coinController = this.#getCoinController();
    this.userController = this.#getUserController();
    this.authController = this.#getAuthController();
  }
}
