export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
interface ILogger {
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}
export declare class Logger implements ILogger {
    private context;
    private static globalLevel;
    constructor(context: string);
    static setLogLevel(level: LogLevel): void;
    static getLogLevel(): LogLevel;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}
export declare function createLogger(context: string): Logger;
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map