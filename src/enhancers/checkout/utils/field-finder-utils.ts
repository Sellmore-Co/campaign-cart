/**
 * Field Finder Utilities - Centralized field and element finding logic
 * 
 * Reduces code duplication for finding form fields and their wrappers
 */

export interface FieldSearchOptions {
  container?: HTMLElement;
  includeDisabled?: boolean;
  includeHidden?: boolean;
  customSelectors?: string[];
}

export class FieldFinder {
  /**
   * Find a field by name using multiple selector strategies
   */
  static findField(
    fieldName: string, 
    options: FieldSearchOptions = {}
  ): HTMLElement | null {
    const container = options.container || document;
    
    // Default selectors in priority order
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
          
          // Check visibility constraints
          if (!options.includeHidden && htmlElement.offsetParent === null) {
            continue;
          }
          
          // Check disabled state
          if (!options.includeDisabled && 'disabled' in htmlElement) {
            const inputElement = htmlElement as HTMLInputElement;
            if (inputElement.disabled) continue;
          }
          
          return htmlElement;
        }
      } catch (e) {
        // Invalid selector, skip
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    
    return null;
  }

  /**
   * Find multiple fields by names
   */
  static findFields(
    fieldNames: string[], 
    options: FieldSearchOptions = {}
  ): Map<string, HTMLElement> {
    const fields = new Map<string, HTMLElement>();
    
    fieldNames.forEach(name => {
      const field = this.findField(name, options);
      if (field) {
        fields.set(name, field);
      }
    });
    
    return fields;
  }

  /**
   * Find field wrapper element
   */
  static findFieldWrapper(
    field: HTMLElement,
    customSelectors?: string[]
  ): HTMLElement | null {
    const wrapperSelectors = customSelectors || [
      '.form-group',
      '.frm-flds',
      '.form-input',
      '.select-form-wrapper',
      '.field-wrapper',
      '.input-wrapper',
      '.form-field'
    ];
    
    // Try each selector in order
    for (const selector of wrapperSelectors) {
      const wrapper = field.closest(selector);
      if (wrapper) return wrapper as HTMLElement;
    }
    
    // Fallback to parent element
    return field.parentElement;
  }

  /**
   * Find form container for a field
   */
  static findFormContainer(field: HTMLElement): HTMLFormElement | null {
    return field.closest('form');
  }

  /**
   * Find label for a field
   */
  static findFieldLabel(field: HTMLElement): HTMLLabelElement | null {
    // Check if field has an ID and look for label with matching 'for'
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label as HTMLLabelElement;
    }
    
    // Check parent elements for label
    let parent = field.parentElement;
    while (parent) {
      const label = parent.querySelector('label');
      if (label) return label;
      
      // Check if parent itself is a label
      if (parent.tagName === 'LABEL') {
        return parent as HTMLLabelElement;
      }
      
      parent = parent.parentElement;
    }
    
    // Check sibling elements
    const wrapper = this.findFieldWrapper(field);
    if (wrapper) {
      const label = wrapper.querySelector('label');
      if (label) return label as HTMLLabelElement;
    }
    
    return null;
  }

  /**
   * Find all form fields in a container
   */
  static findAllFormFields(
    container: HTMLElement,
    options: { includeButtons?: boolean } = {}
  ): HTMLElement[] {
    const selectors = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
      'select',
      'textarea'
    ];
    
    if (options.includeButtons) {
      selectors.push('button', 'input[type="submit"]', 'input[type="button"]');
    }
    
    const fields: HTMLElement[] = [];
    const elements = container.querySelectorAll(selectors.join(', '));
    
    elements.forEach(element => {
      fields.push(element as HTMLElement);
    });
    
    return fields;
  }

  /**
   * Find fields by attribute pattern
   */
  static findFieldsByAttribute(
    attributeName: string,
    pattern?: string | RegExp,
    container: HTMLElement = document.body
  ): HTMLElement[] {
    const fields: HTMLElement[] = [];
    const selector = pattern ? `[${attributeName}]` : `[${attributeName}]`;
    const elements = container.querySelectorAll(selector);
    
    elements.forEach(element => {
      const attrValue = element.getAttribute(attributeName);
      
      if (!pattern || !attrValue) {
        fields.push(element as HTMLElement);
      } else if (typeof pattern === 'string') {
        if (attrValue.includes(pattern)) {
          fields.push(element as HTMLElement);
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(attrValue)) {
          fields.push(element as HTMLElement);
        }
      }
    });
    
    return fields;
  }

  /**
   * Check if element is a form field
   */
  static isFormField(element: HTMLElement): boolean {
    const fieldTags = ['INPUT', 'SELECT', 'TEXTAREA'];
    return fieldTags.includes(element.tagName);
  }

  /**
   * Get field type
   */
  static getFieldType(field: HTMLElement): string {
    if (field instanceof HTMLInputElement) {
      return field.type || 'text';
    } else if (field instanceof HTMLSelectElement) {
      return 'select';
    } else if (field instanceof HTMLTextAreaElement) {
      return 'textarea';
    }
    return 'unknown';
  }

  /**
   * Get field value safely
   */
  static getFieldValue(field: HTMLElement): string {
    if (field instanceof HTMLInputElement || 
        field instanceof HTMLSelectElement || 
        field instanceof HTMLTextAreaElement) {
      return field.value;
    }
    return '';
  }

  /**
   * Set field value safely
   */
  static setFieldValue(field: HTMLElement, value: string): boolean {
    if (field instanceof HTMLInputElement || 
        field instanceof HTMLSelectElement || 
        field instanceof HTMLTextAreaElement) {
      field.value = value;
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }
}