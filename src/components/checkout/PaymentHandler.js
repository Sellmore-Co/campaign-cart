/**
 * PaymentHandler - Handles payment processing for checkout
 */
import { SpreedlyManager } from '../../managers/SpreedlyManager.js';
import { FormValidator } from './FormValidator.js';
import { KonamiCodeHandler } from '../../utils/KonamiCodeHandler.js';

export class PaymentHandler {
  #apiClient;
  #logger;
  #app;
  #form;
  #spreedlyManager = null;
  #formValidator = null;
  #paymentMethod = 'credit-card';
  #isProcessing = false;
  #debugMode = false;
  #testCards = {
    visa: '4111111111111111',
    mastercard: '5555555555554444',
    amex: '378282246310005',
    discover: '6011111111111117'
  };

  constructor(apiClient, logger, app) {
    this.#apiClient = apiClient;
    this.#logger = logger;
    this.#app = app;
    this.#form = this.#getCheckoutForm();

    if (!this.#form) return;

    this.#setupFormPrevention();
    this.#setupCheckoutButton();
    
    this.#formValidator = new FormValidator({ 
      debugMode: this.#debugMode,
      logger: this.#logger
    });
    this.#form.__formValidator = this.#formValidator;

    this.#initPaymentMethods();
    this.#initSpreedly();
  }

  #getCheckoutForm() {
    const form = document.querySelector('form[os-checkout="form"]') || document.querySelector('form#combo_form');
    if (!form) {
      this.#safeLog('warn', 'No checkout form found');
    }
    return form;
  }

  #setupFormPrevention() {
    this.#form.removeAttribute('action');
    this.#form.setAttribute('method', 'post');
    
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'prevent_serialization';
    hiddenInput.value = 'true';
    this.#form.appendChild(hiddenInput);

    this.#form.addEventListener('submit', this.#preventFormSubmission.bind(this), true);
    this.#form.onsubmit = this.#preventFormSubmission.bind(this);
    this.#convertSubmitButtons();
  }

  #preventFormSubmission(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    
    this.#form.removeAttribute('action');
    this.#form.setAttribute('method', 'post');
    window.stop?.();
    
    this.#safeLog('debug', 'Form submission prevented');
    return false;
  }

  #convertSubmitButtons() {
    try {
      const submitButtons = this.#form.querySelectorAll('button[type="submit"], input[type="submit"]');
      submitButtons.forEach((button, index) => {
        button.setAttribute('type', 'button');
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.#safeLog('debug', `Submit button ${index + 1} clicked`);
          this.processPayment();
        });
      });
    } catch (error) {
      this.#safeLog('error', 'Error converting submit buttons:', error);
    }
  }

  #setupCheckoutButton() {
    const checkoutButton = document.querySelector('[os-checkout-payment="combo"]');
    if (!checkoutButton) {
      this.#safeLog('warn', 'Checkout button not found');
      return;
    }

    const newButton = checkoutButton.cloneNode(true);
    checkoutButton.parentNode.replaceChild(newButton, checkoutButton);
    
    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      this.#form.onsubmit = this.#preventFormSubmission.bind(this);
      this.#form.removeAttribute('action');
      this.#form.setAttribute('method', 'post');
      
      this.#safeLog('debug', 'Checkout button clicked');
      setTimeout(() => this.processPayment(), 0);
    });
  }

  #safeLog(level, message, ...args) {
    try {
      const logFn = this.#logger?.[level] || console[level] || console.log;
      logFn.call(console, `[${level.toUpperCase()}] ${message}`, ...args);
    } catch (error) {
      console.error('Error logging:', error);
    }
  }

  #initPaymentMethods() {
    try {
      const paymentMethodSelector = document.querySelector('[os-checkout-field="payment-method"]') || 
                                   document.querySelector('input[name="combo_mode"]:checked');
      if (!paymentMethodSelector) {
        this.#safeLog('warn', 'Payment method selector not found');
        return;
      }

      this.#paymentMethod = paymentMethodSelector.value || 'credit-card';
      this.#setupPaymentMethodListeners();
    } catch (error) {
      this.#safeLog('error', 'Error initializing payment methods:', error);
    }
  }

  #setupPaymentMethodListeners() {
    const radioButtons = document.querySelectorAll('input[name="combo_mode"]');
    const handler = (e) => {
      this.#paymentMethod = e.target.value;
      this.#safeLog('debug', `Payment method changed to: ${this.#paymentMethod}`);
      document.dispatchEvent(new CustomEvent('payment-method-changed', {
        detail: { mode: this.#paymentMethod }
      }));
    };

    if (radioButtons.length > 0) {
      radioButtons.forEach(radio => radio.addEventListener('change', handler));
    } else {
      document.querySelector('[os-checkout-field="payment-method"]')
        ?.addEventListener('change', handler);
    }
  }

  #initSpreedly() {
    try {
      const environmentKey = document.querySelector('meta[name="spreedly-environment-key"]')?.content ||
                            document.querySelector('meta[name="os-payment-env-key"]')?.content;
      if (!environmentKey) {
        this.#safeLog('warn', 'Spreedly environment key not found');
        return;
      }

      this.#spreedlyManager = new SpreedlyManager(environmentKey, { 
        debug: this.#debugMode,
        app: this.#app
      });
      this.#setupSpreedlyCallbacks();
      this.#initializeExpirationFields();
    } catch (error) {
      this.#safeLog('error', 'Error initializing Spreedly:', error);
    }
  }

  #setupSpreedlyCallbacks() {
    this.#spreedlyManager.setOnReady(() => this.#safeLog('debug', 'Spreedly ready'));
    this.#spreedlyManager.setOnError((errors) => {
      this.#safeLog('error', 'Spreedly errors:', errors);
      this.#isProcessing = false;
      this.#hideProcessingState();
      
      // Map Spreedly validation errors to user-friendly messages
      const errorMessage = this.#formatSpreedlyErrors(errors);
      this.#handlePaymentError(errorMessage);
    });
    this.#spreedlyManager.setOnPaymentMethod((token, pmData) => {
      this.#safeLog('debug', 'Spreedly payment method token received:', token);
      this.#createOrder({
        payment_token: token,
        payment_method: 'credit-card',
        ...this.#getOrderData()
      });
    });
  }

  #formatSpreedlyErrors(errors) {
    if (!errors || errors.length === 0) {
      return 'An unknown error occurred with your payment method';
    }
    
    // Map common Spreedly error messages to user-friendly messages
    const errorMap = {
      'The card number is not a valid credit card number': 'Please enter a valid credit card number',
      'Credit card number entered is not valid': 'Please enter a valid credit card number',
      'The card number is too short': 'The card number you entered is too short',
      'The card number is too long': 'The card number you entered is too long',
      'The card security code is invalid': 'Please enter a valid security code (CVV)',
      'The card security code is too short': 'The security code (CVV) is too short',
      'The card security code is too long': 'The security code (CVV) is too long',
      'The card has expired': 'This card has expired. Please use a different card',
      'The card expiration month is invalid': 'Please select a valid expiration month',
      'The card expiration year is invalid': 'Please select a valid expiration year'
    };
    
    // Check if any of the errors match our map
    for (const error of errors) {
      for (const [key, value] of Object.entries(errorMap)) {
        if (error.includes(key)) {
          return value;
        }
      }
    }
    
    // If no specific mapping, return the first error
    return errors[0];
  }

  #initializeExpirationFields() {
    try {
      const [monthSelect, yearSelect] = this.#getExpirationElements();
      this.#populateExpirationOptions(monthSelect, yearSelect);
    } catch (error) {
      this.#safeLog('error', 'Error initializing expiration fields:', error);
    }
  }

  #getExpirationElements() {
    const monthSelectors = ['[os-checkout-field="cc-month"]', '[os-checkout-field="exp-month"]', '#credit_card_exp_month'];
    const yearSelectors = ['[os-checkout-field="cc-year"]', '[os-checkout-field="exp-year"]', '#credit_card_exp_year'];
    
    return [
      monthSelectors.map(s => document.querySelector(s)).find(Boolean),
      yearSelectors.map(s => document.querySelector(s)).find(Boolean)
    ];
  }

  #populateExpirationOptions(monthSelect, yearSelect) {
    if (monthSelect) {
      monthSelect.innerHTML = '<option value="">Month</option>';
      for (let i = 1; i <= 12; i++) {
        const month = i.toString().padStart(2, '0');
        monthSelect.appendChild(new Option(month, month));
      }
    }

    if (yearSelect) {
      yearSelect.innerHTML = '<option value="">Year</option>';
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 20; i++) {
        const year = currentYear + i;
        yearSelect.appendChild(new Option(year, year));
      }
    }
  }

  #isTestMode() {
    // Check for URL parameter or Konami code flag in sessionStorage
    return new URLSearchParams(window.location.search).get('test') === 'true' || 
           KonamiCodeHandler.isTestMode();
  }

  /**
   * Set Konami code test mode flag
   * This method can be called from CheckoutManager when Konami code is activated
   */
  setKonamiTestMode() {
    KonamiCodeHandler.setTestMode();
    this.#safeLog('info', '🎮 Konami code test mode activated');
    return true;
  }

  processPayment() {
    // Check if Konami code test mode is active and clear it after use
    const isKonamiMode = KonamiCodeHandler.isTestMode();
    if (isKonamiMode) {
      KonamiCodeHandler.clearTestMode();
      this.#safeLog('info', '🎮 Processing payment in Konami test mode');
    }

    if (this.#isProcessing) {
      this.#safeLog('warn', 'Payment already processing');
      return;
    }

    // Clear any previous errors before starting a new payment attempt
    this.#clearPaymentErrors();

    this.#enforceFormPrevention();
    this.#isProcessing = true;
    this.#safeLog('debug', `Processing payment with method: ${this.#paymentMethod}`);

    try {
      // If in Konami mode or test mode, bypass validation and directly create a test order
      if (isKonamiMode || this.#isTestMode()) {
        this.#showProcessingState();
        
        // Get order data - for Konami mode, use predefined test data
        const orderData = isKonamiMode ? 
          KonamiCodeHandler.getTestOrderData(
            this.#app?.state?.getState(),
            this.#getPackageIdFromUrl.bind(this),
            this.#getCartLines.bind(this)
          ) : 
          this.#getOrderData();
          
        if (!orderData) {
          this.#hideProcessingState();
          return;
        }
        
        // Create the order with test payment details
        this.#createOrder({
          ...orderData,
          payment_detail: { 
            payment_method: 'card_token', 
            card_token: 'test_card' // Use the same token as test=true for consistency
          }
        });
        return;
      }
      
      // Regular payment flow
      if (!this.#formValidator.validateAllFields(this.#paymentMethod)) {
        this.#isProcessing = false;
        this.#hideProcessingState();
        return;
      }

      this.#showProcessingState();
      const orderData = this.#getOrderData();
      if (!orderData) return;

      switch (this.#paymentMethod) {
        case 'credit-card':
        case 'credit':
          this.#processCreditCard();
          break;
        case 'paypal':
          this.#processPaypal();
          break;
        default:
          this.#handlePaymentError(`Unknown payment method: ${this.#paymentMethod}`);
      }
    } catch (error) {
      this.#safeLog('error', 'Error processing payment:', error);
      this.#handlePaymentError('Unexpected error occurred');
      this.#hideProcessingState();
    }
  }

  #enforceFormPrevention() {
    this.#form?.removeAttribute('action');
    this.#form?.setAttribute('method', 'post');
    this.#form.onsubmit = this.#preventFormSubmission.bind(this);
    this.#form?.querySelectorAll('button[type="submit"], input[type="submit"]')
      .forEach(btn => {
        btn.disabled = true;
        btn.setAttribute('type', 'button');
      });
  }

  #showProcessingState() {
    const submitButton = document.querySelector('[os-checkout-payment="combo"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-submitting');
    }
  }

  #hideProcessingState() {
    const submitButton = document.querySelector('[os-checkout-payment="combo"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.classList.remove('is-submitting');
    }
    this.#isProcessing = false;
  }

  #processCreditCard() {
    if (!this.#spreedlyManager) {
      this.#handlePaymentError('Credit card processing unavailable');
      return;
    }
  
    const [fullName, month, year] = this.#getCreditCardFields();
  
    // If we're in debug test card mode, use that flow
    if (this.#isDebugTestCardMode()) {
      this.#processTestCard(fullName, month, year);
      return;
    }
  
    // Validate credit card fields using the FormValidator
    // The validation is now only checking the field state, not waiting for Spreedly validation
    if (!this.#formValidator.validateCreditCard()) {
      this.#safeLog('debug', 'Credit card validation failed on initial check');
      // We'll still attempt to tokenize if fields are filled in
      if (!month || !year) {
        this.#isProcessing = false;
        this.#hideProcessingState();
        return;
      }
    }
  
    // Proceed with tokenization
    this.#spreedlyManager.tokenizeCard({ full_name: fullName || 'Test User', month, year });
  }

  #getCreditCardFields() {
    return [
      document.querySelector('[os-checkout-field="cc-name"]')?.value || '',
      document.querySelector('[os-checkout-field="cc-month"]')?.value || 
      document.querySelector('[os-checkout-field="exp-month"]')?.value || 
      document.querySelector('#credit_card_exp_month')?.value || '',
      document.querySelector('[os-checkout-field="cc-year"]')?.value || 
      document.querySelector('[os-checkout-field="exp-year"]')?.value || 
      document.querySelector('#credit_card_exp_year')?.value || ''
    ];
  }

  #isDebugTestCardMode() {
    const params = new URLSearchParams(window.location.search);
    return (this.#debugMode || params.get('debug') === 'true') && params.has('test-card');
  }

  #processTestCard(fullName, month, year) {
    const testCardType = new URLSearchParams(window.location.search).get('test-card');
    const testCard = this.#testCards[testCardType];
    if (testCard) {
      this.#createOrder({
        payment_token: `test_card_token_${testCardType}_${Date.now()}`,
        payment_method: 'credit-card',
        test_card_type: testCardType,
        test_card_number: testCard,
        ...this.#getOrderData()
      });
    }
  }

  #processPaypal() {
    this.#createOrder({
      payment_method: 'paypal',
      ...this.#getOrderData()
    });
  }

  #getPackageIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('package_id') || params.get('pid');
    return id ? parseInt(id, 10) || null : null;
  }

  #getOrderData() {
    try {
      const shippingData = this.#getAddressData(['fname', 'lname', 'address1', 'address2', 'city', 'province', 'postal', 'country', 'phone']);
      const billingData = this.#formValidator.isSameAsShipping() ? null : 
        this.#getAddressData(['billing-fname', 'billing-lname', 'billing-address1', 'billing-address2', 'billing-city', 'billing-province', 'billing-postal', 'billing-country', 'billing-phone']);

      const shippingAddress = this.#formatAddress(shippingData);
      const billingAddress = billingData ? this.#formatAddress(billingData) : { ...shippingAddress };

      if (!this.#app?.state) {
        this.#handlePaymentError('Cart data missing');
        return null;
      }

      const state = this.#app.state.getState();
      if (!state.cart?.items?.length) {
        this.#handlePaymentError('Cart is empty');
        return null;
      }

      return {
        user: {
          email: state.user?.email || '',
          first_name: state.user?.firstName || shippingAddress.first_name,
          last_name: state.user?.lastName || shippingAddress.last_name
        },
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_method: this.#getShippingMethod(state),
        attribution: state.cart.attribution || {},
        lines: this.#getCartLines(state.cart.items)
      };
    } catch (error) {
      this.#safeLog('error', 'Error getting order data:', error);
      this.#handlePaymentError('Error preparing order');
      return null;
    }
  }

  #getAddressData(fields) {
    const data = {};
    fields.forEach(field => {
      const value = document.querySelector(`[os-checkout-field="${field}"]`)?.value;
      if (value) data[field.replace('billing-', '')] = value;
    });
    return data;
  }

  #formatAddress(data) {
    return {
      first_name: data.fname || '',
      last_name: data.lname || '',
      line1: data.address1 || '',
      line2: data.address2 || '',
      line3: '',
      line4: data.city || '',
      state: data.province || '',
      postcode: data.postal || '',
      country: data.country || '',
      phone_number: data.phone || ''
    };
  }

  #getShippingMethod(state) {
    const method = state.cart?.shippingMethod;
    return typeof method === 'number' ? method : 
           parseInt(method, 10) || 1;
  }

  #getCartLines(items) {
    return items.map(item => {
      let packageId = parseInt(item.id || item.external_id, 10) || this.#getPackageIdFromUrl();
      if (!packageId) throw new Error(`Invalid package ID for item: ${item.name}`);
      
      // Create the line item
      const lineItem = {
        package_id: packageId,
        quantity: item.quantity || 1
      };
      
      // If is_upsell property exists on the item, add it to the line item
      if (item.is_upsell === true) {
        lineItem.is_upsell = true;
        this.#safeLog('debug', `Adding line item with is_upsell=true: ${packageId}`);
      }
      
      return lineItem;
    });
  }

  #createOrder(orderData) {
    if (!orderData || !this.#apiClient) {
      this.#handlePaymentError('Cannot create order');
      this.#hideProcessingState();
      return;
    }

    this.#enforceFormPrevention();
    const formattedOrderData = this.#formatOrderData(orderData);

    this.#apiClient.createOrder(formattedOrderData)
      .then(response => this.#handleOrderSuccess(response))
      .catch(error => this.#handlePaymentError(this.#formatErrorMessage(error)))
      .finally(() => this.#hideProcessingState());
  }

  #formatOrderData(orderData) {
    const formatted = { ...orderData, success_url: orderData.success_url || window.location.origin + '/checkout/confirmation/' };
    if (orderData.payment_token) {
      formatted.payment_detail = { card_token: orderData.payment_token };
      delete formatted.payment_token;
    }
    if (orderData.payment_method) {
      formatted.payment_detail = formatted.payment_detail || {};
      formatted.payment_detail.payment_method = {
        'credit-card': 'card_token',
        'credit': 'card_token',
        'paypal': 'paypal'
      }[orderData.payment_method] || orderData.payment_method;
      delete formatted.payment_method;
    }
    formatted.shipping_method = parseInt(formatted.shipping_method, 10) || 1;
    formatted.billing_address = formatted.billing_address || formatted.shipping_address;
    return formatted;
  }

  #formatErrorMessage(error) {
    try {
      const errorData = JSON.parse(error.message);
      
      // Handle specific payment errors
      if (errorData?.payment_details) {
        return this.#formatPaymentErrorMessage(errorData);
      }
      
      if (errorData?.message) {
        return `Order creation failed: ${
          Array.isArray(errorData.message) ? 
            errorData.message.map(e => Object.entries(e).map(([k, v]) => `${k}: ${v}`).join(', ')).join(', ') :
            Object.entries(errorData.message).map(([k, v]) => `${k}: ${v}`).join(', ')
        }`;
      }
    } catch {
      return error.message || 'Unknown error';
    }
    return 'Order creation failed';
  }

  #formatPaymentErrorMessage(errorData) {
    // Create a user-friendly message based on the payment error
    const errorCode = errorData.payment_response_code;
    const errorDetails = errorData.payment_details;
    
    // Map common error codes to user-friendly messages
    const errorMessages = {
      '3005': 'The card number you entered is invalid. Please check and try again.',
      '3006': 'The card expiration date is invalid. Please check and try again.',
      '3007': 'The card security code (CVV) is invalid. Please check and try again.',
      '3008': 'The card has been declined. Please try another payment method.',
      '3009': 'This card has expired. Please use a different card.',
      '3010': 'The card has insufficient funds. Please try another payment method.'
    };
    
    return errorMessages[errorCode] || errorDetails || 'There was a problem processing your payment. Please try again.';
  }

  #handlePaymentError(message) {
    this.#hideProcessingState();
    
    // Clear any previous error indicators
    this.#clearPaymentErrors();
    
    // Check if this is a credit card specific error
    const isCreditCardError = this.#paymentMethod === 'credit-card' && 
      (message.includes('card') || message.includes('Card') || message.includes('CVV'));
    
    if (isCreditCardError) {
      // Display error on the credit card field
      this.#displayCreditCardError(message);
    }
    
    // Also display in the general error container
    const errorContainer = document.querySelector('[os-checkout-element="payment-error"]');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Try to find any error container element for Spreedly errors
      const spreedlyErrorContainer = document.querySelector('.spreedly-error') || 
                                     document.querySelector('[data-spreedly-errors]');
      if (spreedlyErrorContainer) {
        spreedlyErrorContainer.textContent = message;
        spreedlyErrorContainer.style.display = 'block';
      } else {
        alert(`Payment Error: ${message}`);
      }
    }
  }
  
  #displayCreditCardError(message) {
    // Find the credit card field container
    let fieldSelector = '[os-checkout-field="cc-number"]';
    let fieldId = '#credit_card_number';
    
    // Determine which field has the error based on the message
    if (message.toLowerCase().includes('cvv') || message.toLowerCase().includes('security code')) {
      fieldSelector = '[os-checkout-field="cc-cvv"]';
      fieldId = '#credit_card_cvv';
    } else if (message.toLowerCase().includes('expiration') || message.toLowerCase().includes('expired')) {
      fieldSelector = '[os-checkout-field="cc-month"], [os-checkout-field="cc-year"]';
      fieldId = '#credit_card_exp_month, #credit_card_exp_year';
    }
    
    // Find the field container
    const fieldSelectors = fieldSelector.split(',').map(s => s.trim());
    const idSelectors = fieldId.split(',').map(s => s.trim());
    
    // Apply error styling to all matching fields
    [...fieldSelectors, ...idSelectors].forEach(selector => {
      const field = document.querySelector(selector);
      if (!field) return;
      
      const container = field.closest('.form-group') || field.parentElement;
      if (!container) return;
      
      // Add error class to the field
      field.classList.add('is-invalid');
      
      // Create or update error message element
      let errorElement = container.querySelector('.invalid-feedback');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        container.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    });
    
    // Scroll to the first field with error
    const firstErrorField = document.querySelector(fieldSelectors[0]) || document.querySelector(idSelectors[0]);
    if (firstErrorField) {
      firstErrorField.focus();
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  #clearPaymentErrors() {
    // Clear all credit card field errors
    const ccFieldSelectors = [
      '[os-checkout-field="cc-number"]', '#credit_card_number',
      '[os-checkout-field="cc-cvv"]', '#credit_card_cvv',
      '[os-checkout-field="cc-month"]', '#credit_card_exp_month',
      '[os-checkout-field="cc-year"]', '#credit_card_exp_year'
    ];
    
    ccFieldSelectors.forEach(selector => {
      const field = document.querySelector(selector);
      if (!field) return;
      
      field.classList.remove('is-invalid');
      const container = field.closest('.form-group') || field.parentElement;
      if (container) {
        const errorElement = container.querySelector('.invalid-feedback');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      }
    });
    
    // Clear general error container
    const errorContainer = document.querySelector('[os-checkout-element="payment-error"]');
    if (errorContainer) {
      errorContainer.style.display = 'none';
    }
  }

  #handleOrderSuccess(orderData) {
    sessionStorage.setItem('order_reference', orderData.ref_id);
    
    // Trigger order.created event for the EventManager
    this.#app?.triggerEvent?.('order.created', orderData);
    
    const redirectUrl = this.#getRedirectUrl(orderData);
    window.location.href = redirectUrl;
  }

  #getRedirectUrl(orderData) {
    const metaUrl = document.querySelector('meta[name="os-next-page"]')?.content;
    if (metaUrl) return `${metaUrl}${metaUrl.includes('?') ? '&' : '?'}ref_id=${orderData.ref_id}`;
    return orderData.confirmation_url || orderData.order_status_url || `/checkout/confirmation/?ref_id=${orderData.ref_id}`;
  }
}