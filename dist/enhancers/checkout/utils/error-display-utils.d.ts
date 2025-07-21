/**
 * Error Display Utilities - Consolidated error display management
 *
 * Reduces code duplication for error handling and display across services
 */
export interface ErrorDisplayOptions {
    wrapperClass?: string;
    errorClass?: string;
    errorLabelClass?: string;
    successClass?: string;
    iconErrorClass?: string;
    iconSuccessClass?: string;
}
export declare class ErrorDisplayManager {
    private options;
    constructor(options?: ErrorDisplayOptions);
    /**
     * Show error on a field with consistent styling
     */
    showFieldError(field: HTMLElement, message: string): void;
    /**
     * Clear error from a field
     */
    clearFieldError(field: HTMLElement): void;
    /**
     * Show field as valid with success styling
     */
    showFieldValid(field: HTMLElement): void;
    /**
     * Clear all error displays in a container
     */
    clearAllErrors(container: HTMLElement): void;
    /**
     * Display multiple field errors at once
     */
    displayErrors(errors: Record<string, string>, container: HTMLElement): void;
    /**
     * Find a field by name within a container
     */
    private findField;
    /**
     * Show a toast error message
     */
    static showToastError(message: string, duration?: number): void;
    /**
     * Hide toast error message
     */
    static hideToastError(): void;
}
export declare const errorDisplayManager: ErrorDisplayManager;
//# sourceMappingURL=error-display-utils.d.ts.map