import { CoinCollectionError } from "../coin-collection-exception/CoinCollectionError";
import { Logger } from "../Logger";

export class APIController {
  async API(req, res, operation, handler) {
    try {
      const result = await handler();
      res.status(result.status).json(result.data);
    } catch (error) {
      throw this.#handleError(error, req, operation);
    }
  }

  async GET(req, res, operation, handler) {
    await this.API(req, res, operation, handler);
  }

  async POST(req, res, operation, handler) {
    await this.API(req, res, operation, handler);
  }
  async PUT(req, res, operation, handler) {
    await this.API(req, res, operation, handler);
  }
  #handleError(error, req, operation) {
    if (!(error instanceof CoinCollectionError)) {
      error = new CoinCollectionError(
        error.message,
        error.name || "UnknownError",
        error.context,
        operation,
        error.status,
      );
    }
    const meta = {
      errorName: error.name,
      errorContext: error.context,
      method: req.method,
      path: req.path,
    };
    if (error.status >= 500) {
      const entry = Logger.log(error.message, meta);
      Logger.methods.ERROR(entry);
    } else {
      const entry = Logger.log(error.message, meta);
      Logger.methods.WARN(entry);
    }

    return error;
  }
}
