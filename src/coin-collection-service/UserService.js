import { UserValidator } from "../coin-collection-validation/UserValidator.js";
import { hashPassword } from "../coin-collection-auth/password.js";

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
}