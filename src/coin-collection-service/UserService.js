import { UserValidator } from "../coin-collection-validation/UserValidator.js";
import {
  hashPassword,
  verifyPassword,
} from "../coin-collection-auth/password.js";
import { AuthenticationError } from "../coin-collection-exception/CoinCollectionError.js";

export class UserService {
  #repo;

  constructor(repo) {
    this.#repo = repo;
  }

  async signup(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    UserValidator.validateEmail(cleanEmail);
    UserValidator.validatePassword(password);

    const passwordHash = await hashPassword(password);
    const uuid = await this.#repo.createUser(cleanEmail, passwordHash);

    return { uuid, email: cleanEmail };
  }

  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    UserValidator.validateEmail(cleanEmail);
    UserValidator.validatePasswordPresent(password);

    const user = await this.#repo.getUserByEmail(cleanEmail);
    if (!user) {
      throw new AuthenticationError("Invalid credentials", "login");
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new AuthenticationError("Invalid credentials", "login");
    }

    return { uuid: user.uuid, email: user.email };
  }
  async getUserByUuid(uuid) {
    return await this.#repo.getUserByUuid(uuid);
  }
  async getUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    UserValidator.validateEmail(cleanEmail);
    const user = await this.#repo.getUserByEmail(cleanEmail);
    if (!user) {
      throw new AuthenticationError("Invalid credentials", "login");
    }
    return user;
  }
  async putTempPin(email, pin) {
  const cleanEmail = email.toLowerCase().trim();
  const pinHash = await hashPassword(pin);
  const expiresAt = Date.now() + 15 * 60 * 1000;
  await this.#repo.putTempPin(cleanEmail, {
    pinHash,
    expiresAt,
    attempts: 0,
  });
}
}
