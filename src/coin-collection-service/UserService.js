import { UserValidator } from "../coin-collection-validation/UserValidator.js";
import {
  hashPassword,
  verifyPassword,
} from "../coin-collection-auth/password.js";
import { AuthenticationError } from "../coin-collection-exception/CoinCollectionError.js";
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

  async signup(email, password, collection) {
    const cleanEmail = email.toLowerCase().trim();
    UserValidator.validateEmail(cleanEmail);
    UserValidator.validatePassword(password);
    const uuid = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const dto = UserDTO.from({
      id: uuid,
      email: cleanEmail,
      passwordHash,
      collection,
      createdAt: new Date().toISOString(),
    });
    const entity = User.from({
      ...dto.toJSON(),
      createdAt: dto.createdAt,
      passwordHash,
    });
    await this.#repo.createUser(entity);
    return dto;
  }
  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    UserValidator.validateEmail(cleanEmail);
    UserValidator.validatePasswordPresent(password);
    const user = await this.#repo.getUserByEmail(cleanEmail);
    if (!user) throw new AuthenticationError("Invalid credentials", "Email");
    const entity = User.from(user);
    console.log(user);

    const ok = await verifyPassword(password, user.passwordHash);
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
    const pinHash = await hashPassword(pin);
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const dto = UserDTO.from({ ...user, pinHash, expiresAt, attempts: 0 });
    const entity = User.from({
      ...dto.toJSON(),
      passwordHash: user.passwordHash,
    });
    await this.#repo.putUser(entity);
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
