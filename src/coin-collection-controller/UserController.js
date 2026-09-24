import { APIController } from "./APIController";
import { encrypt } from "../coin-collection-auth/session.js";

export class UserController extends APIController {
  #userService;
  #serverKey;

  constructor(service, serverKey) {
    super();
    this.#userService = service;
    this.#serverKey = serverKey;
  }

  async signup(req, res) {
    return super.POST(req, res, "signup", async () => {
      const { uuid, email } = await this.#userService.signup(
        req.body.email,
        req.body.password,
      );
      const session = await encrypt(uuid, this.#serverKey);

      res.setHeader(
        "Set-Cookie",
        `auth=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
      );

      return { status: 201, data: { uuid, email } };
    });
  }
}