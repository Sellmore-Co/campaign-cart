/**
 * Logger - Provides logging functionality for the 29next client
 */

// Add global declaration for TypeScript compatibility
// This would typically be in a separate .d.ts file in a TypeScript project
// But including it as a comment for reference
// declare global {
//   interface Window {
//     twentyNineNextStartupTime: number;
//   }
// }

export class Logger {
  #debug;
  #prefix = '29next';
  #startupTime = 0;

  constructor(debug = false) {
    this.#debug = debug;
    this.setStartupTime();
  }

  setDebug(debug) {
    this.#debug = debug;
  }

  /**
   * Sets the startup time to the current timestamp
   */
  setStartupTime() {
    this.#startupTime = +new Date();
    // Make startup time available globally
    window.twentyNineNextStartupTime = this.#startupTime;
  }

  /**
   * Gets the elapsed time since startup in milliseconds
   */
  getElapsedTime() {
    return (+new Date()) - this.#startupTime;
  }

  createModuleLogger(moduleName) {
    const modulePrefix = `${this.#prefix} [${moduleName}]`;
    return {
      debug: (...args) => this.#debugLog(modulePrefix, ...args),
      info: (...args) => this.#info(modulePrefix, ...args),
      warn: (...args) => this.#warn(modulePrefix, ...args),
      error: (...args) => this.#error(modulePrefix, ...args),
      // Add timing methods to module loggers
      debugWithTime: (...args) => this.#debugLogWithTime(modulePrefix, ...args),
      infoWithTime: (...args) => this.#infoWithTime(modulePrefix, ...args),
      warnWithTime: (...args) => this.#warnWithTime(modulePrefix, ...args),
      errorWithTime: (...args) => this.#errorWithTime(modulePrefix, ...args)
    };
  }

  #info(prefix, message, ...args) {
    console.info(`%c${prefix}%c ${message}`, 'color: #0066cc; font-weight: bold;', 'color: inherit;', ...args);
  }

  #warn(prefix, message, ...args) {
    console.warn(`%c${prefix}%c ${message}`, 'color: #ff9900; font-weight: bold;', 'color: inherit;', ...args);
  }

  #error(prefix, message, ...args) {
    console.error(`%c${prefix}%c ${message}`, 'color: #cc0000; font-weight: bold;', 'color: inherit;', ...args);
  }

  #debugLog(prefix, message, ...args) {
    if (this.#debug) {
      console.debug(`%c${prefix}:debug%c ${message}`, 'color: #666666; font-weight: bold;', 'color: inherit;', ...args);
    }
  }

  // New methods with timing information
  #infoWithTime(prefix, message, ...args) {
    const diff = this.getElapsedTime();
    console.info(`%c${prefix} +${diff}ms%c ${message}`, 'color: #0066cc; font-weight: bold;', 'color: inherit;', ...args);
  }

  #warnWithTime(prefix, message, ...args) {
    const diff = this.getElapsedTime();
    console.warn(`%c${prefix} +${diff}ms%c ${message}`, 'color: #ff9900; font-weight: bold;', 'color: inherit;', ...args);
  }

  #errorWithTime(prefix, message, ...args) {
    const diff = this.getElapsedTime();
    console.error(`%c${prefix} +${diff}ms%c ${message}`, 'color: #cc0000; font-weight: bold;', 'color: inherit;', ...args);
  }

  #debugLogWithTime(prefix, message, ...args) {
    if (this.#debug) {
      const diff = this.getElapsedTime();
      console.debug(`%c${prefix}:debug +${diff}ms%c ${message}`, 'color: #666666; font-weight: bold;', 'color: inherit;', ...args);
    }
  }

  // Standalone timing log methods
  logWithTime(message, ...args) {
    const diff = this.getElapsedTime();
    console.log(`%c${this.#prefix} +${diff}ms%c ${message}`, 'color: #0066cc; font-weight: bold;', 'color: inherit;', ...args);
  }

  warnWithTime(message, ...args) {
    const diff = this.getElapsedTime();
    console.warn(`%c${this.#prefix} +${diff}ms%c ${message}`, 'color: #ff9900; font-weight: bold;', 'color: inherit;', ...args);
  }

  errorWithTime(message, ...args) {
    const diff = this.getElapsedTime();
    console.error(`%c${this.#prefix} +${diff}ms%c ${message}`, 'color: #cc0000; font-weight: bold;', 'color: inherit;', ...args);
  }

  debugWithTime(message, ...args) {
    if (this.#debug) {
      const diff = this.getElapsedTime();
      console.debug(`%c${this.#prefix}:debug +${diff}ms%c ${message}`, 'color: #666666; font-weight: bold;', 'color: inherit;', ...args);
    }
  }
}