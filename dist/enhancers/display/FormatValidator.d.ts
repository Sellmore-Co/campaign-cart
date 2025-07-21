/**
 * Format Validator
 * Validates display formatting across the application
 */
export interface ValidationIssue {
    element: HTMLElement;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
    path?: string;
    actualFormat?: string;
    expectedFormat?: string;
    value?: string;
}
export interface ValidationReport {
    issues: ValidationIssue[];
    stats: {
        totalElements: number;
        errorCount: number;
        warningCount: number;
        infoCount: number;
        formatDistribution: Record<string, number>;
    };
}
export declare class FormatValidator {
    /**
     * Validate all display elements in the document
     */
    static validateAll(): ValidationReport;
    /**
     * Validate a single element
     */
    static validateElement(element: HTMLElement): ValidationIssue[];
    /**
     * Check if the format matches the content
     */
    private static checkFormatMismatch;
    /**
     * Detect the likely format of a value
     */
    private static detectFormat;
    /**
     * Check if format mismatch is significant
     */
    private static isRealMismatch;
    /**
     * Check for common formatting mistakes
     */
    private static checkCommonMistakes;
    /**
     * Check accessibility issues
     */
    private static checkAccessibility;
    /**
     * Check for performance issues
     */
    private static checkPerformance;
    /**
     * Generate a validation report summary
     */
    static generateSummary(report: ValidationReport): string;
    /**
     * Log validation report to console
     */
    static logReport(report: ValidationReport): void;
    /**
     * Create visual indicators for issues
     */
    static highlightIssues(report: ValidationReport): void;
    /**
     * Clear validation highlights
     */
    static clearHighlights(): void;
}
//# sourceMappingURL=FormatValidator.d.ts.map