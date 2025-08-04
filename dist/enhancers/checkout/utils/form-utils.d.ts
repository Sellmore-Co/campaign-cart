export interface FieldSearchOptions {
    container?: HTMLElement;
    includeDisabled?: boolean;
    includeHidden?: boolean;
    customSelectors?: string[];
}
export interface ErrorDisplayOptions {
    wrapperClass?: string;
    errorClass?: string;
    errorLabelClass?: string;
    successClass?: string;
    iconErrorClass?: string;
    iconSuccessClass?: string;
}
export declare class FormUtils {
    private errorOptions;
    constructor(errorOptions?: ErrorDisplayOptions);
    findField(fieldName: string, options?: FieldSearchOptions): HTMLElement | null;
    findFields(fieldNames: string[], options?: FieldSearchOptions): Map<string, HTMLElement>;
    findFieldWrapper(field: HTMLElement, customSelectors?: string[]): HTMLElement | null;
    findFieldLabel(field: HTMLElement): HTMLLabelElement | null;
    getFieldValue(field: HTMLElement): string;
    setFieldValue(field: HTMLElement, value: string): boolean;
    showFieldError(field: HTMLElement, message: string): void;
    clearFieldError(field: HTMLElement): void;
    showFieldValid(field: HTMLElement): void;
    clearAllErrors(container: HTMLElement): void;
    displayErrors(errors: Record<string, string>, container: HTMLElement): void;
    static showToastError(message: string, duration?: number): void;
    static hideToastError(): void;
}
export declare const formUtils: FormUtils;
//# sourceMappingURL=form-utils.d.ts.map