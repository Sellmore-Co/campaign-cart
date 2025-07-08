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
  #expressCheckoutButtons = {
    paypal: null,
    applePay: null,
    googlePay: null
  };
  #deviceSupport = {
    applePay: false,
    googlePay: false
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
    this.#initExpressCheckout();
    this.#checkForPaymentFailedParameters();
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
      // If in Konami mode, bypass validation and use predefined test data
      if (isKonamiMode) {
        this.#showProcessingState();
        
        // Get order data using predefined test data
        const orderData = KonamiCodeHandler.getTestOrderData(
          this.#app?.state?.getState(),
          this.#getPackageIdFromUrl.bind(this),
          this.#getCartLines.bind(this)
        );
          
        if (!orderData) {
          this.#hideProcessingState();
          return;
        }
        
        // Create the order with test payment details using the specific test card
        this.#createOrder({
          ...orderData,
          payment_detail: { 
            payment_method: 'card_token', 
            card_token: 'test_card',
            test_card_number: '6011111111111117' // Use specific test card for Konami mode
          }
        });
        return;
      }
      
      // Regular payment flow (including test mode)
      if (!this.#formValidator.validateAllFields(this.#paymentMethod)) {
        this.#isProcessing = false;
        this.#hideProcessingState();
        return;
      }

      this.#showProcessingState();
      const orderData = this.#getOrderData();
      if (!orderData) return;

      // If in test mode, bypass Spreedly validation and use test card token
      if (this.#isTestMode()) {
        this.#createOrder({
          ...orderData,
          payment_detail: { 
            payment_method: 'card_token', 
            card_token: 'test_card' // Use test_card token for test mode
          }
        });
        return;
      }

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
  
    // If we're in debug test card mode or regular test mode, use test card flow
    if (this.#isDebugTestCardMode() || this.#isTestMode()) {
      this.#processTestCard(fullName, month, year);
      return;
    }
  
    // Validate credit card fields using the FormValidator
    if (!this.#formValidator.validateCreditCard()) {
      this.#safeLog('debug', 'Credit card validation failed on initial check');
      if (!month || !year) {
        this.#isProcessing = false;
        this.#hideProcessingState();
        return;
      }
    }
  
    // Proceed with tokenization
    this.#spreedlyManager.tokenizeCard({ 
      full_name: fullName || '', 
      month, 
      year 
    });

    // Add callback to log tokenization results
    this.#spreedlyManager.setOnPaymentMethod((token, pmData) => {
    //   console.log('Card tokenization successful:', {
    //     token,
    //     paymentMethodData: pmData,
    //     cardholderName: fullName,
    //     expirationMonth: month,
    //     expirationYear: year
    //   });
      
      // Comment out order creation
      this.#createOrder({
        payment_token: token,
        payment_method: 'credit-card',
        ...this.#getOrderData()
      });
    });
  }

  #getCreditCardFields() {
    // Check if billing address is different from shipping
    const isDifferentBilling = !this.#formValidator.isSameAsShipping();
    
    // Get first and last name from the appropriate form (billing or shipping)
    const firstName = document.querySelector(`[os-checkout-field="${isDifferentBilling ? 'billing-fname' : 'fname'}"]`)?.value || '';
    const lastName = document.querySelector(`[os-checkout-field="${isDifferentBilling ? 'billing-lname' : 'lname'}"]`)?.value || '';
    
    // Capitalize the names
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const fullName = `${capitalize(firstName)} ${capitalize(lastName)}`.trim();
    
    return [
      fullName,
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
    // Get the actual card number from the input field
    const cardNumber = document.querySelector('[os-checkout-field="cc-number"]')?.value || 
                      document.querySelector('#credit_card_number')?.value;
    
    if (!cardNumber) {
      this.#handlePaymentError('Please enter a credit card number');
      return;
    }

    // Create a test token with the actual card number
    this.#createOrder({
      payment_token: `test_card_token_${Date.now()}`,
      payment_method: 'credit-card',
      test_card_number: cardNumber,
      ...this.#getOrderData()
    });
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

      const orderData = {
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

      // Include vouchers if available - API expects array of strings
      if (state.cart.vouchers && state.cart.vouchers.length > 0) {
        // Convert any object vouchers to string codes
        orderData.vouchers = state.cart.vouchers.map(voucher => {
          if (typeof voucher === 'string') {
            return voucher;
          } else if (voucher && voucher.code) {
            return voucher.code;
          }
          return String(voucher);
        });
        this.#safeLog('debug', `Using vouchers from cart: ${JSON.stringify(orderData.vouchers)}`);
      } else if (state.cart.couponDetails && state.cart.couponCode) {
        // Just use the coupon code as a string
        orderData.vouchers = [state.cart.couponCode];
        this.#safeLog('debug', `Using coupon code: ${state.cart.couponCode}`);
      } else if (state.cart.couponCode) {
        // Backward compatibility for coupon code only
        orderData.vouchers = [state.cart.couponCode];
        this.#safeLog('debug', `Using legacy coupon code: ${state.cart.couponCode}`);
      }

      return orderData;
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
    const method = state.cart?.shippingMethod; // This is the object { ref_id: 2, code: 'default', ... }
    // Extract the ref_id before parsing
    const refId = method?.ref_id;
    // Parse the refId, default to 1 if null, undefined, or NaN
    return parseInt(refId, 10) || 1;
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
    
    // Debug vouchers
    if (orderData.vouchers) {
      this.#safeLog('debug', `Original vouchers in orderData:`, orderData.vouchers);
    } else {
      this.#safeLog('warn', `No vouchers found in original orderData`);
    }
    
    if (formattedOrderData.vouchers) {
      this.#safeLog('debug', `Formatted vouchers in formattedOrderData:`, formattedOrderData.vouchers);
    } else {
      this.#safeLog('warn', `No vouchers found in formattedOrderData - they may have been lost during formatting`);
    }

    this.#apiClient.createOrder(formattedOrderData)
      .then(response => this.#handleOrderSuccess(response))
      .catch(error => this.#handlePaymentError(this.#formatErrorMessage(error)))
      .finally(() => this.#hideProcessingState());
  }

  #formatOrderData(orderData) {
    const formatted = { ...orderData };
    
    // Only set success_url from meta tag if not already set in orderData
    if (!formatted.success_url && this.#apiClient) {
      // Use ApiClient to get next page URL from meta tag
      const nextPageUrl = this.#apiClient.getNextPageUrlFromMeta(orderData.ref_id);
      if (nextPageUrl) {
        formatted.success_url = nextPageUrl;
      }
    }
    
    // Add payment_failed_url to redirect back to the current page with error parameters
    if (!formatted.payment_failed_url) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('payment_failed', 'true');
      
      // Add the payment method to the failed URL if available
      if (orderData.payment_method) {
        currentUrl.searchParams.set('payment_method', orderData.payment_method);
      } else if (formatted.payment_detail?.payment_method) {
        currentUrl.searchParams.set('payment_method', formatted.payment_detail.payment_method);
      }
      
      formatted.payment_failed_url = currentUrl.href;
      this.#safeLog('debug', `Set payment_failed_url to: ${formatted.payment_failed_url}`);
    }
    
    if (orderData.payment_token) {
      formatted.payment_detail = formatted.payment_detail || {};
      formatted.payment_detail.card_token = orderData.payment_token;
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
    formatted.billing_address = formatted.billing_address || formatted.shipping_address;
    
    // Make sure vouchers are preserved from the original order data
    if (!formatted.vouchers && orderData.vouchers) {
      formatted.vouchers = [...orderData.vouchers];
      this.#safeLog('debug', 'Restored vouchers from original order data', formatted.vouchers);
    }
    
    // If we still don't have vouchers, check cart state directly as a fallback
    if (!formatted.vouchers && this.#app?.state) {
      const cart = this.#app.state.getState('cart');
      if (cart.couponDetails && cart.couponCode) {
        // Just use the coupon code as a string - API only expects strings
        formatted.vouchers = [cart.couponCode];
        this.#safeLog('debug', 'Added coupon code from cart state as fallback', formatted.vouchers);
      } else if (cart.couponCode) {
        formatted.vouchers = [cart.couponCode];
        this.#safeLog('debug', 'Added coupon code from cart state as fallback', formatted.vouchers);
      }
    }
    
    // Make sure all vouchers are strings (not objects)
    if (formatted.vouchers && Array.isArray(formatted.vouchers)) {
      formatted.vouchers = formatted.vouchers.map(voucher => {
        if (typeof voucher === 'string') {
          return voucher;
        } else if (voucher && voucher.code) {
          return voucher.code;
        }
        return String(voucher);
      });
      this.#safeLog('debug', 'Ensured all vouchers are strings', formatted.vouchers);
    }
    
    return formatted;
  }

  #formatErrorMessage(error) {
    try {
      const errorData = JSON.parse(error.message);

      // 1. Handle specific payment_details errors (existing)
      if (errorData?.payment_details) {
        return this.#formatPaymentErrorMessage(errorData);
      }

      // 2. Handle specific known error keys directly (e.g., voucher)
      if (typeof errorData?.voucher === 'string') {
        return errorData.voucher; // Return the voucher message directly
      }
      // Example for adding other specific keys:
      // if (typeof errorData?.another_specific_key === 'string') {
      //   return errorData.another_specific_key;
      // }

      // 3. Handle generic errorData.message if present
      if (errorData?.message) {
        if (typeof errorData.message === 'string') {
          // If errorData.message is just a string, use it.
          // Prefixing with "Order creation failed: " to maintain some consistency
          // with how it might have behaved for other errors hitting this path.
          return `Order creation failed: ${errorData.message}`;
        }
        // If errorData.message is an object or array, format it (existing logic improved)
        const formattedMessage = Array.isArray(errorData.message) ?
          errorData.message.map(e => typeof e === 'object' ? Object.entries(e).map(([k, v]) => `${k}: ${v}`).join(', ') : String(e)).join('; ') :
          (typeof errorData.message === 'object' ? Object.entries(errorData.message).map(([k, v]) => `${k}: ${v}`).join(', ') : String(errorData.message));
        return `Order creation failed: ${formattedMessage}`;
      }

      // 4. Fallback: If no specific handlers matched, try to extract a general message from other keys
      // Exclude 'ref_id' or other purely informational fields.
      let generalErrorMessage = '';
      for (const key in errorData) {
        if (Object.prototype.hasOwnProperty.call(errorData, key) &&
            key !== 'ref_id' && key !== 'payment_details' && key !== 'message' &&
            typeof errorData[key] === 'string') {
          generalErrorMessage += (generalErrorMessage ? '; ' : '') + `${this.#formatErrorKey(key)}: ${errorData[key]}`;
        }
      }
      if (generalErrorMessage) {
        return generalErrorMessage;
      }

    } catch (e) {
      this.#safeLog('warn', `Error parsing or formatting API error message: ${e.message}`, error.message);
      // error.message is the original string passed to the function.
      // If it's a simple string (not JSON), it might be a direct message.
      if (typeof error.message === 'string' && !error.message.startsWith('{') && !error.message.startsWith('[')) {
          return error.message;
      }
      // Default for parsing failure or complex unhandled structures
      return 'An error occurred while processing your request. Please check the details and try again.';
    }

    // Final, ultimate fallback if nothing above returned a message
    return 'Order creation failed. Please contact support if the issue persists.';
  }

  #formatErrorKey(key) {
    // Converts "some_key" to "Some key" for better display
    return key.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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
    
    // Handle Spreedly errors in the toast handler
    const spreedlyErrorContainer = document.querySelector('[os-checkout-element="spreedly-error"]');
    if (spreedlyErrorContainer) {
      const errorMessageElement = spreedlyErrorContainer.querySelector('[data-os-message="error"]');
      if (errorMessageElement) {
        errorMessageElement.textContent = message;
        spreedlyErrorContainer.style.display = 'flex';
      }
    } else {
      // Fallback to general error container
      const errorContainer = document.querySelector('[os-checkout-element="payment-error"]');
      if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    
    // Set pending purchase event flag
    sessionStorage.setItem(`pending_purchase_event_${orderData.ref_id}`, 'true');
    
    // Trigger order.created event for the EventManager
    this.#app?.triggerEvent?.('order.created', orderData);
    

    // If payment_complete_url exists, use it directly
    // This is primarily for PayPal and other redirect payment flows
    if (orderData.payment_complete_url) {
      this.#safeLog('debug', `Redirecting to payment gateway: ${orderData.payment_complete_url}`);
      window.location.href = orderData.payment_complete_url;
      return;
    }
    
    // Otherwise use the standard redirect approach for completed payments
    const redirectUrl = this.#getRedirectUrl(orderData);
    window.location.href = redirectUrl;
  }

  #getRedirectUrl(orderData) {
    // If we have ApiClient, use its method for consistency
    if (this.#apiClient) {
      return this.#apiClient.getNextUrlFromOrderResponse(orderData);
    }
    
    // Fallback implementation if ApiClient is not available
    // First check for meta tag (highest priority after payment_complete_url)
    const metaUrl = document.querySelector('meta[name="os-next-page"]')?.content;
    if (metaUrl) {
      const url = metaUrl.startsWith('http') ? 
        metaUrl : 
        new URL(metaUrl, window.location.origin).href;
      
      return `${url}${url.includes('?') ? '&' : '?'}ref_id=${orderData.ref_id}`;
    }
    
    // Then use order_status_url as the fallback
    if (orderData.order_status_url) {
      return orderData.order_status_url;
    }
    
    // Last resort - use confirmation_url or construct one
    return orderData.confirmation_url || 
           `${window.location.origin}/checkout/confirmation/?ref_id=${orderData.ref_id}`;
  }

  /**
   * Initialize express checkout buttons
   */
  #initExpressCheckout() {
    try {
      // Detect device support for payment methods
      this.#detectDeviceSupport();

      // Initialize PayPal Express button
      const paypalButton = document.querySelector('[os-checkout-payment="paypal"]');
      if (paypalButton) {
        paypalButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.processExpressCheckout('paypal');
        });
        this.#expressCheckoutButtons.paypal = paypalButton;
      }

      // Initialize Apple Pay button if supported
      if (this.#deviceSupport.applePay) {
        const applePayButton = document.querySelector('[os-checkout-payment="apple-pay"]');
        if (applePayButton) {
          applePayButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.processExpressCheckout('apple_pay');
          });
          this.#expressCheckoutButtons.applePay = applePayButton;
        }
      } else {
        // Hide Apple Pay button if not supported
        const applePayBtn = document.querySelector('[os-checkout-payment="apple-pay"]');
        if (applePayBtn) {
          applePayBtn.style.display = 'none';
        }
      }

      // Initialize Google Pay button if supported
      if (this.#deviceSupport.googlePay) {
        const googlePayButton = document.querySelector('[os-checkout-payment="google-pay"]');
        if (googlePayButton) {
          googlePayButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.processExpressCheckout('google_pay');
          });
          this.#expressCheckoutButtons.googlePay = googlePayButton;
        }
      } else {
        // Hide Google Pay button if not supported
        const googlePayBtn = document.querySelector('[os-checkout-payment="google-pay"]');
        if (googlePayBtn) {
          googlePayBtn.style.display = 'none';
        }
      }

      // Hide the express checkout container if no buttons are active
      if (!this.#hasActiveExpressButtons()) {
        const container = document.querySelector('[os-checkout-container="express-checkout"]');
        if (container) {
          container.style.display = 'none';
        }
      }

    } catch (error) {
      this.#safeLog('error', 'Error initializing express checkout:', error);
    }
  }

  /**
   * Detect which payment methods are supported by the device/browser
   */
  #detectDeviceSupport() {
    // Check if this is a desktop/laptop screen (typically > 1024px width)
    const isDesktop = window.innerWidth >= 1024;
    
    // Check for Apple Pay support
    // Apple Pay is available on Safari on iOS/macOS devices, or on any desktop
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments) {
      this.#deviceSupport.applePay = true;
      this.#safeLog('debug', 'Apple Pay is supported on this device');
    } else if (isDesktop) {
      // Show Apple Pay on desktop even without native support (for QR code flow)
      this.#deviceSupport.applePay = true;
      this.#safeLog('debug', 'Apple Pay enabled on desktop (QR code flow)');
    } else {
      this.#deviceSupport.applePay = false;
      this.#safeLog('debug', 'Apple Pay is not supported on this device');
    }

    // Check for Google Pay support
    // Google Pay is available on Chrome, Android devices, iOS devices, or any desktop
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isEdgeChromium = /Edg/.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Mac/.test(navigator.userAgent) && 'ontouchend' in document);
    const isMacOS = /Mac/.test(navigator.userAgent) && !('ontouchend' in document);
    
    if (isChrome || isAndroid || isEdgeChromium || isIOS || isMacOS || isDesktop) {
      this.#deviceSupport.googlePay = true;
      this.#safeLog('debug', 'Google Pay is supported on this device');
    } else {
      this.#deviceSupport.googlePay = false;
      this.#safeLog('debug', 'Google Pay is not supported on this device');
    }
    
    // Log detected environment for debugging
    this.#safeLog('debug', `User Agent: ${navigator.userAgent}`);
    this.#safeLog('debug', `Vendor: ${navigator.vendor}`);
    this.#safeLog('debug', `Screen width: ${window.innerWidth}px (Desktop: ${isDesktop})`);
  }

  /**
   * Check if there are any active express checkout buttons
   * @returns {boolean} True if at least one express button is initialized
   */
  #hasActiveExpressButtons() {
    return !!(
      this.#expressCheckoutButtons.paypal || 
      this.#expressCheckoutButtons.applePay || 
      this.#expressCheckoutButtons.googlePay
    );
  }

  /**
   * Process an express checkout payment
   * @param {string} method - Payment method ('paypal', 'apple_pay', 'google_pay')
   */
  processExpressCheckout(method) {
    this.#safeLog('info', `Processing ${method} express checkout`);
    
    // Determine which button to use based on the method
    let button;
    switch (method) {
      case 'paypal':
        button = this.#expressCheckoutButtons.paypal;
        break;
      case 'apple_pay':
        button = this.#expressCheckoutButtons.applePay;
        break;
      case 'google_pay':
        button = this.#expressCheckoutButtons.googlePay;
        break;
      default:
        this.#safeLog('error', `Unknown express checkout method: ${method}`);
        return;
    }
    
    // Show processing state
    this.#setExpressButtonProcessing(button, true);
    
    try {
      // Get cart data from state manager
      const cart = this.#app.state.getState('cart');
      
      if (!cart || !cart.items || cart.items.length === 0) {
        this.#safeLog('error', `Cannot process ${method} checkout: cart is empty`);
        this.#handleExpressCheckoutError('Your cart is empty. Please add items to your cart before checking out.', button);
        return;
      }

      // Prepare simplified API request for express checkout
      // Express checkout doesn't need user and address information
      const orderData = {
        lines: cart.items.map(item => ({
          package_id: item.id,
          quantity: item.quantity || 1,
          is_upsell: !!item.is_upsell
        })),
        payment_detail: {
          payment_method: method
        },
        attribution: this.#app.attribution?.getAttributionData() || cart.attribution || {},
        shipping_method: this.#getShippingMethod(this.#app.state.getState())
      };

      // Get success_url from meta tag using ApiClient
      if (this.#apiClient) {
        const nextPageUrl = this.#apiClient.getNextPageUrlFromMeta();
        if (nextPageUrl) {
          orderData.success_url = nextPageUrl;
          this.#safeLog('debug', `Express checkout success URL set from meta tag: ${nextPageUrl}`);
        } else {
          this.#safeLog('debug', 'No meta tag found for express checkout success_url, API will use order_status_url');
        }
      }
      
      // Add payment_failed_url to redirect back to current page with error parameters
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('payment_failed', 'true');
      currentUrl.searchParams.set('payment_method', method);
      orderData.payment_failed_url = currentUrl.href;
      this.#safeLog('debug', `Express checkout payment_failed_url set to: ${orderData.payment_failed_url}`);

      // Add vouchers if available
      if (cart.vouchers && cart.vouchers.length > 0) {
        // Convert any object vouchers to string codes
        orderData.vouchers = cart.vouchers.map(voucher => {
          if (typeof voucher === 'string') {
            return voucher;
          } else if (voucher && voucher.code) {
            return voucher.code;
          }
          return String(voucher);
        });
        this.#safeLog('debug', `Using vouchers from cart for express checkout: ${JSON.stringify(orderData.vouchers)}`);
      } else if (cart.couponDetails && cart.couponCode) {
        // Just use the coupon code as a string
        orderData.vouchers = [cart.couponCode];
        this.#safeLog('debug', `Using coupon code for express checkout: ${cart.couponCode}`);
      } else if (cart.couponCode) {
        // Backward compatibility for coupon code only
        orderData.vouchers = [cart.couponCode];
        this.#safeLog('debug', `Using legacy coupon code for express checkout: ${cart.couponCode}`);
      }

      this.#safeLog('debug', 'Express checkout order data:', orderData);

      // Create order through API
      this.#apiClient.createOrder(orderData)
        .then(response => {
          this.#safeLog('debug', `${method} express checkout order created:`, response);
          
          if (response.payment_complete_url) {
            // Trigger event before redirect
            this.#app.triggerEvent('express.checkout.started', {
              method,
              order: response
            });
            
            // Redirect to payment processor
            window.location.href = response.payment_complete_url;
          } else {
            throw new Error('No payment URL returned from API');
          }
        })
        .catch(error => {
          this.#safeLog('error', `${method} express checkout error:`, error);
          this.#handleExpressCheckoutError(`There was an error processing your ${method.replace('_', ' ')} payment. Please try again or use a different payment method.`, button);
        });
    } catch (error) {
      this.#safeLog('error', `Error in ${method} express checkout:`, error);
      this.#handleExpressCheckoutError('An unexpected error occurred. Please try again.', button);
    }
  }

  /**
   * Set express checkout button to processing state
   * @param {HTMLElement} button - Button element
   * @param {boolean} isProcessing - Whether the button is processing
   */
  #setExpressButtonProcessing(button, isProcessing) {
    if (!button) return;
    
    if (isProcessing) {
      button.setAttribute('disabled', 'disabled');
      button.classList.add('processing');
      
      // Store original content and replace with processing indicator
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'payment-btn-spinner';
        loadingSpinner.innerHTML = '<div class="spinner"></div>';
        button.innerHTML = '';
        button.appendChild(loadingSpinner);
      }
    } else {
      button.removeAttribute('disabled');
      button.classList.remove('processing');
      
      // Restore original content
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        delete button.dataset.originalHtml;
      }
    }
  }

  /**
   * Handle express checkout error
   * @param {string} message - Error message
   * @param {HTMLElement} button - Button element that was clicked
   */
  #handleExpressCheckoutError(message, button) {
    // Reset button state
    this.#setExpressButtonProcessing(button, false);
    
    // Create or update error message
    const container = document.querySelector('.express-checkout-wrapper');
    if (!container) return;
    
    let errorContainer = container.querySelector('.express-checkout-error');
    
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'express-checkout-error';
      container.appendChild(errorContainer);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);
    
    // Trigger error event
    this.#app.triggerEvent('express.checkout.error', { message });
  }

  /**
   * Reset processing state for all express checkout buttons
   */
  resetExpressButtons() {
    this.#setExpressButtonProcessing(this.#expressCheckoutButtons.paypal, false);
    this.#setExpressButtonProcessing(this.#expressCheckoutButtons.applePay, false);
    this.#setExpressButtonProcessing(this.#expressCheckoutButtons.googlePay, false);
  }

  /**
   * Check URL parameters for payment_failed and display appropriate error message
   */
  #checkForPaymentFailedParameters() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentFailed = urlParams.get('payment_failed');
      
      if (paymentFailed === 'true') {
        const paymentMethod = urlParams.get('payment_method');
        let errorMessage = 'Your payment could not be processed. Please try again or use a different payment method.';
        
        // Customize message based on payment method
        if (paymentMethod) {
          const methodDisplay = {
            'paypal': 'PayPal',
            'apple_pay': 'Apple Pay',
            'google_pay': 'Google Pay',
            'card_token': 'credit card',
            'credit-card': 'credit card',
            'credit': 'credit card'
          }[paymentMethod] || paymentMethod;
          
          errorMessage = `Your ${methodDisplay} payment could not be processed. Please try again or use a different payment method.`;
        }
        
        // Handle errors from express checkout methods differently
        const isExpressCheckout = ['paypal', 'apple_pay', 'google_pay'].includes(paymentMethod);
        if (isExpressCheckout) {
          this.#displayTopBannerError(errorMessage, paymentMethod);
        } else {
          // Default to credit card error display for card_token or unknown methods
          this.#handlePaymentError(errorMessage);
        }
        
        // Clear the URL parameters to prevent showing the error again on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment_failed');
        newUrl.searchParams.delete('payment_method');
        window.history.replaceState({}, document.title, newUrl.href);
      }
    } catch (error) {
      this.#safeLog('error', 'Error checking payment failed parameters:', error);
    }
  }
  
  /**
   * Display a prominent error banner at the top of the checkout form
   * @param {string} message - Error message to display
   * @param {string} method - Payment method that failed
   */
  #displayTopBannerError(message, method) {
    try {
      // Check if there's already a top banner error
      let errorBanner = document.querySelector('[os-checkout-element="top-error-banner"]');
      
      if (!errorBanner) {
        // Create the banner
        errorBanner = document.createElement('div');
        errorBanner.setAttribute('os-checkout-element', 'top-error-banner');
        errorBanner.className = 'checkout-error-banner';
        errorBanner.style.width = '100%';
        errorBanner.style.padding = '12px 16px';
        errorBanner.style.backgroundColor = '#fff3cd';
        errorBanner.style.color = '#856404';
        errorBanner.style.borderRadius = '4px';
        errorBanner.style.marginBottom = '20px';
        errorBanner.style.border = '1px solid #ffeeba';
        errorBanner.style.display = 'flex';
        errorBanner.style.alignItems = 'center';
        errorBanner.style.justifyContent = 'space-between';
        
        // Create message div
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.cursor = 'pointer';
        closeButton.style.marginLeft = '10px';
        closeButton.addEventListener('click', () => {
          errorBanner.style.display = 'none';
        });
        
        // Assemble banner
        errorBanner.appendChild(messageDiv);
        errorBanner.appendChild(closeButton);
        
        // Insert banner at the top of the checkout form
        const checkoutForm = this.#form;
        if (checkoutForm) {
          checkoutForm.insertBefore(errorBanner, checkoutForm.firstChild);
        } else {
          // Try to find other common checkout container elements
          const checkoutContainer = 
            document.querySelector('[os-checkout-container="form"]') || 
            document.querySelector('.checkout-form') ||
            document.querySelector('.checkout-container');
          
          if (checkoutContainer) {
            checkoutContainer.insertBefore(errorBanner, checkoutContainer.firstChild);
          } else {
            // Last resort - add to body
            const mainContent = document.querySelector('main') || document.body;
            mainContent.insertBefore(errorBanner, mainContent.firstChild);
          }
        }
        
        // Scroll to error banner
        errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Update existing banner
        const messageDiv = errorBanner.querySelector('div');
        if (messageDiv) {
          messageDiv.textContent = message;
        } else {
          errorBanner.textContent = message;
        }
        errorBanner.style.display = 'flex';
        errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      this.#safeLog('debug', `Displayed top banner error for ${method}: ${message}`);
    } catch (error) {
      this.#safeLog('error', 'Error displaying top banner error:', error);
      // Fall back to the standard error method
      this.#handlePaymentError(message);
    }
  }
}