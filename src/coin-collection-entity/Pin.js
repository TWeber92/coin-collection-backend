export class Pin {
  #pinHash;
  #expiresAt;
  #attempts;
  constructor(data) {
    this.#pinHash = data.pinHash;
    this.#expiresAt = data.expiresAt;
    this.#attempts = data.attempts;
  }
  toJSON() {
    return {
      pinHash: this.#pinHash,
      expiresAt: this.#expiresAt,
      attempts: this.#attempts,
    };
  }
  static from(data) {
    return new Pin(data);
  }
}