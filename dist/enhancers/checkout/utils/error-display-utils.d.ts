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
    showFieldError(field: HTMLElement, message: string): void;
    clearFieldError(field: HTMLElement): void;
    showFieldValid(field: HTMLElement): void;
    clearAllErrors(container: HTMLElement): void;
    displayErrors(errors: Record<string, string>, container: HTMLElement): void;
    private findField;
    static showToastError(message: string, duration?: number): void;
    static hideToastError(): void;
}
export declare const errorDisplayManager: ErrorDisplayManager;
//# sourceMappingURL=error-display-utils.d.ts.map