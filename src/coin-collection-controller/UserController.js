import { APIController } from "./APIController";
import { decrypt, encrypt } from "../coin-collection-auth/session.js";

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
  async login(req, res) {
    return super.POST(req, res, "login", async () => {
      const { uuid, email } = await this.#userService.login(
        req.body.email,
        req.body.password,
      );
      const session = await encrypt(uuid, this.#serverKey);

      res.setHeader(
        "Set-Cookie",
        `auth=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
      );

      return { status: 200, data: { uuid, email } };
    });
  }
  async logout(req, res) {
    return super.POST(req, res, "logout", async () => {
      res.setHeader(
        "Set-Cookie",
        "auth=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
      );
      return { status: 200, data: { message: "Logged out" } };
    });
  }
  async getMe(req, res) {
    return super.GET(req, res, "getMe", async () => {
      const uuid = await decrypt(req.headers.cookie, this.#serverKey);
      const user = await this.#userService.getUserByUuid(uuid);
      return { status: 200, data: { uuid: user.uuid, email: user.email } };
    });
  }
  async getUserByEmail(req, res) {
    return super.GET(req, res, "getUserByEmail", async () => {
      const user = await this.#userService.getUserByEmail(req.body.email);
      return { status: 200, data: user };
    });
  }
  async putTempPin(req, res) {
  return super.POST(req, res, "putPin", async () => {
    const { email, pin } = req.body;
    await this.#userService.putTempPin(email, pin);
    return {
      status: 200,
      data: { message: "If that email is registered, a PIN has been sent." },
    };
  });
}
}
