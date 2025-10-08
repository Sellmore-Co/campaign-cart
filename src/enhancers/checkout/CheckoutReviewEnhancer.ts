/**
 * Checkout Review Enhancer
 * Displays stored checkout data from previous steps for review
 */

import { BaseEnhancer } from '../base/BaseEnhancer';
import { useCheckoutStore } from '@/stores/checkoutStore';
import type { Logger } from '@/utils/logger';

interface CheckoutReviewConfig {
  element: HTMLElement;
  field: string;
  format?: 'text' | 'address' | 'name' | 'phone' | 'currency';
  fallback?: string;
}

export class CheckoutReviewEnhancer extends BaseEnhancer {
  private configs: CheckoutReviewConfig[] = [];
  private unsubscribe?: () => void;

  constructor(element: HTMLElement) {
    super(element);
  }

  async initialize(): Promise<void> {
    await this.enhance();
  }

  update(): void {
    // Updates are handled by Zustand subscription
    const checkoutStore = useCheckoutStore.getState();
    this.updateDisplay(checkoutStore.formData);
  }

  async enhance(): Promise<void> {
    this.logger.info('CheckoutReviewEnhancer initializing', {
      element: this.element.tagName,
      className: this.element.className,
    });

    // Find all elements with data-next-checkout-review attribute
    const reviewElements = this.element.querySelectorAll('[data-next-checkout-review]');

    this.logger.info('Found review elements:', {
      count: reviewElements.length,
      elements: Array.from(reviewElements).map(el => ({
        tag: el.tagName,
        field: el.getAttribute('data-next-checkout-review'),
        format: el.getAttribute('data-next-format'),
      })),
    });

    reviewElements.forEach((el) => {
      const field = el.getAttribute('data-next-checkout-review');
      const format = (el.getAttribute('data-next-format') || 'text') as CheckoutReviewConfig['format'];
      const fallback = el.getAttribute('data-next-fallback') || '';

      if (field && el instanceof HTMLElement) {
        this.configs.push({
          element: el,
          field,
          format,
          fallback,
        });
      }
    });

    this.logger.debug('Found review elements:', {
      count: this.configs.length,
      fields: this.configs.map(c => c.field),
    });

    // Subscribe to checkout store updates
    this.unsubscribe = useCheckoutStore.subscribe((state) => {
      this.updateDisplay(state.formData);
    }) || undefined;

    // Initial render
    const checkoutStore = useCheckoutStore.getState();
    this.updateDisplay(checkoutStore.formData);
  }

  private updateDisplay(formData: Record<string, any>): void {
    // Get full state for nested access (e.g., shippingMethod)
    const checkoutStore = useCheckoutStore.getState();

    this.configs.forEach((config) => {
      const value = this.getFieldValue(config.field, formData, checkoutStore);
      const formattedValue = this.formatValue(value, config.format, formData);

      // Update element content
      if (formattedValue) {
        config.element.textContent = formattedValue;
        config.element.classList.remove('next-review-empty');
      } else {
        config.element.textContent = config.fallback || '';
        config.element.classList.add('next-review-empty');
      }
    });
  }

  private getFieldValue(field: string, formData: Record<string, any>, checkoutStore?: any): any {
    // Support dot notation for nested fields (e.g., "shippingMethod.name", "billingAddress.city")
    if (field.includes('.')) {
      const parts = field.split('.');
      // Check if first part is a root store property (not in formData)
      const firstPart = parts[0];

      // If accessing shippingMethod, billingAddress, etc. (root store properties)
      if (checkoutStore && ['shippingMethod', 'billingAddress', 'paymentMethod'].includes(firstPart)) {
        let value = checkoutStore;
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined) break;
        }
        return value;
      }

      // Otherwise check formData
      let value = formData;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) break;
      }
      return value;
    }
    return formData[field];
  }

  private formatValue(
    value: any,
    format: CheckoutReviewConfig['format'],
    formData: Record<string, any>
  ): string {
    if (!value && format !== 'address' && format !== 'name') {
      return '';
    }

    switch (format) {
      case 'address':
        return this.formatAddress(formData);

      case 'name':
        return this.formatName(formData);

      case 'phone':
        return this.formatPhone(value);

      case 'currency':
        return this.formatCurrency(value);

      case 'text':
      default:
        return String(value || '');
    }
  }

  private formatCurrency(value: any): string {
    if (value === null || value === undefined) return '';

    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return String(value);

    // Format as currency with 2 decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  }

  private formatAddress(formData: Record<string, any>): string {
    const parts: string[] = [];

    // Line 1: Address
    if (formData.address1) {
      parts.push(formData.address1);
    }

    // Line 2: Address 2 (if exists)
    if (formData.address2) {
      parts.push(formData.address2);
    }

    // Line 3: City, State ZIP
    const cityLine: string[] = [];
    if (formData.city) cityLine.push(formData.city);
    if (formData.province) cityLine.push(formData.province);
    if (formData.postal) cityLine.push(formData.postal);
    if (cityLine.length > 0) {
      parts.push(cityLine.join(' '));
    }

    // Line 4: Country
    if (formData.country) {
      // Convert country code to full name if needed
      const countryName = this.getCountryName(formData.country);
      parts.push(countryName);
    }

    return parts.join(', ');
  }

  private formatName(formData: Record<string, any>): string {
    const parts: string[] = [];
    if (formData.fname) parts.push(formData.fname);
    if (formData.lname) parts.push(formData.lname);
    return parts.join(' ');
  }

  private formatPhone(value: string): string {
    if (!value) return '';

    // If already formatted with country code, return as is
    if (value.startsWith('+')) {
      return value;
    }

    // Basic US formatting
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return value;
  }

  private getCountryName(countryCode: string): string {
    // Map of common country codes to names
    const countryMap: Record<string, string> = {
      US: 'United States',
      CA: 'Canada',
      GB: 'United Kingdom',
      AU: 'Australia',
      NZ: 'New Zealand',
      IE: 'Ireland',
      DE: 'Germany',
      FR: 'France',
      ES: 'Spain',
      IT: 'Italy',
      NL: 'Netherlands',
      BE: 'Belgium',
      CH: 'Switzerland',
      AT: 'Austria',
      DK: 'Denmark',
      SE: 'Sweden',
      NO: 'Norway',
      FI: 'Finland',
      BR: 'Brazil',
      MX: 'Mexico',
      AR: 'Argentina',
      CL: 'Chile',
      CO: 'Colombia',
      PE: 'Peru',
      JP: 'Japan',
      CN: 'China',
      KR: 'South Korea',
      IN: 'India',
      SG: 'Singapore',
      MY: 'Malaysia',
      TH: 'Thailand',
      PH: 'Philippines',
      ID: 'Indonesia',
      VN: 'Vietnam',
      ZA: 'South Africa',
      EG: 'Egypt',
      NG: 'Nigeria',
      KE: 'Kenya',
      IL: 'Israel',
      AE: 'United Arab Emirates',
      SA: 'Saudi Arabia',
      TR: 'Turkey',
      RU: 'Russia',
      UA: 'Ukraine',
      PL: 'Poland',
      CZ: 'Czech Republic',
      HU: 'Hungary',
      RO: 'Romania',
      GR: 'Greece',
      PT: 'Portugal',
    };

    return countryMap[countryCode] || countryCode;
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    super.destroy();
  }
}
