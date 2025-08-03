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
    static render(template: string, options: TemplateRenderOptions): string;
    private static getValue;
    private static formatValue;
    static validateTemplate(template: string, availablePlaceholders: string[]): string[];
    static extractPlaceholders(template: string): string[];
    static createDefaultFormatters(): TemplateFormatters;
}
//# sourceMappingURL=TemplateRenderer.d.ts.map