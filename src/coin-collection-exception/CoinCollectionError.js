export class CoinCollectionError extends Error {
  constructor(message, name, context) {
    super(message);
    this.name = `CoinCollectionError: ${name}`;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}
