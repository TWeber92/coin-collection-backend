import { APIController } from "./APIController";
import { decrypt, encrypt } from "../coin-collection-auth/session.js";

export class UserController extends APIController {
  #userService;
  #keys;

  constructor(service, keys) {
    super();
    this.#userService = service;
    this.#keys = keys;
  }

  async signup(req, res) {
    return super.POST(req, res, "signup", async () => {
      const data = await this.#userService.signup(
        req.body.email,
        req.body.password,
        req.body.collection,
        this.#keys.pepper
      );
      const session = await encrypt(data.toJSON().uuid, this.#keys.server);

      res.setHeader(
        "Set-Cookie",
        `auth=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
      );

      return { status: 201, data };
    });
  }
  async login(req, res) {
    return super.POST(req, res, "login", async () => {
      const data = await this.#userService.login(
        req.body.email,
        req.body.password,
        this.#keys.pepper
      );
      const session = await encrypt(data.toJSON().uuid, this.#keys.server);

      res.setHeader(
        "Set-Cookie",
        `auth=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
      );

      return { status: 200, data };
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
      const uuid = await decrypt(req.headers.cookie, this.#keys.server);
      const user = await this.#userService.getUserByUuid(uuid);
      return { status: 200, data: user };
    });
  }
  async putPassword(req, res) {
    return super.POST(req, res, "putPassword", async () => {
      const { email, pin, newPassword } = req.body;
      await this.#userService.putPassword(email, pin, newPassword);
      return {
        status: 200,
        data: { message: "Password updated successfully." },
      };
    });
  }
  async getEmailIndex(req, res) {
    return super.GET(req, res, "getEmailIndex", async () => {
      const index = await this.#userService.getEmailIndex(req.body.email);
      return { status: 200, data: index };
    });
  }
  async putTempPin(req, res) {
    return super.POST(req, res, "putPin", async () => {
      const { index, pin } = req.body;
      await this.#userService.putTempPin(index, pin);
      return {
        status: 200,
        data: { message: "If that email is registered, a PIN has been sent." },
      };
    });
  }
}
