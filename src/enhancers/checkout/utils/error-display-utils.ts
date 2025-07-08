/**
 * Error Display Utilities - Consolidated error display management
 * 
 * Reduces code duplication for error handling and display across services
 */

import { FieldFinder } from './field-finder-utils';

export interface ErrorDisplayOptions {
  wrapperClass?: string;
  errorClass?: string;
  errorLabelClass?: string;
  successClass?: string;
  iconErrorClass?: string;
  iconSuccessClass?: string;
}

const DEFAULT_OPTIONS: ErrorDisplayOptions = {
  wrapperClass: 'form-group',
  errorClass: 'next-error-field',
  errorLabelClass: 'next-error-label',
  successClass: 'no-error',
  iconErrorClass: 'addErrorIcon',
  iconSuccessClass: 'addTick'
};

export class ErrorDisplayManager {
  private options: ErrorDisplayOptions;

  constructor(options: ErrorDisplayOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Show error on a field with consistent styling
   */
  showFieldError(field: HTMLElement, message: string): void {
    const wrapper = FieldFinder.findFieldWrapper(field);
    if (!wrapper) return;

    // Remove any existing error
    this.clearFieldError(field);

    // Add error styling to field
    field.classList.add('has-error', this.options.errorClass!);
    field.classList.remove(this.options.successClass!);

    // Add error styling to wrapper
    wrapper.classList.add(this.options.iconErrorClass!);
    wrapper.classList.remove(this.options.iconSuccessClass!);

    // Create and append error label
    const errorElement = document.createElement('div');
    errorElement.className = this.options.errorLabelClass!;
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');

    // Append to appropriate container
    const formGroup = field.closest(`.${this.options.wrapperClass}`);
    if (formGroup) {
      formGroup.appendChild(errorElement);
    } else {
      wrapper.appendChild(errorElement);
    }
  }

  /**
   * Clear error from a field
   */
  clearFieldError(field: HTMLElement): void {
    const wrapper = FieldFinder.findFieldWrapper(field);
    
    // Remove error classes from field
    field.classList.remove('has-error', this.options.errorClass!);
    
    if (wrapper) {
      // Remove error classes from wrapper
      wrapper.classList.remove(this.options.iconErrorClass!);
      
      // Remove error label
      const errorLabel = wrapper.querySelector(`.${this.options.errorLabelClass}`);
      if (errorLabel) {
        errorLabel.remove();
      }

      // Also check parent form group
      const formGroup = field.closest(`.${this.options.wrapperClass}`);
      if (formGroup) {
        const formGroupError = formGroup.querySelector(`.${this.options.errorLabelClass}`);
        if (formGroupError) {
          formGroupError.remove();
        }
      }
    }
  }

  /**
   * Show field as valid with success styling
   */
  showFieldValid(field: HTMLElement): void {
    const wrapper = FieldFinder.findFieldWrapper(field);
    
    // Clear any errors first
    this.clearFieldError(field);
    
    // Add success styling
    field.classList.add(this.options.successClass!);
    
    if (wrapper) {
      wrapper.classList.add(this.options.iconSuccessClass!);
    }
  }

  /**
   * Clear all error displays in a container
   */
  clearAllErrors(container: HTMLElement): void {
    // Remove all error labels
    const errorLabels = container.querySelectorAll(`.${this.options.errorLabelClass}`);
    errorLabels.forEach(label => label.remove());

    // Remove error classes from fields
    const errorFields = container.querySelectorAll(`.${this.options.errorClass}, .has-error`);
    errorFields.forEach(field => {
      field.classList.remove('has-error', this.options.errorClass!);
    });

    // Remove error icons from wrappers
    const errorWrappers = container.querySelectorAll(`.${this.options.iconErrorClass}`);
    errorWrappers.forEach(wrapper => {
      wrapper.classList.remove(this.options.iconErrorClass!);
    });
  }

  /**
   * Display multiple field errors at once
   */
  displayErrors(errors: Record<string, string>, container: HTMLElement): void {
    // Clear existing errors first
    this.clearAllErrors(container);

    // Display each error
    Object.entries(errors).forEach(([fieldName, message]) => {
      const field = this.findField(fieldName, container);
      if (field) {
        this.showFieldError(field, message);
      }
    });
  }

  /**
   * Find a field by name within a container
   */
  private findField(fieldName: string, container: HTMLElement): HTMLElement | null {
    const selectors = [
      `[data-next-checkout-field="${fieldName}"]`,
      `[os-checkout-field="${fieldName}"]`,
      `[name="${fieldName}"]`,
      `#${fieldName}`
    ];

    for (const selector of selectors) {
      const field = container.querySelector(selector);
      if (field) return field as HTMLElement;
    }

    return null;
  }

  /**
   * Show a toast error message
   */
  static showToastError(message: string, duration: number = 10000): void {
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (!(toastHandler instanceof HTMLElement)) return;

    const messageElement = toastHandler.querySelector('[data-os-message="error"]');
    if (messageElement instanceof HTMLElement) {
      messageElement.textContent = message;
      toastHandler.style.display = 'flex';

      // Auto-hide after duration
      setTimeout(() => {
        if (toastHandler.style.display === 'flex') {
          toastHandler.style.display = 'none';
        }
      }, duration);
    }
  }

  /**
   * Hide toast error message
   */
  static hideToastError(): void {
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (toastHandler instanceof HTMLElement) {
      toastHandler.style.display = 'none';
    }
  }
}

// Export singleton instance for common use
export const errorDisplayManager = new ErrorDisplayManager();