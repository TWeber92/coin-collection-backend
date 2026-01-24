import { CoinController } from "./coin-collection-controller/CoinController";
import { CoinCollectionRepo } from "./coin-collection-repository/CoinCollectionRepo";
// import { OORTStorageClient } from "./coin-collection-repository/OORTStorageClient";
import { CoinService } from "./coin-collection-service/CoinService";

export class Main {
  constructor(env) {
    this.config = {
      accessKey: env.OORT_ACCESS_KEY,
      secretKey: env.OORT_SECRET_KEY,
      bucket: env.OORT_BUCKET,
    };
    this.controller = this.getController();
    console.log("OORT Config:", {
      hasAccessKey: !!this.config.accessKey,
      hasSecretKey: !!this.config.secretKey,
      bucket: this.config.bucket,
    });
  }

  getRepo() {
    return new CoinCollectionRepo(
      this.config.accessKey,
      this.config.secretKey,
      this.config.bucket,
    );
  }

  getService() {
    return new CoinService(this.getRepo());
  }

  getController() {
    return new CoinController(this.getService());
  }
}
