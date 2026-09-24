import { ValidationError } from "../coin-collection-exception/CoinCollectionError";

export class UserValidator {
  static validateUserId(userId) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new ValidationError("userId", "Invalid UUID format");
    }
  }
  static validateUserData(user) {
    const errors = [];
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(user.email)) errors.push("Invalid Email Format");
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) errors.push("Invalid User ID format");
    if (errors.length > 0) {
      throw new ValidationError("userData", errors.join(", "));
    }
  }
  static validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new ValidationError("email", "Invalid email format");
  }
}

static validatePassword(password) {
  if (!password || typeof password !== "string") {
    throw new ValidationError("password", "Password is required");
  }
  if (password.length < 8) {
    throw new ValidationError("password", "Password must be at least 8 characters");
  }
}
}
