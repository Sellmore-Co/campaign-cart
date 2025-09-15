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

export class TemplateRenderer {
  /**
   * Renders a template string by replacing {placeholder} patterns with actual values
   * @param template - Template string with {key.subkey} placeholders
   * @param options - Data, formatters, and default values
   * @returns Rendered HTML string
   */
  static render(template: string, options: TemplateRenderOptions): string {
    const { data, formatters = {}, defaultValues = {} } = options;
    
    return template.replace(/\{([^}]+)\}/g, (_, placeholder) => {
      try {
        const value = this.getValue(data, placeholder);
        const formattedValue = this.formatValue(value, placeholder, formatters);
        
        // Return default value if result is empty/null/undefined
        if (formattedValue === '' || formattedValue === null || formattedValue === undefined) {
          return defaultValues[placeholder] || '';
        }
        
        return String(formattedValue);
      } catch (error) {
        console.warn(`Template rendering error for placeholder ${placeholder}:`, error);
        return defaultValues[placeholder] || '';
      }
    });
  }

  /**
   * Extracts nested property value from data object
   * Handles paths like "item.price", "item.price.raw", "item.showUpsell"
   */
  private static getValue(data: TemplateData, path: string): any {
    const keys = path.split('.');
    let current = data;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Applies formatting based on placeholder path and available formatters
   */
  private static formatValue(value: any, placeholder: string, formatters: TemplateFormatters): any {
    // Handle .raw suffix (return unformatted value)
    if (placeholder.endsWith('.raw')) {
      return value;
    }
    
    // Apply currency formatting for monetary values
    // Check for common currency-related field names
    const currencyFields = [
      'price', 'total', 'savings', 'amount', 'cost', 'fee', 'charge',
      'compare', 'retail', 'recurring', 'subtotal', 'tax', 'shipping',
      'discount', 'credit', 'balance', 'payment', 'refund'
    ];
    
    const shouldFormatAsCurrency = currencyFields.some(field => 
      placeholder.toLowerCase().includes(field.toLowerCase())
    );
    
    if (shouldFormatAsCurrency && typeof value === 'number') {
      return formatters.currency ? formatters.currency(value) : value;
    }
    
    // Also format if it's a string that looks like a number and contains currency keywords
    if (shouldFormatAsCurrency && typeof value === 'string' && !isNaN(parseFloat(value))) {
      return formatters.currency ? formatters.currency(parseFloat(value)) : value;
    }
    
    if (placeholder.includes('date') || placeholder.includes('created_at')) {
      return formatters.date ? formatters.date(value) : value;
    }
    
    // HTML escape text fields
    if (typeof value === 'string' && (placeholder.includes('name') || placeholder.includes('title') || placeholder.includes('description'))) {
      return formatters.escapeHtml ? formatters.escapeHtml(value) : value;
    }
    
    return value;
  }

  /**
   * Validates template for common issues
   * Returns list of potential problems
   */
  static validateTemplate(template: string, availablePlaceholders: string[]): string[] {
    const issues: string[] = [];
    const usedPlaceholders = this.extractPlaceholders(template);
    
    for (const placeholder of usedPlaceholders) {
      // Check if placeholder exists in available list
      const basePlaceholder = placeholder.replace('.raw', '');
      if (!availablePlaceholders.some(p => p.startsWith(basePlaceholder))) {
        issues.push(`Unknown placeholder: {${placeholder}}`);
      }
    }
    
    // Check for unclosed placeholders
    const unclosed = template.match(/\{[^}]*$/g);
    if (unclosed) {
      issues.push(`Unclosed placeholders found: ${unclosed.join(', ')}`);
    }
    
    return issues;
  }

  /**
   * Extracts all placeholders from template
   */
  static extractPlaceholders(template: string): string[] {
    const matches = template.match(/\{([^}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1)); // Remove { }
  }

  /**
   * Creates default formatters that both cart and order enhancers can use
   */
  static createDefaultFormatters(): TemplateFormatters {
    return {
      currency: (amount: number) => {
        const { formatCurrency } = require('@/utils/currencyFormatter');
        return formatCurrency(amount);
      },
      
      date: (dateValue: any) => {
        if (!dateValue) return '';
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return String(dateValue);
          return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(date);
        } catch {
          return String(dateValue);
        }
      },
      
      escapeHtml: (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    };
  }
}