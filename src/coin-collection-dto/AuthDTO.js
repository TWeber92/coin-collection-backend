export class AuthDTO {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }

  static fromRequest(body) {
    return new AuthDTO({
      email: body.email,
      password: body.password,
    });
  }
}