export interface FieldSearchOptions {
    container?: HTMLElement;
    includeDisabled?: boolean;
    includeHidden?: boolean;
    customSelectors?: string[];
}
export declare class FieldFinder {
    static findField(fieldName: string, options?: FieldSearchOptions): HTMLElement | null;
    static findFields(fieldNames: string[], options?: FieldSearchOptions): Map<string, HTMLElement>;
    static findFieldWrapper(field: HTMLElement, customSelectors?: string[]): HTMLElement | null;
    static findFormContainer(field: HTMLElement): HTMLFormElement | null;
    static findFieldLabel(field: HTMLElement): HTMLLabelElement | null;
    static findAllFormFields(container: HTMLElement, options?: {
        includeButtons?: boolean;
    }): HTMLElement[];
    static findFieldsByAttribute(attributeName: string, pattern?: string | RegExp, container?: HTMLElement): HTMLElement[];
    static isFormField(element: HTMLElement): boolean;
    static getFieldType(field: HTMLElement): string;
    static getFieldValue(field: HTMLElement): string;
    static setFieldValue(field: HTMLElement, value: string): boolean;
}
//# sourceMappingURL=field-finder-utils.d.ts.map