import { L as Logger, s as sentryManager, E as EventBus } from "./analytics-BZUvO6mp.js";
class GlobalErrorHandler {
  constructor() {
    this.logger = new Logger("ErrorHandler");
    this.initialized = false;
    this.isHandlingError = false;
  }
  initialize() {
    if (this.initialized) return;
    window.addEventListener("error", (event) => {
      this.handleError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(event.reason, {
        type: "unhandledRejection",
        promise: event.promise
      });
    });
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      if (this.isHandlingError) return;
      const firstArg = args[0];
      if (firstArg instanceof Error) {
        this.handleError(firstArg, { source: "console.error" });
      } else if (typeof firstArg === "string" && firstArg.toLowerCase().includes("error")) {
        this.handleError(new Error(firstArg), {
          source: "console.error",
          additionalArgs: args.slice(1)
        });
      }
    };
    this.initialized = true;
    this.logger.debug("Global error handler initialized");
  }
  handleError(error, context) {
    if (!error) return;
    if (this.isHandlingError) return;
    try {
      this.isHandlingError = true;
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const enrichedContext = {
        ...context,
        sdk: {
          version: "0.2.0",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };
      this.logger.error("Captured error:", errorObj, enrichedContext);
      sentryManager.captureException(errorObj, enrichedContext);
      EventBus.getInstance().emit("error:occurred", {
        message: errorObj.message,
        code: errorObj.name,
        details: enrichedContext
      });
    } finally {
      this.isHandlingError = false;
    }
  }
  captureMessage(message, level = "info") {
    sentryManager.captureMessage(message, level);
  }
  addBreadcrumb(breadcrumb) {
    sentryManager.addBreadcrumb(breadcrumb);
  }
}
const errorHandler = new GlobalErrorHandler();
export {
  errorHandler
};
