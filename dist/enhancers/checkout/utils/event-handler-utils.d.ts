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
export declare class EventHandlerManager {
    private handlers;
    private bindings;
    /**
     * Add an event handler with automatic cleanup tracking
     */
    addHandler(element: HTMLElement | null | undefined, event: string, handler: EventListener, options?: AddEventListenerOptions): void;
    /**
     * Add multiple handlers at once
     */
    addHandlers(bindings: EventBinding[]): void;
    /**
     * Remove a specific handler
     */
    removeHandler(element: HTMLElement | null | undefined, event: string): void;
    /**
     * Remove all handlers for a specific element
     */
    removeElementHandlers(element: HTMLElement): void;
    /**
     * Remove all handlers
     */
    removeAllHandlers(): void;
    /**
     * Add event delegation handler
     */
    addDelegatedHandler(container: HTMLElement, selector: string, event: string, handler: (event: Event, target: HTMLElement) => void): void;
    /**
     * Add handler with debounce
     */
    addDebouncedHandler(element: HTMLElement, event: string, handler: EventListener, delay?: number): void;
    /**
     * Add handler with throttle
     */
    addThrottledHandler(element: HTMLElement, event: string, handler: EventListener, limit?: number): void;
    /**
     * Add one-time handler that auto-removes
     */
    addOnceHandler(element: HTMLElement, event: string, handler: EventListener): void;
    /**
     * Get all active bindings (for debugging)
     */
    getActiveBindings(): EventBinding[];
    /**
     * Check if element has handler for event
     */
    hasHandler(element: HTMLElement, event: string): boolean;
}
/**
 * Helper function to bind multiple handlers to form fields
 */
export declare function bindFieldHandlers(fields: Map<string, HTMLElement>, eventHandler: EventHandlerManager, handlers: {
    change?: (field: HTMLElement, value: string, fieldName: string) => void;
    blur?: (field: HTMLElement, value: string, fieldName: string) => void;
    focus?: (field: HTMLElement, value: string, fieldName: string) => void;
    input?: (field: HTMLElement, value: string, fieldName: string) => void;
}): void;
//# sourceMappingURL=event-handler-utils.d.ts.map