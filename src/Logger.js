export class Logger {
  static methods = {
    ERROR: console.error,
    WARN: console.warn,
    INFO: console.info,
    DEBUG: console.debug,
  };

  static log(message, metadata = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      message,
      ...metadata,
    });
  }
}
