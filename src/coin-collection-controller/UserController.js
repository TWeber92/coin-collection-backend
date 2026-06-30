import { Logger } from "../Logger";
import { APIController } from "./APIController";

export class UserController extends APIController {
  #userService;
  constructor(service) {
    super();
    this.#userService = service;
  }
  async getUserById(req, res) {
    super.GET(req, res, "getUserById", async () => {
      const user = await this.#userService.getUserById(req.body.sub);
      return { status: 200, data: user };
    });
  }
  async postUserData(req, res) {
    super.POST(req, res, "postUserData", async () => {
      const user = await this.#userService.postUserData(req.body);
      return { status: 200, data: user };
    });
  }

  async updateUserData(req, res) {
    super.PUT(req, res, "putUserData", async () => {
      await this.#userService.updateUserData(req.body);
      return { status: 200 };
    });
  }
}
