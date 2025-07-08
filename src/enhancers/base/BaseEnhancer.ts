/**
 * Base Enhancer Class
 * Abstract base class for all data attribute enhancers
 */

import { Logger, createLogger } from '@/utils/logger';
import { EventBus } from '@/utils/events';
import type { EventMap } from '@/types/global';

export abstract class BaseEnhancer {
  protected logger: Logger;
  protected eventBus: EventBus;
  protected element: HTMLElement;
  private subscriptions: (() => void)[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
    this.logger = createLogger(this.constructor.name);
    this.eventBus = EventBus.getInstance();
  }

  // Lifecycle hooks - must be implemented by subclasses
  public abstract initialize(): Promise<void> | void;
  public abstract update(data?: any): Promise<void> | void;

  // Optional lifecycle hook
  public destroy(): void {
    // Cleanup subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    // Remove any event listeners added to the element
    this.cleanupEventListeners();
  }

  // Event handling
  protected emit<K extends keyof EventMap>(event: K, detail: EventMap[K]): void {
    this.eventBus.emit(event, detail);
  }

  protected on<K extends keyof EventMap>(
    event: K, 
    handler: (data: EventMap[K]) => void
  ): void {
    this.eventBus.on(event, handler);
  }

  // Store subscription helper
  protected subscribe<T>(
    store: { subscribe: (listener: (state: T) => void) => () => void },
    listener: (state: T) => void
  ): void {
    const unsubscribe = store.subscribe(listener);
    this.subscriptions.push(unsubscribe);
  }

  // Utility methods
  protected getAttribute(name: string): string | null {
    return this.element.getAttribute(name);
  }

  protected getRequiredAttribute(name: string): string {
    const value = this.getAttribute(name);
    if (!value) {
      throw new Error(`Required attribute ${name} not found on element`);
    }
    return value;
  }

  protected hasAttribute(name: string): boolean {
    return this.element.hasAttribute(name);
  }

  protected setAttribute(name: string, value: string): void {
    this.element.setAttribute(name, value);
  }

  protected removeAttribute(name: string): void {
    this.element.removeAttribute(name);
  }

  protected addClass(className: string): void {
    this.element.classList.add(className);
  }

  protected removeClass(className: string): void {
    this.element.classList.remove(className);
  }

  protected hasClass(className: string): boolean {
    return this.element.classList.contains(className);
  }

  protected toggleClass(className: string, force?: boolean): void {
    this.element.classList.toggle(className, force);
  }

  protected updateTextContent(content: string): void {
    this.element.textContent = content;
  }

  protected updateInnerHTML(html: string): void {
    this.element.innerHTML = html;
  }

  // Override this in subclasses if they add event listeners
  protected cleanupEventListeners(): void {
    // Default implementation - no cleanup needed
  }

  // Validation helpers
  protected validateElement(): void {
    if (!this.element) {
      throw new Error('Element is required');
    }
  }

  // Error handling
  protected handleError(error: unknown, context: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error in ${context}:`, errorMessage);
    
    // Emit error event
    this.emit('error:occurred', {
      message: errorMessage,
      code: 'ENHANCER_ERROR',
      details: { enhancer: this.constructor.name, context, element: this.element },
    });
  }
}