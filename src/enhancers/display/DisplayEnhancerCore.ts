/**
 * Display Enhancer Core
 * Consolidated core functionality for all display enhancers
 */

import { BaseEnhancer } from '../base/BaseEnhancer';
import { AttributeParser } from '../base/AttributeParser';
import { FormatType, getPropertyConfig, type DisplayValue } from './DisplayEnhancerTypes';
import { DisplayValueValidator } from '@/utils/validation/DisplayValueValidator';
import { DisplayErrorBoundary } from './DisplayErrorBoundary';
import { formatCurrency as formatCurrencyUtil, formatNumber as formatNumberUtil, CurrencyFormatter } from '@/utils/currencyFormatter';

// =====================
// DISPLAY FORMATTER
// =====================

export class DisplayFormatter {
  private static dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  static formatValue(value: any, format: FormatType = 'auto', options?: { hideZeroCents?: boolean }): string {
    return DisplayErrorBoundary.wrap(() => {
      if (value === null || value === undefined) {
        return '';
      }

      switch (format) {
        case 'currency':
          return this.formatCurrency(value, options?.hideZeroCents);
        
        case 'number':
          return this.formatNumber(value);
        
        case 'boolean':
          return this.formatBoolean(value);
        
        case 'date':
          return this.formatDate(value);
        
        case 'percentage':
          return this.formatPercentage(value);
        
        case 'text':
          return String(value);
        
        case 'auto':
        default:
          return this.formatAuto(value, options);
      }
    }, '', {
      operation: 'formatValue',
      value: String(value),
      format: String(format)
    });
  }

  static formatCurrency(value: any, hideZeroCents?: boolean): string {
    const numValue = DisplayValueValidator.validateCurrency(value);
    return formatCurrencyUtil(numValue, undefined, hideZeroCents !== undefined ? { hideZeroCents } : {});
  }

  static formatNumber(value: any): string {
    const numValue = DisplayValueValidator.validateNumber(value);
    return formatNumberUtil(numValue);
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
    const numValue = DisplayValueValidator.validatePercentage(value);
    return `${Math.round(numValue)}%`;
  }

  static formatAuto(value: any, options?: { hideZeroCents?: boolean }): string {
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
        return this.formatCurrency(value, options?.hideZeroCents);
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
          return this.formatCurrency(numValue, options?.hideZeroCents);
        }
        return this.formatNumber(numValue);
      }
    }
    
    // Return as-is for strings that don't match patterns
    return String(value);
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
  protected hideZeroCents: boolean = false;
  protected divideBy?: number;
  protected multiplyBy?: number;
  protected lastValue?: any;
  private debugMode = process.env.NODE_ENV === 'development';

  public async initialize(): Promise<void> {
    this.validateElement();
    this.parseDisplayAttributes();
    this.setupStoreSubscriptions();
    this.setupCurrencyChangeListener();
    await this.performInitialUpdate();
    this.logger.debug(`${this.constructor.name} initialized with path: ${this.displayPath}`);
  }

  /**
   * Sets up listener for currency change events to refresh display
   */
  protected setupCurrencyChangeListener(): void {
    // Listen for currency changes and update display
    document.addEventListener('next:currency-changed', () => {
      this.logger.debug(`Currency changed, updating display for ${this.displayPath}`);
      // Clear formatter cache to ensure new currency is used
      CurrencyFormatter.clearCache();
      // Clear the last value to force a display update even if the raw value hasn't changed
      // This is important because currency symbol changes even when the numeric value doesn't
      this.lastValue = undefined;
      // Update the display with new currency
      this.updateDisplay();
    });
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
    const explicitFormat = (this.getAttribute('data-next-format') || this.getAttribute('data-format')) as FormatType;
    const detectedFormat = this.getDefaultFormatType(this.property || '');
    this.formatType = explicitFormat || detectedFormat;
    
    this.hideIfZero = this.getAttribute('data-hide-if-zero') === 'true';
    this.hideIfFalse = this.getAttribute('data-hide-if-false') === 'true';
    this.hideZeroCents = this.getAttribute('data-hide-zero-cents') === 'true';
    
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
    // 1. Check if we have explicit format in property config
    if (this.displayPath) {
      const parts = this.displayPath.split('.');
      if (parts.length >= 2) {
        const [objectType, ...propParts] = parts;
        let propName = propParts.join('.');
        
        // For selection properties, strip the selector ID to get the base property
        // e.g., "selection.drone-packages.hasSelection" -> "hasSelection"
        if (objectType === 'selection' && propParts.length >= 2) {
          propName = propParts.slice(1).join('.');
        }
        
        const config = getPropertyConfig(objectType as any, propName);
        if (config?.format) {
          return config.format;
        }
      }
    }
    
    // 2. Fall back to name-based detection (existing logic)
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
    
    // Check for percentage properties FIRST (before currency check)
    // This ensures savingsPercentage is detected as percentage, not currency
    if (propertyLower.includes('percentage') || 
        propertyLower.includes('percent') ||
        propertyLower.endsWith('pct') ||
        propertyLower.endsWith('rate')) {
      return 'percentage';
    }
    
    // Check for currency properties
    if (currencyProperties.some(term => propertyLower.includes(term))) {
      return 'currency';
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
  
  protected getPropertyValueWithValidation(): any {
    return DisplayErrorBoundary.wrap(() => {
      const rawValue = this.getPropertyValue();
      
      // Get property config to check for validators and fallbacks
      if (this.displayPath) {
        const parsed = AttributeParser.parseDisplayPath(this.displayPath);
        const config = getPropertyConfig(parsed.object as any, this.property || parsed.property);
        
        if (config) {
          // Apply validator if present
          let value = rawValue;
          if (config.validator && value !== undefined && value !== null) {
            try {
              value = config.validator(value);
            } catch (error) {
              this.logger.warn(`Validator failed for ${this.displayPath}:`, error);
              value = config.fallback;
            }
          }
          
          // Use fallback if value is null/undefined
          if ((value === null || value === undefined) && config.fallback !== undefined) {
            value = config.fallback;
          }
          
          return value;
        }
      }
      
      return rawValue;
    }, undefined, {
      operation: 'getPropertyValueWithValidation',
      property: this.property || 'unknown',
      path: this.displayPath || 'unknown'
    });
  }

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
      let value = this.getPropertyValueWithValidation();
      
      // Check if value is pre-formatted
      if (value && typeof value === 'object' && '_preformatted' in value) {
        // This is a pre-formatted value from cart store, skip formatting
        const preformattedValue = value.value || '';
        this.updateElementContent(preformattedValue);
        this.showElement();
        
        // Add debug information if in dev mode
        if (this.debugMode) {
          this.element.setAttribute('data-format-debug', JSON.stringify({
            path: this.displayPath,
            property: this.property,
            format: 'preformatted',
            rawValue: value,
            formattedValue: preformattedValue
          }));
        }
        return;
      }
      
      // Check if value is a structured DisplayValue object
      let rawValue: any;
      let structuredFormat: FormatType | undefined;
      if (value && typeof value === 'object' && 'value' in value && 'format' in value) {
        const displayValue = value as DisplayValue;
        rawValue = displayValue.value;
        structuredFormat = displayValue.format as FormatType;
        // Apply metadata if present
        if (displayValue.metadata) {
          // Future: apply metadata to formatter
        }
      } else {
        rawValue = value;
      }
      
      // Apply mathematical transformations
      if (typeof rawValue === 'number' || (typeof rawValue === 'string' && !isNaN(Number(rawValue)))) {
        const numValue = Number(rawValue);
        if (this.divideBy) rawValue = numValue / this.divideBy;
        if (this.multiplyBy) rawValue = numValue * this.multiplyBy;
      }

      // Skip update if value hasn't changed (performance optimization)
      if (rawValue === this.lastValue) return;
      this.lastValue = rawValue;

      // Handle conditional hiding
      if (this.shouldHideElement(rawValue)) {
        this.hideElement();
        return;
      }

      // Format and display value
      // Use structured format if provided, otherwise fall back to detection
      let effectiveFormatType = structuredFormat || this.formatType;
      if (!structuredFormat && this.property && this.property.toLowerCase().includes('percentage') && this.formatType === 'auto') {
        effectiveFormatType = 'percentage';
      }
      
      const formattedValue = DisplayFormatter.formatValue(rawValue, effectiveFormatType, {
        hideZeroCents: this.hideZeroCents
      });
      
      // Add debug information to element in development mode
      if (this.debugMode) {
        this.element.setAttribute('data-format-debug', JSON.stringify({
          path: this.displayPath,
          property: this.property,
          format: effectiveFormatType,
          rawValue: value,
          formattedValue: formattedValue
        }));
      }
      
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