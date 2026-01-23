export class CoinCollectionError extends Error {
  constructor(message, name, context, status) {
    super(message);
    this.name = `CoinCollectionError: ${name}`;
    this.context = context;
    this.status = status;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      context: this.context,
      status: this.status,
      timestamp: this.timestamp,
    };
  }
}
