import { APIController } from "./APIController";
import { decrypt, encrypt } from "../coin-collection-auth/session.js";
import { AuthenticationError } from "../coin-collection-exception/CoinCollectionError.js";

export class UserController extends APIController {
  #userService;
  #keys;

  constructor(service, keys) {
    super();
    this.#userService = service;
    this.#keys = keys;
  }
  async #getUserFromCookie(req) {
    const payload = JSON.parse(
      await decrypt(req.headers.cookie, this.#keys.server),
    );
    if (payload.exp < Date.now()) {
      throw new AuthenticationError("Session expired", "session.js/expiry");
    }
    return payload.uuid;
  }
  async #getSessionCookie(data) {
    const payload = JSON.stringify({
      uuid: data.toJSON().id,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now, in ms
    });
    return await encrypt(payload, this.#keys.server);
  }

  async signup(req, res) {
    return super.POST(req, res, "signup", async () => {
      const data = await this.#userService.signup(
        req.body.email,
        req.body.password,
        req.body.collection,
        this.#keys.pepper,
      );
      const session = await this.#getSessionCookie(data);

      res.setHeader(
        "Set-Cookie",
        `auth=${session}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
      );

      return { status: 201, data };
    });
  }
  async login(req, res) {
    return super.POST(req, res, "login", async () => {
      const data = await this.#userService.login(
        req.body.email,
        req.body.password,
        this.#keys.pepper,
      );
      const session = await this.#getSessionCookie(data);

      res.setHeader(
        "Set-Cookie",
        `auth=${session}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
      );

      return { status: 200, data };
    });
  }
  async logout(req, res) {
    return super.POST(req, res, "logout", async () => {
      res.setHeader(
        "Set-Cookie",
        "auth=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
      );
      return { status: 200, data: { message: "Logged out" } };
    });
  }
  async getMe(req, res) {
    return super.GET(req, res, "getMe", async () => {
      const id = await this.#getUserFromCookie(req);
      const user = await this.#userService.getUserByUuid(id);
      return { status: 200, data: user };
    });
  }
  async putUserCollection(req, res) {
    return super.PUT(req, res, "putUserCollection", async () => {
      const id = await this.#getUserFromCookie(req);
      const user = await this.#userService.putUserCollection(
        id,
        req.body.collection,
      );
      return { status: 200, data: user };
    });
  }
  async putPassword(req, res) {
    return super.POST(req, res, "putPassword", async () => {
      const { email, pin, newPassword } = req.body;
      await this.#userService.putPassword(
        email,
        pin,
        newPassword,
        this.#keys.pepper,
      );
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
      await this.#userService.putTempPin(index, pin, this.#keys.pepper);
      return {
        status: 200,
        data: { message: "If that email is registered, a PIN has been sent." },
      };
    });
  }
}
