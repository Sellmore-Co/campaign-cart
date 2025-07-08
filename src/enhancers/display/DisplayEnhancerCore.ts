/**
 * Display Enhancer Core
 * Consolidated core functionality for all display enhancers
 */

import { BaseEnhancer } from '../base/BaseEnhancer';
import { AttributeParser } from '../base/AttributeParser';
import type { FormatType } from './DisplayEnhancerTypes';

// =====================
// DISPLAY FORMATTER
// =====================

export class DisplayFormatter {
  private static currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  private static numberFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  private static dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  static formatValue(value: any, format: FormatType = 'auto'): string {
    if (value === null || value === undefined) {
      return '';
    }

    switch (format) {
      case 'currency':
        return this.formatCurrency(value);
      
      case 'number':
        return this.formatNumber(value);
      
      case 'boolean':
        return this.formatBoolean(value);
      
      case 'date':
        return this.formatDate(value);
      
      case 'percentage':
        return this.formatPercentage(value);
      
      case 'auto':
      default:
        return this.formatAuto(value);
    }
  }

  static formatCurrency(value: any): string {
    const numValue = this.toNumber(value);
    if (isNaN(numValue)) return String(value);
    return this.currencyFormatter.format(numValue);
  }

  static formatNumber(value: any): string {
    const numValue = this.toNumber(value);
    if (isNaN(numValue)) return String(value);
    return this.numberFormatter.format(numValue);
  }

  static formatBoolean(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return 'Yes';
      if (lower === 'false' || lower === '0' || lower === 'no') return 'No';
    }
    return value ? 'Yes' : 'No';
  }

  static formatDate(value: any): string {
    if (!value) return '';
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return this.dateFormatter.format(date);
    } catch {
      return String(value);
    }
  }

  static formatPercentage(value: any): string {
    const numValue = this.toNumber(value);
    if (isNaN(numValue)) return String(value);
    return `${Math.round(numValue)}%`;
  }

  static formatAuto(value: any): string {
    // Auto-detect format based on value characteristics
    if (typeof value === 'boolean') {
      return this.formatBoolean(value);
    }
    
    if (typeof value === 'number') {
      // For very small whole numbers (1-10), format as plain number
      if (Number.isInteger(value) && value >= 0 && value <= 10) {
        return value.toString();
      }
      
      // If it has exactly 2 decimal places, it's likely a price
      const valueStr = value.toString();
      if (valueStr.includes('.') && valueStr.split('.')[1]?.length === 2) {
        return this.formatCurrency(value);
      }
      
      // If it's a whole number between 0-100, might be percentage
      if (Number.isInteger(value) && value >= 0 && value <= 100) {
        // Context-dependent: if it seems like percentage, format as such
        // For now, just format as number
        return this.formatNumber(value);
      }
      return this.formatNumber(value);
    }
    
    if (typeof value === 'string') {
      // Check if it's a date string
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime()) && value.match(/\d{4}-\d{2}-\d{2}/)) {
        return this.formatDate(value);
      }
      
      // Don't auto-format string numbers unless they look like decimals
      // This prevents postal codes, order numbers, etc. from being formatted
      const numValue = Number(value);
      if (!isNaN(numValue) && value.includes('.')) {
        // Only format if it has decimal places (likely a price)
        const valueStr = numValue.toString();
        if (valueStr.includes('.') && valueStr.split('.')[1]?.length === 2) {
          return this.formatCurrency(numValue);
        }
        return this.formatNumber(numValue);
      }
    }
    
    // Return as-is for strings that don't match patterns
    return String(value);
  }

  private static toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and spaces
      const cleaned = value.replace(/[$,\s]/g, '');
      return parseFloat(cleaned);
    }
    return parseFloat(value);
  }
}

// =====================
// PROPERTY RESOLVER
// =====================

export class PropertyResolver {
  /**
   * Safely gets nested property value from an object
   */
  static getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // Handle array notation like lines[0]
      if (key.includes('[') && key.includes(']')) {
        const [arrayKey, indexStr] = key.split('[');
        const index = parseInt(indexStr?.replace(']', '') || '');
        
        if (arrayKey && !isNaN(index)) {
          current = current[arrayKey];
          if (Array.isArray(current) && index >= 0 && index < current.length) {
            current = current[index];
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      } else {
        current = current[key];
      }
    }
    
    return current;
  }

  /**
   * Checks if a property path exists in an object
   */
  static hasProperty(obj: any, path: string): boolean {
    return this.getNestedProperty(obj, path) !== undefined;
  }

  /**
   * Gets property with fallback values
   */
  static getPropertyWithFallbacks(obj: any, paths: string[]): any {
    for (const path of paths) {
      const value = this.getNestedProperty(obj, path);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }
}

// =====================
// BASE DISPLAY ENHANCER
// =====================

export abstract class BaseDisplayEnhancer extends BaseEnhancer {
  protected displayPath?: string;
  protected property?: string | undefined;
  protected formatType: FormatType = 'auto';
  protected hideIfZero: boolean = false;
  protected hideIfFalse: boolean = false;
  protected divideBy?: number;
  protected multiplyBy?: number;
  protected lastValue?: any;

  public async initialize(): Promise<void> {
    this.validateElement();
    this.parseDisplayAttributes();
    this.setupStoreSubscriptions();
    await this.performInitialUpdate();
    this.logger.debug(`${this.constructor.name} initialized with path: ${this.displayPath}`);
  }

  /**
   * Parses display-related attributes from the element
   * Note: Subclasses should NOT override unless they need custom parsing logic
   * (e.g., SelectionDisplayEnhancer extracts selector ID from path)
   */
  protected parseDisplayAttributes(): void {
    const displayPath = this.getAttribute('data-next-display');
    if (!displayPath) {
      throw new Error(`${this.constructor.name}: data-next-display attribute is required`);
    }
    
    this.displayPath = displayPath;

    const parsed = AttributeParser.parseDisplayPath(this.displayPath);
    this.property = parsed.property;

    // Parse formatting options - use explicit format or smart default
    const explicitFormat = this.getAttribute('data-next-format') as FormatType;
    this.formatType = explicitFormat || this.getDefaultFormatType(this.property || '');
    
    this.hideIfZero = this.getAttribute('data-hide-if-zero') === 'true';
    this.hideIfFalse = this.getAttribute('data-hide-if-false') === 'true';
    
    const divideBy = this.getAttribute('data-divide-by');
    if (divideBy) this.divideBy = parseFloat(divideBy);
    
    const multiplyBy = this.getAttribute('data-multiply-by');
    if (multiplyBy) this.multiplyBy = parseFloat(multiplyBy);
  }

  /**
   * Determines the default format type based on property name
   * This enables smart formatting for common property patterns
   */
  protected getDefaultFormatType(property: string): FormatType {
    // Currency-related properties
    const currencyProperties = [
      'price',
      'cost',
      'amount',
      'total',
      'subtotal',
      'retail',
      'compare',
      'savings',
      'shipping',
      'tax',
      'discount',
      'fee',
      'charge',
      'payment',
      'balance',
      'credit',
      'debit',
      'refund',
      'revenue',
      'msrp',
      'value'
    ];
    
    // Check if property name contains any currency-related terms
    const propertyLower = property.toLowerCase();
    
    // Check for .raw suffix - these should not be formatted
    if (propertyLower.endsWith('.raw')) {
      return 'auto';
    }
    
    // Check for currency properties
    if (currencyProperties.some(term => propertyLower.includes(term))) {
      return 'currency';
    }
    
    // Check for percentage properties
    if (propertyLower.includes('percentage') || 
        propertyLower.includes('percent') ||
        propertyLower.endsWith('pct') ||
        propertyLower.endsWith('rate')) {
      return 'percentage';
    }
    
    // Check for boolean properties
    if (propertyLower.startsWith('is') || 
        propertyLower.startsWith('has') ||
        propertyLower.startsWith('can') ||
        propertyLower.startsWith('should') ||
        propertyLower.startsWith('enabled') ||
        propertyLower.startsWith('disabled') ||
        propertyLower.includes('visible') ||
        propertyLower.includes('active')) {
      return 'boolean';
    }
    
    // Check for date properties
    if (propertyLower.includes('date') ||
        propertyLower.includes('time') ||
        propertyLower.endsWith('at') ||
        propertyLower.endsWith('on')) {
      return 'date';
    }
    
    // Check for quantity/count properties that should be numbers
    if (propertyLower.includes('quantity') ||
        propertyLower.includes('count') ||
        propertyLower.includes('qty') ||
        propertyLower.includes('units') ||
        propertyLower.includes('items')) {
      return 'number';
    }
    
    // Default to auto for everything else
    return 'auto';
  }

  protected abstract setupStoreSubscriptions(): void;
  protected abstract getPropertyValue(): any;

  protected async performInitialUpdate(): Promise<void> {
    await this.updateDisplay();
  }

  protected async updateDisplay(): Promise<void> {
    // Performance optimization: Skip updates for hidden elements
    if (this.element.style.display === 'none' || 
        this.element.classList.contains('next-hidden')) {
      return;
    }
    
    try {
      let value = this.getPropertyValue();
      
      // Apply mathematical transformations
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        const numValue = Number(value);
        if (this.divideBy) value = numValue / this.divideBy;
        if (this.multiplyBy) value = numValue * this.multiplyBy;
      }

      // Skip update if value hasn't changed (performance optimization)
      if (value === this.lastValue) return;
      this.lastValue = value;

      // Handle conditional hiding
      if (this.shouldHideElement(value)) {
        this.hideElement();
        return;
      }

      // Format and display value
      const formattedValue = DisplayFormatter.formatValue(value, this.formatType);
      this.updateElementContent(formattedValue);
      this.showElement();

    } catch (error) {
      this.handleError(error, 'updateDisplay');
      this.updateElementContent('N/A');
    }
  }

  protected shouldHideElement(value: any): boolean {
    if (this.hideIfZero && (value === 0 || value === '0' || value === 0.0)) {
      return true;
    }
    if (this.hideIfFalse && !value) {
      return true;
    }
    return false;
  }

  protected updateElementContent(value: string): void {
    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement) {
      this.element.value = value;
    } else {
      this.element.textContent = value;
    }
  }

  protected hideElement(): void {
    this.element.style.display = 'none';
    this.addClass('display-hidden');
    this.removeClass('display-visible');
  }

  protected showElement(): void {
    this.element.style.display = '';
    this.addClass('display-visible');
    this.removeClass('display-hidden');
  }

  public update(): void {
    this.updateDisplay();
  }
}