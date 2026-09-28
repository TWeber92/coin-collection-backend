import { UserValidator } from "../coin-collection-validation/UserValidator.js";
import {
  hashPassword,
  verifyPassword,
} from "../coin-collection-auth/password.js";
import {
  AuthenticationError,
  RateLimitError,
} from "../coin-collection-exception/CoinCollectionError.js";
import { User } from "../coin-collection-entity/User.js";
import { UserDTO } from "../coin-collection-dto/UserDTO.js";

export class UserService {
  #repo;

  constructor(repo) {
    this.#repo = repo;
  }

  async getUserByUuid(uuid) {
    return await this.#repo.getUserByUuid(uuid);
  }

  async signup(email, password, collection, pepper) {
    const cleanEmail = email.toLowerCase().trim();
    UserValidator.validateEmail(cleanEmail);
    UserValidator.validatePassword(password);
    const uuid = crypto.randomUUID();
    const passwordHash = await hashPassword(password, pepper);
    const entity = User.from({
      id: uuid,
      email: cleanEmail,
      passwordHash,
      collection,
      createdAt: new Date().toISOString(),
      pin: { pinHash: null, expiresAt: null, attempts: 0, requests: [] },
    });
    await this.#repo.createUser(entity);
    return UserDTO.from(entity.toJSON());
  }
  async login(email, password, pepper) {
    const cleanEmail = email.toLowerCase().trim();
    UserValidator.validateEmail(cleanEmail);
    UserValidator.validatePasswordPresent(password);
    const user = await this.#repo.getUserByEmail(cleanEmail);
    if (!user) throw new AuthenticationError("Invalid credentials", "Email");
    const entity = User.from(user);
    const ok = await verifyPassword(password, user.passwordHash, pepper);
    if (!ok) throw new AuthenticationError("Invalid credentials", "Password");
    return UserDTO.from(entity.toJSON());
  }

  async getEmailIndex(email) {
    const cleanEmail = email.toLowerCase().trim();
    UserValidator.validateEmail(cleanEmail);
    const index = await this.#repo.getEmailIndex(cleanEmail);
    if (!index) throw new AuthenticationError("Invalid credentials", "Email");
    return index;
  }

  async putTempPin(index, pin) {
    const user = await this.#repo.getUserByUuid(index.uuid);
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const limit = 5;
    user.pin.requests = (user.pin.requests).filter(
      (t) => now - t < windowMs,
    );
    if (user.pin.requests.length >= limit)
      throw new RateLimitError("Too many PIN requests. Try again later.");
    user.pin.requests.push(now);
    user.pin.pinHash = await hashPassword(pin);
    user.pin.expiresAt = now + windowMs;
    user.pin.attempts = 0;
    await this.#repo.putUser(User.from(user));
  }
  async putPassword(email, pin, newPassword) {
    const cleanEmail = email.toLowerCase().trim();
    UserValidator.validateEmail(cleanEmail);
    UserValidator.validatePassword(newPassword);
    const user = await this.#repo.getUserByEmail(cleanEmail);
    if (!user) throw new AuthenticationError("User not found", "putPassword");
    const newPasswordHash = await hashPassword(newPassword);
    const pinOk = await verifyPassword(pin, user.pin.pinHash);
    const clearPin = { pinHash: null, expiresAt: null, attempts: 0 };
    let error;
    if (!pinOk) {
      user.pin.attempts += 1;
      error = "Invalid PIN";
    } else if (!user.pin.pinHash) {
      error = "PIN not found";
    } else if (user.pin.attempts >= 5) {
      user.pin = clearPin;
      error = "Too many attempts";
    } else if (Date.now() > user.pin.expiresAt) {
      user.pin = clearPin;
      error = "PIN expired";
    } else {
      user.passwordHash = newPasswordHash;
      user.pin = clearPin;
      error = null;
    }
    const entity = User.from(user);
    await this.#repo.putUser(entity);
    if (error) throw new AuthenticationError(error, "putPassword");
  }
}
