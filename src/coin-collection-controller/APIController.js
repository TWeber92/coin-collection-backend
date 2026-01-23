import { CoinCollectionError } from "../coin-collection-exception/CoinCollectionError";
import { Logger } from "../Logger";

export class APIController {
  #handleError(error, req, operation) {
    const instance = error instanceof CoinCollectionError;
    const apiError = instance
      ? error
      : new CoinCollectionError(
          error.message,
          error.name || "UnknownError",
          operation,
          error.status,
        );
    const meta = {
      errorName: apiError.name,
      errorContext: apiError.context,
      method: req.method,
      path: req.path,
      operation,
    };
    const entry = Logger.log(apiError.message, meta);
    Logger.methods.ERROR(entry);
    return apiError;
  }

  async GET(req, res, operation, handler) {
    try {
      const result = await handler();
      if (result?.status === 404) {
        res.status(result.status).json(result.data);
        return;
      }
      res.status(result.status).json(result.data);
    } catch (error) {
      const coinErr = this.#handleError(error, req, operation);
      const status = coinErr.status;
      res.status(status).json(coinErr.toJSON());
    }
  }

  async POST(req, res, operation, handler) {
    try {
      const result = await handler();
      if (result?.status === 400) {
        res.status(result.status).json(result.data);
      }
      res.status(result.status).json(result.data);
    } catch (error) {
      const coinErr = this.#handleError(error, req, operation);
      const status = coinErr.status;
      res.status(status).json(coinErr.toJSON());
    }
  }
}
