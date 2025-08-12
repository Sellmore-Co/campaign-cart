import { B as BaseEnhancer } from "./BaseEnhancer-B4sx_W7g.js";
import { c as createLogger, F as FieldFinder, b as useCheckoutStore, h as ErrorDisplayManager, i as EventHandlerManager, d as configStore, u as useCartStore, C as CountryService } from "./utils-Bgh0TU7j.js";
import { ApiClient } from "./api-BIUkTLAN.js";
import { u as useAttributionStore } from "./index-DqT-IFSn.js";
import { G as GeneralModal } from "./GeneralModal-Cuk4sJCc.js";
import { L as LoadingOverlay } from "./LoadingOverlay-DOjYiQnB.js";
import { O as OrderManager, E as ExpressCheckoutProcessor } from "./OrderManager-Kx9ajAph.js";
class CreditCardService {
  constructor(environmentKey) {
    this.isReady = false;
    this.environmentKey = environmentKey;
    this.logger = createLogger("CreditCardService");
    this.validationState = this.initializeValidationState();
    if (!environmentKey) {
      this.logger.error("No Spreedly environment key provided");
      return;
    }
  }
  /**
   * Initialize the credit card service
   */
  async initialize() {
    try {
      if (this.isReady) {
        this.logger.debug("CreditCardService already initialized, skipping");
        return;
      }
      this.findCreditCardFields();
      if (!this.numberField || !this.cvvField) {
        this.logger.debug("Credit card fields not found, skipping Spreedly initialization");
        return;
      }
      await this.loadSpreedlyScript();
      this.setupSpreedly();
      this.logger.debug("CreditCardService initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize CreditCardService:", error);
      throw error;
    }
  }
  /**
   * Tokenize credit card data
   */
  async tokenizeCard(cardData) {
    if (!this.isReady) {
      throw new Error("Credit card service is not ready");
    }
    if (!cardData.full_name || !cardData.month || !cardData.year) {
      throw new Error("Credit card data is incomplete");
    }
    this.logger.debug("Tokenizing credit card");
    return new Promise((resolve, reject) => {
      const originalTokenCallback = this.onTokenCallback;
      const originalErrorCallback = this.onErrorCallback;
      this.onTokenCallback = (token, pmData) => {
        if (originalTokenCallback) {
          originalTokenCallback(token, pmData);
        }
        if (originalTokenCallback) {
          this.onTokenCallback = originalTokenCallback;
        } else {
          delete this.onTokenCallback;
        }
        if (originalErrorCallback) {
          this.onErrorCallback = originalErrorCallback;
        } else {
          delete this.onErrorCallback;
        }
        resolve(token);
      };
      this.onErrorCallback = (errors) => {
        if (originalErrorCallback) {
          originalErrorCallback(errors);
        }
        if (originalTokenCallback) {
          this.onTokenCallback = originalTokenCallback;
        } else {
          delete this.onTokenCallback;
        }
        if (originalErrorCallback) {
          this.onErrorCallback = originalErrorCallback;
        } else {
          delete this.onErrorCallback;
        }
        reject(new Error(errors.join(". ")));
      };
      const timeoutId = setTimeout(() => {
        if (originalTokenCallback) {
          this.onTokenCallback = originalTokenCallback;
        } else {
          delete this.onTokenCallback;
        }
        if (originalErrorCallback) {
          this.onErrorCallback = originalErrorCallback;
        } else {
          delete this.onErrorCallback;
        }
        reject(new Error("Credit card tokenization timed out"));
      }, 3e4);
      const originalResolve = resolve;
      const originalReject = reject;
      const wrappedResolve = (value) => {
        clearTimeout(timeoutId);
        originalResolve(value);
      };
      resolve = wrappedResolve;
      reject = (error) => {
        clearTimeout(timeoutId);
        originalReject(error);
      };
      console.log("🟢 [CreditCardService] Calling Spreedly.tokenizeCreditCard with:", cardData);
      window.Spreedly.tokenizeCreditCard(cardData);
    });
  }
  /**
   * Validate credit card form data
   */
  validateCreditCard(cardData) {
    const errors = {};
    let isValid = true;
    const monthFieldName = this.monthField?.getAttribute("data-next-checkout-field") || this.monthField?.getAttribute("os-checkout-field") || "cc-month";
    const yearFieldName = this.yearField?.getAttribute("data-next-checkout-field") || this.yearField?.getAttribute("os-checkout-field") || "cc-year";
    if (!cardData.month || cardData.month.trim() === "") {
      errors[monthFieldName] = "Expiration month is required";
      this.setCreditCardFieldError("month", "Expiration month is required");
      isValid = false;
    } else {
      const monthNum = parseInt(cardData.month, 10);
      if (monthNum < 1 || monthNum > 12) {
        errors[monthFieldName] = "Please select a valid month";
        this.setCreditCardFieldError("month", "Please select a valid month");
        isValid = false;
      } else {
        this.setCreditCardFieldValid("month");
      }
    }
    if (!cardData.year || cardData.year.trim() === "") {
      errors[yearFieldName] = "Expiration year is required";
      this.setCreditCardFieldError("year", "Expiration year is required");
      isValid = false;
    } else {
      const currentDate = /* @__PURE__ */ new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const yearNum = parseInt(cardData.year, 10);
      const fullYear = yearNum < 100 ? 2e3 + yearNum : yearNum;
      if (fullYear < currentYear || fullYear > currentYear + 20) {
        errors[yearFieldName] = "Please select a valid year";
        this.setCreditCardFieldError("year", "Please select a valid year");
        isValid = false;
      } else if (fullYear === currentYear && cardData.month) {
        const monthNum = parseInt(cardData.month, 10);
        if (monthNum < currentMonth) {
          errors[monthFieldName] = "Card has expired";
          errors[yearFieldName] = "Card has expired";
          this.setCreditCardFieldError("month", "Card has expired");
          this.setCreditCardFieldError("year", "Card has expired");
          isValid = false;
        } else {
          this.setCreditCardFieldValid("year");
        }
      } else {
        this.setCreditCardFieldValid("year");
      }
    }
    const result = { isValid };
    if (Object.keys(errors).length > 0) {
      result.errors = errors;
    }
    return result;
  }
  /**
   * Check if Spreedly fields are ready for validation
   */
  checkSpreedlyFieldsReady() {
    const errors = [];
    if (!this.validationState.number.isValid) {
      errors.push({ field: "number", message: "Please enter a valid credit card number" });
    }
    if (!this.validationState.cvv.isValid) {
      errors.push({ field: "cvv", message: "Please enter a valid CVV" });
    }
    return {
      hasEmptyFields: errors.length > 0,
      errors
    };
  }
  /**
   * Clear all credit card errors
   */
  clearAllErrors() {
    this.clearCreditCardFieldError("number");
    this.clearCreditCardFieldError("cvv");
    this.clearCreditCardFieldError("month");
    this.clearCreditCardFieldError("year");
    this.hidePaymentErrorContainers();
  }
  /**
   * Clear credit card fields
   */
  clearFields() {
    if (window.Spreedly && this.isReady) {
      try {
        window.Spreedly.reload();
        this.logger.debug("Spreedly fields reloaded");
      } catch (error) {
        this.logger.warn("Failed to reload Spreedly fields:", error);
      }
    }
    if (this.monthField instanceof HTMLSelectElement) {
      this.monthField.selectedIndex = 0;
    }
    if (this.yearField instanceof HTMLSelectElement) {
      this.yearField.selectedIndex = 0;
    }
    this.validationState = this.initializeValidationState();
    this.clearAllErrors();
  }
  hidePaymentErrorContainers() {
    const creditErrorContainer = document.querySelector('[data-next-component="credit-error"]');
    if (creditErrorContainer instanceof HTMLElement) {
      creditErrorContainer.style.display = "none";
      creditErrorContainer.classList.remove("visible");
    }
  }
  /**
   * Set callbacks
   */
  setOnReady(callback) {
    this.onReadyCallback = callback;
    if (this.isReady) callback();
  }
  setOnError(callback) {
    this.onErrorCallback = callback;
  }
  setOnToken(callback) {
    this.onTokenCallback = callback;
  }
  /**
   * Check if service is ready
   */
  get ready() {
    return this.isReady;
  }
  /**
   * Focus a specific Spreedly field
   */
  focusField(field) {
    if (window.Spreedly && this.isReady) {
      window.Spreedly.transferFocus(field);
      this.logger.debug(`Focusing ${field} field`);
    }
  }
  // Private methods
  initializeValidationState() {
    return {
      number: { isValid: false, hasError: false },
      cvv: { isValid: false, hasError: false },
      month: { isValid: false, hasError: false },
      year: { isValid: false, hasError: false }
    };
  }
  findCreditCardFields() {
    const numberField = FieldFinder.findField("cc-number") || document.getElementById("spreedly-number");
    if (numberField) {
      this.numberField = numberField;
    }
    const cvvField = FieldFinder.findField("cvv") || document.getElementById("spreedly-cvv");
    if (cvvField) {
      this.cvvField = cvvField;
    }
    const monthField = FieldFinder.findField("cc-month") || FieldFinder.findField("exp-month");
    if (monthField) {
      this.monthField = monthField;
    }
    const yearField = FieldFinder.findField("cc-year") || FieldFinder.findField("exp-year");
    if (yearField) {
      this.yearField = yearField;
    }
    this.logger.debug("Credit card fields found:", {
      number: !!this.numberField,
      cvv: !!this.cvvField,
      month: !!this.monthField,
      year: !!this.yearField
    });
  }
  async loadSpreedlyScript() {
    if (typeof window.Spreedly !== "undefined") {
      this.logger.debug("Spreedly already loaded");
      return;
    }
    this.logger.debug("Loading Spreedly script...");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://core.spreedly.com/iframe/iframe-v1.min.js";
      script.async = true;
      script.onload = () => {
        this.logger.debug("Spreedly script loaded");
        resolve();
      };
      script.onerror = () => {
        this.logger.error("Failed to load Spreedly script");
        reject(new Error("Failed to load Spreedly script"));
      };
      document.head.appendChild(script);
    });
  }
  setupSpreedly() {
    try {
      if (this.numberField) {
        this.numberField.id = "spreedly-number";
        this.numberField.setAttribute("data-spreedly", "number");
        this.numberField.style.transition = "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
      }
      if (this.cvvField) {
        this.cvvField.id = "spreedly-cvv";
        this.cvvField.setAttribute("data-spreedly", "cvv");
        this.cvvField.style.transition = "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
      }
      window.Spreedly.init(this.environmentKey, {
        "numberEl": "spreedly-number",
        "cvvEl": "spreedly-cvv"
      });
      this.setupSpreedlyEventListeners();
      this.setupFieldClickHandlers();
      this.addFocusStyles();
      this.logger.debug("Spreedly setup complete");
    } catch (error) {
      this.logger.error("Error setting up Spreedly:", error);
      throw error;
    }
  }
  addFocusStyles() {
    const styleId = "spreedly-focus-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        /* Spreedly field focus states */
        #spreedly-number.next-focused,
        #spreedly-number.has-focus,
        #spreedly-cvv.next-focused,
        #spreedly-cvv.has-focus {
          border-color: #80bdff !important;
          outline: 0 !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
        }
        
        /* Bootstrap-style focus */
        .form-control#spreedly-number.next-focused,
        .form-control#spreedly-number.has-focus,
        .form-control#spreedly-cvv.next-focused,
        .form-control#spreedly-cvv.has-focus {
          border-color: #80bdff !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
        }
        
        /* Parent container focus states */
        .frm-flds.next-focused,
        .form-group.next-focused,
        .field-group.next-focused {
          /* Add any parent-level focus styles here if needed */
        }
        
        /* Ensure smooth transitions */
        #spreedly-number,
        #spreedly-cvv {
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }
  setupFieldClickHandlers() {
    if (this.numberField) {
      const numberWrapper = this.numberField.closest(".frm-flds, .form-group, .form-field, .field-group") || this.numberField;
      numberWrapper.addEventListener("click", (event) => {
        const target = event.target;
        if (target.tagName !== "INPUT" && target.tagName !== "SELECT" && target.tagName !== "TEXTAREA") {
          if (window.Spreedly && this.isReady) {
            window.Spreedly.transferFocus("number");
            this.logger.debug("Transferring focus to credit card number field");
          }
        }
      });
      this.numberField.addEventListener("click", () => {
        if (window.Spreedly && this.isReady) {
          window.Spreedly.transferFocus("number");
        }
      });
    }
    if (this.cvvField) {
      const cvvWrapper = this.cvvField.closest(".frm-flds, .form-group, .form-field, .field-group") || this.cvvField;
      cvvWrapper.addEventListener("click", (event) => {
        const target = event.target;
        if (target.tagName !== "INPUT" && target.tagName !== "SELECT" && target.tagName !== "TEXTAREA") {
          if (window.Spreedly && this.isReady) {
            window.Spreedly.transferFocus("cvv");
            this.logger.debug("Transferring focus to CVV field");
          }
        }
      });
      this.cvvField.addEventListener("click", () => {
        if (window.Spreedly && this.isReady) {
          window.Spreedly.transferFocus("cvv");
        }
      });
    }
  }
  setupSpreedlyEventListeners() {
    window.Spreedly.on("ready", () => {
      this.logger.info("[Spreedly Event: ready] iFrame initialized and ready for configuration");
      this.applySpreedlyConfig();
      this.isReady = true;
      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
    });
    window.Spreedly.on("errors", (errors) => {
      this.logger.error("[Spreedly Event: errors] Tokenization failed:", errors.map((e) => ({
        attribute: e.attribute,
        key: e.key,
        message: e.message
      })));
      const errorMessages = errors.map((error) => {
        if (!error.message || error.message.trim() === "") {
          if (error.key === "errors.unexpected_error" || error.status === 0) {
            return "Unable to process payment. Please check your internet connection and try again.";
          }
          return "An error occurred processing your payment. Please try again.";
        }
        return error.message;
      });
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessages);
      }
      this.showSpreedlyErrors(errors);
    });
    window.Spreedly.on("paymentMethod", (token, pmData) => {
      this.logger.info("[Spreedly Event: paymentMethod] Successfully tokenized!", {
        token,
        last4: pmData.last_four_digits,
        cardType: pmData.card_type,
        fingerprint: pmData.fingerprint
      });
      this.clearAllErrors();
      if (this.onTokenCallback) {
        this.logger.debug("[Spreedly] Invoking token callback");
        this.onTokenCallback(token, pmData);
      } else {
        this.logger.error("[Spreedly] No onTokenCallback registered!");
      }
    });
    window.Spreedly.on("validation", (inputProperties) => {
      this.logger.info("[Spreedly Event: validation] Validation requested:", {
        cardType: inputProperties.cardType,
        validNumber: inputProperties.validNumber,
        validCvv: inputProperties.validCvv,
        numberLength: inputProperties.numberLength,
        cvvLength: inputProperties.cvvLength,
        iin: inputProperties.iin
      });
      if (inputProperties.validNumber !== void 0) {
        this.validationState.number.isValid = inputProperties.validNumber;
        this.validationState.number.hasError = !inputProperties.validNumber;
      }
      if (inputProperties.validCvv !== void 0) {
        this.validationState.cvv.isValid = inputProperties.validCvv;
        this.validationState.cvv.hasError = !inputProperties.validCvv;
      }
    });
    window.Spreedly.on("fieldEvent", (name, type, _activeEl, inputProperties) => {
      this.handleSpreedlyFieldEvent(name, type, inputProperties);
    });
    window.Spreedly.on("consoleError", (error) => {
      this.logger.error("[Spreedly Event: consoleError] Error from iFrame:", {
        message: error.msg,
        url: error.url,
        line: error.line,
        col: error.col
      });
    });
  }
  applySpreedlyConfig() {
    try {
      window.Spreedly.setFieldType("number", "text");
      window.Spreedly.setFieldType("cvv", "text");
      window.Spreedly.setNumberFormat("prettyFormat");
      window.Spreedly.setPlaceholder("number", "Card Number");
      window.Spreedly.setPlaceholder("cvv", "CVV *");
      const fieldStyle = 'color: #212529; font-size: .925rem; font-weight: 400; width: 100%; height:100%; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";';
      window.Spreedly.setStyle("number", fieldStyle);
      window.Spreedly.setStyle("cvv", fieldStyle);
      window.Spreedly.setRequiredAttribute("number");
      window.Spreedly.setRequiredAttribute("cvv");
      this.logger.debug("Spreedly configuration applied");
    } catch (error) {
      this.logger.error("Error applying Spreedly configuration:", error);
    }
  }
  handleSpreedlyFieldEvent(name, type, inputProperties) {
    if (type === "focus") {
      this.handleFieldFocus(name);
    } else if (type === "blur") {
      this.handleFieldBlur(name);
    }
    if (type === "input" && inputProperties) {
      if (name === "number" && inputProperties.validNumber !== void 0) {
        const wasValid = this.validationState.number.isValid;
        const hadError = this.validationState.number.hasError;
        this.validationState.number.isValid = inputProperties.validNumber;
        this.validationState.number.hasError = !inputProperties.validNumber;
        if (wasValid !== inputProperties.validNumber) {
          this.logger.info(`[Spreedly] Card number validation changed: ${wasValid} -> ${inputProperties.validNumber}`);
        }
        if (inputProperties.validNumber && (hadError || wasValid !== inputProperties.validNumber)) {
          this.logger.info("[Spreedly] Card number is now valid, clearing error");
          this.clearCreditCardFieldError("number");
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.clearError("cc-number");
          checkoutStore.clearError("card_number");
        } else if (!inputProperties.validNumber && wasValid) {
          this.logger.info("[Spreedly] Card number is now invalid, showing error");
          this.setCreditCardFieldError("number", "Please enter a valid credit card number");
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.setError("cc-number", "Please enter a valid credit card number");
        }
      } else if (name === "cvv" && inputProperties.validCvv !== void 0) {
        const wasValid = this.validationState.cvv.isValid;
        const hadError = this.validationState.cvv.hasError;
        this.validationState.cvv.isValid = inputProperties.validCvv;
        this.validationState.cvv.hasError = !inputProperties.validCvv;
        if (wasValid !== inputProperties.validCvv) {
          this.logger.info(`[Spreedly] CVV validation changed: ${wasValid} -> ${inputProperties.validCvv}`);
        }
        if (inputProperties.validCvv && (hadError || wasValid !== inputProperties.validCvv)) {
          this.logger.info("[Spreedly] CVV is now valid, clearing error");
          this.clearCreditCardFieldError("cvv");
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.clearError("cvv");
          checkoutStore.clearError("card_cvv");
        } else if (!inputProperties.validCvv && wasValid) {
          this.logger.info("[Spreedly] CVV is now invalid, showing error");
          this.setCreditCardFieldError("cvv", "Please enter a valid CVV");
          const checkoutStore = useCheckoutStore.getState();
          checkoutStore.setError("cvv", "Please enter a valid CVV");
        }
      }
    }
  }
  handleFieldFocus(fieldName) {
    const field = fieldName === "number" ? this.numberField : fieldName === "cvv" ? this.cvvField : null;
    if (field) {
      field.classList.add("next-focused", "has-focus");
      const wrapper = field.closest(".frm-flds, .form-group, .form-field, .field-group");
      if (wrapper) {
        wrapper.classList.add("next-focused", "has-focus");
      }
      const parentContainer = field.closest(".credit-card-field, .form-input-wrapper");
      if (parentContainer) {
        parentContainer.classList.add("next-focused", "has-focus");
      }
      this.logger.debug(`Field focused: ${fieldName}`);
    }
  }
  handleFieldBlur(fieldName) {
    const field = fieldName === "number" ? this.numberField : fieldName === "cvv" ? this.cvvField : null;
    if (field) {
      field.classList.remove("next-focused", "has-focus");
      const wrapper = field.closest(".frm-flds, .form-group, .form-field, .field-group");
      if (wrapper) {
        wrapper.classList.remove("next-focused", "has-focus");
      }
      const parentContainer = field.closest(".credit-card-field, .form-input-wrapper");
      if (parentContainer) {
        parentContainer.classList.remove("next-focused", "has-focus");
      }
      this.logger.debug(`Field blurred: ${fieldName}`);
    }
  }
  showSpreedlyErrors(errors) {
    this.logger.info("[Spreedly] Showing errors:", errors);
    const errorContainer = document.querySelector('[data-next-component="credit-error"]');
    if (errorContainer instanceof HTMLElement) {
      const messageElement = errorContainer.querySelector('[data-next-component="credit-error-text"]');
      if (messageElement) {
        const errorMessages = errors.map((e) => e.message).join(". ");
        messageElement.textContent = errorMessages;
        errorContainer.style.display = "flex";
        errorContainer.classList.add("visible");
        this.logger.debug("[Spreedly] Error displayed with message:", errorMessages);
        setTimeout(() => {
          if (errorContainer.style.display === "flex") {
            errorContainer.style.display = "none";
            errorContainer.classList.remove("visible");
            this.logger.debug("[Spreedly] Error auto-hidden after 10 seconds");
          }
        }, 1e4);
      }
    } else {
      this.logger.error("[Spreedly] Could not find error container to display errors");
    }
    errors.forEach((error) => {
      const fieldType = error.attribute;
      if (fieldType === "number" || fieldType === "card_number") {
        this.setCreditCardFieldError("number", error.message);
      } else if (fieldType === "cvv") {
        this.setCreditCardFieldError("cvv", error.message);
      }
    });
  }
  setCreditCardFieldValid(fieldType) {
    this.validationState[fieldType].isValid = true;
    this.validationState[fieldType].hasError = false;
    delete this.validationState[fieldType].errorMessage;
    const field = this.getFieldElement(fieldType);
    if (field) {
      field.classList.remove("has-error", "next-error-field");
      field.classList.add("no-error");
      const wrapper = FieldFinder.findFieldWrapper(field);
      if (wrapper) {
        wrapper.classList.remove("has-error", "addErrorIcon");
        wrapper.classList.add("addTick");
      }
    }
  }
  setCreditCardFieldError(fieldType, message) {
    this.validationState[fieldType].isValid = false;
    this.validationState[fieldType].hasError = true;
    this.validationState[fieldType].errorMessage = message;
    this.logger.debug(`[Spreedly] Setting error for field: ${fieldType} - ${message}`);
    let selector = null;
    if (fieldType === "number") {
      selector = '[data-next-checkout-field="cc-number"], #spreedly-number';
    } else if (fieldType === "cvv") {
      selector = '[data-next-checkout-field="cvv"], #spreedly-cvv';
    } else if (fieldType === "month") {
      selector = '[data-next-checkout-field="cc-month"], [data-next-checkout-field="exp-month"]';
    } else if (fieldType === "year") {
      selector = '[data-next-checkout-field="cc-year"], [data-next-checkout-field="exp-year"]';
    }
    if (!selector) {
      this.logger.warn(`[Spreedly] No selector found for field type: ${fieldType}`);
      return;
    }
    const fields = document.querySelectorAll(selector);
    fields.forEach((field) => {
      if (field instanceof HTMLElement) {
        field.classList.remove("no-error");
        field.classList.add("has-error", "next-error-field");
        const wrapper = field.closest(".form-group, .frm-flds, .field-group");
        if (wrapper) {
          wrapper.classList.remove("addTick");
          wrapper.classList.add("has-error", "addErrorIcon");
          const existingErrors = wrapper.querySelectorAll(".next-error-label");
          existingErrors.forEach((error) => error.remove());
          const errorElement = document.createElement("div");
          errorElement.className = "next-error-label";
          errorElement.setAttribute("role", "alert");
          errorElement.setAttribute("aria-live", "polite");
          errorElement.textContent = message;
          wrapper.appendChild(errorElement);
          this.logger.debug(`[Spreedly] Added error label: ${message}`);
        }
      }
    });
  }
  clearCreditCardFieldError(fieldType) {
    this.validationState[fieldType].hasError = false;
    delete this.validationState[fieldType].errorMessage;
    this.logger.debug(`[Spreedly] Clearing error for field: ${fieldType}`);
    let selector = null;
    if (fieldType === "number") {
      selector = '[data-next-checkout-field="cc-number"], #spreedly-number';
    } else if (fieldType === "cvv") {
      selector = '[data-next-checkout-field="cvv"], #spreedly-cvv';
    } else if (fieldType === "month") {
      selector = '[data-next-checkout-field="cc-month"], [data-next-checkout-field="exp-month"]';
    } else if (fieldType === "year") {
      selector = '[data-next-checkout-field="cc-year"], [data-next-checkout-field="exp-year"]';
    }
    if (!selector) {
      this.logger.warn(`[Spreedly] No selector found for field type: ${fieldType}`);
      return;
    }
    const fields = document.querySelectorAll(selector);
    fields.forEach((field) => {
      if (field instanceof HTMLElement) {
        field.classList.remove("has-error", "next-error-field");
        const wrapper = field.closest(".form-group, .frm-flds, .field-group");
        if (wrapper) {
          wrapper.classList.remove("has-error", "addErrorIcon");
          const errorLabels = wrapper.querySelectorAll('.next-error-label, .error-message, [role="alert"]');
          errorLabels.forEach((label) => {
            this.logger.debug(`[Spreedly] Removing error label: ${label.textContent}`);
            label.remove();
          });
        }
      }
    });
  }
  getFieldElement(fieldType) {
    switch (fieldType) {
      case "number":
        return this.numberField;
      case "cvv":
        return this.cvvField;
      case "month":
        return this.monthField;
      case "year":
        return this.yearField;
      default:
        return void 0;
    }
  }
  destroy() {
    this.clearAllErrors();
    this.isReady = false;
    delete this.onReadyCallback;
    delete this.onErrorCallback;
    delete this.onTokenCallback;
    this.logger.debug("CreditCardService destroyed");
  }
}
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  NAME: /^[A-Za-zÀ-ÿ]+(?:[' -][A-Za-zÀ-ÿ]+)*$/
};
class CheckoutValidator {
  constructor(logger, countryService, phoneInputManager) {
    this.rules = /* @__PURE__ */ new Map();
    this.errors = /* @__PURE__ */ new Map();
    this.logger = logger;
    this.countryService = countryService;
    this.phoneInputManager = phoneInputManager;
    this.errorManager = new ErrorDisplayManager();
    this.initializeValidationRules();
  }
  /**
   * Set credit card service for payment validation
   */
  setCreditCardService(creditCardService) {
    this.creditCardService = creditCardService;
  }
  /**
   * Set custom phone validator function
   */
  setPhoneValidator(validator) {
    this.phoneValidator = validator;
  }
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  initializeValidationRules() {
    const requiredRule = { type: "required", message: "This field is required" };
    const emailRule = { type: "email", message: "Please enter a valid email address" };
    const phoneRule = { type: "phone", message: "Please enter a valid phone number" };
    const nameRule = { type: "name", message: "Name can only contain letters, spaces, hyphens, and apostrophes" };
    this.rules.set("email", [requiredRule, emailRule]);
    this.rules.set("fname", [requiredRule, nameRule]);
    this.rules.set("lname", [requiredRule, nameRule]);
    this.rules.set("address1", [requiredRule]);
    this.rules.set("city", [requiredRule]);
    this.rules.set("postal", [requiredRule]);
    this.rules.set("country", [requiredRule]);
    this.rules.set("phone", [phoneRule]);
  }
  // ============================================================================
  // CORE VALIDATION METHODS
  // ============================================================================
  /**
   * Validate a single field based on its rules
   */
  validateField(name, value, context) {
    const rules = this.rules.get(name) || [];
    let isValid = true;
    let message;
    for (const rule of rules) {
      if (!this.applyRule(rule, value, context)) {
        message = rule.message || `${this.formatFieldName(name, context)} is invalid`;
        this.setError(name, message);
        isValid = false;
        break;
      }
    }
    if (isValid) {
      this.clearError(name);
    }
    const result = { isValid };
    if (message !== void 0) {
      result.message = message;
    }
    return result;
  }
  /**
   * Validate entire form including billing address if needed
   */
  async validateForm(formData, countryConfigs, currentCountryConfig, includePayment = false, billingAddress, sameAsShipping = true) {
    let isValid = true;
    let firstErrorField;
    const errors = {};
    const baseRequiredFields = ["email", "fname", "lname", "address1", "city"];
    const countryConfig = countryConfigs.get(formData.country);
    const requiredFields = [...baseRequiredFields];
    if (countryConfig?.stateRequired) {
      requiredFields.push("province");
    }
    requiredFields.push("postal", "country");
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        errors[field] = `${this.formatFieldName(field, currentCountryConfig)} is required`;
        if (!firstErrorField) {
          firstErrorField = field;
        }
        isValid = false;
      }
    });
    if (formData.fname && formData.fname.trim() && !this.isValidName(formData.fname)) {
      errors.fname = "First name can only contain letters, spaces, hyphens, and apostrophes";
      if (!firstErrorField) {
        firstErrorField = "fname";
      }
      isValid = false;
    }
    if (formData.lname && formData.lname.trim() && !this.isValidName(formData.lname)) {
      errors.lname = "Last name can only contain letters, spaces, hyphens, and apostrophes";
      if (!firstErrorField) {
        firstErrorField = "lname";
      }
      isValid = false;
    }
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      if (isValid) {
        firstErrorField = "email";
      }
      isValid = false;
    }
    if (formData.phone) {
      let phoneIsValid = false;
      if (this.phoneValidator) {
        phoneIsValid = this.phoneValidator(formData.phone, "shipping");
      } else if (this.phoneInputManager) {
        phoneIsValid = this.phoneInputManager.validatePhoneNumber(true);
        const formattedPhone = this.phoneInputManager.getFormattedPhoneNumber(true);
        if (formattedPhone) {
          formData.phone = formattedPhone;
        }
      } else {
        phoneIsValid = this.isValidPhone(formData.phone);
      }
      if (!phoneIsValid) {
        errors.phone = "Please enter a valid phone number";
        if (isValid) {
          firstErrorField = "phone";
        }
        isValid = false;
      }
    }
    if (formData.postal && formData.country) {
      const countryConfig2 = countryConfigs.get(formData.country);
      if (countryConfig2 && !this.countryService.validatePostalCode(formData.postal, formData.country, countryConfig2)) {
        const errorMsg = countryConfig2.postcodeExample ? `Please enter a valid ${countryConfig2.postcodeLabel.toLowerCase()} (e.g. ${countryConfig2.postcodeExample})` : `Please enter a valid ${countryConfig2.postcodeLabel.toLowerCase()}`;
        errors.postal = errorMsg;
        if (isValid) {
          firstErrorField = "postal";
        }
        isValid = false;
      }
    }
    if (includePayment) {
      const paymentMethod = formData.paymentMethod || "credit-card";
      if (paymentMethod === "credit-card" || paymentMethod === "card_token") {
        const cardData = {
          full_name: `${formData.fname || ""} ${formData.lname || ""}`.trim(),
          month: formData["exp-month"] || formData["cc-month"] || "",
          year: formData["exp-year"] || formData["cc-year"] || ""
        };
        if (this.creditCardService) {
          const spreedlyCheck = this.creditCardService.checkSpreedlyFieldsReady();
          if (spreedlyCheck.hasEmptyFields) {
            spreedlyCheck.errors.forEach((error) => {
              const fieldName = error.field === "number" ? "cc-number" : "cvv";
              errors[fieldName] = error.message;
              if (isValid && error.field === "number") {
                firstErrorField = "cc-number";
              } else if (isValid && !firstErrorField) {
                firstErrorField = fieldName;
              }
            });
            isValid = false;
          }
          const creditCardValidation = this.creditCardService.validateCreditCard(cardData);
          if (!creditCardValidation.isValid && creditCardValidation.errors) {
            Object.entries(creditCardValidation.errors).forEach(([field, error]) => {
              errors[field] = error;
              if (isValid) {
                firstErrorField = field;
                isValid = false;
              }
            });
          }
        }
      }
    }
    if (!sameAsShipping && billingAddress) {
      const billingErrors = this.validateBillingAddress(billingAddress, countryConfigs);
      Object.entries(billingErrors.errors).forEach(([field, error]) => {
        const fieldNameMap = {
          "first_name": "billing-fname",
          "last_name": "billing-lname",
          "address1": "billing-address1",
          "city": "billing-city",
          "province": "billing-province",
          "postal": "billing-postal",
          "country": "billing-country",
          "phone": "billing-phone"
        };
        const htmlFieldName = fieldNameMap[field] || `billing-${field}`;
        errors[htmlFieldName] = error;
        if (isValid) {
          firstErrorField = htmlFieldName;
          isValid = false;
        }
      });
      if (!billingErrors.isValid) {
        isValid = false;
      }
    }
    return {
      isValid,
      ...firstErrorField && { firstErrorField },
      errors
    };
  }
  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================
  applyRule(rule, value, context) {
    switch (rule.type) {
      case "required":
        return value !== null && value !== void 0 && value.toString().trim() !== "";
      case "email":
        return !value || this.isValidEmail(value);
      case "phone":
        if (!value) return true;
        if (this.phoneInputManager) {
          return this.phoneInputManager.validatePhoneNumber(true);
        } else {
          return this.isValidPhone(value);
        }
      case "name":
        return !value || this.isValidName(value);
      case "postal":
        if (!value || !context?.country) return true;
        const countryConfig = context.countryConfigs?.get(context.country);
        return !countryConfig || this.countryService.validatePostalCode(value, context.country, countryConfig);
      case "custom":
        return rule.validator ? rule.validator(value, context) : true;
      default:
        return true;
    }
  }
  isValidEmail(email) {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }
  isValidPhone(phone) {
    return VALIDATION_PATTERNS.PHONE.test(phone) && phone.replace(/\D/g, "").length >= 10;
  }
  isValidName(name) {
    return VALIDATION_PATTERNS.NAME.test(name.trim());
  }
  formatFieldName(field, currentCountryConfig) {
    const fieldNames = {
      fname: "First name",
      lname: "Last name",
      address1: "Address",
      address2: "Address line 2",
      city: "City",
      province: currentCountryConfig?.stateLabel || "State/Province",
      postal: currentCountryConfig?.postcodeLabel || "Postal code",
      country: "Country",
      email: "Email",
      phone: "Phone number"
    };
    return fieldNames[field] || field;
  }
  // ============================================================================
  // BILLING ADDRESS VALIDATION
  // ============================================================================
  validateBillingAddress(billingAddress, countryConfigs) {
    const errors = {};
    let isValid = true;
    const requiredBillingFields = ["first_name", "last_name", "address1", "city", "country"];
    const countryConfig = countryConfigs.get(billingAddress?.country);
    if (countryConfig?.stateRequired) {
      requiredBillingFields.push("province");
    }
    requiredBillingFields.push("postal");
    requiredBillingFields.forEach((field) => {
      const value = billingAddress?.[field];
      if (!value || value.trim() === "") {
        const fieldDisplayName = field === "first_name" ? "First name" : field === "last_name" ? "Last name" : field === "address1" ? "Address" : field === "city" ? "City" : field === "province" ? "State/Province" : field === "postal" ? "ZIP/Postal code" : field === "country" ? "Country" : field;
        errors[field] = `Billing ${fieldDisplayName.toLowerCase()} is required`;
        isValid = false;
      } else if ((field === "first_name" || field === "last_name") && value.trim()) {
        if (!this.isValidName(value)) {
          const fieldDisplayName = field === "first_name" ? "First name" : "Last name";
          errors[field] = `Billing ${fieldDisplayName.toLowerCase()} can only contain letters, spaces, hyphens, and apostrophes`;
          isValid = false;
        }
      }
    });
    if (billingAddress?.phone) {
      let phoneIsValid = false;
      if (this.phoneValidator) {
        phoneIsValid = this.phoneValidator(billingAddress.phone, "billing");
      } else {
        phoneIsValid = this.isValidPhone(billingAddress.phone);
      }
      if (!phoneIsValid) {
        errors.phone = "Please enter a valid billing phone number";
        isValid = false;
      }
    }
    if (billingAddress?.postal && billingAddress?.country) {
      const countryConfig2 = countryConfigs.get(billingAddress.country);
      if (countryConfig2 && !this.countryService.validatePostalCode(billingAddress.postal, billingAddress.country, countryConfig2)) {
        const errorMsg = countryConfig2.postcodeExample ? `Please enter a valid billing ${countryConfig2.postcodeLabel.toLowerCase()} (e.g. ${countryConfig2.postcodeExample})` : `Please enter a valid billing ${countryConfig2.postcodeLabel.toLowerCase()}`;
        errors.postal = errorMsg;
        isValid = false;
      }
    }
    return { isValid, errors };
  }
  // ============================================================================
  // ERROR MANAGEMENT
  // ============================================================================
  setError(fieldName, message) {
    this.errors.set(fieldName, message);
    this.showError(fieldName, message);
  }
  clearError(fieldName) {
    this.errors.delete(fieldName);
    this.hideError(fieldName);
  }
  clearAllErrors() {
    this.errors.clear();
    const fields = document.querySelectorAll("[data-next-checkout-field], [os-checkout-field]");
    fields.forEach((field) => {
      const fieldName = field.getAttribute("data-next-checkout-field") || field.getAttribute("os-checkout-field");
      if (fieldName) {
        this.hideError(fieldName);
      }
    });
    if (this.creditCardService) {
      this.creditCardService.clearAllErrors();
    }
  }
  showError(fieldName, message) {
    const field = this.findFormField(fieldName);
    if (!field) return;
    this.errorManager.showFieldError(field, message);
  }
  hideError(fieldName) {
    const field = this.findFormField(fieldName);
    if (!field) return;
    this.errorManager.clearFieldError(field);
    this.errorManager.showFieldValid(field);
  }
  findFormField(fieldName) {
    return FieldFinder.findField(fieldName);
  }
  // ============================================================================
  // FOCUS MANAGEMENT
  // ============================================================================
  focusFirstErrorField(firstErrorField) {
    if (!firstErrorField) return;
    const ccFields = ["cc-month", "cc-year", "number", "cvv", "exp-month", "exp-year"];
    if (ccFields.includes(firstErrorField)) {
      this.focusCreditCardErrorField(firstErrorField);
      return;
    }
    const field = this.findFormField(firstErrorField);
    if (field && "focus" in field) {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        field.focus();
      }, 800);
    }
  }
  focusCreditCardErrorField(fieldName) {
    if (fieldName === "cc-number" || fieldName === "number") {
      if (typeof window !== "undefined" && window.Spreedly) {
        window.Spreedly.transferFocus("number");
      }
    } else if (fieldName === "cvv") {
      if (typeof window !== "undefined" && window.Spreedly) {
        window.Spreedly.transferFocus("cvv");
      }
    } else {
      const field = this.findFormField(fieldName);
      if (field && "focus" in field) {
        field.focus();
      }
    }
  }
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  isValid() {
    return this.errors.size === 0;
  }
  destroy() {
    this.clearAllErrors();
    this.logger.debug("CheckoutValidator destroyed");
  }
}
class UIService {
  constructor(form, fields, logger, billingFields) {
    this.floatingLabels = /* @__PURE__ */ new Map();
    this.loadingStates = /* @__PURE__ */ new Map();
    this.lastErrorsString = "";
    this.form = form;
    this.fields = fields;
    this.logger = logger;
    if (billingFields) {
      this.billingFields = billingFields;
    }
    this.errorManager = new ErrorDisplayManager();
    this.eventManager = new EventHandlerManager();
  }
  /**
   * Initialize the UI service with all functionality
   */
  initialize() {
    this.initializeFloatingLabels();
    this.logger.debug("UIService initialized");
  }
  // ============================================================================
  // LOADING STATE MANAGEMENT
  // ============================================================================
  /**
   * Show loading state for a specific section
   */
  showLoading(section) {
    this.loadingStates.set(section, true);
    this.form.classList.add("next-processing");
    const sectionElement = this.form.querySelector(`[data-section="${section}"]`);
    if (sectionElement instanceof HTMLElement) {
      sectionElement.classList.add("next-loading");
    }
    this.logger.debug(`Showing loading state for section: ${section}`);
  }
  /**
   * Hide loading state for a specific section
   */
  hideLoading(section) {
    this.loadingStates.set(section, false);
    const hasActiveLoading = Array.from(this.loadingStates.values()).some((isLoading) => isLoading);
    if (!hasActiveLoading) {
      this.form.classList.remove("next-processing");
    }
    const sectionElement = this.form.querySelector(`[data-section="${section}"]`);
    if (sectionElement instanceof HTMLElement) {
      sectionElement.classList.remove("next-loading");
    }
    this.logger.debug(`Hiding loading state for section: ${section}`);
  }
  /**
   * Update progress indicator
   */
  updateProgress(step) {
    const progressBar = this.form.querySelector(".next-progress-bar");
    if (progressBar instanceof HTMLElement) {
      const progressFill = progressBar.querySelector(".next-progress-fill");
      if (progressFill instanceof HTMLElement) {
        const percentage = Math.min(100, Math.max(0, step * 25));
        progressFill.style.width = `${percentage}%`;
        progressFill.setAttribute("aria-valuenow", percentage.toString());
      }
    }
    this.logger.debug(`Updated progress to step: ${step}`);
  }
  // ============================================================================
  // ERROR MANAGEMENT
  // ============================================================================
  /**
   * Display form validation errors
   */
  displayErrors(errors, scrollToField) {
    this.errorManager.clearAllErrors(this.form);
    const filteredErrors = {};
    Object.entries(errors).forEach(([field, message]) => {
      if (field === "cc-number" || field === "cvv") {
        const spreedlyField = field === "cc-number" ? "spreedly-number" : "spreedly-cvv";
        const spreedlyElement = document.getElementById(spreedlyField);
        if (spreedlyElement && spreedlyElement.classList.contains("no-error")) {
          return;
        }
      }
      filteredErrors[field] = message;
    });
    Object.entries(filteredErrors).forEach(([fieldName, message]) => {
      let fieldElement = this.fields.get(fieldName);
      if (!fieldElement && fieldName.startsWith("billing-") && this.billingFields) {
        fieldElement = this.billingFields.get(fieldName);
      }
      if (fieldElement) {
        this.errorManager.showFieldError(fieldElement, message);
      } else {
        this.logger.warn(`Field element not found for error: ${fieldName}`);
      }
    });
    if (scrollToField) {
      this.focusFirstError(scrollToField);
    }
  }
  /**
   * Focus and scroll to the first error field
   */
  focusFirstError(fieldName) {
    let fieldElement = this.fields.get(fieldName);
    if (!fieldElement && fieldName.startsWith("billing-") && this.billingFields) {
      fieldElement = this.billingFields.get(fieldName);
    }
    if (!fieldElement) {
      this.logger.warn(`Field '${fieldName}' not found for scrolling`);
      return;
    }
    const scrollTarget = fieldElement.closest(".frm-flds") || fieldElement;
    const offset = 100;
    const elementRect = scrollTarget.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.scrollY;
    const scrollPosition = absoluteElementTop - offset;
    window.scrollTo({
      top: Math.max(0, scrollPosition),
      behavior: "smooth"
    });
    if (fieldElement instanceof HTMLInputElement || fieldElement instanceof HTMLSelectElement || fieldElement instanceof HTMLTextAreaElement) {
      setTimeout(() => {
        try {
          fieldElement.focus();
          fieldElement.style.outline = "2px solid #ff6b6b";
          fieldElement.style.outlineOffset = "2px";
          setTimeout(() => {
            fieldElement.style.outline = "";
            fieldElement.style.outlineOffset = "";
          }, 2e3);
        } catch (error) {
          this.logger.debug("Could not focus field after scroll:", error);
        }
      }, 300);
    }
    this.logger.debug(`Scrolled to field: ${fieldName}`);
  }
  /**
   * Update field state with visual indicators
   */
  updateFieldState(fieldName, state) {
    let fieldElement = this.fields.get(fieldName);
    if (!fieldElement && fieldName.startsWith("billing-") && this.billingFields) {
      fieldElement = this.billingFields.get(fieldName);
    }
    if (!fieldElement) {
      this.logger.warn(`Field '${fieldName}' not found for state update`);
      return;
    }
    fieldElement.classList.remove("next-error-field", "next-valid-field", "next-neutral-field");
    switch (state) {
      case "valid":
        fieldElement.classList.add("next-valid-field");
        break;
      case "invalid":
        fieldElement.classList.add("next-error-field");
        break;
      case "neutral":
        fieldElement.classList.add("next-neutral-field");
        break;
    }
    this.logger.debug(`Updated field ${fieldName} state to: ${state}`);
  }
  // ============================================================================
  // CHECKOUT STATE MANAGEMENT
  // ============================================================================
  /**
   * Handle checkout state updates
   */
  handleCheckoutUpdate(state, displayErrors) {
    const currentErrorsString = JSON.stringify(state.errors || {});
    if (currentErrorsString !== this.lastErrorsString) {
      this.lastErrorsString = currentErrorsString;
      if (state.errors && Object.keys(state.errors).length > 0) {
        displayErrors(state.errors);
      } else {
        displayErrors({});
      }
    }
    if (state.isProcessing) {
      this.showLoading("checkout");
    } else {
      this.hideLoading("checkout");
    }
  }
  /**
   * Handle cart state updates
   */
  handleCartUpdate(cartState) {
    if (cartState.isEmpty) {
      this.logger.warn("Cart is empty, redirecting to cart page");
    }
  }
  // ============================================================================
  // PAYMENT FORM MANAGEMENT
  // ============================================================================
  /**
   * Update payment form visibility based on selected payment method
   */
  updatePaymentFormVisibility(paymentMethod) {
    this.logger.debug("Updating payment form visibility for method:", paymentMethod);
    const paymentMethods = this.form.querySelectorAll("[data-next-payment-method]");
    paymentMethods.forEach((paymentMethodElement) => {
      if (paymentMethodElement instanceof HTMLElement) {
        const radio = paymentMethodElement.querySelector('input[type="radio"]');
        const paymentForm = paymentMethodElement.querySelector("[data-next-payment-form]");
        if (!(radio instanceof HTMLInputElement) || !(paymentForm instanceof HTMLElement)) {
          return;
        }
        if (radio && paymentForm) {
          const isSelected = radio.value === paymentMethod;
          this.logger.debug(`Payment method ${radio.value}: ${isSelected ? "selected" : "not selected"}`);
          if (isSelected) {
            paymentMethodElement.classList.add("next-selected");
            paymentForm.setAttribute("data-next-payment-state", "expanded");
            this.expandPaymentForm(paymentForm);
            this.clearPaymentFormErrors(paymentForm);
          } else {
            paymentMethodElement.classList.remove("next-selected");
            paymentForm.setAttribute("data-next-payment-state", "collapsed");
            this.collapsePaymentForm(paymentForm);
            this.clearPaymentFormErrors(paymentForm);
          }
        }
      }
    });
  }
  /**
   * Smoothly expand a payment form with animation
   */
  expandPaymentForm(paymentForm) {
    if (paymentForm.classList.contains("payment-method__form--expanded")) {
      return;
    }
    paymentForm.classList.remove("payment-method__form--collapsed");
    paymentForm.classList.add("payment-method__form--expanded");
    const startHeight = paymentForm.offsetHeight;
    const currentOverflow = paymentForm.style.overflow;
    paymentForm.style.overflow = "hidden";
    paymentForm.style.height = "auto";
    const targetHeight = paymentForm.scrollHeight;
    paymentForm.style.height = startHeight + "px";
    paymentForm.style.height = targetHeight + "px";
    setTimeout(() => {
      paymentForm.style.height = "";
      paymentForm.style.overflow = currentOverflow;
    }, 300);
    this.logger.debug("Expanded payment form");
  }
  /**
   * Smoothly collapse a payment form with animation
   */
  collapsePaymentForm(paymentForm) {
    if (paymentForm.classList.contains("payment-method__form--collapsed")) {
      return;
    }
    const currentHeight = paymentForm.scrollHeight;
    paymentForm.style.overflow = "hidden";
    paymentForm.style.height = currentHeight + "px";
    paymentForm.style.height = "0px";
    setTimeout(() => {
      paymentForm.classList.add("payment-method__form--collapsed");
      paymentForm.classList.remove("payment-method__form--expanded");
    }, 300);
    this.logger.debug("Collapsed payment form");
  }
  /**
   * Clear validation errors from a payment form when it's collapsed
   */
  clearPaymentFormErrors(paymentForm) {
    this.errorManager.clearAllErrors(paymentForm);
    const fields = paymentForm.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      field.classList.add("no-error");
    });
    this.logger.debug("Cleared payment form errors");
  }
  // ============================================================================
  // FLOATING LABEL MANAGEMENT
  // ============================================================================
  /**
   * Initialize floating labels for all form fields in the container
   */
  initializeFloatingLabels() {
    this.logger.debug("Initializing floating labels");
    const formGroups = this.form.querySelectorAll(".form-group");
    formGroups.forEach((formGroup) => {
      const label = formGroup.querySelector(".label-checkout");
      const input = formGroup.querySelector("input[data-next-checkout-field], input[os-checkout-field], select[data-next-checkout-field], select[os-checkout-field]");
      if (label instanceof HTMLLabelElement && (input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) {
        this.setupFloatingLabel(input, label);
      }
    });
    this.logger.debug(`Initialized ${this.floatingLabels.size} floating labels`);
    this.startPeriodicCheck();
  }
  /**
   * Set up floating label behavior for a specific field
   */
  setupFloatingLabel(field, label) {
    if (!label) {
      const formGroup = field.closest(".form-group");
      if (formGroup) {
        const labelElement = formGroup.querySelector(".label-checkout");
        if (labelElement instanceof HTMLLabelElement) {
          label = labelElement;
        }
      }
    }
    if (!label) {
      this.logger.warn("No label found for floating label setup");
      return;
    }
    this.floatingLabels.set(field, label);
    this.setupLabelStyles(label);
    this.setupFieldStyles(field);
    this.updateLabelState(field, label);
    this.eventManager.addHandler(field, "input", (e) => this.handleInput(e));
    this.eventManager.addHandler(field, "focus", (e) => this.handleFocus(e));
    this.eventManager.addHandler(field, "blur", (e) => this.handleBlur(e));
    this.eventManager.addHandler(field, "change", (e) => this.handleInput(e));
    this.eventManager.addHandler(field, "animationstart", (e) => this.handleAutofill(e));
    this.logger.debug("Set up floating label for field:", field.getAttribute("data-next-checkout-field") || field.name);
  }
  /**
   * Set up label positioning and transition styles
   */
  setupLabelStyles(label) {
    if (!label.style.transition) {
      label.style.transition = "all 0.15s ease-in-out";
    }
  }
  /**
   * Set up field styles to accommodate floating label
   */
  setupFieldStyles(field) {
    const formInput = field.closest(".form-input");
    if (formInput instanceof HTMLElement) {
      formInput.style.position = "relative";
    }
  }
  /**
   * Handle input events - triggered when user types
   */
  handleInput(event) {
    const field = event.target;
    const label = this.floatingLabels.get(field);
    if (label) {
      this.updateLabelState(field, label);
    }
  }
  /**
   * Handle focus events - triggered when field gains focus
   */
  handleFocus(event) {
    const field = event.target;
    const label = this.floatingLabels.get(field);
    if (label) {
      if (this.hasValue(field)) {
        this.floatLabelUp(label, field);
      }
    }
  }
  /**
   * Handle blur events - triggered when field loses focus
   */
  handleBlur(event) {
    const field = event.target;
    const label = this.floatingLabels.get(field);
    if (label) {
      this.updateLabelState(field, label);
    }
  }
  /**
   * Handle autofill detection - Chrome triggers animation when autofilling
   */
  handleAutofill(event) {
    const animationEvent = event;
    if (animationEvent.animationName === "autofill") {
      const field = event.target;
      const label = this.floatingLabels.get(field);
      if (label) {
        setTimeout(() => {
          this.updateLabelState(field, label);
        }, 100);
      }
    }
  }
  /**
   * Update label state based on field value
   */
  updateLabelState(field, label) {
    if (this.hasValue(field)) {
      this.floatLabelUp(label, field);
    } else {
      this.floatLabelDown(label, field);
    }
  }
  /**
   * Check if field has a value
   */
  hasValue(field) {
    if (field instanceof HTMLSelectElement) {
      return field.value !== "" && field.value !== field.querySelector("option")?.value;
    }
    return field.value.trim() !== "";
  }
  /**
   * Float label up (when field has value)
   */
  floatLabelUp(label, field) {
    if (label.classList.contains("has-value")) return;
    label.classList.add("has-value");
    field.style.paddingTop = "14px";
    this.logger.debug("Added has-value class for field:", field.getAttribute("data-next-checkout-field") || field.name);
  }
  /**
   * Float label down (when field is empty)
   */
  floatLabelDown(label, field) {
    if (!label.classList.contains("has-value")) return;
    label.classList.remove("has-value");
    field.style.paddingTop = "";
    this.logger.debug("Removed has-value class for field:", field.getAttribute("data-next-checkout-field") || field.name);
  }
  /**
   * Start periodic check for autocomplete detection (fallback method)
   */
  startPeriodicCheck() {
    this.periodicCheckInterval = window.setInterval(() => {
      this.checkAllFieldsForChanges();
    }, 500);
  }
  /**
   * Check all fields for value changes (autocomplete detection)
   */
  checkAllFieldsForChanges() {
    this.floatingLabels.forEach((label, field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        this.updateLabelState(field, label);
      }
    });
  }
  /**
   * Update floating labels when form data is populated programmatically
   */
  updateLabelsForPopulatedData() {
    this.floatingLabels.forEach((label, field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        this.updateLabelState(field, label);
      }
    });
    this.logger.debug("Updated all floating labels for populated data");
  }
  // ============================================================================
  // RESPONSIVE UI HANDLING
  // ============================================================================
  /**
   * Handle responsive UI adjustments
   */
  handleResponsiveUI() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    this.form.classList.toggle("next-mobile", isMobile);
    this.form.classList.toggle("next-tablet", isTablet);
    this.form.classList.toggle("next-desktop", !isMobile && !isTablet);
    if (isMobile) {
      this.floatingLabels.forEach((label, field) => {
        const focusHandler = () => {
          this.floatLabelUp(label, field);
        };
        field.addEventListener("focus", focusHandler);
      });
    }
    this.logger.debug(`Handled responsive UI adjustments for ${isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}`);
  }
  // ============================================================================
  // ACCESSIBILITY FEATURES
  // ============================================================================
  /**
   * Enhance accessibility features
   */
  enhanceAccessibility() {
    this.fields.forEach((field, fieldName) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        const errorElement = field.parentElement?.querySelector(".next-error-label");
        if (errorElement) {
          const errorId = `${fieldName}-error`;
          errorElement.id = errorId;
          field.setAttribute("aria-describedby", errorId);
          field.setAttribute("aria-invalid", "true");
        } else {
          field.removeAttribute("aria-describedby");
          field.setAttribute("aria-invalid", "false");
        }
        const isRequired = field.hasAttribute("required") || field.getAttribute("data-required") === "true";
        if (isRequired) {
          field.setAttribute("aria-required", "true");
        }
      }
    });
    this.logger.debug("Enhanced accessibility features");
  }
  // ============================================================================
  // CLEANUP AND DESTRUCTION
  // ============================================================================
  /**
   * Clean up event listeners and restore original state
   */
  destroy() {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
      delete this.periodicCheckInterval;
    }
    this.eventManager.removeAllHandlers();
    this.floatingLabels.clear();
    this.loadingStates.clear();
    this.logger.debug("UIService destroyed");
  }
}
class ProspectCartEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.config = {
      autoCreate: true,
      triggerOn: "emailEntry",
      emailField: "email",
      includeUtmData: true,
      sessionTimeout: 30
    };
    this.hasTriggered = false;
    this.updateTimeout = 0;
  }
  async initialize() {
    this.validateElement();
    this.logger.info("Initializing ProspectCartEnhancer", {
      element: this.element.tagName,
      config: this.config
    });
    const config = configStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    this.loadConfig();
    this.findEmailField();
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.setupTriggers();
    this.checkExistingProspectCart();
    this.logger.debug("ProspectCartEnhancer initialized", {
      emailFieldFound: !!this.emailField,
      triggerOn: this.config.triggerOn,
      autoCreate: this.config.autoCreate
    });
  }
  update(data) {
    if (data?.config) {
      this.config = { ...this.config, ...data.config };
      this.setupTriggers();
    }
  }
  loadConfig() {
    const configAttr = this.getAttribute("data-prospect-config");
    if (configAttr) {
      try {
        const customConfig = JSON.parse(configAttr);
        this.config = { ...this.config, ...customConfig };
      } catch (error) {
        this.logger.warn("Invalid prospect config JSON:", error);
      }
    }
    if (this.hasAttribute("data-auto-create")) {
      this.config.autoCreate = this.getAttribute("data-auto-create") !== "false";
    }
    if (this.hasAttribute("data-trigger-on")) {
      const triggerOn = this.getAttribute("data-trigger-on");
      if (triggerOn && (triggerOn === "formStart" || triggerOn === "emailEntry" || triggerOn === "manual")) {
        this.config.triggerOn = triggerOn;
      }
    }
    if (this.hasAttribute("data-email-field")) {
      const emailField = this.getAttribute("data-email-field");
      if (emailField) {
        this.config.emailField = emailField;
      }
    }
  }
  findEmailField() {
    const selectors = [
      '[data-next-checkout-field="email"]',
      '[os-checkout-field="email"]',
      `input[name="${this.config.emailField}"]`,
      'input[type="email"]',
      'input[data-field="email"]',
      'input[name*="email"]'
    ];
    for (const selector of selectors) {
      const field = this.element.querySelector(selector);
      if (field) {
        this.emailField = field;
        this.logger.debug("Found email field with selector:", selector);
        break;
      }
    }
    if (!this.emailField) {
      this.logger.warn("Email field not found for prospect cart");
    }
  }
  setupTriggers() {
    if (!this.config.autoCreate) return;
    switch (this.config.triggerOn) {
      case "formStart":
        this.setupFormStartTrigger();
        break;
      case "emailEntry":
        this.setupEmailEntryTrigger();
        break;
    }
  }
  setupFormStartTrigger() {
    const formFields = this.element.querySelectorAll("input, select, textarea");
    formFields.forEach((field) => {
      const handler = () => {
        if (!this.hasTriggered) {
          this.createProspectCart();
          this.hasTriggered = true;
        }
      };
      field.addEventListener("focus", handler, { once: true });
      field.addEventListener("input", handler, { once: true });
    });
  }
  setupEmailEntryTrigger() {
    if (!this.emailField) {
      this.logger.warn("Cannot setup email entry trigger - email field not found");
      return;
    }
    this.logger.debug("Setting up email entry trigger on field:", this.emailField);
    this.emailField.addEventListener("blur", () => {
      this.logger.debug("Email blur event triggered, value:", this.emailField.value);
      if (!this.hasTriggered && this.isValidEmail(this.emailField.value)) {
        this.logger.info("Valid email detected, creating prospect cart");
        this.createProspectCart();
        this.hasTriggered = true;
      }
    });
    let emailTimeout;
    this.emailField.addEventListener("input", () => {
      clearTimeout(emailTimeout);
      emailTimeout = window.setTimeout(() => {
        if (!this.hasTriggered && this.isValidEmail(this.emailField.value)) {
          this.createProspectCart();
          this.hasTriggered = true;
        }
      }, 2e3);
    });
  }
  checkExistingProspectCart() {
    const stored = sessionStorage.getItem("next_prospect_cart");
    if (stored) {
      try {
        const prospectCart = JSON.parse(stored);
        const expiresAt = new Date(prospectCart.expires_at);
        if (expiresAt > /* @__PURE__ */ new Date()) {
          this.prospectCart = prospectCart;
          this.logger.debug("Restored existing prospect cart:", prospectCart.id);
        } else {
          sessionStorage.removeItem("next_prospect_cart");
        }
      } catch (error) {
        this.logger.warn("Failed to parse stored prospect cart:", error);
        sessionStorage.removeItem("next_prospect_cart");
      }
    }
  }
  async createProspectCart() {
    if (this.prospectCart) {
      this.logger.debug("Prospect cart already exists");
      return;
    }
    this.logger.info("Starting prospect cart creation");
    try {
      const cartState = useCartStore.getState();
      const email = this.emailField?.value || "";
      this.logger.debug("Cart state:", {
        isEmpty: cartState.isEmpty,
        itemCount: cartState.items.length,
        items: cartState.items,
        email
      });
      if (cartState.isEmpty || cartState.items.length === 0) {
        this.logger.warn("No items in cart, skipping prospect cart creation");
        return;
      }
      const firstName = this.element.querySelector('[data-next-checkout-field="fname"], [os-checkout-field="fname"], input[name="first_name"]')?.value || "";
      const lastName = this.element.querySelector('[data-next-checkout-field="lname"], [os-checkout-field="lname"], input[name="last_name"]')?.value || "";
      const attribution = this.config.includeUtmData ? {
        ...this.collectUtmData(),
        ...cartState.attribution
      } : cartState.attribution || {};
      const user = {
        first_name: firstName,
        last_name: lastName,
        language: "en",
        accepts_marketing: false
      };
      if (email) {
        user.email = email;
      }
      const cartData = {
        lines: cartState.items.map((item) => ({
          package_id: item.packageId,
          quantity: item.quantity,
          is_upsell: item.is_upsell || false
        })),
        user
      };
      if (Object.keys(attribution).length > 0) {
        cartData.attribution = attribution;
      }
      const cart = await this.apiClient.createCart(cartData);
      this.prospectCart = {
        id: cart.checkout_url,
        // Use checkout URL as ID
        prospect_id: cart.checkout_url,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        expires_at: new Date(Date.now() + (this.config.sessionTimeout || 30) * 60 * 1e3).toISOString(),
        utm_data: this.collectUtmData(),
        cart_data: cart
      };
      if (email) {
        this.prospectCart.email = email;
      }
      sessionStorage.setItem("next_prospect_cart", JSON.stringify(this.prospectCart));
      this.emitProspectEvent("cart-created", { cart, prospectCart: this.prospectCart });
      this.logger.info("Prospect cart created with checkout URL:", cart.checkout_url);
    } catch (error) {
      this.logger.error("Failed to create prospect cart:", error);
    }
  }
  async updateProspectCart() {
    if (!this.prospectCart) return;
    this.logger.debug("Prospect cart update skipped - using standard cart API");
  }
  collectUtmData() {
    const params = new URLSearchParams(window.location.search);
    const utmData = {};
    const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    utmParams.forEach((param) => {
      const value = params.get(param);
      if (value) {
        utmData[param] = value;
      }
    });
    const storedUtm = sessionStorage.getItem("next_utm_data");
    if (storedUtm) {
      try {
        const stored = JSON.parse(storedUtm);
        Object.assign(utmData, stored);
      } catch (error) {
        this.logger.warn("Failed to parse stored UTM data:", error);
      }
    }
    if (Object.keys(utmData).length > 0) {
      sessionStorage.setItem("next_utm_data", JSON.stringify(utmData));
    }
    return utmData;
  }
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  handleCartUpdate(cartState) {
    if (this.prospectCart && !cartState.isEmpty) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = window.setTimeout(() => {
        this.updateProspectCart();
      }, 1e3);
    }
  }
  emitProspectEvent(type, data) {
    const event = new CustomEvent(`next:prospect-${type}`, {
      detail: data,
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }
  // Public API methods
  async createCartManually() {
    await this.createProspectCart();
    return this.prospectCart || null;
  }
  getCurrentProspectCart() {
    return this.prospectCart || null;
  }
  async abandonCart() {
    if (!this.prospectCart) return;
    this.emitProspectEvent("cart-abandoned", { prospectCart: this.prospectCart });
    sessionStorage.removeItem("next_prospect_cart");
    this.prospectCart = void 0;
    this.logger.info("Prospect cart marked as abandoned");
  }
  async convertCart() {
    if (!this.prospectCart) return;
    this.emitProspectEvent("cart-converted", { prospectCart: this.prospectCart });
    sessionStorage.removeItem("next_prospect_cart");
    this.prospectCart = void 0;
    this.logger.info("Prospect cart converted to order");
  }
  updateEmail(email) {
    if (this.emailField) {
      this.emailField.value = email;
    }
    if (!this.hasTriggered && this.isValidEmail(email)) {
      this.createProspectCart();
      this.hasTriggered = true;
    } else if (this.prospectCart) {
      this.updateProspectCart();
    }
  }
}
const FIELD_SELECTORS = ["[data-next-checkout-field]", "[os-checkout-field]"];
const BILLING_CONTAINER_SELECTOR = '[os-checkout-element="different-billing-address"], [data-next-component="different-billing-address"]';
const SHIPPING_FORM_SELECTOR = '[os-checkout-component="shipping-form"], [data-next-component="shipping-form"]';
const BILLING_FORM_CONTAINER_SELECTOR = '[os-checkout-component="billing-form"], [data-next-component="billing-form"]';
const PAYMENT_METHOD_MAP = {
  "credit": "credit-card",
  "paypal": "paypal",
  "apple-pay": "apple_pay",
  "google-pay": "google_pay"
};
const API_PAYMENT_METHOD_MAP = {
  "credit-card": "card_token",
  "card_token": "card_token",
  "paypal": "paypal",
  "apple_pay": "apple_pay",
  "google_pay": "google_pay"
};
const BILLING_ADDRESS_FIELD_MAP = {
  "fname": "first_name",
  "lname": "last_name",
  "address1": "address1",
  "address2": "address2",
  "city": "city",
  "province": "province",
  "postal": "postal",
  "country": "country",
  "phone": "phone"
};
class CheckoutFormEnhancer extends BaseEnhancer {
  constructor(element) {
    super(element);
    this.fields = /* @__PURE__ */ new Map();
    this.billingFields = /* @__PURE__ */ new Map();
    this.paymentButtons = /* @__PURE__ */ new Map();
    this.countries = [];
    this.countryConfigs = /* @__PURE__ */ new Map();
    this.detectedCountryCode = "US";
    this.phoneInputs = /* @__PURE__ */ new Map();
    this.isIntlTelInputAvailable = false;
    this.googleMapsLoaded = false;
    this.googleMapsLoading = false;
    this.googleMapsLoadPromise = null;
    this.autocompleteInstances = /* @__PURE__ */ new Map();
    this.enableAutocomplete = true;
    this.locationElements = null;
    this.locationFieldsShown = false;
    this.loadingOverlay = new LoadingOverlay();
  }
  async initialize() {
    this.validateElement();
    if (!(this.element instanceof HTMLFormElement)) {
      throw new Error("CheckoutFormEnhancer must be applied to a form element");
    }
    this.form = this.element;
    this.form.noValidate = true;
    this.loadingOverlay = new LoadingOverlay();
    const config = configStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    this.countryService = CountryService.getInstance();
    this.orderManager = new OrderManager(
      this.apiClient,
      this.logger,
      (event, data) => this.emit(event, data)
    );
    this.expressProcessor = new ExpressCheckoutProcessor(
      this.logger,
      () => this.loadingOverlay.show(),
      (immediate) => this.loadingOverlay.hide(immediate),
      (event, data) => this.emit(event, data),
      this.orderManager
    );
    this.isIntlTelInputAvailable = !!window.intlTelInput && !!window.intlTelInputUtils;
    this.validator = new CheckoutValidator(
      this.logger,
      this.countryService,
      void 0
      // PhoneInputManager will be handled by us
    );
    this.scanAllFields();
    const billingFormCloned = this.setupBillingForm();
    if (billingFormCloned) {
      this.scanBillingFields();
    }
    this.ui = new UIService(
      this.form,
      this.fields,
      this.logger,
      this.billingFields
    );
    this.ui.initialize();
    if (config.spreedlyEnvironmentKey) {
      await this.initializeCreditCard(config.spreedlyEnvironmentKey, config.debug);
    }
    await this.initializeAddressManagement(config);
    this.initializePhoneInputs();
    await this.initializeAddressAutocomplete();
    this.validator.setPhoneValidator((phoneNumber, type = "shipping") => {
      if (!this.isIntlTelInputAvailable) {
        return /^[\d\s\-\+\(\)]+$/.test(phoneNumber);
      }
      const instance = this.phoneInputs.get(type);
      if (instance) {
        return instance.isValidNumber();
      }
      return /^[\d\s\-\+\(\)]+$/.test(phoneNumber);
    });
    this.populateExpirationFields();
    this.setupEventHandlers();
    this.subscribe(useCheckoutStore, this.handleCheckoutUpdate.bind(this));
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.subscribe(configStore, this.handleConfigUpdate.bind(this));
    this.boundHandleTestDataFilled = this.handleTestDataFilled.bind(this);
    this.boundHandleKonamiActivation = this.handleKonamiActivation.bind(this);
    document.addEventListener("checkout:test-data-filled", this.boundHandleTestDataFilled);
    document.addEventListener("next:test-mode-activated", this.boundHandleKonamiActivation);
    this.populateFormData();
    this.initializeLocationFieldVisibility();
    await this.initializeProspectCart();
    this.eventBus.on("payment:error", (event) => {
      if (event.message) {
        this.displayPaymentError(event.message);
      }
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
        this.logger.info("Page restored from bfcache, resetting express checkout state");
        this.loadingOverlay.hide(true);
        const checkoutStore = useCheckoutStore.getState();
        if (checkoutStore.isProcessing) {
          this.logger.info("Resetting processing state after bfcache restore");
          checkoutStore.setProcessing(false);
        }
        if (checkoutStore.paymentMethod === "apple_pay" || checkoutStore.paymentMethod === "google_pay" || checkoutStore.paymentMethod === "paypal") {
          this.logger.info("Resetting payment method from", checkoutStore.paymentMethod, "to credit-card");
          checkoutStore.setPaymentMethod("credit-card");
          checkoutStore.setPaymentToken("");
        }
        if (this.creditCardService && config.spreedlyEnvironmentKey) {
          this.logger.info("Re-initializing credit card service after bfcache restore");
          this.creditCardService.initialize().catch((error) => {
            this.logger.error("Failed to re-initialize credit card service:", error);
          });
        }
        this.handlePurchaseEvent();
      }
    });
    this.handlePurchaseEvent();
    this.logger.debug("CheckoutFormEnhancer initialized");
    this.emit("checkout:form-initialized", { form: this.form });
  }
  // ============================================================================
  // FIELD SCANNING AND MANAGEMENT
  // ============================================================================
  scanAllFields() {
    FIELD_SELECTORS.forEach((selector) => {
      this.form.querySelectorAll(selector).forEach((element) => {
        const fieldName = element.getAttribute(selector.includes("data-next") ? "data-next-checkout-field" : "os-checkout-field");
        if (fieldName && element instanceof HTMLElement) {
          this.fields.set(fieldName, element);
        }
      });
    });
    const submitButton = this.form.querySelector('button[type="submit"]') || this.form.querySelector("[data-next-checkout-submit]") || this.form.querySelector("[os-checkout-submit]");
    if (submitButton instanceof HTMLButtonElement) {
      this.submitButton = submitButton;
      this.logger.debug("Found submit button:", submitButton);
    } else {
      this.logger.warn("Submit button not found in checkout form");
    }
    const paymentSelectors = [
      "[data-next-checkout-payment]",
      "[os-checkout-payment]"
    ];
    paymentSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const paymentMethod = element.getAttribute(selector.includes("data-next") ? "data-next-checkout-payment" : "os-checkout-payment");
        if (paymentMethod && element instanceof HTMLElement) {
          this.paymentButtons.set(paymentMethod, element);
        }
      });
    });
    this.scanExpirationFields();
  }
  scanBillingFields() {
    const billingSelectors = [
      '[os-checkout-field^="billing-"]',
      '[data-next-checkout-field^="billing-"]'
    ];
    billingSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const fieldName = element.getAttribute("os-checkout-field") || element.getAttribute("data-next-checkout-field");
        if (fieldName && element instanceof HTMLElement) {
          this.billingFields.set(fieldName, element);
        }
      });
    });
  }
  scanExpirationFields() {
    const monthSelectors = [
      '[data-next-checkout-field="cc-month"]',
      '[data-next-checkout-field="exp-month"]',
      '[os-checkout-field="cc-month"]',
      '[os-checkout-field="exp-month"]',
      "#credit_card_exp_month"
    ];
    const yearSelectors = [
      '[data-next-checkout-field="cc-year"]',
      '[data-next-checkout-field="exp-year"]',
      '[os-checkout-field="cc-year"]',
      '[os-checkout-field="exp-year"]',
      "#credit_card_exp_year"
    ];
    const monthField = monthSelectors.map((selector) => document.querySelector(selector)).find((element) => element !== null);
    const yearField = yearSelectors.map((selector) => document.querySelector(selector)).find((element) => element !== null);
    if (monthField) {
      const hasExpMonth = monthField.getAttribute("data-next-checkout-field") === "exp-month" || monthField.getAttribute("os-checkout-field") === "exp-month";
      if (hasExpMonth && !this.fields.has("exp-month")) {
        this.fields.set("exp-month", monthField);
      } else if (!hasExpMonth && !this.fields.has("cc-month") && !this.fields.has("exp-month")) {
        this.fields.set("cc-month", monthField);
      }
    }
    if (yearField) {
      const hasExpYear = yearField.getAttribute("data-next-checkout-field") === "exp-year" || yearField.getAttribute("os-checkout-field") === "exp-year";
      if (hasExpYear && !this.fields.has("exp-year")) {
        this.fields.set("exp-year", yearField);
      } else if (!hasExpYear && !this.fields.has("cc-year") && !this.fields.has("exp-year")) {
        this.fields.set("cc-year", yearField);
      }
    }
  }
  populateExpirationFields() {
    const monthField = this.fields.get("cc-month") || this.fields.get("exp-month");
    const yearField = this.fields.get("cc-year") || this.fields.get("exp-year");
    if (monthField instanceof HTMLSelectElement) {
      monthField.innerHTML = '<option value="">Month</option>';
      for (let i = 1; i <= 12; i++) {
        const month = i.toString().padStart(2, "0");
        const option = document.createElement("option");
        option.value = month;
        option.textContent = month;
        monthField.appendChild(option);
      }
    }
    if (yearField instanceof HTMLSelectElement) {
      yearField.innerHTML = '<option value="">Year</option>';
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      for (let i = 0; i < 20; i++) {
        const year = currentYear + i;
        const option = document.createElement("option");
        option.value = year.toString();
        option.textContent = year.toString();
        yearField.appendChild(option);
      }
    }
  }
  // ============================================================================
  // BILLING FORM MANAGEMENT
  // ============================================================================
  setupBillingForm() {
    const billingContainer = document.querySelector(BILLING_CONTAINER_SELECTOR);
    if (!billingContainer) return false;
    const shippingForm = document.querySelector(SHIPPING_FORM_SELECTOR);
    if (!shippingForm) return false;
    const billingFormContainer = billingContainer.querySelector(BILLING_FORM_CONTAINER_SELECTOR);
    if (!billingFormContainer) return false;
    const shippingFieldRows = shippingForm.querySelectorAll('[data-next-component="shipping-field-row"]');
    billingFormContainer.innerHTML = "";
    shippingFieldRows.forEach((row) => {
      const clonedRow = row.cloneNode(true);
      this.convertShippingFieldsToBilling(clonedRow);
      billingFormContainer.appendChild(clonedRow);
    });
    this.setInitialBillingFormState();
    return true;
  }
  convertShippingFieldsToBilling(billingForm) {
    billingForm.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
      heading.remove();
    });
    billingForm.querySelectorAll("[data-next-checkout-field]").forEach((field) => {
      const currentValue = field.getAttribute("data-next-checkout-field");
      if (currentValue && !currentValue.startsWith("billing-")) {
        field.setAttribute("data-next-checkout-field", `billing-${currentValue}`);
      }
    });
    billingForm.querySelectorAll("[os-checkout-field]").forEach((field) => {
      const currentValue = field.getAttribute("os-checkout-field");
      if (currentValue && !currentValue.startsWith("billing-")) {
        field.setAttribute("os-checkout-field", `billing-${currentValue}`);
      }
    });
    billingForm.querySelectorAll("input, select, textarea").forEach((field) => {
      const element = field;
      if (element.name && !element.name.startsWith("billing_")) {
        element.name = element.name.startsWith("shipping_") ? element.name.replace("shipping_", "billing_") : `billing_${element.name}`;
      }
      if (element.id && !element.id.startsWith("billing_")) {
        element.id = element.id.startsWith("shipping_") ? element.id.replace("shipping_", "billing_") : `billing_${element.id}`;
      }
      if (element.type === "checkbox" || element.type === "radio") {
        element.checked = false;
      } else {
        element.value = "";
      }
    });
  }
  setInitialBillingFormState() {
    const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
    const billingSection = document.querySelector(BILLING_CONTAINER_SELECTOR);
    if (billingToggle && billingSection) {
      if (billingToggle.checked) {
        this.collapseBillingForm(billingSection);
      } else {
        this.expandBillingForm(billingSection);
      }
    }
  }
  expandBillingForm(billingSection) {
    billingSection.style.transition = "none";
    billingSection.style.height = "auto";
    const fullHeight = billingSection.offsetHeight;
    billingSection.style.height = "0";
    billingSection.style.transition = "height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out";
    billingSection.style.height = `${fullHeight}px`;
    billingSection.style.padding = "20px 2px";
    billingSection.style.marginTop = "20px";
    billingSection.style.overflow = "visible";
    setTimeout(() => {
      billingSection.style.height = "auto";
    }, 300);
    billingSection.classList.add("billing-form-expanded");
    billingSection.classList.remove("billing-form-collapsed");
  }
  collapseBillingForm(billingSection) {
    const currentHeight = billingSection.offsetHeight;
    billingSection.style.height = `${currentHeight}px`;
    billingSection.style.overflow = "hidden";
    billingSection.style.transition = "height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out";
    billingSection.style.height = "0";
    billingSection.style.padding = "2px";
    billingSection.style.marginTop = "0";
    billingSection.classList.add("billing-form-collapsed");
    billingSection.classList.remove("billing-form-expanded");
  }
  // ============================================================================
  // GOOGLE MAPS LOADER METHODS
  // ============================================================================
  async loadGoogleMapsAPI() {
    const configStore$1 = configStore.getState();
    const googleMapsConfig = configStore$1.googleMapsConfig;
    if (googleMapsConfig.enableAutocomplete === false) {
      this.logger.debug("Google Maps Autocomplete is disabled in configuration");
      return;
    }
    if (!googleMapsConfig.apiKey) {
      this.logger.warn("Google Maps API key not found. Autocomplete will be disabled.");
      return;
    }
    if (this.googleMapsLoaded) {
      this.logger.debug("Google Maps API already loaded");
      return;
    }
    if (this.googleMapsLoading) {
      this.logger.debug("Google Maps API loading in progress, waiting...");
      return this.googleMapsLoadPromise;
    }
    this.googleMapsLoading = true;
    this.googleMapsLoadPromise = this.performGoogleMapsLoad(googleMapsConfig);
    try {
      await this.googleMapsLoadPromise;
      this.googleMapsLoaded = true;
      this.logger.info("Google Maps API loaded successfully");
    } catch (error) {
      this.logger.error("Failed to load Google Maps API:", error);
    } finally {
      this.googleMapsLoading = false;
    }
  }
  async performGoogleMapsLoad(config) {
    if (typeof window.google !== "undefined" && typeof window.google.maps !== "undefined") {
      this.logger.debug("Google Maps API already available");
      return;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const regionParam = config.region ? `&region=${config.region}` : "";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places${regionParam}&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = async () => {
        this.logger.debug("Google Maps API script loaded successfully");
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          if (typeof window.google !== "undefined" && typeof window.google.maps !== "undefined" && typeof window.google.maps.places !== "undefined" && typeof window.google.maps.places.Autocomplete !== "undefined") {
            this.logger.debug("Google Maps Places API fully initialized");
            resolve();
            return;
          }
          attempts++;
          this.logger.debug(`Waiting for Google Maps API to initialize... (attempt ${attempts}/${maxAttempts})`);
          await new Promise((r) => setTimeout(r, 100));
        }
        reject(new Error("Google Maps API not fully available after script load"));
      };
      script.onerror = () => {
        const error = new Error("Failed to load Google Maps API script");
        this.logger.error(error.message);
        reject(error);
      };
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        this.logger.debug("Google Maps script already in DOM, waiting for load...");
        if (typeof window.google !== "undefined" && typeof window.google.maps !== "undefined" && typeof window.google.maps.places !== "undefined" && typeof window.google.maps.places.Autocomplete !== "undefined") {
          resolve();
          return;
        }
        const waitForExisting = async () => {
          let attempts = 0;
          const maxAttempts = 10;
          while (attempts < maxAttempts) {
            if (typeof window.google !== "undefined" && typeof window.google.maps !== "undefined" && typeof window.google.maps.places !== "undefined" && typeof window.google.maps.places.Autocomplete !== "undefined") {
              this.logger.debug("Existing Google Maps script fully loaded");
              resolve();
              return;
            }
            attempts++;
            await new Promise((r) => setTimeout(r, 100));
          }
          reject(new Error("Existing Google Maps script failed to fully initialize"));
        };
        waitForExisting();
        return;
      }
      document.head.appendChild(script);
    });
  }
  isGoogleMapsLoaded() {
    return this.googleMapsLoaded && typeof window.google !== "undefined" && typeof window.google.maps !== "undefined";
  }
  isGoogleMapsPlacesAvailable() {
    return this.isGoogleMapsLoaded() && typeof window.google.maps.places !== "undefined" && typeof window.google.maps.places.Autocomplete !== "undefined";
  }
  // ============================================================================
  // ADDRESS AND COUNTRY MANAGEMENT
  // ============================================================================
  async initializeAddressManagement(config) {
    try {
      this.addClass("next-loading-countries");
      if (config.addressConfig) {
        this.countryService.setConfig(config.addressConfig);
      }
      const googleMapsConfig = config.googleMapsConfig || {};
      this.enableAutocomplete = googleMapsConfig.enableAutocomplete !== false && !!googleMapsConfig.apiKey;
      const locationData = await this.countryService.getLocationData();
      this.countries = locationData.countries;
      this.detectedCountryCode = locationData.detectedCountryCode;
      const countryField = this.fields.get("country");
      if (countryField instanceof HTMLSelectElement) {
        this.populateCountryDropdown(countryField, locationData.countries, locationData.detectedCountryCode);
        if (locationData.detectedCountryCode) {
          this.updateFormData({ country: locationData.detectedCountryCode });
          this.clearError("country");
        }
      }
      this.countryConfigs.set(locationData.detectedCountryCode, locationData.detectedCountryConfig);
      if (locationData.detectedCountryCode) {
        const provinceField = this.fields.get("province");
        if (provinceField instanceof HTMLSelectElement) {
          await this.updateStateOptions(locationData.detectedCountryCode, provinceField);
          this.currentCountryConfig = locationData.detectedCountryConfig;
        }
        this.updateFormLabels(locationData.detectedCountryConfig);
      }
      if (this.billingFields.size > 0) {
        this.populateBillingCountryDropdown();
      }
    } catch (error) {
      this.logger.error("Failed to load country data:", error);
    } finally {
      this.removeClass("next-loading-countries");
    }
  }
  populateCountryDropdown(countrySelect, countries, defaultCountry) {
    const firstOption = countrySelect.options[0];
    countrySelect.innerHTML = "";
    if (firstOption && !firstOption.value) {
      firstOption.disabled = true;
      countrySelect.appendChild(firstOption);
    }
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = country.name;
      if (country.code === defaultCountry) {
        option.selected = true;
      }
      countrySelect.appendChild(option);
    });
    if (defaultCountry) {
      countrySelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  populateBillingCountryDropdown() {
    const billingCountryField = this.billingFields.get("billing-country");
    if (!(billingCountryField instanceof HTMLSelectElement)) return;
    const firstOption = billingCountryField.options[0];
    billingCountryField.innerHTML = "";
    if (firstOption && !firstOption.value) {
      firstOption.disabled = true;
      billingCountryField.appendChild(firstOption);
    }
    this.countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = country.name;
      billingCountryField.appendChild(option);
    });
  }
  async updateStateOptions(country, provinceField) {
    provinceField.disabled = true;
    const originalHTML = provinceField.innerHTML;
    provinceField.innerHTML = '<option value="">Loading...</option>';
    try {
      const countryData = await this.countryService.getCountryStates(country);
      this.countryConfigs.set(country, countryData.countryConfig);
      this.currentCountryConfig = countryData.countryConfig;
      this.updateFormLabels(countryData.countryConfig);
      const hasStates = countryData.states && countryData.states.length > 0;
      const stateRequired = countryData.countryConfig.stateRequired;
      const provinceContainer = provinceField.closest(".frm-flds, .form-group, .form-field, .field-group") || provinceField.parentElement;
      if (!stateRequired && !hasStates) {
        if (provinceContainer) {
          provinceContainer.style.display = "none";
        }
        provinceField.removeAttribute("required");
        this.updateFormData({ province: "" });
        this.clearError("province");
        return;
      }
      if (provinceContainer) {
        provinceContainer.style.display = "";
      }
      provinceField.innerHTML = "";
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      provinceField.appendChild(placeholderOption);
      countryData.states.forEach((state) => {
        const option = document.createElement("option");
        option.value = state.code;
        option.textContent = state.name;
        provinceField.appendChild(option);
      });
      if (countryData.countryConfig.stateRequired) {
        provinceField.setAttribute("required", "required");
      } else {
        provinceField.removeAttribute("required");
      }
      this.updateFormData({ province: "" });
      this.clearError("province");
      provinceField.value = "";
      if (countryData.states.length > 0 && countryData.countryConfig.stateRequired) {
        const firstState = countryData.states[0];
        if (firstState) {
          provinceField.value = firstState.code;
          this.updateFormData({ province: firstState.code });
          this.clearError("province");
          provinceField.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    } catch (error) {
      this.logger.error("Failed to load states:", error);
      provinceField.innerHTML = originalHTML;
    } finally {
      provinceField.disabled = false;
    }
  }
  updateFormLabels(countryConfig) {
    const stateLabel = this.form.querySelector('label[for*="province"], label[for*="state"]');
    if (stateLabel) {
      const isRequired = countryConfig.stateRequired ? " *" : "";
      stateLabel.textContent = countryConfig.stateLabel + isRequired;
    }
    const postalLabel = this.form.querySelector('label[for*="postal"], label[for*="zip"]');
    if (postalLabel) {
      postalLabel.textContent = countryConfig.postcodeLabel + " *";
    }
    const postalField = this.fields.get("postal");
    if (postalField instanceof HTMLInputElement) {
      postalField.placeholder = countryConfig.postcodeLabel;
    }
  }
  updateBillingFormLabels(countryConfig) {
    const billingContainer = document.querySelector('[os-checkout-element="different-billing-address"]');
    if (!billingContainer) return;
    const billingStateLabel = billingContainer.querySelector('label[for*="billing"][for*="province"], label[for*="billing"][for*="state"]');
    if (billingStateLabel) {
      const isRequired = countryConfig.stateRequired ? " *" : "";
      billingStateLabel.textContent = `Billing ${countryConfig.stateLabel}${isRequired}`;
    }
    const billingPostalLabel = billingContainer.querySelector('label[for*="billing"][for*="postal"], label[for*="billing"][for*="zip"]');
    if (billingPostalLabel) {
      billingPostalLabel.textContent = `Billing ${countryConfig.postcodeLabel} *`;
    }
    const billingPostalField = this.billingFields.get("billing-postal");
    if (billingPostalField instanceof HTMLInputElement) {
      billingPostalField.placeholder = `Billing ${countryConfig.postcodeLabel}`;
    }
  }
  // ============================================================================
  // ADDRESS AUTOCOMPLETE MANAGEMENT
  // ============================================================================
  async initializeAddressAutocomplete() {
    if (!this.enableAutocomplete) {
      this.logger.debug("Google Maps autocomplete disabled, skipping initialization");
      return;
    }
    try {
      this.setupLazyAutocompleteLoading();
    } catch (error) {
      this.logger.error("Failed to initialize autocomplete:", error);
    }
  }
  setupLazyAutocompleteLoading() {
    const addressField = this.fields.get("address1");
    const billingAddressField = this.billingFields.get("billing-address1");
    let isLoading = false;
    let isLoaded = false;
    const loadAutocompleteOnFocus = async () => {
      if (isLoaded || isLoading) return;
      isLoading = true;
      this.logger.info("User focused on address field, loading Google Maps API...");
      try {
        await this.initializeGoogleMapsAutocomplete();
        isLoaded = true;
        if (addressField) {
          addressField.removeEventListener("focus", loadAutocompleteOnFocus);
        }
        if (billingAddressField) {
          billingAddressField.removeEventListener("focus", loadAutocompleteOnFocus);
        }
      } catch (error) {
        this.logger.error("Failed to load Google Maps on focus:", error);
      } finally {
        isLoading = false;
      }
    };
    if (addressField instanceof HTMLInputElement) {
      addressField.addEventListener("focus", loadAutocompleteOnFocus);
    }
    if (billingAddressField instanceof HTMLInputElement) {
      billingAddressField.addEventListener("focus", loadAutocompleteOnFocus);
    }
  }
  async initializeGoogleMapsAutocomplete() {
    try {
      await this.loadGoogleMapsAPI();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.logger.debug("Google Maps status:", {
        google: typeof window.google !== "undefined",
        maps: typeof window.google?.maps !== "undefined",
        places: typeof window.google?.maps?.places !== "undefined",
        Autocomplete: typeof window.google?.maps?.places?.Autocomplete !== "undefined"
      });
      if (!this.isGoogleMapsPlacesAvailable()) {
        this.logger.warn("Google Places API not available, skipping autocomplete setup");
        return;
      }
      this.logger.debug("Google Maps API loaded, setting up autocomplete");
      this.setupAutocomplete();
    } catch (error) {
      this.logger.warn("Failed to load Google Maps API:", error);
    }
  }
  setupAutocomplete() {
    const addressField = this.fields.get("address1");
    const billingAddressField = this.billingFields.get("billing-address1");
    const defaultCountry = this.detectedCountryCode || "US";
    if (addressField instanceof HTMLInputElement) {
      this.createAutocompleteInstance(
        addressField,
        "address1",
        defaultCountry,
        "shipping"
      );
    }
    if (billingAddressField instanceof HTMLInputElement) {
      this.createAutocompleteInstance(
        billingAddressField,
        "billing-address1",
        defaultCountry,
        "billing"
      );
    }
    this.setupAutocompleteCountryChangeListeners();
  }
  createAutocompleteInstance(input, fieldKey, defaultCountry, type) {
    try {
      const countryField = type === "shipping" ? this.fields.get("country") : this.billingFields.get("billing-country");
      const countryValue = countryField instanceof HTMLSelectElement && countryField.value ? countryField.value : defaultCountry;
      const options = {
        types: ["address"],
        fields: ["address_components", "formatted_address"],
        componentRestrictions: { country: countryValue }
      };
      if (!window.google?.maps?.places) {
        this.logger.warn("Google Maps Places API not loaded, skipping autocomplete initialization");
        return;
      }
      if (!window.google.maps.places.Autocomplete) {
        this.logger.warn("Google Maps Autocomplete API not available");
        return;
      }
      const autocomplete = new window.google.maps.places.Autocomplete(input, options);
      this.autocompleteInstances.set(fieldKey, autocomplete);
      this.logger.debug(`Autocomplete created for ${fieldKey}, restricted to: ${countryValue}`);
      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place || !place.address_components) {
          this.logger.debug("No valid place data returned from autocomplete");
          return;
        }
        await this.fillAddressFromAutocomplete(place, type);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      });
    } catch (error) {
      this.logger.error(`Failed to create autocomplete for ${fieldKey}:`, error);
    }
  }
  async fillAddressFromAutocomplete(place, type) {
    console.log("🔍 fillAddressFromAutocomplete called with place:", place, "type:", type);
    if (!place.address_components) return;
    const components = this.parseAddressComponents(place.address_components);
    if (!components) {
      this.logger.warn("Failed to parse address components");
      return;
    }
    const countryCode = components.country?.short;
    if (countryCode === "BR" || countryCode === "GB" || countryCode === "JP" || countryCode === "IN" || countryCode === "CA") {
      console.log(`🌍 Google Autocomplete selection for ${countryCode}:`, {
        country: countryCode,
        type,
        formatted_address: place.formatted_address,
        components: {
          street_number: components.street_number?.long,
          route: components.route?.long,
          locality: components.locality?.long,
          postal_town: components.postal_town?.long,
          sublocality: components.sublocality?.long,
          sublocality_level_1: components.sublocality_level_1?.long,
          sublocality_level_2: components.sublocality_level_2?.long,
          administrative_area_level_1: components.administrative_area_level_1?.long,
          administrative_area_level_2: components.administrative_area_level_2?.long,
          administrative_area_level_3: components.administrative_area_level_3?.long,
          administrative_area_level_4: components.administrative_area_level_4?.long,
          neighborhood: components.neighborhood?.long,
          postal_code: components.postal_code?.long,
          postal_code_suffix: components.postal_code_suffix?.long
        },
        all_types: Object.keys(components)
      });
    }
    const isShipping = type === "shipping";
    const fieldPrefix = isShipping ? "" : "billing-";
    const fieldMap = isShipping ? this.fields : this.billingFields;
    const checkoutStore = useCheckoutStore.getState();
    const addressField = fieldMap.get(`${fieldPrefix}address1`);
    if (addressField instanceof HTMLInputElement) {
      const streetNumber = components.street_number?.long || "";
      const route = components.route?.long || "";
      let addressValue = "";
      if (countryCode === "BR" && route && streetNumber) {
        addressValue = `${route}, ${streetNumber}`;
        if (components.sublocality_level_1) {
          addressValue += ` - ${components.sublocality_level_1.long}`;
        } else if (components.sublocality) {
          addressValue += ` - ${components.sublocality.long}`;
        }
      } else {
        addressValue = [streetNumber, route].filter(Boolean).join(" ");
      }
      addressField.value = addressValue;
      addressField.dispatchEvent(new Event("change", { bubbles: true }));
    }
    let parsedCity = "";
    let parsedState = "";
    if (countryCode === "BR" && place.formatted_address && (!components.administrative_area_level_2 || !components.administrative_area_level_1)) {
      const addressParts = place.formatted_address.split(",");
      if (addressParts.length >= 3) {
        const cityStatePart = addressParts[addressParts.length - 3]?.trim();
        if (cityStatePart && cityStatePart.includes(" - ")) {
          const [city, state] = cityStatePart.split(" - ").map((s) => s.trim());
          parsedCity = city || "";
          parsedState = state || "";
        }
      }
    }
    const cityField = fieldMap.get(`${fieldPrefix}city`);
    if (cityField instanceof HTMLInputElement) {
      let cityValue = "";
      if (countryCode === "BR") {
        if (components.administrative_area_level_2) {
          cityValue = components.administrative_area_level_2.long;
        } else if (parsedCity) {
          cityValue = parsedCity;
        }
      } else if (components.locality) {
        cityValue = components.locality.long;
      } else if (components.postal_town) {
        cityValue = components.postal_town.long;
      } else if (components.administrative_area_level_2) {
        cityValue = components.administrative_area_level_2.long;
      } else if (components.sublocality && countryCode !== "BR") {
        cityValue = components.sublocality.long;
      } else if (components.sublocality_level_1 && countryCode !== "BR") {
        cityValue = components.sublocality_level_1.long;
      }
      if (cityValue) {
        cityField.value = cityValue;
        cityField.dispatchEvent(new Event("change", { bubbles: true }));
        this.logger.debug(`City set to: ${cityValue} (type: ${components.locality ? "locality" : components.postal_town ? "postal_town" : components.sublocality ? "sublocality" : "sublocality_level_1"})`);
      } else {
        this.logger.warn("No suitable city component found in address");
      }
    }
    const zipField = fieldMap.get(`${fieldPrefix}postal`);
    if (zipField instanceof HTMLInputElement && components?.postal_code) {
      zipField.value = components.postal_code.long;
      zipField.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const countryField = fieldMap.get(`${fieldPrefix}country`);
    if (countryField instanceof HTMLSelectElement && components?.country) {
      const countryCode2 = components.country.short;
      if (countryField.value !== countryCode2) {
        countryField.value = countryCode2;
        countryField.dispatchEvent(new Event("change", { bubbles: true }));
        this.logger.debug(`Country set to ${countryCode2}`);
      }
      const stateField = fieldMap.get(`${fieldPrefix}province`);
      if (stateField instanceof HTMLSelectElement) {
        if (components?.administrative_area_level_1) {
          this.setStateWithRetry(stateField, components.administrative_area_level_1.short, fieldPrefix);
        } else if (countryCode2 === "BR" && parsedState) {
          this.setStateWithRetry(stateField, parsedState, fieldPrefix);
        }
      }
    }
    if (isShipping) {
      const updates = {};
      if (components.street_number || components.route) {
        const streetNumber = components.street_number?.long || "";
        const route = components.route?.long || "";
        let addressValue = "";
        if (countryCode === "BR" && route && streetNumber) {
          addressValue = `${route}, ${streetNumber}`;
          if (components.sublocality_level_1) {
            addressValue += ` - ${components.sublocality_level_1.long}`;
          } else if (components.sublocality) {
            addressValue += ` - ${components.sublocality.long}`;
          }
        } else {
          addressValue = [streetNumber, route].filter(Boolean).join(" ");
        }
        updates.address1 = addressValue;
      }
      if (countryCode === "BR" && components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.locality) {
        updates.city = components.locality.long;
      } else if (components.postal_town) {
        updates.city = components.postal_town.long;
      } else if (components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.sublocality && countryCode !== "BR") {
        updates.city = components.sublocality.long;
      } else if (components.sublocality_level_1) {
        updates.city = components.sublocality_level_1.long;
      }
      if (components.postal_code) updates.postal = components.postal_code.long;
      if (components.country) updates.country = components.country.short;
      if (components.administrative_area_level_1) updates.province = components.administrative_area_level_1.short;
      checkoutStore.updateFormData(updates);
    } else {
      const currentBillingData = checkoutStore.billingAddress || {
        first_name: "",
        last_name: "",
        address1: "",
        city: "",
        province: "",
        postal: "",
        country: "",
        phone: ""
      };
      const updates = { ...currentBillingData };
      if (components.street_number || components.route) {
        const streetNumber = components.street_number?.long || "";
        const route = components.route?.long || "";
        let addressValue = "";
        if (countryCode === "BR" && route && streetNumber) {
          addressValue = `${route}, ${streetNumber}`;
          if (components.sublocality_level_1) {
            addressValue += ` - ${components.sublocality_level_1.long}`;
          } else if (components.sublocality) {
            addressValue += ` - ${components.sublocality.long}`;
          }
        } else {
          addressValue = [streetNumber, route].filter(Boolean).join(" ");
        }
        updates.address1 = addressValue;
      }
      if (countryCode === "BR" && components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.locality) {
        updates.city = components.locality.long;
      } else if (components.postal_town) {
        updates.city = components.postal_town.long;
      } else if (components.administrative_area_level_2) {
        updates.city = components.administrative_area_level_2.long;
      } else if (components.sublocality && countryCode !== "BR") {
        updates.city = components.sublocality.long;
      } else if (components.sublocality_level_1) {
        updates.city = components.sublocality_level_1.long;
      }
      if (components.postal_code) updates.postal = components.postal_code.long;
      if (components.country) updates.country = components.country.short;
      if (components.administrative_area_level_1) updates.province = components.administrative_area_level_1.short;
      checkoutStore.setBillingAddress(updates);
    }
    this.emit("address:autocomplete-filled", {
      type,
      components
    });
  }
  parseAddressComponents(addressComponents) {
    const components = {};
    addressComponents.forEach((component) => {
      component.types.forEach((type) => {
        if (type !== "political") {
          components[type] = {
            long: component.long_name,
            short: component.short_name
          };
        }
      });
    });
    this.logger.debug("Parsed address components:", {
      availableTypes: Object.keys(components),
      cityRelatedComponents: {
        locality: components.locality?.long,
        postal_town: components.postal_town?.long,
        sublocality: components.sublocality?.long,
        sublocality_level_1: components.sublocality_level_1?.long
      },
      allComponents: components
    });
    return components;
  }
  async setStateWithRetry(stateSelect, stateCode, fieldPrefix, attempt = 0) {
    if (attempt >= 5) {
      this.logger.warn(`Failed to set state ${stateCode} after 5 attempts`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300 * Math.pow(1.5, attempt)));
    const hasOption = Array.from(stateSelect.options).some((opt) => opt.value === stateCode);
    if (hasOption) {
      stateSelect.value = stateCode;
      stateSelect.dispatchEvent(new Event("change", { bubbles: true }));
      this.logger.debug(`State set to ${stateCode}`);
    } else {
      this.setStateWithRetry(stateSelect, stateCode, fieldPrefix, attempt + 1);
    }
  }
  setupAutocompleteCountryChangeListeners() {
    const shippingCountryField = this.fields.get("country");
    if (shippingCountryField instanceof HTMLSelectElement) {
      shippingCountryField.addEventListener("change", () => {
        const autocomplete = this.autocompleteInstances.get("address1");
        const countryValue = shippingCountryField.value;
        if (autocomplete && countryValue && countryValue.length === 2) {
          if (autocomplete.setComponentRestrictions) {
            autocomplete.setComponentRestrictions({ country: countryValue });
          }
          this.logger.debug(`Shipping autocomplete restricted to: ${countryValue}`);
        }
      });
    }
    const billingCountryField = this.billingFields.get("billing-country");
    if (billingCountryField instanceof HTMLSelectElement) {
      billingCountryField.addEventListener("change", () => {
        const autocomplete = this.autocompleteInstances.get("billing-address1");
        const countryValue = billingCountryField.value;
        if (autocomplete && countryValue && countryValue.length === 2) {
          if (autocomplete.setComponentRestrictions) {
            autocomplete.setComponentRestrictions({ country: countryValue });
          }
          this.logger.debug(`Billing autocomplete restricted to: ${countryValue}`);
        }
      });
    }
  }
  // ============================================================================
  // LOCATION FIELD VISIBILITY MANAGEMENT
  // ============================================================================
  initializeLocationFieldVisibility() {
    this.locationElements = this.form.querySelectorAll('[data-next-component="location"], [data-next-component-location="location"]');
    if (!this.locationElements || this.locationElements.length === 0) {
      this.logger.debug("No location elements found");
      return;
    }
    this.hideLocationFields();
    const addressField = this.fields.get("address1");
    if (addressField instanceof HTMLInputElement) {
      addressField.addEventListener("input", this.handleAddressInput.bind(this));
      addressField.addEventListener("change", this.handleAddressInput.bind(this));
      addressField.addEventListener("blur", this.handleAddressInput.bind(this));
      if (addressField.value && addressField.value.trim().length > 0) {
        this.showLocationFields();
      }
    }
    this.eventBus.on("address:autocomplete-filled", (event) => {
      if (event.type === "shipping") {
        this.showLocationFields();
      }
    });
    const checkoutStore = useCheckoutStore.getState();
    if (checkoutStore.formData.address1 && checkoutStore.formData.address1.trim().length > 0) {
      this.showLocationFields();
    }
    this.logger.debug("Location field visibility initialized", {
      locationElementsCount: this.locationElements.length
    });
  }
  handleAddressInput(event) {
    const field = event.target;
    if (field.value && field.value.trim().length > 0) {
      this.showLocationFields();
    }
  }
  hideLocationFields() {
    if (!this.locationElements) return;
    this.locationElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.display = "none";
        el.classList.add("next-location-hidden");
      }
    });
    this.locationFieldsShown = false;
    this.logger.debug("Location fields hidden");
  }
  showLocationFields() {
    if (this.locationFieldsShown || !this.locationElements) return;
    this.locationElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.display = "flex";
        el.classList.remove("next-location-hidden");
      }
    });
    this.locationFieldsShown = true;
    this.eventBus.emit("checkout:location-fields-shown", {});
    this.form.dispatchEvent(new CustomEvent("checkout:location-fields-shown"));
    this.logger.debug("Location fields shown");
  }
  // ============================================================================
  // PROSPECT CART MANAGEMENT
  // ============================================================================
  async initializeProspectCart() {
    try {
      this.prospectCartEnhancer = new ProspectCartEnhancer(this.form);
      await this.prospectCartEnhancer.initialize();
      this.form.addEventListener("next:prospect-cart-created", (event) => {
        const customEvent = event;
        this.logger.info("Prospect cart created", customEvent.detail);
      });
      this.form.addEventListener("next:prospect-cart-abandoned", (event) => {
        const customEvent = event;
        this.logger.info("Prospect cart abandoned", customEvent.detail);
      });
      this.logger.debug("ProspectCartEnhancer initialized");
    } catch (error) {
      this.logger.warn("Failed to initialize ProspectCartEnhancer:", error);
    }
  }
  // ============================================================================
  // PHONE INPUT MANAGEMENT
  // ============================================================================
  initializePhoneInputs() {
    if (!this.isIntlTelInputAvailable) return;
    const shippingPhoneField = this.fields.get("phone");
    const billingPhoneField = this.billingFields.get("billing-phone");
    if (shippingPhoneField instanceof HTMLInputElement) {
      this.initializePhoneInput("shipping", shippingPhoneField);
    }
    if (billingPhoneField instanceof HTMLInputElement) {
      this.initializePhoneInput("billing", billingPhoneField);
    }
  }
  initializePhoneInput(type, phoneField) {
    try {
      const existingInstance = this.phoneInputs.get(type);
      if (existingInstance) {
        existingInstance.destroy();
      }
      const countryFieldName = type === "shipping" ? "country" : "billing-country";
      const countryField = type === "shipping" ? this.fields.get(countryFieldName) : this.billingFields.get(countryFieldName);
      const initialCountry = countryField instanceof HTMLSelectElement && countryField.value ? countryField.value.toLowerCase() : this.detectedCountryCode.toLowerCase();
      const isRequired = phoneField.getAttribute("data-next-required") === "true" || phoneField.hasAttribute("required");
      phoneField.placeholder = isRequired ? "Phone*" : "Phone (Optional)";
      const instance = window.intlTelInput(phoneField, {
        separateDialCode: false,
        nationalMode: true,
        autoPlaceholder: "off",
        // Turn off auto placeholder to use our custom one
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        preferredCountries: ["us", "ca", "gb", "au"],
        allowDropdown: false,
        initialCountry,
        formatOnDisplay: true
      });
      this.phoneInputs.set(type, instance);
      phoneField.addEventListener("input", () => {
        if (instance && window.intlTelInputUtils) {
          const currentValue = phoneField.value;
          const countryData = instance.getSelectedCountryData();
          if (currentValue && countryData.iso2) {
            const formattedNumber = window.intlTelInputUtils.formatNumber(
              currentValue,
              countryData.iso2,
              window.intlTelInputUtils.numberFormat.NATIONAL
            );
            if (formattedNumber !== currentValue) {
              const cursorPosition = phoneField.selectionStart || 0;
              const oldLength = currentValue.length;
              const newLength = formattedNumber.length;
              phoneField.value = formattedNumber;
              const newCursorPosition = cursorPosition + (newLength - oldLength);
              phoneField.setSelectionRange(newCursorPosition, newCursorPosition);
            }
          }
          const fullNumber = instance.getNumber();
          if (type === "shipping") {
            this.updateFormData({ phone: fullNumber });
          } else {
            const checkoutStore = useCheckoutStore.getState();
            const currentBillingData = checkoutStore.billingAddress || {
              first_name: "",
              last_name: "",
              address1: "",
              city: "",
              province: "",
              postal: "",
              country: "",
              phone: ""
            };
            checkoutStore.setBillingAddress({ ...currentBillingData, phone: fullNumber });
          }
        }
      });
      phoneField.addEventListener("blur", () => {
        if (instance && window.intlTelInputUtils) {
          const countryData = instance.getSelectedCountryData();
          const currentValue = phoneField.value;
          if (currentValue && countryData.iso2) {
            const formattedNumber = window.intlTelInputUtils.formatNumber(
              currentValue,
              countryData.iso2,
              window.intlTelInputUtils.numberFormat.NATIONAL
            );
            phoneField.value = formattedNumber;
          }
        }
      });
      if (countryField instanceof HTMLSelectElement) {
        const updatePhoneCountry = () => {
          const countryCode = countryField.value;
          if (countryCode && instance) {
            instance.setCountry(countryCode.toLowerCase());
          }
        };
        countryField.addEventListener("change", updatePhoneCountry);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize ${type} phone field:`, error);
    }
  }
  // ============================================================================
  // CREDIT CARD MANAGEMENT
  // ============================================================================
  async initializeCreditCard(environmentKey, _debug) {
    try {
      this.addClass("next-loading-spreedly");
      this.creditCardService = new CreditCardService(environmentKey);
      this.creditCardService.setOnReady(() => {
        this.removeClass("next-loading-spreedly");
        this.emit("checkout:spreedly-ready", {});
        this.logger.debug("[Spreedly] Credit card service ready");
      });
      this.creditCardService.setOnError((errors) => {
        this.logger.warn("[Spreedly] Credit card validation errors:", errors);
        this.emit("payment:error", { errors });
        if (errors && errors.length > 0) {
          const errorMessage = errors.map((err) => err.message || err).join(". ");
          this.displayPaymentError(errorMessage);
        }
      });
      this.creditCardService.setOnToken((token, pmData) => {
        this.logger.info("[Spreedly] Payment token received:", { token, pmData });
        this.handleTokenizedPayment(token, pmData);
      });
      await this.creditCardService.initialize();
      this.validator.setCreditCardService(this.creditCardService);
    } catch (error) {
      this.logger.error("Failed to initialize credit card service:", error);
      this.removeClass("next-loading-spreedly");
      throw error;
    }
  }
  // ============================================================================
  // FORM CLEARING
  // ============================================================================
  clearAllCheckoutFields() {
    try {
      this.fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          if (field.type === "checkbox" || field.type === "radio") {
            field.checked = false;
          } else {
            field.value = "";
          }
        } else if (field instanceof HTMLSelectElement) {
          field.selectedIndex = 0;
        }
      });
      this.billingFields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          if (field.type === "checkbox" || field.type === "radio") {
            field.checked = false;
          } else {
            field.value = "";
          }
        } else if (field instanceof HTMLSelectElement) {
          field.selectedIndex = 0;
        }
      });
      if (this.creditCardService && typeof this.creditCardService.clearFields === "function") {
        this.creditCardService.clearFields();
      }
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.reset();
      checkoutStore.clearAllErrors();
      const countryField = this.fields.get("country");
      if (countryField instanceof HTMLSelectElement && this.detectedCountryCode) {
        countryField.value = this.detectedCountryCode;
        countryField.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
      if (billingToggle) {
        billingToggle.checked = true;
        billingToggle.dispatchEvent(new Event("change", { bubbles: true }));
      }
      this.logger.info("All checkout fields cleared");
    } catch (error) {
      this.logger.error("Error clearing checkout fields:", error);
    }
  }
  // ============================================================================
  // PURCHASE EVENT HANDLING
  // ============================================================================
  async handlePurchaseEvent() {
    const orderDataStr = sessionStorage.getItem("next-order");
    if (!orderDataStr) return;
    try {
      const orderData = JSON.parse(orderDataStr);
      const order = orderData?.state?.order;
      if (!order?.ref_id || !order?.number) return;
      const shownOrdersStr = sessionStorage.getItem("next-shown-order-warnings");
      const shownOrders = shownOrdersStr ? JSON.parse(shownOrdersStr) : [];
      if (shownOrders.includes(order.ref_id)) {
        this.logger.debug("Already shown warning for order", order.ref_id);
        return;
      }
      this.logger.info("Fresh purchase detected, showing attention modal", {
        orderNumber: order.number,
        refId: order.ref_id
      });
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
      const action = await GeneralModal.show({
        title: "Attention",
        content: "Your initial order has been successfully processed. Please check your email for the order confirmation. Entering your payment details again will result in a secondary purchase.",
        buttons: [
          { text: "Close", action: "cancel" },
          { text: "Back", action: "confirm" }
        ],
        className: "purchase-warning-modal"
      });
      shownOrders.push(order.ref_id);
      sessionStorage.setItem("next-shown-order-warnings", JSON.stringify(shownOrders));
      if (action === "confirm") {
        const successUrl = this.getSuccessUrl();
        if (successUrl) {
          const url = new URL(successUrl, window.location.origin);
          if (!url.searchParams.has("ref_id") && order.ref_id) {
            url.searchParams.set("ref_id", order.ref_id);
          }
          window.location.href = url.href;
        }
      } else {
        this.populateFormData();
        if (this.ui) {
          this.ui.hideLoading("checkout");
        }
        this.clearAllCheckoutFields();
      }
    } catch (error) {
      this.logger.error("Failed to parse order data from sessionStorage:", error);
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
    }
  }
  // ============================================================================
  // ORDER MANAGEMENT
  // ============================================================================
  buildOrderData(checkoutStore, cartStore) {
    const shippingAddress = {
      first_name: checkoutStore.formData.fname || "",
      last_name: checkoutStore.formData.lname || "",
      line1: checkoutStore.formData.address1 || "",
      line2: checkoutStore.formData.address2,
      line4: checkoutStore.formData.city || "",
      state: checkoutStore.formData.province,
      postcode: checkoutStore.formData.postal,
      country: checkoutStore.formData.country || "",
      phone_number: checkoutStore.formData.phone
    };
    let billingAddressData;
    if (!checkoutStore.sameAsShipping && checkoutStore.billingAddress) {
      billingAddressData = {
        first_name: checkoutStore.billingAddress.first_name || "",
        last_name: checkoutStore.billingAddress.last_name || "",
        line1: checkoutStore.billingAddress.address1 || "",
        line4: checkoutStore.billingAddress.city || "",
        country: checkoutStore.billingAddress.country || "",
        ...checkoutStore.billingAddress.address2 && { line2: checkoutStore.billingAddress.address2 },
        ...checkoutStore.billingAddress.province && { state: checkoutStore.billingAddress.province },
        ...checkoutStore.billingAddress.postal && { postcode: checkoutStore.billingAddress.postal },
        ...checkoutStore.billingAddress.phone && { phone_number: checkoutStore.billingAddress.phone }
      };
    }
    const payment = {
      payment_method: API_PAYMENT_METHOD_MAP[checkoutStore.paymentMethod] || "card_token",
      ...checkoutStore.paymentToken && { card_token: checkoutStore.paymentToken }
    };
    const attributionStore = useAttributionStore.getState();
    const attribution = attributionStore.getAttributionForApi();
    return {
      lines: cartStore.items.map((item) => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: false
      })),
      shipping_address: shippingAddress,
      ...billingAddressData && { billing_address: billingAddressData },
      billing_same_as_shipping_address: checkoutStore.sameAsShipping,
      shipping_method: checkoutStore.shippingMethod?.id || 1,
      payment_detail: payment,
      user: {
        email: checkoutStore.formData.email,
        first_name: checkoutStore.formData.fname || "",
        last_name: checkoutStore.formData.lname || "",
        language: "en",
        phone_number: checkoutStore.formData.phone,
        accepts_marketing: checkoutStore.formData.accepts_marketing || false
      },
      vouchers: checkoutStore.vouchers || [],
      attribution,
      success_url: this.getSuccessUrl(),
      payment_failed_url: this.getFailureUrl()
    };
  }
  async createOrder() {
    const checkoutStore = useCheckoutStore.getState();
    const cartStore = useCartStore.getState();
    try {
      if (!checkoutStore.formData.email || !checkoutStore.formData.fname || !checkoutStore.formData.lname) {
        throw new Error("Missing required customer information");
      }
      if (cartStore.items.length === 0) {
        throw new Error("Cannot create order with empty cart");
      }
      if ((checkoutStore.paymentMethod === "credit-card" || checkoutStore.paymentMethod === "card_token") && !checkoutStore.paymentToken) {
        throw new Error("Payment token is required for credit card payments");
      }
      const orderData = this.buildOrderData(checkoutStore, cartStore);
      const order = await this.apiClient.createOrder(orderData);
      if (!order.ref_id) {
        throw new Error("Invalid order response: missing ref_id");
      }
      this.logger.info("Order created successfully", {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        payment_method: checkoutStore.paymentMethod
      });
      return order;
    } catch (error) {
      this.logger.error("Failed to create order:", error);
      if (error.status === 400 && error.responseData) {
        const responseData = error.responseData;
        this.logger.warn("API 400 error response:", responseData);
        if (responseData.message && Array.isArray(responseData.message)) {
          const errorMessages = responseData.message.map((msg) => {
            if (typeof msg === "object" && msg !== null) {
              return msg.message || JSON.stringify(msg);
            }
            return String(msg);
          }).join(". ");
          this.displayPaymentError(errorMessages);
          throw new Error(errorMessages);
        }
        if (responseData.message && typeof responseData.message === "string") {
          this.displayPaymentError(responseData.message);
          throw new Error(responseData.message);
        }
        if (responseData.payment_details || responseData.payment_response_code) {
          this.logger.warn("Payment error detected:", {
            payment_details: responseData.payment_details,
            payment_response_code: responseData.payment_response_code
          });
          this.displayPaymentError(responseData.payment_details || "Payment failed. Please check your payment information.");
          let errorMessage = "Payment failed: ";
          if (responseData.payment_details) {
            errorMessage += responseData.payment_details;
          } else {
            errorMessage += "Please check your payment information and try again.";
          }
          throw new Error(errorMessage);
        }
        if (responseData.errors) {
          const errorMessages = Object.entries(responseData.errors).map(([, messages]) => {
            if (Array.isArray(messages)) {
              return messages.join(". ");
            }
            return messages;
          }).join(". ");
          this.displayPaymentError(errorMessages);
          throw new Error(errorMessages);
        }
      }
      if (error instanceof Error) {
        if (error.message.includes("Rate limited")) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        } else if (error.message.includes("401") || error.message.includes("403")) {
          throw new Error("Authentication error. Please refresh the page and try again.");
        } else if (error.message.includes("400")) {
          throw new Error("Invalid order data. Please check your information and try again.");
        } else if (error.message.includes("500")) {
          throw new Error("Server error. Please try again in a few moments.");
        }
      }
      throw error;
    }
  }
  async createTestOrder() {
    const cartStore = useCartStore.getState();
    try {
      const testOrderData = {
        lines: cartStore.items.length > 0 ? cartStore.items.map((item) => ({
          package_id: item.packageId,
          quantity: item.quantity,
          is_upsell: false
        })) : [{ package_id: 1, quantity: 1, is_upsell: false }],
        shipping_address: {
          first_name: "Test",
          last_name: "Order",
          line1: "Test Address 123",
          line2: "",
          line4: "Tempe",
          state: "AZ",
          postcode: "85281",
          country: "US",
          phone_number: "+14807581224"
        },
        billing_same_as_shipping_address: true,
        shipping_method: 1,
        payment_detail: {
          payment_method: "card_token",
          card_token: "test_card"
        },
        user: {
          email: "test@test.com",
          first_name: "Test",
          last_name: "Order",
          language: "en",
          phone_number: "+14807581224",
          accepts_marketing: false
        },
        vouchers: [],
        attribution: this.getTestAttribution(),
        success_url: this.getSuccessUrl(),
        payment_failed_url: this.getFailureUrl()
      };
      const order = await this.apiClient.createOrder(testOrderData);
      return order;
    } catch (error) {
      this.logger.error("Failed to create test order:", error);
      throw error;
    }
  }
  getTestAttribution() {
    const attributionStore = useAttributionStore.getState();
    const baseAttribution = attributionStore.getAttributionForApi();
    return {
      ...baseAttribution,
      utm_source: "konami_code",
      utm_medium: "test",
      utm_campaign: "debug_test_order",
      utm_content: "test_mode",
      metadata: {
        ...baseAttribution.metadata,
        test_order: true,
        test_timestamp: Date.now()
      }
    };
  }
  handleOrderRedirect(order) {
    let redirectUrl;
    if (order.payment_complete_url) {
      redirectUrl = order.payment_complete_url;
    } else {
      const nextPageUrl = this.getNextPageUrlFromMeta(order.ref_id);
      if (nextPageUrl) {
        redirectUrl = nextPageUrl;
      } else if (order.order_status_url) {
        redirectUrl = order.order_status_url;
      } else {
        redirectUrl = `${window.location.origin}/checkout/confirmation/?ref_id=${order.ref_id || ""}`;
      }
    }
    if (redirectUrl) {
      const finalUrl = this.preserveQueryParams(redirectUrl);
      window.location.href = finalUrl;
    } else {
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
      this.emit("order:redirect-missing", { order });
    }
  }
  getNextPageUrlFromMeta(refId) {
    const metaTag = document.querySelector('meta[name="next-success-url"]') || document.querySelector('meta[name="next-next-url"]') || document.querySelector('meta[name="os-next-page"]');
    if (!metaTag?.content) return null;
    const nextPagePath = metaTag.content;
    const redirectUrl = nextPagePath.startsWith("http") ? new URL(nextPagePath) : new URL(nextPagePath, window.location.origin);
    if (refId) {
      redirectUrl.searchParams.append("ref_id", refId);
    }
    return redirectUrl.href;
  }
  preserveQueryParams(targetUrl, preserveParams = ["debug", "debugger"]) {
    try {
      const url = new URL(targetUrl, window.location.origin);
      const currentParams = new URLSearchParams(window.location.search);
      preserveParams.forEach((param) => {
        const value = currentParams.get(param);
        if (value && !url.searchParams.has(param)) {
          url.searchParams.append(param, value);
        }
      });
      return url.href;
    } catch (error) {
      return targetUrl;
    }
  }
  getSuccessUrl() {
    const metaTag = document.querySelector('meta[name="next-success-url"]') || document.querySelector('meta[name="next-next-url"]') || document.querySelector('meta[name="os-next-page"]');
    if (metaTag?.content) {
      if (metaTag.content.startsWith("/")) {
        return window.location.origin + metaTag.content;
      }
      return metaTag.content;
    }
    return window.location.origin + "/success";
  }
  async validateExpressCheckoutFields(formData, requiredFields) {
    const errors = {};
    let firstErrorField = null;
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || typeof value === "string" && !value.trim()) {
        const fieldNameMap = {
          "email": "Email",
          "fname": "First Name",
          "lname": "Last Name",
          "phone": "Phone",
          "address1": "Address",
          "city": "City",
          "province": "State/Province",
          "postal": "ZIP/Postal Code",
          "country": "Country"
        };
        const fieldLabel = fieldNameMap[field] || field;
        errors[field] = `${fieldLabel} is required`;
        if (!firstErrorField) {
          firstErrorField = field;
        }
      }
      if (field === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field] = "Please enter a valid email address";
          if (!firstErrorField) {
            firstErrorField = field;
          }
        }
      }
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstErrorField
    };
  }
  getFailureUrl() {
    const metaTag = document.querySelector('meta[name="next-failure-url"]') || document.querySelector('meta[name="os-failure-url"]');
    if (metaTag?.content) {
      if (metaTag.content.startsWith("/")) {
        return window.location.origin + metaTag.content;
      }
      return metaTag.content;
    }
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("payment_failed", "true");
    return currentUrl.href;
  }
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  async handleFormSubmit(event) {
    event.preventDefault();
    const checkoutStore = useCheckoutStore.getState();
    const cartStore = useCartStore.getState();
    try {
      checkoutStore.clearAllErrors();
      checkoutStore.setProcessing(true);
      this.loadingOverlay.show();
      if (this.isIntlTelInputAvailable) {
        const shippingPhoneInstance = this.phoneInputs.get("shipping");
        if (shippingPhoneInstance) {
          const isValidShipping = shippingPhoneInstance.isValidNumber();
          if (!isValidShipping && checkoutStore.formData.phone) {
            checkoutStore.setError("phone", "Please enter a valid phone number");
          } else if (isValidShipping) {
            const formattedNumber = shippingPhoneInstance.getNumber();
            if (formattedNumber) {
              checkoutStore.updateFormData({ phone: formattedNumber });
            }
          }
        }
        if (!checkoutStore.sameAsShipping && checkoutStore.billingAddress) {
          const billingPhoneInstance = this.phoneInputs.get("billing");
          if (billingPhoneInstance) {
            const isValidBilling = billingPhoneInstance.isValidNumber();
            if (!isValidBilling && checkoutStore.billingAddress.phone) {
              checkoutStore.setError("billing-phone", "Please enter a valid phone number");
            }
          }
        }
      }
      const expressPaymentMethods = ["paypal", "apple_pay", "google_pay"];
      const isExpressPayment = expressPaymentMethods.includes(checkoutStore.paymentMethod);
      const config = configStore.getState();
      const requireExpressValidation = config.paymentConfig?.expressCheckout?.requireValidation;
      this.logger.debug("Express payment config:", {
        isExpressPayment,
        paymentMethod: checkoutStore.paymentMethod,
        requireExpressValidation,
        hasExpressProcessor: !!this.expressProcessor,
        fullConfig: config.paymentConfig?.expressCheckout
      });
      if (isExpressPayment && this.expressProcessor && !requireExpressValidation) {
        this.logger.info(`Processing express checkout for ${checkoutStore.paymentMethod} (skipping validation)`);
        this.loadingOverlay.hide(true);
        await this.expressProcessor.handleExpressCheckout(
          checkoutStore.paymentMethod,
          cartStore.items,
          cartStore.isEmpty,
          () => cartStore.reset()
        );
        return;
      }
      if (isExpressPayment && requireExpressValidation) {
        this.logger.info(`Express payment ${checkoutStore.paymentMethod} requires validation (requireValidation: true)`);
      }
      const includePayment = checkoutStore.paymentMethod === "credit-card" || checkoutStore.paymentMethod === "card_token" || isExpressPayment && requireExpressValidation;
      let validation;
      if (isExpressPayment && requireExpressValidation && config.paymentConfig?.expressCheckout?.requiredFields) {
        const requiredFields = config.paymentConfig.expressCheckout.requiredFields;
        validation = await this.validateExpressCheckoutFields(checkoutStore.formData, requiredFields);
      } else {
        validation = await this.validator.validateForm(
          checkoutStore.formData,
          this.countryConfigs,
          this.currentCountryConfig,
          includePayment,
          checkoutStore.billingAddress,
          checkoutStore.sameAsShipping
        );
      }
      if (!validation.isValid) {
        this.logger.warn("Validation failed", {
          paymentMethod: checkoutStore.paymentMethod,
          isExpressPayment,
          requireExpressValidation,
          errors: validation.errors,
          firstErrorField: validation.firstErrorField
        });
        if (validation.errors) {
          Object.entries(validation.errors).forEach(([field, error]) => {
            checkoutStore.setError(field, error);
            this.validator.showError(field, error);
          });
        }
        if (isExpressPayment && requireExpressValidation) {
          const errorFields = Object.keys(validation.errors || {});
          const fieldNameMap = {
            "email": "Email",
            "fname": "First Name",
            "lname": "Last Name",
            "phone": "Phone",
            "address1": "Address",
            "city": "City",
            "province": "State/Province",
            "postal": "ZIP/Postal Code",
            "country": "Country",
            "cc-month": "Expiration Month",
            "cc-year": "Expiration Year",
            "exp-month": "Expiration Month",
            "exp-year": "Expiration Year",
            "billing-fname": "Billing First Name",
            "billing-lname": "Billing Last Name",
            "billing-address1": "Billing Address",
            "billing-city": "Billing City",
            "billing-province": "Billing State/Province",
            "billing-postal": "Billing ZIP/Postal Code",
            "billing-country": "Billing Country"
          };
          const requiredFields = errorFields.map((field) => fieldNameMap[field] || field).join(", ");
          const generalMessage = `Please fill in the following required fields: ${requiredFields}`;
          checkoutStore.setError("general", generalMessage);
          this.displayPaymentError(generalMessage);
        }
        if (validation.firstErrorField) {
          setTimeout(() => {
            this.validator.focusFirstErrorField(validation.firstErrorField);
          }, 100);
        }
        checkoutStore.setProcessing(false);
        this.loadingOverlay.hide(true);
        return;
      }
      this.emit("checkout:started", {
        formData: checkoutStore.formData,
        paymentMethod: checkoutStore.paymentMethod
      });
      if (isExpressPayment && this.expressProcessor) {
        this.logger.info(`Processing express checkout for ${checkoutStore.paymentMethod} (after validation)`);
        this.loadingOverlay.hide(true);
        await this.expressProcessor.handleExpressCheckout(
          checkoutStore.paymentMethod,
          cartStore.items,
          cartStore.isEmpty,
          () => cartStore.reset()
        );
        return;
      }
      if (checkoutStore.paymentMethod === "credit-card" || checkoutStore.paymentMethod === "card_token") {
        if (this.creditCardService?.ready) {
          const cardData = {
            full_name: `${checkoutStore.formData.fname || ""} ${checkoutStore.formData.lname || ""}`.trim(),
            month: checkoutStore.formData["cc-month"] || checkoutStore.formData["exp-month"] || "",
            year: checkoutStore.formData["cc-year"] || checkoutStore.formData["exp-year"] || ""
          };
          await this.creditCardService.tokenizeCard(cardData);
          return;
        } else {
          throw new Error("Credit card payment system is not ready. Please refresh the page and try again.");
        }
      }
      await this.processOrder();
    } catch (error) {
      this.handleError(error, "handleFormSubmit");
      checkoutStore.setError("general", "Failed to process order. Please try again.");
      checkoutStore.setProcessing(false);
      this.loadingOverlay.hide(true);
    }
  }
  async processOrder() {
    try {
      const order = await this.createOrder();
      if (this.prospectCartEnhancer) {
        await this.prospectCartEnhancer.convertCart();
      }
      this.emit("order:completed", order);
      this.handleOrderRedirect(order);
    } catch (error) {
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setProcessing(false);
      this.loadingOverlay.hide(true);
      throw error;
    }
  }
  async handleTokenizedPayment(token, pmData) {
    try {
      const checkoutStore = useCheckoutStore.getState();
      checkoutStore.setPaymentToken(token);
      this.emit("payment:tokenized", { token, pmData, paymentMethod: checkoutStore.paymentMethod });
      await this.processOrder();
    } catch (error) {
      this.logger.error("Failed to process tokenized payment:", error);
      const checkoutStore = useCheckoutStore.getState();
      if (error.message && error.message.includes("Payment failed:")) {
        checkoutStore.setError("general", error.message);
      } else {
        checkoutStore.setError("general", "Payment processing failed. Please try again.");
      }
      checkoutStore.setProcessing(false);
      this.loadingOverlay.hide(true);
    }
  }
  async handleFieldChange(event) {
    const target = event.target;
    const fieldName = this.getFieldNameFromElement(target);
    if (!fieldName) return;
    const checkoutStore = useCheckoutStore.getState();
    if (fieldName.startsWith("billing-")) {
      this.handleBillingFieldChange(fieldName, target.value, checkoutStore);
      if (fieldName === "billing-country") {
        const billingProvinceField = this.billingFields.get("billing-province");
        if (billingProvinceField instanceof HTMLSelectElement) {
          await this.updateBillingStateOptions(target.value, billingProvinceField, checkoutStore.formData.province);
        }
      }
    } else {
      this.updateFormData({ [fieldName]: target.value });
      checkoutStore.clearError(fieldName);
      if (fieldName === "country") {
        const provinceField = this.fields.get("province");
        if (provinceField instanceof HTMLSelectElement) {
          await this.updateStateOptions(target.value, provinceField);
        }
      }
      if (fieldName === "address1" && target.value && target.value.trim().length > 0) {
        this.showLocationFields();
      }
      if (fieldName === "email" && this.prospectCartEnhancer) {
        this.prospectCartEnhancer.updateEmail(target.value);
      }
    }
    if (target.value && target.value.trim() !== "") {
      this.validator.clearError(fieldName);
    }
  }
  async updateBillingStateOptions(country, billingProvinceField, shippingProvince) {
    billingProvinceField.disabled = true;
    const originalHTML = billingProvinceField.innerHTML;
    billingProvinceField.innerHTML = '<option value="">Loading...</option>';
    try {
      const countryData = await this.countryService.getCountryStates(country);
      this.updateBillingFormLabels(countryData.countryConfig);
      billingProvinceField.innerHTML = "";
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = `Select ${countryData.countryConfig.stateLabel}`;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      billingProvinceField.appendChild(placeholderOption);
      countryData.states.forEach((state) => {
        const option = document.createElement("option");
        option.value = state.code;
        option.textContent = state.name;
        billingProvinceField.appendChild(option);
      });
      if (countryData.countryConfig.stateRequired) {
        billingProvinceField.setAttribute("required", "required");
      } else {
        billingProvinceField.removeAttribute("required");
      }
      if (shippingProvince) {
        billingProvinceField.value = shippingProvince;
      }
    } catch (error) {
      this.logger.error("Failed to load billing states:", error);
      billingProvinceField.innerHTML = originalHTML;
    } finally {
      billingProvinceField.disabled = false;
    }
  }
  getFieldNameFromElement(element) {
    const checkoutFieldName = element.getAttribute("data-next-checkout-field") || element.getAttribute("os-checkout-field");
    if (checkoutFieldName) return checkoutFieldName;
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      if (element.name) return element.name;
    }
    return null;
  }
  handleBillingFieldChange(fieldName, value, checkoutStore) {
    const billingFieldName = fieldName.replace("billing-", "");
    const currentBillingData = checkoutStore.billingAddress || {
      first_name: "",
      last_name: "",
      address1: "",
      city: "",
      province: "",
      postal: "",
      country: "",
      phone: ""
    };
    const mappedFieldName = BILLING_ADDRESS_FIELD_MAP[billingFieldName] || billingFieldName;
    checkoutStore.setBillingAddress({
      ...currentBillingData,
      [mappedFieldName]: value
    });
  }
  handlePaymentMethodChange(event) {
    const target = event.target;
    const checkoutStore = useCheckoutStore.getState();
    const mappedMethod = PAYMENT_METHOD_MAP[target.value] || "credit-card";
    checkoutStore.setPaymentMethod(mappedMethod);
    const paypalError = document.querySelector('[data-next-component="paypal-error"]');
    if (paypalError instanceof HTMLElement) {
      paypalError.style.display = "none";
    }
    const creditError = document.querySelector('[data-next-component="credit-error"]');
    if (creditError instanceof HTMLElement) {
      creditError.style.display = "none";
    }
    this.ui.updatePaymentFormVisibility(target.value);
  }
  // Methods moved to CheckoutUIHelpers class - expandPaymentForm and collapsePaymentForm
  handleShippingMethodChange(event) {
    const target = event.target;
    const checkoutStore = useCheckoutStore.getState();
    const shippingMethods = [
      { id: 1, name: "Standard Shipping", price: 0, code: "standard" },
      { id: 2, name: "Subscription Shipping", price: 5, code: "subscription" },
      { id: 3, name: "Expedited: Standard Overnight", price: 28, code: "overnight" }
    ];
    const parsedValue = parseInt(target.value);
    if (isNaN(parsedValue)) return;
    const selectedMethod = shippingMethods.find((m) => m.id === parsedValue);
    if (selectedMethod) {
      checkoutStore.setShippingMethod(selectedMethod);
      const cartStore = useCartStore.getState();
      cartStore.setShippingMethod(selectedMethod.id);
    }
  }
  handleBillingAddressToggle(event) {
    const target = event.target;
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.setSameAsShipping(target.checked);
    const billingSection = document.querySelector(BILLING_CONTAINER_SELECTOR);
    if (billingSection instanceof HTMLElement) {
      if (target.checked) {
        this.collapseBillingForm(billingSection);
      } else {
        this.expandBillingForm(billingSection);
        setTimeout(() => {
          const shippingCountry = checkoutStore.formData.country;
          const billingCountryField = this.billingFields.get("billing-country");
          if (shippingCountry && billingCountryField instanceof HTMLSelectElement) {
            billingCountryField.value = shippingCountry;
            billingCountryField.dispatchEvent(new Event("change", { bubbles: true }));
          }
          checkoutStore.setBillingAddress({
            first_name: "",
            last_name: "",
            address1: "",
            address2: "",
            city: "",
            province: "",
            postal: "",
            country: shippingCountry || "",
            phone: ""
          });
        }, 50);
      }
    }
  }
  setupEventHandlers() {
    this.submitHandler = this.handleFormSubmit.bind(this);
    this.form.addEventListener("submit", this.submitHandler);
    this.changeHandler = this.handleFieldChange.bind(this);
    [...this.fields.values(), ...this.billingFields.values()].forEach((field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.addEventListener("change", this.changeHandler);
        field.addEventListener("blur", this.changeHandler);
      }
    });
    this.paymentMethodChangeHandler = this.handlePaymentMethodChange.bind(this);
    const paymentRadios = this.form.querySelectorAll([
      '[data-next-checkout-field="payment-method"]',
      '[os-checkout-field="payment-method"]',
      'input[name="payment_method"]'
    ].join(", "));
    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", this.paymentMethodChangeHandler);
    });
    this.shippingMethodChangeHandler = this.handleShippingMethodChange.bind(this);
    const shippingRadios = this.form.querySelectorAll('input[name="shipping_method"]');
    shippingRadios.forEach((radio) => {
      radio.addEventListener("change", this.shippingMethodChangeHandler);
    });
    this.billingAddressToggleHandler = this.handleBillingAddressToggle.bind(this);
    const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
    if (billingToggle) {
      billingToggle.addEventListener("change", this.billingAddressToggleHandler);
    }
  }
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  updateFormData(data) {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.updateFormData(data);
  }
  clearError(field) {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.clearError(field);
  }
  populateFormData() {
    const checkoutStore = useCheckoutStore.getState();
    this.fields.forEach((field, name) => {
      if (checkoutStore.formData[name] && (field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
        field.value = checkoutStore.formData[name];
      }
    });
    this.ui.updateLabelsForPopulatedData();
  }
  handleTestDataFilled(_event) {
    setTimeout(() => {
      this.populateFormData();
      this.fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
          field.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      this.ui.updateLabelsForPopulatedData();
    }, 150);
  }
  async handleKonamiActivation(event) {
    const checkoutStore = useCheckoutStore.getState();
    const customEvent = event;
    const activationMethod = customEvent.detail?.method;
    if (activationMethod === "konami") {
      try {
        const testFormData = {
          email: "test@test.com",
          fname: "Test",
          lname: "Order",
          phone: "+14807581224",
          address1: "Test Address 123",
          address2: "",
          city: "Tempe",
          province: "AZ",
          postal: "85281",
          country: "US",
          accepts_marketing: false
        };
        checkoutStore.clearAllErrors();
        this.validator.clearAllErrors();
        checkoutStore.updateFormData(testFormData);
        checkoutStore.setPaymentMethod("credit-card");
        checkoutStore.setPaymentToken("test_card");
        checkoutStore.setSameAsShipping(true);
        checkoutStore.setShippingMethod({
          id: 1,
          name: "Standard Shipping",
          price: 0,
          code: "standard"
        });
        this.populateFormData();
        setTimeout(async () => {
          try {
            const order = await this.createTestOrder();
            this.emit("order:completed", order);
            this.handleOrderRedirect(order);
          } catch (error) {
            this.logger.error("Failed to create test order:", error);
          }
        }, 1e3);
      } catch (error) {
        this.logger.error("Error filling test data for Konami order:", error);
      }
    }
  }
  handleCheckoutUpdate(state) {
    if (state.errors && Object.keys(state.errors).length > 0) {
      Object.entries(state.errors).forEach(([fieldName, message]) => {
        this.validator.setError(fieldName, message);
      });
    } else {
      this.validator.clearAllErrors();
    }
    if (state.formData?.address1 && state.formData.address1.trim().length > 0) {
      this.showLocationFields();
    }
    if (state.isProcessing) {
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.setAttribute("aria-busy", "true");
      }
    } else {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.setAttribute("aria-busy", "false");
      }
    }
  }
  handleCartUpdate(cartState) {
    if (cartState.isEmpty) {
      this.logger.warn("Cart is empty");
    }
  }
  async handleConfigUpdate(configState) {
    try {
      if (configState.spreedlyEnvironmentKey && !this.creditCardService) {
        await this.initializeCreditCard(configState.spreedlyEnvironmentKey, configState.debug || false);
      }
    } catch (error) {
      this.logger.error("Error handling config update:", error);
    }
  }
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  setSuccessUrl(url) {
    this.setOrCreateMetaTag("next-success-url", url);
    this.setOrCreateMetaTag("next-next-url", url);
    this.setOrCreateMetaTag("os-next-page", url);
  }
  setFailureUrl(url) {
    this.setOrCreateMetaTag("next-failure-url", url);
    this.setOrCreateMetaTag("os-failure-url", url);
  }
  setOrCreateMetaTag(name, content) {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = name;
      document.head.appendChild(metaTag);
    }
    metaTag.content = content;
  }
  validateField(fieldName, value) {
    const result = this.validator.validateField(fieldName, value);
    return {
      isValid: result.isValid,
      ...result.message && { errorMessage: result.message }
    };
  }
  clearAllValidationErrors() {
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.clearAllErrors();
    this.validator.clearAllErrors();
  }
  update() {
    this.scanAllFields();
    this.initializePhoneInputs();
  }
  cleanupEventListeners() {
    if (this.submitHandler) {
      this.form.removeEventListener("submit", this.submitHandler);
    }
    if (this.changeHandler) {
      [...this.fields.values(), ...this.billingFields.values()].forEach((field) => {
        field.removeEventListener("change", this.changeHandler);
        field.removeEventListener("blur", this.changeHandler);
      });
    }
    if (this.paymentMethodChangeHandler) {
      const paymentRadios = this.form.querySelectorAll([
        '[data-next-checkout-field="payment-method"]',
        '[os-checkout-field="payment-method"]',
        'input[name="payment_method"]'
      ].join(", "));
      paymentRadios.forEach((radio) => {
        radio.removeEventListener("change", this.paymentMethodChangeHandler);
      });
    }
    if (this.shippingMethodChangeHandler) {
      const shippingRadios = this.form.querySelectorAll('input[name="shipping_method"]');
      shippingRadios.forEach((radio) => {
        radio.removeEventListener("change", this.shippingMethodChangeHandler);
      });
    }
    if (this.billingAddressToggleHandler) {
      const billingToggle = this.form.querySelector('input[name="use_shipping_address"]');
      if (billingToggle) {
        billingToggle.removeEventListener("change", this.billingAddressToggleHandler);
      }
    }
    if (this.boundHandleTestDataFilled) {
      document.removeEventListener("checkout:test-data-filled", this.boundHandleTestDataFilled);
    }
    if (this.boundHandleKonamiActivation) {
      document.removeEventListener("next:test-mode-activated", this.boundHandleKonamiActivation);
    }
  }
  displayPaymentError(message) {
    this.logger.info("[Payment Error] Displaying error:", message);
    setTimeout(() => {
      const errorContainer = document.querySelector('[data-next-component="credit-error"]');
      if (errorContainer instanceof HTMLElement) {
        const messageElement = errorContainer.querySelector('[data-next-component="credit-error-text"]');
        if (messageElement) {
          messageElement.textContent = message;
        }
        errorContainer.style.display = "flex";
        errorContainer.style.visibility = "visible";
        errorContainer.style.opacity = "1";
        errorContainer.classList.add("visible");
        errorContainer.classList.remove("hidden");
        if (errorContainer.style.display === "none") {
          errorContainer.style.removeProperty("display");
          errorContainer.style.display = "flex";
        }
        this.logger.info("[Payment Error] Error container shown with message:", message);
        setTimeout(() => {
          errorContainer.style.display = "none";
          errorContainer.classList.remove("visible");
        }, 1e4);
      } else {
        this.logger.error("[Payment Error] Could not find error container element");
      }
    }, 100);
    this.emit("payment:error", { errors: [message] });
  }
  destroy() {
    if (this.validator) {
      this.validator.destroy();
    }
    if (this.creditCardService) {
      this.creditCardService.destroy();
    }
    if (this.prospectCartEnhancer) {
      this.prospectCartEnhancer.destroy();
    }
    this.phoneInputs.forEach((instance) => {
      try {
        instance.destroy();
      } catch (error) {
      }
    });
    this.phoneInputs.clear();
    this.autocompleteInstances.clear();
    this.fields.clear();
    this.billingFields.clear();
    this.paymentButtons.clear();
    super.destroy();
  }
}
export {
  CheckoutFormEnhancer
};
