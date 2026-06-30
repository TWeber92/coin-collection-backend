import { Logger } from "../Logger";
import { APIController } from "./APIController";

export class CoinController extends APIController {
  #coinService;
  constructor(service) {
    super();
    this.#coinService = service;
  }

  async getCoinByStateName(req, res) {
    return super.GET(req, res, "getCoinByStateName", async () => {
      const coin = await this.#coinService.getCoinByStateName(
        req.params.stateName,
      );
      return { status: 200, data: coin };
    });
  }

  async postAllStateCoins(req, res) {
    return super.POST(req, res, "postAllStateCoins", async () => {
      const ids = await this.#coinService.postAllStateCoins(req.body);
      return { status: 200, data: ids };
      // const { ids, success, statusCode, error } =
      //   await this.coinService.postAllStateCoins(req.body);
      // if (!success)
      //   return this.#handleLogger(
      //     req,
      //     statusCode,
      //     error,
      //     `Failed to post coins`,
      //     "postAllStateCoins",
      //   );
      // return { status: statusCode, data: ids };
    });
  }
}
