/**
 * Shared Template Renderer
 * Handles placeholder replacement for both cart and order item templates
 */
export interface TemplateData {
    [key: string]: any;
}
export interface TemplateFormatters {
    currency?: (amount: number) => string;
    date?: (date: any) => string;
    escapeHtml?: (text: string) => string;
    [key: string]: ((value: any) => string) | undefined;
}
export interface TemplateRenderOptions {
    data: TemplateData;
    formatters?: TemplateFormatters;
    defaultValues?: Record<string, string>;
}
export declare class TemplateRenderer {
    /**
     * Renders a template string by replacing {placeholder} patterns with actual values
     * @param template - Template string with {key.subkey} placeholders
     * @param options - Data, formatters, and default values
     * @returns Rendered HTML string
     */
    static render(template: string, options: TemplateRenderOptions): string;
    /**
     * Extracts nested property value from data object
     * Handles paths like "item.price", "item.price.raw", "item.showUpsell"
     */
    private static getValue;
    /**
     * Applies formatting based on placeholder path and available formatters
     */
    private static formatValue;
    /**
     * Validates template for common issues
     * Returns list of potential problems
     */
    static validateTemplate(template: string, availablePlaceholders: string[]): string[];
    /**
     * Extracts all placeholders from template
     */
    static extractPlaceholders(template: string): string[];
    /**
     * Creates default formatters that both cart and order enhancers can use
     */
    static createDefaultFormatters(): TemplateFormatters;
}
//# sourceMappingURL=TemplateRenderer.d.ts.map