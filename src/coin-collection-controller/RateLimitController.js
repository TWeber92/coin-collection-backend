import { APIController } from "./APIController";

export class RateLimitController extends APIController {
  constructor(service) {
    this.#service = service;
  }
  #service;
  async checkIp(req, res) {
    return super.POST(req, res, "checkIp", async () => {
      const ip = req.headers["cf-connecting-ip"] || "unknown";
      console.log(ip);
      
      await this.#service.checkIp(ip);
      return { status: 200, data: null };
    });
  }
}
