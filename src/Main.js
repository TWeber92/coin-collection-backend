import { AuthController } from "./coin-collection-controller/AuthController";
import { CoinController } from "./coin-collection-controller/CoinController";
import { UserController } from "./coin-collection-controller/UserController";
import { AuthRepository } from "./coin-collection-repository/AuthRepository";
import { CoinRepository } from "./coin-collection-repository/CoinRepository";
import { UserRepository } from "./coin-collection-repository/UserRepository";
import { AuthService } from "./coin-collection-service/AuthService";
// import { OORTStorageClient } from "./coin-collection-repository/OORTStorageClient";
import { CoinService } from "./coin-collection-service/CoinService";
import { UserService } from "./coin-collection-service/UserService";

export class Main {
  constructor(env) {
    this.config = {
      accessKey: env.OORT_ACCESS_KEY,
      secretKey: env.OORT_SECRET_KEY,
      bucket: env.OORT_BUCKET,
    };
    
    this.instantiateControllers();
  }

  getCoinRepo() {
    return new CoinRepository(
      this.config.accessKey,
      this.config.secretKey,
      this.config.bucket,
    );
  }
  getUserRepo() {
    return new UserRepository(
      this.config.accessKey,
      this.config.secretKey,
      this.config.bucket,
    );
  }
  getAuthRepo() {
    return new AuthRepository(
      this.config.accessKey,
      this.config.secretKey,
      this.config.bucket,
    );
  }

  getCoinService() {
    return new CoinService(this.getCoinRepo());
  }
  getUserService() {
    return new UserService(this.getUserRepo());
  }
  getAuthService() {
    return new AuthService(this.getAuthRepo());
  }

  getAuthController() {
    return new AuthController(this.getAuthService());
  }
  getUserController() {
    return new UserController(this.getUserService());
  }
  getCoinController() {
    return new CoinController(this.getCoinService());
  }

  instantiateControllers() {
    this.controller = this.getCoinController();
    this.userController = this.getUserController();
    this.authController = this.getAuthController();
  }
}
