import { Logger } from "../Logger";
import { APIController } from "./APIController";

export class CoinController extends APIController {
  constructor(service) {
    super();
    this.coinService = service;
  }

  async getCoinByStateName(req, res) {
    return super.GET(req, res, "getCoinByStateName", async () => {
      const coin = await this.coinService.getCoinByStateName(
        req.params.stateName,
      );
      return { status: 200, data: coin };
      // const { coin, success, statusCode, error } =
      //   await this.coinService.getCoinByStateName(req.params.stateName);
      // if (!success)
      //   return this.#handleLogger(
      //     req,
      //     statusCode,
      //     error,
      //     `Coin not found for StateName ${req.params.stateName}`,
      //     "getCoinByStateName",
      //   );
      // return { status: statusCode, data: coin.toJSON() };
    });
  }

  async postAllStateCoins(req, res) {
    return super.POST(req, res, "postAllStateCoins", async () => {
      const ids = await this.coinService.postAllStateCoins(req.body);
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

  // #handleLogger(req, status, error, context, op) {
  //   const entry = Logger.log(`${error.name}, ${error.message}`, {
  //     context,
  //     op,
  //   });
  //   Logger.methods.WARN(entry);
  //   return {
  //     status,
  //     data: {
  //       error: {
  //         message: `${error.message}, ${context}`,
  //         name: `${error.name}`,
  //       },
  //     },
  //   };
  // }
}
