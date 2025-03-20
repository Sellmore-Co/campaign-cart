/**
 * FormValidator - Handles form validation for checkout
 */
export class FormValidator {
  #logger;
  #form;
  #validationErrors = {};
  #debugMode = false;
  #spreedlyEnabled = false;
  #spreedlyFieldsValid = false;
  #spreedlyReady = false;

  constructor(options = {}) {
    this.#debugMode = options.debugMode || false;
    this.#logger = options.logger || console;
    this.#form = this.#getFormElement();
    this.#spreedlyEnabled = typeof Spreedly !== 'undefined';

    if (!this.#form) return;

    this.#setupListeners();
  }

  #getFormElement() {
    const form = document.querySelector('form[os-checkout="form"]') || document.querySelector('form#combo_form');
    if (!form) this.#safeLog('warn', 'No checkout form found');
    return form;
  }

  #safeLog(level, message, ...args) {
    try {
      const logFn = this.#logger?.[level] || console[level] || console.log;
      logFn.call(console, `[${level.toUpperCase()}] ${message}`, ...args);
    } catch (error) {
      console.error('Error logging:', error);
    }
  }

  #setupListeners() {
    this.#form.addEventListener('submit', e => this.#handleSubmit(e));
    document.querySelector('[os-checkout-payment="combo"]')?.addEventListener('click', () => {
      if (this.validateAllFields()) this.#form.submit();
    });
    document.addEventListener('payment-method-changed', () => this.clearAllErrors());

    if (this.#spreedlyEnabled && typeof Spreedly.on === 'function') {
      this.#setupSpreedlyListeners();
    }
  }

  #setupSpreedlyListeners() {
    const listeners = {
      'ready': () => {
        this.#spreedlyReady = true;
        this.#safeLog('debug', 'Spreedly is ready');
      },
      'paymentMethod': (token, pmData) => {
        this.#spreedlyFieldsValid = true;
        this.#safeLog('debug', 'Spreedly payment method created');
        this.#clearSpreedlyErrors();
      },
      'validation': (result) => {
        this.#safeLog('debug', `Spreedly field validation: ${result.fieldType} ${result.valid ? 'valid' : 'invalid'}`);
        if (result.valid) this.clearErrorForField(document.getElementById(`spreedly-${result.fieldType}`));
      },
      'errors': (errors) => {
        this.#safeLog('debug', 'Spreedly validation errors:', errors);
        errors.forEach(error => this.#handleSpreedlyError(error));
      }
    };

    Object.entries(listeners).forEach(([event, handler]) => Spreedly.on(event, handler));
  }

  #handleSpreedlyError(error) {
    const fieldMap = {
      'number': 'spreedly-number',
      'card_number': 'spreedly-number',
      'cvv': 'spreedly-cvv',
      'month': 'cc-month',
      'year': 'cc-year',
      'full_name': 'cc-name',
      'first_name': 'cc-name',
      'last_name': 'cc-name'
    };
    const container = document.getElementById(fieldMap[error.attribute]) || 
                     document.querySelector(`[os-checkout-field="${fieldMap[error.attribute]}"]`);
    if (container) this.#showError(container, error.message);
  }

  #handleSubmit(event) {
    if (!this.validateAllFields()) {
      event.preventDefault();
      this.#safeLog('warn', 'Form validation failed');
    }
  }

  validateAllFields(selectedPaymentMethod = this.getSelectedPaymentMethod()) {
    this.#debugMode && this.#logValidationStart(selectedPaymentMethod);
    
    const isCreditCard = ['credit', 'credit-card'].includes(selectedPaymentMethod);
    const requiredFields = Array.from(document.querySelectorAll('[os-checkout-validate="required"]'));
    const firstErrorField = this.#validateFields(requiredFields, isCreditCard);

    if (isCreditCard && this.#spreedlyEnabled && !firstErrorField) {
      if (!this.#validateCreditCardExpiryFields()) return false;
    }

    if (firstErrorField) {
      this.#scrollToError(firstErrorField);
      return false;
    }
    return true;
  }

  #logValidationStart(method) {
    this.#safeLog('debug', 'Starting field validation for payment method:', method);
    this.#safeLog('debug', 'Same as shipping:', this.isSameAsShipping());
    this.#safeLog('debug', 'Spreedly enabled:', this.#spreedlyEnabled);
    this.#safeLog('debug', 'Spreedly ready:', this.#spreedlyReady);
  }

  #validateFields(fields, isCreditCard) {
    let firstErrorField = null;
    
    for (const field of fields) {
      const fieldName = field.getAttribute('os-checkout-field');
      if (this.#shouldSkipField(fieldName, isCreditCard)) {
        this.clearErrorForField(field);
        continue;
      }

      const label = field.previousElementSibling?.textContent || fieldName || field.placeholder;
      if (!this.#validateField(field, label)) {
        firstErrorField = firstErrorField || field;
      }
    }
    return firstErrorField;
  }

  #shouldSkipField(fieldName, isCreditCard) {
    return (this.isSameAsShipping() && fieldName?.startsWith('billing-')) ||
           (isCreditCard && ['cc-number', 'cvv'].includes(fieldName));
  }

  #validateCreditCardExpiryFields() {
    const [monthField, yearField] = this.#getExpiryFields();
    return this.#validateExpiryField(monthField, 'month') && 
           this.#validateExpiryField(yearField, 'year');
  }

  #getExpiryFields() {
    const monthSelectors = ['[os-checkout-field="cc-month"]', '[os-checkout-field="exp-month"]', '#credit_card_exp_month'];
    const yearSelectors = ['[os-checkout-field="cc-year"]', '[os-checkout-field="exp-year"]', '#credit_card_exp_year'];
    return [
      monthSelectors.map(s => document.querySelector(s)).find(Boolean),
      yearSelectors.map(s => document.querySelector(s)).find(Boolean)
    ];
  }

  #validateExpiryField(field, type) {
    if (!field || !field.value) {
      this.#safeLog('error', `${type} field is empty`);
      this.#showError(field, `Please select an expiration ${type}`);
      return false;
    }
    return true;
  }

  #clearSpreedlyErrors() {
    ['cc-number', 'cvv'].forEach(name => 
      this.clearErrorForField(document.querySelector(`[os-checkout-field="${name}"]`)));
    ['spreedly-number', 'spreedly-cvv'].forEach(id => 
      this.clearErrorForField(document.getElementById(id)));
  }

  #validateField(field, label) {
    if (!field) return true;

    const value = field.value.trim();
    const validation = this.#getFieldValidation(field, value, label);
    
    if (!validation.isValid) {
      this.#showError(field, validation.errorMessage);
    } else {
      this.clearErrorForField(field);
    }
    return validation.isValid;
  }

  #getFieldValidation(field, value, label) {
    const tag = field.tagName.toLowerCase();
    if (tag === 'select') return {
      isValid: !!value,
      errorMessage: `Please select a ${label.toLowerCase()}`
    };
    if (!value) return { isValid: false, errorMessage: `${label} is required` };
    if (field.type === 'tel' && field.iti) return {
      isValid: field.iti.isValidNumber(),
      errorMessage: 'Please enter a valid phone number'
    };
    if (field.type === 'email') return {
      isValid: this.#isValidEmail(value),
      errorMessage: 'Please enter a valid email address'
    };
    return { isValid: true, errorMessage: '' };
  }

  #showError(input, message) {
    if (!input) return;
    
    input.classList.add('error');
    const wrapper = input.closest('.frm-flds') || input.closest('.form-group') || input.parentElement;
    const errorElement = this.#getOrCreateErrorElement(wrapper);
    
    errorElement.textContent = message;
    Object.assign(errorElement.style, {
      color: 'red',
      fontSize: '0.875rem',
      marginTop: '0.25rem'
    });

    if (!input.hasErrorListener) {
      input.hasErrorListener = true;
      ['input', 'change'].forEach(event => 
        input.addEventListener(event, () => this.clearErrorForField(input)));
      if (input.type === 'tel' && input.iti) {
        input.addEventListener('countrychange', () => this.clearErrorForField(input));
      }
    }
  }

  #getOrCreateErrorElement(wrapper) {
    let errorElement = wrapper.querySelector('.pb-input-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'pb-input-error';
      wrapper.appendChild(errorElement);
    }
    return errorElement;
  }

  clearErrorForField(field) {
    if (!field) return;
    
    field.classList.remove('error');
    const wrapper = field.closest('.frm-flds') || field.closest('.form-group') || field.parentElement;
    wrapper?.querySelector('.pb-input-error')?.remove();

    const fieldName = field.getAttribute('os-checkout-field');
    if (['cc-number', 'cvv'].includes(fieldName)) {
      const spreedlyId = `spreedly-${fieldName === 'cc-number' ? 'number' : 'cvv'}`;
      const spreedlyContainer = document.getElementById(spreedlyId);
      if (spreedlyContainer) {
        spreedlyContainer.classList.remove('error');
        spreedlyContainer.closest('.frm-flds')?.querySelector('.pb-input-error')?.remove();
      }
    }
  }

  clearAllErrors() {
    this.#validationErrors = {};
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.pb-input-error').forEach(el => el.remove());
    this.#clearSpreedlyErrors();
  }

  #scrollToError(element) {
    if (!element) return;
    
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.pageYOffset - 100,
      behavior: 'smooth'
    });
    setTimeout(() => element.focus(), 500);
  }

  #isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isSameAsShipping() {
    const checkbox = document.querySelector('[os-checkout-field="same-as-shipping"] input[type="checkbox"]') || 
                     document.querySelector('[os-input-field="use-shipping-address"] input[type="checkbox"]') || 
                     document.querySelector('#use_shipping_address');
    return checkbox ? checkbox.checked : true;
  }

  getSelectedPaymentMethod() {
    return document.querySelector('input[name="payment_method"]:checked')?.value || 
           document.querySelector('input[name="combo_mode"]:checked')?.value || 
           'credit';
  }

  getFormValues() {
    const values = {};
    this.#form.querySelectorAll('input, select, textarea').forEach(field => {
      if (['button', 'submit'].includes(field.type) || field.disabled || !field.name) return;

      const fieldName = field.getAttribute('os-checkout-field') || field.name;
      if (field.type === 'checkbox') {
        values[fieldName] = field.checked;
      } else if (field.type === 'radio') {
        if (field.checked) values[fieldName] = field.value;
      } else if (fieldName.includes('.')) {
        const [parent, child] = fieldName.split('.');
        values[parent] = values[parent] || {};
        values[parent][child] = field.value;
      } else {
        values[fieldName] = field.value;
      }
    });
    return values;
  }
}