/**
 * Format Validator
 * Validates display formatting across the application
 */

import { FormatType } from './DisplayEnhancerTypes';

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

export class FormatValidator {
  // private static logger = new Logger('FormatValidator');
  
  /**
   * Validate all display elements in the document
   */
  static validateAll(): ValidationReport {
    const elements = document.querySelectorAll('[data-next-display]');
    const issues: ValidationIssue[] = [];
    const formatDistribution: Record<string, number> = {};
    
    elements.forEach((el) => {
      const element = el as HTMLElement;
      const elementIssues = this.validateElement(element);
      issues.push(...elementIssues);
      
      // Track format distribution
      const format = element.getAttribute('data-format') || 'auto';
      formatDistribution[format] = (formatDistribution[format] || 0) + 1;
    });
    
    const stats = {
      totalElements: elements.length,
      errorCount: issues.filter(i => i.severity === 'error').length,
      warningCount: issues.filter(i => i.severity === 'warning').length,
      infoCount: issues.filter(i => i.severity === 'info').length,
      formatDistribution
    };
    
    return { issues, stats };
  }
  
  /**
   * Validate a single element
   */
  static validateElement(element: HTMLElement): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const path = element.getAttribute('data-next-display') || '';
    const value = element.textContent || '';
    const explicitFormat = element.getAttribute('data-format');
    
    // Check for format mismatches
    const formatIssue = this.checkFormatMismatch(element, path, value, explicitFormat);
    if (formatIssue) issues.push(formatIssue);
    
    // Check for common mistakes
    const commonIssues = this.checkCommonMistakes(element, path, value);
    issues.push(...commonIssues);
    
    // Check for accessibility
    const a11yIssue = this.checkAccessibility(element, path, value);
    if (a11yIssue) issues.push(a11yIssue);
    
    // Check for performance issues
    const perfIssue = this.checkPerformance(element, path);
    if (perfIssue) issues.push(perfIssue);
    
    return issues;
  }
  
  /**
   * Check if the format matches the content
   */
  private static checkFormatMismatch(
    element: HTMLElement,
    path: string,
    value: string,
    explicitFormat?: string | null
  ): ValidationIssue | null {
    const detectedFormat = this.detectFormat(value);
    
    if (explicitFormat && explicitFormat !== 'auto' && detectedFormat !== explicitFormat) {
      // Check if this is a real mismatch
      if (this.isRealMismatch(value, explicitFormat as FormatType, detectedFormat)) {
        return {
          element,
          message: `Format mismatch: value "${value}" looks like ${detectedFormat} but format is ${explicitFormat}`,
          severity: 'warning',
          suggestion: `Consider changing data-format to "${detectedFormat}" or ensure the value matches the format`,
          path,
          actualFormat: detectedFormat,
          expectedFormat: explicitFormat,
          value
        };
      }
    }
    
    return null;
  }
  
  /**
   * Detect the likely format of a value
   */
  private static detectFormat(value: string): FormatType {
    if (!value || value === '') return 'text';
    
    // Currency patterns
    if (/^\$[\d,]+(\.\d{2})?$/.test(value)) return 'currency';
    if (/^-?\$[\d,]+(\.\d{2})?$/.test(value)) return 'currency';
    
    // Percentage patterns
    if (/^\d+%$/.test(value)) return 'percentage';
    if (/^\d+\.\d+%$/.test(value)) return 'percentage';
    
    // Number patterns
    if (/^-?\d+$/.test(value)) return 'number';
    if (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(value)) return 'number';
    
    // Boolean patterns
    if (/^(Yes|No|True|False)$/i.test(value)) return 'boolean';
    
    // Date patterns
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    if (/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/.test(value)) return 'date';
    
    return 'text';
  }
  
  /**
   * Check if format mismatch is significant
   */
  private static isRealMismatch(value: string, explicitFormat: FormatType, detectedFormat: FormatType): boolean {
    // Some mismatches are acceptable
    if (explicitFormat === 'text') return false; // Text can contain anything
    if (explicitFormat === 'number' && detectedFormat === 'text' && /^\d+$/.test(value)) return false; // Plain numbers
    if (value === '' || value === 'N/A') return false; // Empty or placeholder values
    
    return true;
  }
  
  /**
   * Check for common formatting mistakes
   */
  private static checkCommonMistakes(element: HTMLElement, path: string, value: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Double dollar signs
    if (value.includes('$$')) {
      issues.push({
        element,
        message: 'Double dollar sign detected - possible double formatting',
        severity: 'error',
        suggestion: 'Check if value is being formatted twice',
        path,
        value
      });
    }
    
    // Percentage over 100
    const percentMatch = value.match(/^(\d+(?:\.\d+)?)%$/);
    if (percentMatch && percentMatch[1] && parseFloat(percentMatch[1]) > 100) {
      issues.push({
        element,
        message: `Percentage value ${value} exceeds 100%`,
        severity: 'warning',
        suggestion: 'Verify percentage calculation is correct',
        path,
        value
      });
    }
    
    // Negative savings
    if (path.toLowerCase().includes('savings') && value.includes('-')) {
      issues.push({
        element,
        message: 'Negative savings amount detected',
        severity: 'warning',
        suggestion: 'Savings should typically be positive or zero',
        path,
        value
      });
    }
    
    // Missing currency symbol for price fields
    if ((path.includes('price') || path.includes('total') || path.includes('cost')) && 
        /^\d+(\.\d{2})?$/.test(value) && 
        !element.getAttribute('data-format')) {
      issues.push({
        element,
        message: 'Price value missing currency symbol',
        severity: 'info',
        suggestion: 'Add data-format="currency" to format as currency',
        path,
        value
      });
    }
    
    // Address fields formatted as numbers
    if ((path.includes('address') || path.includes('zip') || path.includes('postal')) && 
        value.includes(',')) {
      issues.push({
        element,
        message: 'Address/postal code formatted as number',
        severity: 'error',
        suggestion: 'Add data-format="text" to preserve original formatting',
        path,
        value
      });
    }
    
    return issues;
  }
  
  /**
   * Check accessibility issues
   */
  private static checkAccessibility(element: HTMLElement, path: string, value: string): ValidationIssue | null {
    // Empty values in visible elements
    if (value === '' && element.offsetParent !== null) {
      return {
        element,
        message: 'Empty value in visible element',
        severity: 'info',
        suggestion: 'Consider hiding empty elements with data-hide-if-zero or providing a fallback',
        path
      };
    }
    
    // Check for screen reader friendly formats
    if (value === 'N/A' || value === 'n/a') {
      return {
        element,
        message: 'Consider using more descriptive text for screen readers',
        severity: 'info',
        suggestion: 'Use "Not available" or "Not applicable" instead of "N/A"',
        path,
        value
      };
    }
    
    return null;
  }
  
  /**
   * Check for performance issues
   */
  private static checkPerformance(element: HTMLElement, path: string): ValidationIssue | null {
    // Check for complex paths that might be slow
    const pathDepth = path.split('.').length;
    if (pathDepth > 5) {
      return {
        element,
        message: `Deep property path (${pathDepth} levels) may impact performance`,
        severity: 'info',
        suggestion: 'Consider flattening data structure or using computed properties',
        path
      };
    }
    
    return null;
  }
  
  /**
   * Generate a validation report summary
   */
  static generateSummary(report: ValidationReport): string {
    const lines = [
      '=== Display Format Validation Report ===',
      `Total Elements: ${report.stats.totalElements}`,
      `Errors: ${report.stats.errorCount}`,
      `Warnings: ${report.stats.warningCount}`,
      `Info: ${report.stats.infoCount}`,
      '',
      'Format Distribution:',
      ...Object.entries(report.stats.formatDistribution)
        .sort((a, b) => b[1] - a[1])
        .map(([format, count]) => `  ${format}: ${count}`),
      ''
    ];
    
    if (report.issues.length > 0) {
      lines.push('Top Issues:');
      const topIssues = report.issues
        .slice(0, 10)
        .map((issue, i) => `  ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
      lines.push(...topIssues);
    } else {
      lines.push('No issues found! ✅');
    }
    
    return lines.join('\n');
  }
  
  /**
   * Log validation report to console
   */
  static logReport(report: ValidationReport): void {
    console.group('Display Format Validation');
    
    // Log summary
    console.log(this.generateSummary(report));
    
    // Log detailed issues by severity
    if (report.stats.errorCount > 0) {
      console.group(`Errors (${report.stats.errorCount})`);
      report.issues
        .filter(i => i.severity === 'error')
        .forEach(issue => {
          console.error(issue.message, {
            element: issue.element,
            path: issue.path,
            value: issue.value,
            suggestion: issue.suggestion
          });
        });
      console.groupEnd();
    }
    
    if (report.stats.warningCount > 0) {
      console.group(`Warnings (${report.stats.warningCount})`);
      report.issues
        .filter(i => i.severity === 'warning')
        .forEach(issue => {
          console.warn(issue.message, {
            element: issue.element,
            path: issue.path,
            value: issue.value,
            suggestion: issue.suggestion
          });
        });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
  
  /**
   * Create visual indicators for issues
   */
  static highlightIssues(report: ValidationReport): void {
    // Remove existing highlights
    document.querySelectorAll('.format-validation-highlight').forEach(el => {
      el.classList.remove('format-validation-highlight');
      (el as HTMLElement).style.outline = '';
    });
    
    // Add new highlights
    report.issues.forEach(issue => {
      issue.element.classList.add('format-validation-highlight');
      
      const color = {
        error: '#ff0000',
        warning: '#ffaa00',
        info: '#0099ff'
      }[issue.severity];
      
      issue.element.style.outline = `2px solid ${color}`;
      issue.element.style.outlineOffset = '2px';
      
      // Add tooltip
      issue.element.setAttribute('title', `${issue.severity.toUpperCase()}: ${issue.message}`);
    });
    
    console.log(`Highlighted ${report.issues.length} elements with formatting issues`);
  }
  
  /**
   * Clear validation highlights
   */
  static clearHighlights(): void {
    document.querySelectorAll('.format-validation-highlight').forEach(el => {
      el.classList.remove('format-validation-highlight');
      (el as HTMLElement).style.outline = '';
      el.removeAttribute('title');
    });
  }
}

// Export convenience function for console usage
(window as any).validateFormats = () => {
  const report = FormatValidator.validateAll();
  FormatValidator.logReport(report);
  FormatValidator.highlightIssues(report);
  return report;
};