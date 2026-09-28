export class Pin {
  #pinHash;
  #expiresAt;
  #attempts;
  #requests
  constructor(data) {
    this.#pinHash = data.pinHash;
    this.#expiresAt = data.expiresAt;
    this.#attempts = data.attempts;
    this.#requests = data.requests
  }
  toJSON() {
    return {
      pinHash: this.#pinHash,
      expiresAt: this.#expiresAt,
      attempts: this.#attempts,
      requests: this.#requests,
    };
  }
  static from(data) {
    return new Pin(data);
  }
}