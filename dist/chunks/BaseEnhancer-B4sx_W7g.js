import { c as createLogger, E as EventBus } from "./utils-Bgh0TU7j.js";
class BaseEnhancer {
  constructor(element) {
    this.subscriptions = [];
    this.element = element;
    this.logger = createLogger(this.constructor.name);
    this.eventBus = EventBus.getInstance();
  }
  // Optional lifecycle hook
  destroy() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
    this.cleanupEventListeners();
  }
  // Event handling
  emit(event, detail) {
    this.eventBus.emit(event, detail);
  }
  on(event, handler) {
    this.eventBus.on(event, handler);
  }
  // Store subscription helper
  subscribe(store, listener) {
    const unsubscribe = store.subscribe(listener);
    this.subscriptions.push(unsubscribe);
  }
  // Utility methods
  getAttribute(name) {
    return this.element.getAttribute(name);
  }
  getRequiredAttribute(name) {
    const value = this.getAttribute(name);
    if (!value) {
      throw new Error(`Required attribute ${name} not found on element`);
    }
    return value;
  }
  hasAttribute(name) {
    return this.element.hasAttribute(name);
  }
  setAttribute(name, value) {
    this.element.setAttribute(name, value);
  }
  removeAttribute(name) {
    this.element.removeAttribute(name);
  }
  addClass(className) {
    this.element.classList.add(className);
  }
  removeClass(className) {
    this.element.classList.remove(className);
  }
  hasClass(className) {
    return this.element.classList.contains(className);
  }
  toggleClass(className, force) {
    this.element.classList.toggle(className, force);
  }
  updateTextContent(content) {
    this.element.textContent = content;
  }
  updateInnerHTML(html) {
    this.element.innerHTML = html;
  }
  // Override this in subclasses if they add event listeners
  cleanupEventListeners() {
  }
  // Validation helpers
  validateElement() {
    if (!this.element) {
      throw new Error("Element is required");
    }
  }
  // Error handling
  handleError(error, context) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error in ${context}:`, errorMessage);
    this.emit("error:occurred", {
      message: errorMessage,
      code: "ENHANCER_ERROR",
      details: { enhancer: this.constructor.name, context, element: this.element }
    });
  }
}
export {
  BaseEnhancer as B
};
