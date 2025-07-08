/**
 * Consolidated Form Utilities - Field finding, error display, and form management
 */

export interface FieldSearchOptions {
    container?: HTMLElement;
    includeDisabled?: boolean;
    includeHidden?: boolean;
    customSelectors?: string[];
  }
  
  export interface ErrorDisplayOptions {
    wrapperClass?: string;
    errorClass?: string;
    errorLabelClass?: string;
    successClass?: string;
    iconErrorClass?: string;
    iconSuccessClass?: string;
  }
  
  const DEFAULT_ERROR_OPTIONS: ErrorDisplayOptions = {
    wrapperClass: 'form-group',
    errorClass: 'next-error-field',
    errorLabelClass: 'next-error-label',
    successClass: 'no-error',
    iconErrorClass: 'addErrorIcon',
    iconSuccessClass: 'addTick'
  };
  
  export class FormUtils {
    private errorOptions: ErrorDisplayOptions;
  
    constructor(errorOptions: ErrorDisplayOptions = {}) {
      this.errorOptions = { ...DEFAULT_ERROR_OPTIONS, ...errorOptions };
    }
  
    // ============================================================================
    // FIELD FINDING
    // ============================================================================
  
    findField(fieldName: string, options: FieldSearchOptions = {}): HTMLElement | null {
      const container = options.container || document;
      
      const defaultSelectors = [
        `[data-next-checkout-field="${fieldName}"]`,
        `[os-checkout-field="${fieldName}"]`,
        `input[name="${fieldName}"]`,
        `select[name="${fieldName}"]`,
        `textarea[name="${fieldName}"]`,
        `#${fieldName}`,
        `[data-field="${fieldName}"]`,
        `[data-field-name="${fieldName}"]`
      ];
      
      const selectors = options.customSelectors || defaultSelectors;
      
      for (const selector of selectors) {
        try {
          const element = container.querySelector(selector);
          if (element) {
            const htmlElement = element as HTMLElement;
            
            if (!options.includeHidden && htmlElement.offsetParent === null) {
              continue;
            }
            
            if (!options.includeDisabled && 'disabled' in htmlElement) {
              const inputElement = htmlElement as HTMLInputElement;
              if (inputElement.disabled) continue;
            }
            
            return htmlElement;
          }
        } catch (e) {
          console.warn(`Invalid selector: ${selector}`);
        }
      }
      
      return null;
    }
  
    findFields(fieldNames: string[], options: FieldSearchOptions = {}): Map<string, HTMLElement> {
      const fields = new Map<string, HTMLElement>();
      
      fieldNames.forEach(name => {
        const field = this.findField(name, options);
        if (field) {
          fields.set(name, field);
        }
      });
      
      return fields;
    }
  
    findFieldWrapper(field: HTMLElement, customSelectors?: string[]): HTMLElement | null {
      const wrapperSelectors = customSelectors || [
        '.form-group',
        '.frm-flds',
        '.form-input',
        '.select-form-wrapper',
        '.field-wrapper',
        '.input-wrapper',
        '.form-field'
      ];
      
      for (const selector of wrapperSelectors) {
        const wrapper = field.closest(selector);
        if (wrapper) return wrapper as HTMLElement;
      }
      
      return field.parentElement;
    }
  
    findFieldLabel(field: HTMLElement): HTMLLabelElement | null {
      if (field.id) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) return label as HTMLLabelElement;
      }
      
      let parent = field.parentElement;
      while (parent) {
        const label = parent.querySelector('label');
        if (label) return label;
        
        if (parent.tagName === 'LABEL') {
          return parent as HTMLLabelElement;
        }
        
        parent = parent.parentElement;
      }
      
      const wrapper = this.findFieldWrapper(field);
      if (wrapper) {
        const label = wrapper.querySelector('label');
        if (label) return label as HTMLLabelElement;
      }
      
      return null;
    }
  
    getFieldValue(field: HTMLElement): string {
      if (field instanceof HTMLInputElement || 
          field instanceof HTMLSelectElement || 
          field instanceof HTMLTextAreaElement) {
        return field.value;
      }
      return '';
    }
  
    setFieldValue(field: HTMLElement, value: string): boolean {
      if (field instanceof HTMLInputElement || 
          field instanceof HTMLSelectElement || 
          field instanceof HTMLTextAreaElement) {
        field.value = value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }
  
    // ============================================================================
    // ERROR DISPLAY
    // ============================================================================
  
    showFieldError(field: HTMLElement, message: string): void {
      const wrapper = this.findFieldWrapper(field);
      if (!wrapper) return;
  
      this.clearFieldError(field);
  
      field.classList.add('has-error', this.errorOptions.errorClass!);
      field.classList.remove(this.errorOptions.successClass!);
  
      wrapper.classList.add(this.errorOptions.iconErrorClass!);
      wrapper.classList.remove(this.errorOptions.iconSuccessClass!);
  
      const errorElement = document.createElement('div');
      errorElement.className = this.errorOptions.errorLabelClass!;
      errorElement.textContent = message;
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
  
      const formGroup = field.closest(`.${this.errorOptions.wrapperClass}`);
      if (formGroup) {
        formGroup.appendChild(errorElement);
      } else {
        wrapper.appendChild(errorElement);
      }
    }
  
    clearFieldError(field: HTMLElement): void {
      const wrapper = this.findFieldWrapper(field);
      
      field.classList.remove('has-error', this.errorOptions.errorClass!);
      
      if (wrapper) {
        wrapper.classList.remove(this.errorOptions.iconErrorClass!);
        
        const errorLabel = wrapper.querySelector(`.${this.errorOptions.errorLabelClass}`);
        if (errorLabel) {
          errorLabel.remove();
        }
  
        const formGroup = field.closest(`.${this.errorOptions.wrapperClass}`);
        if (formGroup) {
          const formGroupError = formGroup.querySelector(`.${this.errorOptions.errorLabelClass}`);
          if (formGroupError) {
            formGroupError.remove();
          }
        }
      }
    }
  
    showFieldValid(field: HTMLElement): void {
      const wrapper = this.findFieldWrapper(field);
      
      this.clearFieldError(field);
      
      field.classList.add(this.errorOptions.successClass!);
      
      if (wrapper) {
        wrapper.classList.add(this.errorOptions.iconSuccessClass!);
      }
    }
  
    clearAllErrors(container: HTMLElement): void {
      const errorLabels = container.querySelectorAll(`.${this.errorOptions.errorLabelClass}`);
      errorLabels.forEach(label => label.remove());
  
      const errorFields = container.querySelectorAll(`.${this.errorOptions.errorClass}, .has-error`);
      errorFields.forEach(field => {
        field.classList.remove('has-error', this.errorOptions.errorClass!);
      });
  
      const errorWrappers = container.querySelectorAll(`.${this.errorOptions.iconErrorClass}`);
      errorWrappers.forEach(wrapper => {
        wrapper.classList.remove(this.errorOptions.iconErrorClass!);
      });
    }
  
    displayErrors(errors: Record<string, string>, container: HTMLElement): void {
      this.clearAllErrors(container);
  
      Object.entries(errors).forEach(([fieldName, message]) => {
        const field = this.findField(fieldName, { container });
        if (field) {
          this.showFieldError(field, message);
        }
      });
    }
  
    // ============================================================================
    // TOAST MESSAGES
    // ============================================================================
  
    static showToastError(message: string, duration: number = 10000): void {
      const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
      if (!(toastHandler instanceof HTMLElement)) return;
  
      const messageElement = toastHandler.querySelector('[data-os-message="error"]');
      if (messageElement instanceof HTMLElement) {
        messageElement.textContent = message;
        toastHandler.style.display = 'flex';
  
        setTimeout(() => {
          if (toastHandler.style.display === 'flex') {
            toastHandler.style.display = 'none';
          }
        }, duration);
      }
    }
  
    static hideToastError(): void {
      const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
      if (toastHandler instanceof HTMLElement) {
        toastHandler.style.display = 'none';
      }
    }
  }
  
  // Export singleton instance
  export const formUtils = new FormUtils();