import { B as BaseEnhancer } from "./BaseEnhancer-Bbss3g8X.js";
import { L as Logger, e as createLogger, c as configStore, d as ApiClient, f as useCheckoutStore, u as useCartStore, g as useAttributionStore, s as sentryManager } from "./analytics-BZUvO6mp.js";
class CountryService {
  constructor() {
    this.cachePrefix = "next_country_";
    this.cacheExpiry = 36e5;
    this.baseUrl = "https://cdn-countries.muddy-wind-c7ca.workers.dev";
    this.config = {};
    this.logger = new Logger("CountryService");
  }
  static getInstance() {
    if (!CountryService.instance) {
      CountryService.instance = new CountryService();
    }
    return CountryService.instance;
  }
  /**
   * Set address configuration
   */
  setConfig(config) {
    this.config = { ...config };
    this.logger.debug("Address configuration updated:", this.config);
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Get location data with user's detected country and list of all countries
   */
  async getLocationData() {
    const cached = this.getFromCache("location_data");
    if (cached) {
      return this.applyCountryFiltering(cached);
    }
    try {
      const response = await fetch(`${this.baseUrl}/location`);
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
      }
      const data = await response.json();
      this.setCache("location_data", data);
      this.logger.debug("Location data fetched", {
        detectedCountry: data.detectedCountryCode,
        countriesCount: data.countries?.length
      });
      return this.applyCountryFiltering(data);
    } catch (error) {
      this.logger.error("Failed to fetch location data:", error);
      return this.applyCountryFiltering(this.getFallbackLocationData());
    }
  }
  /**
   * Get states for a specific country
   */
  async getCountryStates(countryCode) {
    const cacheKey = `states_${countryCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        states: this.applyStateFiltering(cached.states || [])
      };
    }
    try {
      const response = await fetch(`${this.baseUrl}/countries/${countryCode}/states`);
      if (!response.ok) {
        throw new Error(`Failed to fetch states for ${countryCode}: ${response.statusText}`);
      }
      const data = await response.json();
      this.setCache(cacheKey, data);
      this.logger.debug(`States data fetched for ${countryCode}`, {
        statesCount: data.states?.length,
        stateLabel: data.countryConfig?.stateLabel
      });
      return {
        ...data,
        states: this.applyStateFiltering(data.states || [])
      };
    } catch (error) {
      this.logger.error(`Failed to fetch states for ${countryCode}:`, error);
      return {
        countryConfig: this.getDefaultCountryConfig(countryCode),
        states: []
      };
    }
  }
  /**
   * Get country configuration by country code
   */
  async getCountryConfig(countryCode) {
    const locationData = await this.getLocationData();
    if (locationData.detectedCountryCode === countryCode) {
      return locationData.detectedCountryConfig;
    }
    const statesData = await this.getCountryStates(countryCode);
    return statesData.countryConfig;
  }
  /**
   * Validate postal code based on country configuration
   */
  validatePostalCode(postalCode, _countryCode, countryConfig) {
    if (!postalCode) return false;
    if (postalCode.length < countryConfig.postcodeMinLength || postalCode.length > countryConfig.postcodeMaxLength) {
      return false;
    }
    if (countryConfig.postcodeRegex) {
      try {
        const regex = new RegExp(countryConfig.postcodeRegex);
        return regex.test(postalCode);
      } catch (error) {
        this.logger.error("Invalid postal code regex:", error);
        return true;
      }
    }
    return true;
  }
  /**
   * Clear all cached data
   */
  clearCache() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.cachePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      this.logger.debug("Country service cache cleared");
    } catch (error) {
      this.logger.warn("Failed to clear cache:", error);
    }
  }
  /**
   * Clear cache for a specific country
   */
  clearCountryCache(countryCode) {
    try {
      const cacheKey = this.cachePrefix + `states_${countryCode}`;
      sessionStorage.removeItem(cacheKey);
      this.logger.debug(`Cache cleared for country: ${countryCode}`);
    } catch (error) {
      this.logger.warn(`Failed to clear cache for country ${countryCode}:`, error);
    }
  }
  getFromCache(key) {
    try {
      const cacheKey = this.cachePrefix + key;
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      if (now - timestamp > this.cacheExpiry) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }
      return data;
    } catch (error) {
      this.logger.warn("Failed to read from cache:", error);
      return null;
    }
  }
  setCache(key, data) {
    try {
      const cacheKey = this.cachePrefix + key;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      this.logger.warn("Failed to write to cache:", error);
    }
  }
  getDefaultCountryConfig(countryCode) {
    const configs = {
      US: {
        stateLabel: "State",
        stateRequired: true,
        postcodeLabel: "ZIP Code",
        postcodeRegex: "^\\d{5}(-\\d{4})?$",
        postcodeMinLength: 5,
        postcodeMaxLength: 10,
        postcodeExample: "12345 or 12345-6789",
        currencyCode: "USD",
        currencySymbol: "$"
      },
      CA: {
        stateLabel: "Province",
        stateRequired: true,
        postcodeLabel: "Postal Code",
        postcodeRegex: "^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$",
        postcodeMinLength: 6,
        postcodeMaxLength: 7,
        postcodeExample: "K1A 0B1",
        currencyCode: "CAD",
        currencySymbol: "$"
      },
      GB: {
        stateLabel: "County",
        stateRequired: false,
        postcodeLabel: "Postcode",
        postcodeRegex: "^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$",
        postcodeMinLength: 5,
        postcodeMaxLength: 8,
        postcodeExample: "SW1A 1AA",
        currencyCode: "GBP",
        currencySymbol: "£"
      }
    };
    return configs[countryCode] || {
      stateLabel: "State/Province",
      stateRequired: false,
      postcodeLabel: "Postal Code",
      postcodeRegex: null,
      postcodeMinLength: 2,
      postcodeMaxLength: 20,
      postcodeExample: null,
      currencyCode: "USD",
      currencySymbol: "$"
    };
  }
  getFallbackLocationData() {
    return {
      detectedCountryCode: "US",
      detectedCountryConfig: this.getDefaultCountryConfig("US"),
      detectedStates: [],
      countries: [
        { code: "US", name: "United States", phonecode: "+1", currencyCode: "USD", currencySymbol: "$" },
        { code: "CA", name: "Canada", phonecode: "+1", currencyCode: "CAD", currencySymbol: "$" },
        { code: "GB", name: "United Kingdom", phonecode: "+44", currencyCode: "GBP", currencySymbol: "£" },
        { code: "AU", name: "Australia", phonecode: "+61", currencyCode: "AUD", currencySymbol: "$" },
        { code: "DE", name: "Germany", phonecode: "+49", currencyCode: "EUR", currencySymbol: "€" }
      ]
    };
  }
  applyCountryFiltering(data) {
    let filteredCountries = [...data.countries];
    if (this.config.countries && this.config.countries.length > 0) {
      filteredCountries = this.config.countries.map((customCountry) => ({
        code: customCountry.code,
        name: customCountry.name,
        phonecode: "",
        currencyCode: "USD",
        currencySymbol: "$"
      }));
    } else if (this.config.showCountries && this.config.showCountries.length > 0) {
      filteredCountries = filteredCountries.filter(
        (country) => this.config.showCountries.includes(country.code)
      );
    }
    let detectedCountryCode = data.detectedCountryCode;
    if (this.config.defaultCountry) {
      const defaultCountryExists = filteredCountries.some(
        (country) => country.code === this.config.defaultCountry
      );
      if (defaultCountryExists) {
        detectedCountryCode = this.config.defaultCountry;
      }
    }
    return {
      ...data,
      countries: filteredCountries,
      detectedCountryCode
    };
  }
  applyStateFiltering(states) {
    if (!this.config.dontShowStates || this.config.dontShowStates.length === 0) {
      return states;
    }
    return states.filter(
      (state) => !this.config.dontShowStates.includes(state.code)
    );
  }
}
class FieldFinder {
  /**
   * Find a field by name using multiple selector strategies
   */
  static findField(fieldName, options = {}) {
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
          const htmlElement = element;
          if (!options.includeHidden && htmlElement.offsetParent === null) {
            continue;
          }
          if (!options.includeDisabled && "disabled" in htmlElement) {
            const inputElement = htmlElement;
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
  /**
   * Find multiple fields by names
   */
  static findFields(fieldNames, options = {}) {
    const fields = /* @__PURE__ */ new Map();
    fieldNames.forEach((name) => {
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
  static findFieldWrapper(field, customSelectors) {
    const wrapperSelectors = customSelectors || [
      ".form-group",
      ".frm-flds",
      ".form-input",
      ".select-form-wrapper",
      ".field-wrapper",
      ".input-wrapper",
      ".form-field"
    ];
    for (const selector of wrapperSelectors) {
      const wrapper = field.closest(selector);
      if (wrapper) return wrapper;
    }
    return field.parentElement;
  }
  /**
   * Find form container for a field
   */
  static findFormContainer(field) {
    return field.closest("form");
  }
  /**
   * Find label for a field
   */
  static findFieldLabel(field) {
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label;
    }
    let parent = field.parentElement;
    while (parent) {
      const label = parent.querySelector("label");
      if (label) return label;
      if (parent.tagName === "LABEL") {
        return parent;
      }
      parent = parent.parentElement;
    }
    const wrapper = this.findFieldWrapper(field);
    if (wrapper) {
      const label = wrapper.querySelector("label");
      if (label) return label;
    }
    return null;
  }
  /**
   * Find all form fields in a container
   */
  static findAllFormFields(container, options = {}) {
    const selectors = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
      "select",
      "textarea"
    ];
    if (options.includeButtons) {
      selectors.push("button", 'input[type="submit"]', 'input[type="button"]');
    }
    const fields = [];
    const elements = container.querySelectorAll(selectors.join(", "));
    elements.forEach((element) => {
      fields.push(element);
    });
    return fields;
  }
  /**
   * Find fields by attribute pattern
   */
  static findFieldsByAttribute(attributeName, pattern, container = document.body) {
    const fields = [];
    const selector = pattern ? `[${attributeName}]` : `[${attributeName}]`;
    const elements = container.querySelectorAll(selector);
    elements.forEach((element) => {
      const attrValue = element.getAttribute(attributeName);
      if (!pattern || !attrValue) {
        fields.push(element);
      } else if (typeof pattern === "string") {
        if (attrValue.includes(pattern)) {
          fields.push(element);
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(attrValue)) {
          fields.push(element);
        }
      }
    });
    return fields;
  }
  /**
   * Check if element is a form field
   */
  static isFormField(element) {
    const fieldTags = ["INPUT", "SELECT", "TEXTAREA"];
    return fieldTags.includes(element.tagName);
  }
  /**
   * Get field type
   */
  static getFieldType(field) {
    if (field instanceof HTMLInputElement) {
      return field.type || "text";
    } else if (field instanceof HTMLSelectElement) {
      return "select";
    } else if (field instanceof HTMLTextAreaElement) {
      return "textarea";
    }
    return "unknown";
  }
  /**
   * Get field value safely
   */
  static getFieldValue(field) {
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      return field.value;
    }
    return "";
  }
  /**
   * Set field value safely
   */
  static setFieldValue(field, value) {
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      field.value = value;
      field.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    return false;
  }
}
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
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (toastHandler instanceof HTMLElement) {
      toastHandler.style.display = "none";
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
      }
      if (this.cvvField) {
        this.cvvField.id = "spreedly-cvv";
        this.cvvField.setAttribute("data-spreedly", "cvv");
      }
      window.Spreedly.init(this.environmentKey, {
        "numberEl": "spreedly-number",
        "cvvEl": "spreedly-cvv"
      });
      this.setupSpreedlyEventListeners();
      this.logger.debug("Spreedly setup complete");
    } catch (error) {
      this.logger.error("Error setting up Spreedly:", error);
      throw error;
    }
  }
  setupSpreedlyEventListeners() {
    window.Spreedly.on("ready", () => {
      this.logger.debug("Spreedly ready");
      this.applySpreedlyConfig();
      this.isReady = true;
      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
    });
    window.Spreedly.on("errors", (errors) => {
      this.logger.error("Spreedly errors:", errors);
      const errorMessages = errors.map((error) => error.message);
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessages);
      }
      this.showSpreedlyErrors(errors);
    });
    window.Spreedly.on("paymentMethod", (token, pmData) => {
      console.log("🟢 [CreditCardService] Spreedly paymentMethod event received!", { token, pmData });
      this.logger.debug("Spreedly payment method created:", token);
      this.clearAllErrors();
      if (this.onTokenCallback) {
        console.log("🟢 [CreditCardService] Calling onTokenCallback with token:", token);
        this.onTokenCallback(token, pmData);
      } else {
        console.log("🔴 [CreditCardService] No onTokenCallback registered!");
      }
    });
    window.Spreedly.on("validation", (result) => {
      this.logger.debug("Spreedly validation:", result);
      if (result.valid) {
        this.clearCreditCardFieldError(result.fieldType);
      }
    });
    window.Spreedly.on("fieldEvent", (name, type, _activeEl, inputProperties) => {
      this.handleSpreedlyFieldEvent(name, type, inputProperties);
    });
  }
  applySpreedlyConfig() {
    try {
      window.Spreedly.setFieldType("number", "text");
      window.Spreedly.setFieldType("cvv", "text");
      window.Spreedly.setNumberFormat("prettyFormat");
      window.Spreedly.setPlaceholder("number", "Credit Card Number");
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
    if (type === "input" && inputProperties) {
      if (name === "number" && inputProperties.validNumber !== void 0) {
        this.validationState.number.isValid = inputProperties.validNumber;
        this.validationState.number.hasError = !inputProperties.validNumber;
      } else if (name === "cvv" && inputProperties.validCvv !== void 0) {
        this.validationState.cvv.isValid = inputProperties.validCvv;
        this.validationState.cvv.hasError = !inputProperties.validCvv;
      }
    }
  }
  showSpreedlyErrors(errors) {
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (toastHandler instanceof HTMLElement) {
      const messageElement = toastHandler.querySelector('[data-os-message="error"]');
      if (messageElement) {
        const errorMessages = errors.map((e) => e.message).join(". ");
        messageElement.textContent = errorMessages;
        toastHandler.style.display = "flex";
        setTimeout(() => {
          if (toastHandler.style.display === "flex") {
            toastHandler.style.display = "none";
          }
        }, 1e4);
      }
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
    const field = this.getFieldElement(fieldType);
    if (field) {
      field.classList.remove("no-error");
      field.classList.add("has-error", "next-error-field");
      const wrapper = FieldFinder.findFieldWrapper(field);
      if (wrapper) {
        wrapper.classList.remove("addTick");
        wrapper.classList.add("has-error", "addErrorIcon");
        const existingError = wrapper.querySelector(".next-error-label");
        if (existingError) {
          existingError.remove();
        }
        const errorElement = document.createElement("div");
        errorElement.className = "next-error-label";
        errorElement.textContent = message;
        wrapper.appendChild(errorElement);
      }
    }
  }
  clearCreditCardFieldError(fieldType) {
    this.validationState[fieldType].hasError = false;
    delete this.validationState[fieldType].errorMessage;
    const field = this.getFieldElement(fieldType);
    if (field) {
      field.classList.remove("has-error", "next-error-field");
      const wrapper = FieldFinder.findFieldWrapper(field);
      if (wrapper) {
        wrapper.classList.remove("has-error", "addErrorIcon");
        const errorElement = wrapper.querySelector(".next-error-label");
        if (errorElement) {
          errorElement.remove();
        }
      }
    }
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
const DEFAULT_OPTIONS = {
  wrapperClass: "form-group",
  errorClass: "next-error-field",
  errorLabelClass: "next-error-label",
  successClass: "no-error",
  iconErrorClass: "addErrorIcon",
  iconSuccessClass: "addTick"
};
class ErrorDisplayManager {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  /**
   * Show error on a field with consistent styling
   */
  showFieldError(field, message) {
    const wrapper = FieldFinder.findFieldWrapper(field);
    if (!wrapper) return;
    this.clearFieldError(field);
    field.classList.add("has-error", this.options.errorClass);
    field.classList.remove(this.options.successClass);
    wrapper.classList.add(this.options.iconErrorClass);
    wrapper.classList.remove(this.options.iconSuccessClass);
    const errorElement = document.createElement("div");
    errorElement.className = this.options.errorLabelClass;
    errorElement.textContent = message;
    errorElement.setAttribute("role", "alert");
    errorElement.setAttribute("aria-live", "polite");
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
  clearFieldError(field) {
    const wrapper = FieldFinder.findFieldWrapper(field);
    field.classList.remove("has-error", this.options.errorClass);
    if (wrapper) {
      wrapper.classList.remove(this.options.iconErrorClass);
      const errorLabel = wrapper.querySelector(`.${this.options.errorLabelClass}`);
      if (errorLabel) {
        errorLabel.remove();
      }
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
  showFieldValid(field) {
    const wrapper = FieldFinder.findFieldWrapper(field);
    this.clearFieldError(field);
    field.classList.add(this.options.successClass);
    if (wrapper) {
      wrapper.classList.add(this.options.iconSuccessClass);
    }
  }
  /**
   * Clear all error displays in a container
   */
  clearAllErrors(container) {
    const errorLabels = container.querySelectorAll(`.${this.options.errorLabelClass}`);
    errorLabels.forEach((label) => label.remove());
    const errorFields = container.querySelectorAll(`.${this.options.errorClass}, .has-error`);
    errorFields.forEach((field) => {
      field.classList.remove("has-error", this.options.errorClass);
    });
    const errorWrappers = container.querySelectorAll(`.${this.options.iconErrorClass}`);
    errorWrappers.forEach((wrapper) => {
      wrapper.classList.remove(this.options.iconErrorClass);
    });
  }
  /**
   * Display multiple field errors at once
   */
  displayErrors(errors, container) {
    this.clearAllErrors(container);
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
  findField(fieldName, container) {
    const selectors = [
      `[data-next-checkout-field="${fieldName}"]`,
      `[os-checkout-field="${fieldName}"]`,
      `[name="${fieldName}"]`,
      `#${fieldName}`
    ];
    for (const selector of selectors) {
      const field = container.querySelector(selector);
      if (field) return field;
    }
    return null;
  }
  /**
   * Show a toast error message
   */
  static showToastError(message, duration = 1e4) {
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (!(toastHandler instanceof HTMLElement)) return;
    const messageElement = toastHandler.querySelector('[data-os-message="error"]');
    if (messageElement instanceof HTMLElement) {
      messageElement.textContent = message;
      toastHandler.style.display = "flex";
      setTimeout(() => {
        if (toastHandler.style.display === "flex") {
          toastHandler.style.display = "none";
        }
      }, duration);
    }
  }
  /**
   * Hide toast error message
   */
  static hideToastError() {
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (toastHandler instanceof HTMLElement) {
      toastHandler.style.display = "none";
    }
  }
}
new ErrorDisplayManager();
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
      if (this.phoneInputManager) {
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
class EventHandlerManager {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map();
    this.bindings = [];
  }
  /**
   * Add an event handler with automatic cleanup tracking
   */
  addHandler(element, event, handler, options) {
    if (!element) return;
    if (!this.handlers.has(element)) {
      this.handlers.set(element, /* @__PURE__ */ new Map());
    }
    const elementHandlers = this.handlers.get(element);
    if (elementHandlers.has(event)) {
      const existingHandler = elementHandlers.get(event);
      element.removeEventListener(event, existingHandler);
    }
    element.addEventListener(event, handler, options);
    elementHandlers.set(event, handler);
    const binding = { element, event, handler };
    if (options !== void 0) {
      binding.options = options;
    }
    this.bindings.push(binding);
  }
  /**
   * Add multiple handlers at once
   */
  addHandlers(bindings) {
    bindings.forEach((binding) => {
      this.addHandler(
        binding.element,
        binding.event,
        binding.handler,
        binding.options
      );
    });
  }
  /**
   * Remove a specific handler
   */
  removeHandler(element, event) {
    if (!element) return;
    const elementHandlers = this.handlers.get(element);
    if (!elementHandlers) return;
    const handler = elementHandlers.get(event);
    if (handler) {
      element.removeEventListener(event, handler);
      elementHandlers.delete(event);
      this.bindings = this.bindings.filter(
        (b) => !(b.element === element && b.event === event)
      );
    }
    if (elementHandlers.size === 0) {
      this.handlers.delete(element);
    }
  }
  /**
   * Remove all handlers for a specific element
   */
  removeElementHandlers(element) {
    const elementHandlers = this.handlers.get(element);
    if (!elementHandlers) return;
    elementHandlers.forEach((handler, event) => {
      element.removeEventListener(event, handler);
    });
    this.handlers.delete(element);
    this.bindings = this.bindings.filter((b) => b.element !== element);
  }
  /**
   * Remove all handlers
   */
  removeAllHandlers() {
    this.handlers.forEach((elementHandlers, element) => {
      elementHandlers.forEach((handler, event) => {
        element.removeEventListener(event, handler);
      });
    });
    this.handlers.clear();
    this.bindings = [];
  }
  /**
   * Add event delegation handler
   */
  addDelegatedHandler(container, selector, event, handler) {
    const delegatedHandler = (e) => {
      const target = e.target;
      const matchedElement = target.closest(selector);
      if (matchedElement && container.contains(matchedElement)) {
        handler(e, matchedElement);
      }
    };
    this.addHandler(container, event, delegatedHandler);
  }
  /**
   * Add handler with debounce
   */
  addDebouncedHandler(element, event, handler, delay = 300) {
    let timeoutId;
    const debouncedHandler = (e) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        handler(e);
      }, delay);
    };
    this.addHandler(element, event, debouncedHandler);
  }
  /**
   * Add handler with throttle
   */
  addThrottledHandler(element, event, handler, limit = 300) {
    let inThrottle = false;
    const throttledHandler = (e) => {
      if (!inThrottle) {
        handler(e);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
    this.addHandler(element, event, throttledHandler);
  }
  /**
   * Add one-time handler that auto-removes
   */
  addOnceHandler(element, event, handler) {
    const onceHandler = (e) => {
      handler(e);
      this.removeHandler(element, event);
    };
    this.addHandler(element, event, onceHandler);
  }
  /**
   * Get all active bindings (for debugging)
   */
  getActiveBindings() {
    return [...this.bindings];
  }
  /**
   * Check if element has handler for event
   */
  hasHandler(element, event) {
    const elementHandlers = this.handlers.get(element);
    return elementHandlers ? elementHandlers.has(event) : false;
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
    paymentForm.offsetHeight;
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
    paymentForm.offsetHeight;
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
const FIELD_SELECTORS = ["[data-next-checkout-field]", "[os-checkout-field]"];
const BILLING_CONTAINER_SELECTOR = '[os-checkout-element="different-billing-address"]';
const SHIPPING_FORM_SELECTOR = '[os-checkout-component="shipping-form"]';
const BILLING_FORM_CONTAINER_SELECTOR = '[os-checkout-component="billing-form"]';
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
const BILLING_FIELD_MAPPING = {
  "fname": "billing-fname",
  "lname": "billing-lname",
  "address1": "billing-address1",
  "address2": "billing-address2",
  "city": "billing-city",
  "province": "billing-province",
  "postal": "billing-postal",
  "country": "billing-country",
  "phone": "billing-phone"
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
  constructor() {
    super(...arguments);
    this.fields = /* @__PURE__ */ new Map();
    this.billingFields = /* @__PURE__ */ new Map();
    this.paymentButtons = /* @__PURE__ */ new Map();
    this.countries = [];
    this.countryConfigs = /* @__PURE__ */ new Map();
    this.phoneInputs = /* @__PURE__ */ new Map();
    this.isIntlTelInputAvailable = false;
  }
  async initialize() {
    this.validateElement();
    if (!(this.element instanceof HTMLFormElement)) {
      throw new Error("CheckoutFormEnhancer must be applied to a form element");
    }
    this.form = this.element;
    this.form.noValidate = true;
    const config = configStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    this.countryService = CountryService.getInstance();
    this.validator = new CheckoutValidator(
      this.logger,
      this.countryService,
      void 0
      // PhoneInputManager will be handled by us
    );
    this.isIntlTelInputAvailable = !!window.intlTelInput && !!window.intlTelInputUtils;
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
    const billingForm = shippingForm.cloneNode(true);
    this.convertShippingFieldsToBilling(billingForm);
    billingFormContainer.innerHTML = "";
    billingFormContainer.appendChild(billingForm);
    this.setInitialBillingFormState();
    return true;
  }
  convertShippingFieldsToBilling(billingForm) {
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
    billingSection.offsetHeight;
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
    billingSection.offsetHeight;
    billingSection.style.transition = "height 0.3s ease-in-out, padding 0.3s ease-in-out, margin-top 0.3s ease-in-out";
    billingSection.style.height = "0";
    billingSection.style.padding = "2px";
    billingSection.style.marginTop = "0";
    billingSection.classList.add("billing-form-collapsed");
    billingSection.classList.remove("billing-form-expanded");
  }
  copyShippingToBilling() {
    const checkoutStore = useCheckoutStore.getState();
    const shippingData = checkoutStore.formData;
    const billingAddress = {
      first_name: shippingData.fname || "",
      last_name: shippingData.lname || "",
      address1: shippingData.address1 || "",
      address2: shippingData.address2,
      city: shippingData.city || "",
      province: shippingData.province || "",
      postal: shippingData.postal || "",
      country: shippingData.country || "",
      phone: shippingData.phone || ""
    };
    checkoutStore.setBillingAddress(billingAddress);
    Object.entries(BILLING_FIELD_MAPPING).forEach(([shippingField, billingField]) => {
      const shippingValue = shippingData[shippingField];
      const billingElement = this.billingFields.get(billingField);
      if (shippingValue && billingElement) {
        if (billingElement instanceof HTMLInputElement || billingElement instanceof HTMLSelectElement) {
          billingElement.value = shippingValue;
        }
      }
    });
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
      const locationData = await this.countryService.getLocationData();
      this.countries = locationData.countries;
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
    if (postalField instanceof HTMLInputElement && countryConfig.postcodeExample) {
      postalField.placeholder = countryConfig.postcodeExample;
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
      const instance = window.intlTelInput(phoneField, {
        separateDialCode: false,
        nationalMode: true,
        autoPlaceholder: "aggressive",
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        preferredCountries: ["us", "ca", "gb", "au"],
        allowDropdown: false,
        initialCountry: "us"
      });
      this.phoneInputs.set(type, instance);
      phoneField.addEventListener("input", () => {
        if (instance) {
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
      });
      this.creditCardService.setOnError((errors) => {
        this.emit("payment:error", { errors });
      });
      this.creditCardService.setOnToken((token, pmData) => {
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
      cartStore.reset();
      this.logger.info("Order created successfully", {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        payment_method: checkoutStore.paymentMethod
      });
      return order;
    } catch (error) {
      this.logger.error("Failed to create order:", error);
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
      cartStore.reset();
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
      this.emit("order:redirect-missing", { order });
    }
  }
  getNextPageUrlFromMeta(refId) {
    const metaTag = document.querySelector('meta[name="next-next-url"]') || document.querySelector('meta[name="os-next-page"]');
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
    const metaTag = document.querySelector('meta[name="next-success-url"]') || document.querySelector('meta[name="os-next-page"]');
    return metaTag?.content || window.location.origin + "/success";
  }
  getFailureUrl() {
    const metaTag = document.querySelector('meta[name="next-failure-url"]') || document.querySelector('meta[name="os-failure-url"]');
    if (metaTag?.content) return metaTag.content;
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
    await sentryManager.startSpan(
      {
        op: "ui.click",
        name: "Checkout Form Submit",
        attributes: {
          "checkout.payment_method": checkoutStore.paymentMethod,
          "cart.item_count": cartStore.items.length,
          "cart.total_value": cartStore.total,
          "checkout.same_as_shipping": checkoutStore.sameAsShipping
        }
      },
      async (span) => {
        try {
          checkoutStore.clearAllErrors();
          checkoutStore.setProcessing(true);
          const includePayment = checkoutStore.paymentMethod === "credit-card" || checkoutStore.paymentMethod === "card_token";
          const validation = await this.validator.validateForm(
            checkoutStore.formData,
            this.countryConfigs,
            this.currentCountryConfig,
            includePayment,
            checkoutStore.billingAddress,
            checkoutStore.sameAsShipping
          );
          if (!validation.isValid) {
            span?.setAttribute("validation.passed", false);
            span?.setAttribute("validation.error_count", Object.keys(validation.errors || {}).length);
            if (validation.errors) {
              Object.entries(validation.errors).forEach(([field, error]) => {
                checkoutStore.setError(field, error);
              });
            }
            if (validation.firstErrorField) {
              this.validator.focusFirstErrorField(validation.firstErrorField);
            }
            return;
          }
          span?.setAttribute("validation.passed", true);
          this.emit("checkout:started", {
            formData: checkoutStore.formData,
            paymentMethod: checkoutStore.paymentMethod
          });
          if (checkoutStore.paymentMethod === "credit-card" || checkoutStore.paymentMethod === "card_token") {
            span?.setAttribute("payment.type", "credit_card");
            if (this.creditCardService?.ready) {
              const cardData = {
                full_name: `${checkoutStore.formData.fname || ""} ${checkoutStore.formData.lname || ""}`.trim(),
                month: checkoutStore.formData["cc-month"] || checkoutStore.formData["exp-month"] || "",
                year: checkoutStore.formData["cc-year"] || checkoutStore.formData["exp-year"] || ""
              };
              await this.creditCardService.tokenizeCard(cardData);
              span?.setAttribute("payment.tokenization_started", true);
              return;
            } else {
              throw new Error("Credit card payment system is not ready. Please refresh the page and try again.");
            }
          }
          span?.setAttribute("payment.type", checkoutStore.paymentMethod || "unknown");
          await this.processOrder();
        } catch (error) {
          span?.setAttribute("error", true);
          span?.setAttribute("error.type", error.name);
          span?.setAttribute("error.message", error.message);
          this.handleError(error, "handleFormSubmit");
          checkoutStore.setError("general", "Failed to process order. Please try again.");
        } finally {
          checkoutStore.setProcessing(false);
        }
      }
    );
  }
  async processOrder() {
    try {
      const order = await this.createOrder();
      this.emit("order:completed", order);
      this.handleOrderRedirect(order);
    } catch (error) {
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
      checkoutStore.setError("general", "Payment processing failed. Please try again.");
      checkoutStore.setProcessing(false);
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
    this.updatePaymentFormVisibility(target.value);
  }
  updatePaymentFormVisibility(paymentMethod) {
    const paymentMethods = this.form.querySelectorAll("[data-next-payment-method]");
    paymentMethods.forEach((paymentMethodElement) => {
      if (paymentMethodElement instanceof HTMLElement) {
        const radio = paymentMethodElement.querySelector('input[type="radio"]');
        const paymentForm = paymentMethodElement.querySelector("[data-next-payment-form]");
        if (!(radio instanceof HTMLInputElement) || !(paymentForm instanceof HTMLElement)) {
          return;
        }
        const isSelected = radio.value === paymentMethod;
        if (isSelected) {
          paymentMethodElement.classList.add("next-selected");
          paymentForm.setAttribute("data-next-payment-state", "expanded");
          this.expandPaymentForm(paymentForm);
        } else {
          paymentMethodElement.classList.remove("next-selected");
          paymentForm.setAttribute("data-next-payment-state", "collapsed");
          this.collapsePaymentForm(paymentForm);
        }
      }
    });
  }
  expandPaymentForm(paymentForm) {
    if (paymentForm.classList.contains("payment-method__form--expanded")) return;
    paymentForm.classList.remove("payment-method__form--collapsed");
    paymentForm.classList.add("payment-method__form--expanded");
    const startHeight = paymentForm.offsetHeight;
    const currentOverflow = paymentForm.style.overflow;
    paymentForm.style.overflow = "hidden";
    paymentForm.style.height = "auto";
    const targetHeight = paymentForm.scrollHeight;
    paymentForm.style.height = startHeight + "px";
    paymentForm.offsetHeight;
    paymentForm.style.height = targetHeight + "px";
    setTimeout(() => {
      paymentForm.style.height = "";
      paymentForm.style.overflow = currentOverflow;
    }, 300);
  }
  collapsePaymentForm(paymentForm) {
    if (paymentForm.classList.contains("payment-method__form--collapsed")) return;
    const currentHeight = paymentForm.scrollHeight;
    paymentForm.style.overflow = "hidden";
    paymentForm.style.height = currentHeight + "px";
    paymentForm.offsetHeight;
    paymentForm.style.height = "0px";
    setTimeout(() => {
      paymentForm.classList.add("payment-method__form--collapsed");
      paymentForm.classList.remove("payment-method__form--expanded");
    }, 300);
  }
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
          this.copyShippingToBilling();
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
    if (state.isProcessing) {
      this.form.classList.add("next-processing");
    } else {
      this.form.classList.remove("next-processing");
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
  destroy() {
    if (this.validator) {
      this.validator.destroy();
    }
    if (this.creditCardService) {
      this.creditCardService.destroy();
    }
    this.phoneInputs.forEach((instance) => {
      try {
        instance.destroy();
      } catch (error) {
      }
    });
    this.phoneInputs.clear();
    this.fields.clear();
    this.billingFields.clear();
    this.paymentButtons.clear();
    super.destroy();
  }
}
export {
  CheckoutFormEnhancer
};
