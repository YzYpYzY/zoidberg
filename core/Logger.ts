// logger.js
// ========

export enum LogTypes {
  default = "default",
  success = "success",
  error = "error",
  warning = "warning",
  info = "info",
}

export class Logger {
  private static TYPESCOLORS = {
    default: "\x1b[0m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warning: "\x1b[33m",
    info: "\x1b[34m",
  };

  static log(type: LogTypes, message: string): void {
    console.log(
      this.TYPESCOLORS[type],
      `[${type}] ${message}.`,
      this.TYPESCOLORS[type]
    );
  }
}
