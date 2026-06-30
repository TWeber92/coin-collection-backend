export class CoinCollectionError extends Error {
  constructor(message, name, context, status) {
    super(message);
    this.name = `CoinCollectionError: ${name}`;
    this.context = context;
    this.status = status;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
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

export class NotFoundError extends CoinCollectionError {
  constructor(resource, id) {
    super(
      `${resource} with ID ${id} not found`,
      "ResourceNotFound",
      {
        resource,
        id,
      },
      404,
    );
  }
}
export class ValidationError extends CoinCollectionError {
  constructor(field, message) {
    super(
      `Validation failed for ${field}: ${message}`,
      "ValidationError",
      { field },
      400,
    );
  }
}
export class AuthenticationError extends CoinCollectionError {
  constructor(message, context) {
    super(message, "AuthenticationError", context, 401);
  }
}
export class AuthorizationError extends CoinCollectionError {
  constructor(resource, context) {
    super(
      `User: ${resource} is not authorized to perform this action`,
      "AuthorizationError",
      context,
      403,
    );
  }
}
export class OortError extends CoinCollectionError {
  constructor(message, originalError) {
    super(
      `OORT operation failed: ${message}`,
      "OortError",
      {
        originalError: originalError?.Message,
      },
      500,
    );
  }
}
export class EmailError extends CoinCollectionError {
  constructor(error) {
    super(
      "PIN created but email failed. Please try again.",
      "WorkerMailerError",
      "coin-collection-proxy/postTempPin",
      error.statusCode || 500,
    );
  }
}
export class ParameterError extends CoinCollectionError {
  constructor(message) {
    super(
      `Parameter Missing: ${message}`,
      "ParameterError",
      "coin-collection-proxy/getCoin",
      400,
    );
  }
}
