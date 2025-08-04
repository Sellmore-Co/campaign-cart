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
    static validateAll(): ValidationReport;
    static validateElement(element: HTMLElement): ValidationIssue[];
    private static checkFormatMismatch;
    private static detectFormat;
    private static isRealMismatch;
    private static checkCommonMistakes;
    private static checkAccessibility;
    private static checkPerformance;
    static generateSummary(report: ValidationReport): string;
    static logReport(report: ValidationReport): void;
    static highlightIssues(report: ValidationReport): void;
    static clearHighlights(): void;
}
//# sourceMappingURL=FormatValidator.d.ts.map