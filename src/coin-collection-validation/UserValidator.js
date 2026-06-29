import { ValidationError } from "../coin-collection-exception/CoinCollectionError";

export class UserValidator {
  static validateUserId(userId) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new ValidationError("userId", "Invalid UUID format");
    }
    return true;
  }
  static validateUserData(user) {
    this.errors = [];
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(user.email)) this.errors.push("Invalid Email Format");
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) this.errors.push("Invalid User ID format");
    if (this.errors.length > 0) {
      throw new ValidationError("userData", this.errors.join(", "));
    }
    return true;
  }
}
