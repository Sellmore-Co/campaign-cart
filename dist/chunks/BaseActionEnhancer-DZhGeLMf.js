import { B as BaseEnhancer } from "./index-DRLPuzCq.js";
class BaseActionEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.isProcessing = false;
  }
  /**
   * Execute an async action with proper state management
   * Handles loading states and prevents concurrent executions
   * 
   * @param action The async action to execute
   * @param options Configuration options
   * @returns Promise resolving to the action result
   */
  async executeAction(action, options) {
    if (this.isProcessing) {
      return Promise.reject(new Error("Already processing"));
    }
    this.isProcessing = true;
    if (options?.showLoading) {
      this.setLoadingState(true);
    }
    if (options?.disableOnProcess) {
      this.element.setAttribute("disabled", "true");
    }
    try {
      const result = await action();
      this.emit("action:success", {
        action: this.constructor.name,
        data: { element: this.element }
      });
      return result;
    } catch (error) {
      this.handleError(error, "executeAction");
      this.emit("action:failed", {
        action: this.constructor.name,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    } finally {
      this.isProcessing = false;
      if (options?.showLoading) {
        this.setLoadingState(false);
      }
      if (options?.disableOnProcess) {
        this.element.removeAttribute("disabled");
      }
    }
  }
  /**
   * Set loading state on element
   * Adds/removes loading class and toggles disabled state
   */
  setLoadingState(loading) {
    this.toggleClass("loading", loading);
    this.toggleClass("next-loading", loading);
    this.setAttribute("aria-busy", loading.toString());
    if (this.element instanceof HTMLButtonElement || this.element instanceof HTMLInputElement || this.element instanceof HTMLSelectElement) {
      this.element.disabled = loading;
    }
  }
  /**
   * Check if action is currently processing
   */
  isActionProcessing() {
    return this.isProcessing;
  }
  /**
   * Set custom loading content
   * Useful for showing loading spinners or text
   */
  setLoadingContent(content) {
    if (content !== null) {
      this.setAttribute("data-loading-text", content);
    } else {
      this.removeAttribute("data-loading-text");
    }
  }
  /**
   * Debounce an action to prevent rapid repeated calls
   */
  debounceAction(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          try {
            const result = func(...args);
            if (result instanceof Promise) {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  }
  /**
   * Throttle an action to limit execution frequency
   */
  throttleAction(func, limit) {
    let inThrottle;
    let lastResult;
    return (...args) => {
      if (!inThrottle) {
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
        lastResult = func(...args);
      }
      return lastResult;
    };
  }
}
export {
  BaseActionEnhancer as B
};
