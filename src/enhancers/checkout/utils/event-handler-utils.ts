/**
 * Event Handler Utilities - Centralized event management with automatic cleanup
 * 
 * Reduces code duplication for event handler setup and cleanup across services
 */

export interface EventBinding {
  element: HTMLElement;
  event: string;
  handler: EventListener;
  options?: AddEventListenerOptions;
}

export class EventHandlerManager {
  private handlers: Map<HTMLElement, Map<string, EventListener>> = new Map();
  private bindings: EventBinding[] = [];

  /**
   * Add an event handler with automatic cleanup tracking
   */
  addHandler(
    element: HTMLElement | null | undefined, 
    event: string, 
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    if (!element) return;

    // Initialize element map if needed
    if (!this.handlers.has(element)) {
      this.handlers.set(element, new Map());
    }

    const elementHandlers = this.handlers.get(element)!;

    // Remove existing handler for this event if present
    if (elementHandlers.has(event)) {
      const existingHandler = elementHandlers.get(event)!;
      element.removeEventListener(event, existingHandler);
    }

    // Add new handler
    element.addEventListener(event, handler, options);
    elementHandlers.set(event, handler);
    
    // Track binding for cleanup
    const binding: EventBinding = { element, event, handler };
    if (options !== undefined) {
      binding.options = options;
    }
    this.bindings.push(binding);
  }

  /**
   * Add multiple handlers at once
   */
  addHandlers(bindings: EventBinding[]): void {
    bindings.forEach(binding => {
      this.addHandler(
        binding.element, 
        binding.event, 
        binding.handler, 
        binding.options
      );
    });
  }

  /**
   * Remove a specific handler
   */
  removeHandler(element: HTMLElement | null | undefined, event: string): void {
    if (!element) return;

    const elementHandlers = this.handlers.get(element);
    if (!elementHandlers) return;

    const handler = elementHandlers.get(event);
    if (handler) {
      element.removeEventListener(event, handler);
      elementHandlers.delete(event);
      
      // Remove from bindings
      this.bindings = this.bindings.filter(
        b => !(b.element === element && b.event === event)
      );
    }

    // Clean up empty maps
    if (elementHandlers.size === 0) {
      this.handlers.delete(element);
    }
  }

  /**
   * Remove all handlers for a specific element
   */
  removeElementHandlers(element: HTMLElement): void {
    const elementHandlers = this.handlers.get(element);
    if (!elementHandlers) return;

    elementHandlers.forEach((handler, event) => {
      element.removeEventListener(event, handler);
    });

    this.handlers.delete(element);
    this.bindings = this.bindings.filter(b => b.element !== element);
  }

  /**
   * Remove all handlers
   */
  removeAllHandlers(): void {
    this.handlers.forEach((elementHandlers, element) => {
      elementHandlers.forEach((handler, event) => {
        element.removeEventListener(event, handler);
      });
    });

    this.handlers.clear();
    this.bindings = [];
  }

  /**
   * Add event delegation handler
   */
  addDelegatedHandler(
    container: HTMLElement,
    selector: string,
    event: string,
    handler: (event: Event, target: HTMLElement) => void
  ): void {
    const delegatedHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      const matchedElement = target.closest(selector);
      
      if (matchedElement && container.contains(matchedElement)) {
        handler(e, matchedElement as HTMLElement);
      }
    };

    this.addHandler(container, event, delegatedHandler);
  }

  /**
   * Add handler with debounce
   */
  addDebouncedHandler(
    element: HTMLElement,
    event: string,
    handler: EventListener,
    delay: number = 300
  ): void {
    let timeoutId: number | undefined;

    const debouncedHandler = (e: Event) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = window.setTimeout(() => {
        handler(e);
      }, delay);
    };

    this.addHandler(element, event, debouncedHandler);
  }

  /**
   * Add handler with throttle
   */
  addThrottledHandler(
    element: HTMLElement,
    event: string,
    handler: EventListener,
    limit: number = 300
  ): void {
    let inThrottle = false;

    const throttledHandler = (e: Event) => {
      if (!inThrottle) {
        handler(e);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };

    this.addHandler(element, event, throttledHandler);
  }

  /**
   * Add one-time handler that auto-removes
   */
  addOnceHandler(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void {
    const onceHandler = (e: Event) => {
      handler(e);
      this.removeHandler(element, event);
    };

    this.addHandler(element, event, onceHandler);
  }

  /**
   * Get all active bindings (for debugging)
   */
  getActiveBindings(): EventBinding[] {
    return [...this.bindings];
  }

  /**
   * Check if element has handler for event
   */
  hasHandler(element: HTMLElement, event: string): boolean {
    const elementHandlers = this.handlers.get(element);
    return elementHandlers ? elementHandlers.has(event) : false;
  }
}

/**
 * Helper function to bind multiple handlers to form fields
 */
export function bindFieldHandlers(
  fields: Map<string, HTMLElement>,
  eventHandler: EventHandlerManager,
  handlers: {
    change?: (field: HTMLElement, value: string, fieldName: string) => void;
    blur?: (field: HTMLElement, value: string, fieldName: string) => void;
    focus?: (field: HTMLElement, value: string, fieldName: string) => void;
    input?: (field: HTMLElement, value: string, fieldName: string) => void;
  }
): void {
  fields.forEach((field, fieldName) => {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
      return;
    }

    if (handlers.change) {
      eventHandler.addHandler(field, 'change', (e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        handlers.change!(target, target.value, fieldName);
      });
    }

    if (handlers.blur) {
      eventHandler.addHandler(field, 'blur', (e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        handlers.blur!(target, target.value, fieldName);
      });
    }

    if (handlers.focus) {
      eventHandler.addHandler(field, 'focus', (e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        handlers.focus!(target, target.value, fieldName);
      });
    }

    if (handlers.input) {
      eventHandler.addHandler(field, 'input', (e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        handlers.input!(target, target.value, fieldName);
      });
    }
  });
}