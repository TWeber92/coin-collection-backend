import { APIController } from "./APIController";

export class AuthController extends APIController {
  constructor(service) {
    super();
    this.authService = service;
  }
  async getAuthDataByKey(req, res) {
    super.GET(req, res, "getAuthDataByKey", async () => {
      const id = await this.#userService.getAuthDataByKey(req.body.lookupKey);
      return { status: 200, data: id };
    });
  }
  async getAuthDataByValue(req, res) {
    super.GET(req, res, "getAuthDataByValue", async () => {
      const id = await this.#userService.getAuthDataByValue(req.body.value);
      return { status: 200, data: id };
    });
  }
  async postAuthData(req, res) {
    super.POST(req, res, "postAuthData", async () => {
      await this.#userService.postAuthData(req.body);
      return { status: 200 };
    });
  }
  async postAuthTempData(req, res) {
    super.POST(req, res, "postAuthTempData", async () => {
      await this.#userService.postAuthTempData(req.body);
      return { status: 200 };
    });
  }
  async deleteAuthTempData(req, res) {
    super.POST(req, res, "deleteAuthTempData", async () => {
      await this.#userService.deleteAuthTempData(req.body);
      return { status: 200 };
    });
  }
}
