/**
 * Field Finder Utilities - Centralized field and element finding logic
 *
 * Reduces code duplication for finding form fields and their wrappers
 */
export interface FieldSearchOptions {
    container?: HTMLElement;
    includeDisabled?: boolean;
    includeHidden?: boolean;
    customSelectors?: string[];
}
export declare class FieldFinder {
    /**
     * Find a field by name using multiple selector strategies
     */
    static findField(fieldName: string, options?: FieldSearchOptions): HTMLElement | null;
    /**
     * Find multiple fields by names
     */
    static findFields(fieldNames: string[], options?: FieldSearchOptions): Map<string, HTMLElement>;
    /**
     * Find field wrapper element
     */
    static findFieldWrapper(field: HTMLElement, customSelectors?: string[]): HTMLElement | null;
    /**
     * Find form container for a field
     */
    static findFormContainer(field: HTMLElement): HTMLFormElement | null;
    /**
     * Find label for a field
     */
    static findFieldLabel(field: HTMLElement): HTMLLabelElement | null;
    /**
     * Find all form fields in a container
     */
    static findAllFormFields(container: HTMLElement, options?: {
        includeButtons?: boolean;
    }): HTMLElement[];
    /**
     * Find fields by attribute pattern
     */
    static findFieldsByAttribute(attributeName: string, pattern?: string | RegExp, container?: HTMLElement): HTMLElement[];
    /**
     * Check if element is a form field
     */
    static isFormField(element: HTMLElement): boolean;
    /**
     * Get field type
     */
    static getFieldType(field: HTMLElement): string;
    /**
     * Get field value safely
     */
    static getFieldValue(field: HTMLElement): string;
    /**
     * Set field value safely
     */
    static setFieldValue(field: HTMLElement, value: string): boolean;
}
//# sourceMappingURL=field-finder-utils.d.ts.map