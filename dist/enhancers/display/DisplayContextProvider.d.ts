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
    static provide(element: HTMLElement, context: DisplayContext): void;
    static resolve(element: HTMLElement): DisplayContext | null;
    static merge(parentContext: DisplayContext | null, childContext: DisplayContext | null): DisplayContext | null;
    static clear(element: HTMLElement): void;
    static clearAll(): void;
    static getContextElements(): HTMLElement[];
    static validate(context: DisplayContext, requiredFields: string[]): boolean;
}
export declare function setupContextProviders(): void;
//# sourceMappingURL=DisplayContextProvider.d.ts.map