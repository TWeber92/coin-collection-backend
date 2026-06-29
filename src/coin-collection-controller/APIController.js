import { CoinCollectionError } from "../coin-collection-exception/CoinCollectionError";
import { Logger } from "../Logger";

export class APIController {
  async API(req, res, operation, handler) {
    try {
      const result = await handler();
      // if (result.status !== 200) {
      //   throw new CoinCollectionError(
      //     result.data.error.message,
      //     `${result.data.error.name}, RequestError`,
      //     operation,
      //     result.status,
      //   );
      // }
      res.status(result.status).json(result.data);
    } catch (error) {
      throw this.#handleError(error, req, operation);
      // res.status(coinErr.status).json({ error: coinErr });
    }
  }

  async GET(req, res, operation, handler) {
    await this.API(req, res, operation, handler);
    // try {
    //   const result = await handler();
    //   if (result.status !== 200) {
    //     throw new CoinCollectionError(
    //       result.data.error,
    //       "RequestError",
    //       operation,
    //       result.status
    //     )
    //   }
    //   res.status(result.status).json(result.data)
    // } catch (error) {
    //   const coinErr = this.#handleError(error, req, operation);
    //   const status = coinErr.status;
    //   res.status(status).json(coinErr.toJSON());
    // }
  }

  async POST(req, res, operation, handler) {
    await this.API(req, res, operation, handler);
    // try {
    //   const result = await handler();
    //   if (result.status !== 200) {
    //     throw new CoinCollectionError(
    //       result.data.error,
    //       "RequestError",
    //       operation,
    //       result.status
    //     )
    //   }
    //   res.status(result.status).json(result.data);
    // } catch (error) {
    //   const coinErr = this.#handleError(error, req, operation);
    //   const status = coinErr.status;
    //   res.status(status).json(coinErr.toJSON());
    // }
  }
  async PUT(req, res, operation, handler) {
    await this.API(req, res, operation, handler);
  }
  #handleError(error, req, operation) {
    // const instance = error instanceof CoinCollectionError;
    // const apiError = instance
    //   ? error
    //   : new CoinCollectionError(
    //       error.message,
    //       error.name || "UnknownError",
    //       operation,
    //       error.status,
    //     );
    if (!(error instanceof CoinCollectionError)) {
      error = new CoinCollectionError(
        error.message,
        error.name || "UnknownError",
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
    // this.#handleLogger(error, meta);
    // return {
    //   status,
    //   data: {
    //     error: {
    //       message: error.message,
    //       name: error.name,
    //       context: error.context,
    //       timestamp: error.timestamp,
    //     },
    //   },
    // };
    // const entry = Logger.log(apiError.message, meta);
    // Logger.methods.ERROR(entry);
    // return apiError;
  }
  // #handleLogger(error, meta) {
  // const entry = Logger.log(`${error.name}, ${error.message}`, {
  //   context,
  //   op,
  // });
  // Logger.methods.WARN(entry);
  // }
}
