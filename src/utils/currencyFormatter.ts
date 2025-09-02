/**
 * Centralized Currency Formatting Utility
 * Ensures consistent currency formatting across the entire application
 */

import { useCampaignStore } from '@/stores/campaignStore';
import { useConfigStore } from '@/stores/configStore';

export class CurrencyFormatter {
  private static formatters: Map<string, Intl.NumberFormat> = new Map();
  private static formattersNoZeroCents: Map<string, Intl.NumberFormat> = new Map();
  private static numberFormatter: Intl.NumberFormat | null = null;

  /**
   * Get the current currency from stores
   */
  private static getCurrentCurrency(): string {
    // Try to get from campaign data first (most accurate)
    const campaignStore = useCampaignStore.getState();
    if (campaignStore?.data?.currency) {
      return campaignStore.data.currency;
    }
    
    // Fallback to config store
    const configStore = useConfigStore.getState();
    return configStore?.selectedCurrency || configStore?.detectedCurrency || 'USD';
  }

  /**
   * Get the user's locale (checking for override first)
   */
  private static getUserLocale(): string {
    // Check for user-selected locale in session storage
    const selectedLocale = sessionStorage.getItem('next_selected_locale');
    if (selectedLocale) {
      return selectedLocale;
    }
    
    // Fallback to browser locale
    return navigator.language || 'en-US';
  }

  /**
   * Clear all cached formatters (call when locale or currency changes)
   */
  public static clearCache(): void {
    this.formatters.clear();
    this.formattersNoZeroCents.clear();
    this.numberFormatter = null;
  }

  /**
   * Get or create a currency formatter
   */
  private static getCurrencyFormatter(currency: string, hideZeroCents: boolean = false): Intl.NumberFormat {
    const locale = this.getUserLocale();
    const key = `${locale}-${currency}-${hideZeroCents}`;
    
    const cache = hideZeroCents ? this.formattersNoZeroCents : this.formatters;
    
    if (!cache.has(key)) {
      const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'narrowSymbol', // Use narrowSymbol to avoid A$, CA$, etc.
      };
      
      if (hideZeroCents) {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 2;
      }
      
      cache.set(key, new Intl.NumberFormat(locale, options));
    }
    
    return cache.get(key)!;
  }

  /**
   * Get or create a number formatter
   */
  private static getNumberFormatter(): Intl.NumberFormat {
    const locale = this.getUserLocale();
    
    if (!this.numberFormatter) {
      this.numberFormatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    }
    
    return this.numberFormatter;
  }

  /**
   * Format a value as currency
   */
  public static formatCurrency(
    value: number | string, 
    currency?: string, 
    options?: { hideZeroCents?: boolean }
  ): string {
    // Parse value if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '';
    }
    
    // Use provided currency or get from stores
    const currencyCode = currency || this.getCurrentCurrency();
    
    // Get appropriate formatter
    const formatter = this.getCurrencyFormatter(currencyCode, options?.hideZeroCents);
    
    return formatter.format(numValue);
  }

  /**
   * Format a number (non-currency)
   */
  public static formatNumber(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '';
    }
    
    return this.getNumberFormatter().format(numValue);
  }

  /**
   * Format a percentage
   */
  public static formatPercentage(value: number, decimals: number = 0): string {
    return `${Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`;
  }

  /**
   * Extract currency symbol from current currency
   */
  public static getCurrencySymbol(currency?: string): string {
    const currencyCode = currency || this.getCurrentCurrency();
    const formatter = this.getCurrencyFormatter(currencyCode);
    
    // Format 0 and extract just the symbol
    const formatted = formatter.format(0);
    return formatted.replace(/[0-9.,\s]/g, '').trim();
  }

  /**
   * Check if a string is already formatted with the current currency
   */
  public static isAlreadyFormatted(value: string, currency?: string): boolean {
    if (typeof value !== 'string') return false;
    
    const symbol = this.getCurrencySymbol(currency);
    return value.includes(symbol);
  }
}

// Export convenience functions
export const formatCurrency = CurrencyFormatter.formatCurrency.bind(CurrencyFormatter);
export const formatNumber = CurrencyFormatter.formatNumber.bind(CurrencyFormatter);
export const formatPercentage = CurrencyFormatter.formatPercentage.bind(CurrencyFormatter);
export const getCurrencySymbol = CurrencyFormatter.getCurrencySymbol.bind(CurrencyFormatter);