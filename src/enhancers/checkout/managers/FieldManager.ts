/**
 * Field Manager - Handles field discovery, mapping, and management
 */

import { FIELD_SELECTORS, PAYMENT_BUTTON_SELECTORS, BILLING_FIELD_SELECTORS, EXPIRATION_MONTH_SELECTORS, EXPIRATION_YEAR_SELECTORS } from '../constants/selectors';
import { COMMON_FIELD_PATTERNS } from '../constants/field-mappings';
import type { Logger } from '@/utils/logger';

export class FieldManager {
  private fields: Map<string, HTMLElement> = new Map();
  private billingFields: Map<string, HTMLElement> = new Map();
  private paymentButtons: Map<string, HTMLElement> = new Map();

  constructor(
    private form: HTMLFormElement,
    private logger: Logger
  ) {}

  public scanCheckoutFields(): void {
    FIELD_SELECTORS.forEach(selector => {
      this.form.querySelectorAll(selector).forEach(element => {
        const fieldName = element.getAttribute(selector.includes('data-next') ? 'data-next-checkout-field' : 'os-checkout-field');
        if (fieldName && element instanceof HTMLElement) {
          this.fields.set(fieldName, element);
          this.logger.debug(`Found checkout field: ${fieldName}`, element);
        }
      });
    });

    // Also scan for expiration fields that might not have checkout field attributes yet
    const [monthField, yearField] = this.getExpirationElements();
    if (monthField) {
      // Check if this field has exp-month attribute
      const hasExpMonth = monthField.getAttribute('data-next-checkout-field') === 'exp-month' ||
                         monthField.getAttribute('os-checkout-field') === 'exp-month';
      
      if (hasExpMonth && !this.fields.has('exp-month')) {
        this.fields.set('exp-month', monthField);
        this.logger.debug('Found exp-month field', monthField);
      } else if (!hasExpMonth && !this.fields.has('cc-month') && !this.fields.has('exp-month')) {
        this.fields.set('cc-month', monthField);
        this.logger.debug('Found cc-month field without checkout attribute', monthField);
      }
    }
    if (yearField) {
      // Check if this field has exp-year attribute
      const hasExpYear = yearField.getAttribute('data-next-checkout-field') === 'exp-year' ||
                        yearField.getAttribute('os-checkout-field') === 'exp-year';
      
      if (hasExpYear && !this.fields.has('exp-year')) {
        this.fields.set('exp-year', yearField);
        this.logger.debug('Found exp-year field', yearField);
      } else if (!hasExpYear && !this.fields.has('cc-year') && !this.fields.has('exp-year')) {
        this.fields.set('cc-year', yearField);
        this.logger.debug('Found cc-year field without checkout attribute', yearField);
      }
    }
    
    // Scan for common form fields by pattern matching if they don't already exist
    COMMON_FIELD_PATTERNS.forEach(({ pattern, key }) => {
      if (!this.fields.has(key)) {
        // More comprehensive search
        const allInputs = this.form.querySelectorAll('input, select, textarea');
        for (const input of allInputs) {
          const element = input as HTMLElement;
          const id = element.id?.toLowerCase() || '';
          const name = (element as HTMLInputElement).name?.toLowerCase() || '';
          
          if (pattern.test(id) || pattern.test(name)) {
            this.fields.set(key, element);
            this.logger.debug(`Found ${key} field by pattern: id="${element.id}", name="${(element as any).name}"`, element);
            break;
          }
        }
      }
    });
  }

  public scanPaymentButtons(): void {
    PAYMENT_BUTTON_SELECTORS.forEach(selector => {
      // Scan both within form and in document for express checkout buttons
      document.querySelectorAll(selector).forEach(element => {
        const paymentMethod = element.getAttribute(selector.includes('data-next') ? 'data-next-checkout-payment' : 'os-checkout-payment');
        if (paymentMethod && element instanceof HTMLElement) {
          this.paymentButtons.set(paymentMethod, element);
          this.logger.debug(`Found payment button: ${paymentMethod}`, element);
        }
      });
    });
  }

  public scanBillingFields(): void {
    BILLING_FIELD_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const fieldName = element.getAttribute('os-checkout-field') || 
                         element.getAttribute('data-next-checkout-field');
        if (fieldName && element instanceof HTMLElement) {
          this.billingFields.set(fieldName, element);
          this.logger.debug(`Found billing field: ${fieldName}`, element);
        }
      });
    });
  }

  public getExpirationElements(): [HTMLElement | null, HTMLElement | null] {
    // Find the first matching element for each field
    const monthField = EXPIRATION_MONTH_SELECTORS
      .map(selector => document.querySelector(selector))
      .find(element => element !== null) as HTMLElement | null;
    
    const yearField = EXPIRATION_YEAR_SELECTORS
      .map(selector => document.querySelector(selector))
      .find(element => element !== null) as HTMLElement | null;
    
    return [monthField, yearField];
  }

  public populateMonthOptions(monthSelect: HTMLSelectElement): void {
    // Clear existing options and add placeholder
    monthSelect.innerHTML = '<option value="">Month</option>';
    
    // Add month options 01-12
    for (let i = 1; i <= 12; i++) {
      const month = i.toString().padStart(2, '0');
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month;
      monthSelect.appendChild(option);
    }
    
    this.logger.debug('Month options populated (01-12)');
  }

  public populateYearOptions(yearSelect: HTMLSelectElement): void {
    // Clear existing options and add placeholder
    yearSelect.innerHTML = '<option value="">Year</option>';
    
    // Add year options from current year to current year + 20
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 20; i++) {
      const year = currentYear + i;
      const option = document.createElement('option');
      option.value = year.toString();
      option.textContent = year.toString();
      yearSelect.appendChild(option);
    }
    
    this.logger.debug(`Year options populated (${currentYear}-${currentYear + 19})`);
  }

  public populateExpirationFields(): void {
    try {
      this.logger.debug('Populating expiration date fields');
      
      // Find expiration month and year fields - support both new and legacy selectors
      const [monthSelect, yearSelect] = this.getExpirationElements();
      
      if (monthSelect) {
        this.populateMonthOptions(monthSelect as HTMLSelectElement);
      }
      
      if (yearSelect) {
        this.populateYearOptions(yearSelect as HTMLSelectElement);
      }
      
      this.logger.debug('Expiration date fields populated', {
        monthFieldFound: !!monthSelect,
        yearFieldFound: !!yearSelect
      });
      
    } catch (error) {
      this.logger.error('Error populating expiration fields:', error);
    }
  }

  public populateFormData(formData: Record<string, any>): void {
    // Populate form fields with existing data
    this.fields.forEach((field, name) => {
      if (formData[name] && (field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
        field.value = formData[name];
      }
    });
  }

  public getFieldNameFromElement(element: HTMLElement): string | null {
    // Check for checkout field attributes first
    const checkoutFieldName = element.getAttribute('data-next-checkout-field') || 
                              element.getAttribute('os-checkout-field');
    
    if (checkoutFieldName) return checkoutFieldName;
    
    // Fallback to name attribute
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      if (element.name) return element.name;
    }
    
    // Enhanced fallback - check for common field patterns by id or name
    const idName = element.id?.toLowerCase() || '';
    const nameAttr = (element as HTMLInputElement | HTMLSelectElement).name?.toLowerCase() || '';
    
    // Country field patterns
    if (idName.includes('country') || nameAttr.includes('country') || 
        idName.includes('countries') || nameAttr.includes('countries')) {
      return 'country';
    }
    
    // State/Province field patterns
    if (idName.includes('state') || nameAttr.includes('state') ||
        idName.includes('province') || nameAttr.includes('province') ||
        idName.includes('region') || nameAttr.includes('region')) {
      return 'province';
    }
    
    // Postal code field patterns
    if (idName.includes('postal') || nameAttr.includes('postal') ||
        idName.includes('zip') || nameAttr.includes('zip') ||
        idName.includes('postcode') || nameAttr.includes('postcode')) {
      return 'postal';
    }
    
    // City field patterns
    if (idName.includes('city') || nameAttr.includes('city') ||
        idName.includes('town') || nameAttr.includes('town')) {
      return 'city';
    }
    
    // Address field patterns
    if (idName.includes('address1') || nameAttr.includes('address1') ||
        idName.includes('address_1') || nameAttr.includes('address_1') ||
        (idName.includes('address') && !idName.includes('2'))) {
      return 'address1';
    }
    
    if (idName.includes('address2') || nameAttr.includes('address2') ||
        idName.includes('address_2') || nameAttr.includes('address_2') ||
        idName.includes('apartment') || nameAttr.includes('apartment')) {
      return 'address2';
    }
    
    // Email field patterns
    if (idName.includes('email') || nameAttr.includes('email')) {
      return 'email';
    }
    
    // Phone field patterns
    if (idName.includes('phone') || nameAttr.includes('phone') ||
        idName.includes('tel') || nameAttr.includes('tel')) {
      return 'phone';
    }
    
    // Name field patterns
    if (idName.includes('first') && idName.includes('name') ||
        nameAttr.includes('first') && nameAttr.includes('name') ||
        idName.includes('fname') || nameAttr.includes('fname')) {
      return 'fname';
    }
    
    if (idName.includes('last') && idName.includes('name') ||
        nameAttr.includes('last') && nameAttr.includes('name') ||
        idName.includes('lname') || nameAttr.includes('lname')) {
      return 'lname';
    }
    
    this.logger.debug(`Could not map field: id="${element.id}", name="${(element as any).name}", attributes:`, element.attributes);
    return null;
  }

  public setupFieldEventHandlers(changeHandler: (event: Event) => void): void {
    // Field change handler
    this.fields.forEach((field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.addEventListener('change', changeHandler);
        field.addEventListener('blur', changeHandler);
      }
    });
    
    // Billing field change handler
    this.billingFields.forEach((field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.addEventListener('change', changeHandler);
        field.addEventListener('blur', changeHandler);
      }
    });
  }

  public cleanupFieldEventHandlers(changeHandler: (event: Event) => void): void {
    this.fields.forEach(field => {
      field.removeEventListener('change', changeHandler);
      field.removeEventListener('blur', changeHandler);
    });
    
    this.billingFields.forEach(field => {
      field.removeEventListener('change', changeHandler);
      field.removeEventListener('blur', changeHandler);
    });
  }

  public disableFields(): void {
    this.fields.forEach(field => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.disabled = true;
      }
    });
    
    this.paymentButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = true;
      }
    });
  }

  public enableFields(): void {
    this.fields.forEach(field => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.disabled = false;
      }
    });
    
    this.paymentButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = false;
      }
    });
  }

  // Getters
  public getFields(): Map<string, HTMLElement> {
    return this.fields;
  }

  public getBillingFields(): Map<string, HTMLElement> {
    return this.billingFields;
  }

  public getPaymentButtons(): Map<string, HTMLElement> {
    return this.paymentButtons;
  }

  public getField(name: string): HTMLElement | undefined {
    return this.fields.get(name);
  }

  public getBillingField(name: string): HTMLElement | undefined {
    return this.billingFields.get(name);
  }

  public getPaymentButton(name: string): HTMLElement | undefined {
    return this.paymentButtons.get(name);
  }

  public update(): void {
    // Re-scan for new fields if DOM has changed
    this.scanCheckoutFields();
    this.scanPaymentButtons();
    
    // Re-populate expiration fields if they were added/changed
    this.populateExpirationFields();
  }

  public clear(): void {
    this.fields.clear();
    this.billingFields.clear();
    this.paymentButtons.clear();
  }
}