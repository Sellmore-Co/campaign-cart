/**
 * Display Context Provider
 * Provides robust context inheritance for display elements
 */
export interface DisplayContext {
    packageId?: number;
    cartItemId?: string;
    shippingMethodId?: string;
    orderId?: string;
    selectionId?: string;
    [key: string]: any;
}
export declare class DisplayContextProvider {
    private static contexts;
    private static contextElements;
    /**
     * Provide context to an element and its descendants
     */
    static provide(element: HTMLElement, context: DisplayContext): void;
    /**
     * Resolve context for an element by traversing up the DOM tree
     */
    static resolve(element: HTMLElement): DisplayContext | null;
    /**
     * Merge contexts, with child context taking precedence
     */
    static merge(parentContext: DisplayContext | null, childContext: DisplayContext | null): DisplayContext | null;
    /**
     * Clear context for an element
     */
    static clear(element: HTMLElement): void;
    /**
     * Clear all contexts (useful for cleanup)
     */
    static clearAll(): void;
    /**
     * Get all elements with contexts (for debugging)
     */
    static getContextElements(): HTMLElement[];
    /**
     * Validate context has required fields
     */
    static validate(context: DisplayContext, requiredFields: string[]): boolean;
}
/**
 * Context-aware helper to set up context providers on common elements
 */
export declare function setupContextProviders(): void;
//# sourceMappingURL=DisplayContextProvider.d.ts.map