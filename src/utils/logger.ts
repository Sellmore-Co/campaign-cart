/**
 * Logger utility with different log levels and debugging support
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private context: string;
  private static globalLevel: LogLevel = LogLevel.INFO;

  constructor(context: string) {
    this.context = context;
  }

  public static setLogLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  public static getLogLevel(): LogLevel {
    return Logger.globalLevel;
  }

  public error(message: string, ...args: any[]): void {
    if (Logger.globalLevel >= LogLevel.ERROR) {
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (Logger.globalLevel >= LogLevel.WARN) {
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (Logger.globalLevel >= LogLevel.INFO) {
      console.info(`[${this.context}] ${message}`, ...args);
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (Logger.globalLevel >= LogLevel.DEBUG) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }
}

// Factory function for creating loggers
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export const logger = createLogger('SDK');