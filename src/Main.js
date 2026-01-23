import { CoinController } from "./coin-collection-controller/CoinController";
import { CoinCollectionRepo } from "./coin-collection-repository/CoinCollectionRepo";
import { OORTStorageClient } from "./coin-collection-repository/OORTStorageClient";
import { CoinService } from "./coin-collection-service/CoinService";

export class Main {
  constructor(process) {
    this.config = {
      accessKey: process.env.OORT_ACCESS_KEY,
      secretKey: process.env.OORT_SECRET_KEY,
      bucket: process.env.OORT_BUCKET,
    };
    this.controller = this.getController();
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
