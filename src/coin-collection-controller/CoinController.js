import { Logger } from "../Logger";
import { APIController } from "./APIController";

export class CoinController extends APIController {
  constructor(service) {
    super();
    this.coinService = service;
  }

  async getCoinByStateName(req, res) {
    return super.GET(req, res, "getCoinByStateName", async () => {
      const coinDto = await this.coinService.getCoinByStateName(
        req.params.stateName,
      );
      if (!coinDto) {
        const entry = Logger.log("Coin not found", {
          stateName: req.params.stateName,
          operation: "getCoinByStateName",
        });
        Logger.methods.WARN(entry);
        return { status: 404, data: { error: "Coin not found for StateName" } };
      }
      return { status: 200, data: coinDto.toJSON() };
    });
  }

  async postAllStateCoins(req, res) {
    return super.POST(req, res, async () => {
      const result = await this.coinService.postAllStateCoins(req.body);
      if (!result.success) {
        const entry = Logger.log("Client Data Invalid", {
          ids: result || [],
          operation: "postAllStateCoins",
        });
        Logger.methods.WARN(entry);
        return { status: 400, data: { error: "Client Data Invalid" } };
      }
      return { status: 201, data: result };
    });
  }
}
