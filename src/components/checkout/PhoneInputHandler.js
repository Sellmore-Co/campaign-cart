export class PhoneInputHandler {
  #logger;
  #intlTelInputAvailable = !!window.intlTelInput;
  #phoneInstances = new Map(); // Store phone input instances for sync

  constructor(logger) {
    this.#logger = logger;

    if (!this.#intlTelInputAvailable) {
      this.#logger.warn('intlTelInput not found, loading dynamically');
      this.#loadIntlTelInput().then(() => this.#initPhoneInputs());
    } else {
      this.#logger.info('intlTelInput available, initializing phone inputs');
      this.#initPhoneInputs();
    }
  }

  async #loadIntlTelInput() {
    const resources = [
      { tag: 'link', rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.min.css' },
      { tag: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js', async: true },
      { tag: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js', async: true },
    ];

    await Promise.all(resources.map(({ tag, ...attrs }) => {
      const element = document.createElement(tag);
      Object.assign(element, attrs);
      document.head.appendChild(element);
      return tag === 'link' ? Promise.resolve() : new Promise(resolve => element.onload = resolve);
    }));

    this.#intlTelInputAvailable = true;
    this.#logger.debug('intlTelInput and utils loaded');
  }

  #initPhoneInputs() {
    if (!this.#intlTelInputAvailable) return;

    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    this.#logger.info(`Found ${phoneInputs.length} phone inputs`);
    phoneInputs.forEach((input, i) => this.#initializePhoneInput(input, i + 1));
    
    // Setup integration with AddressHandler
    this.#setupAddressHandlerIntegration();
  }

  #initializePhoneInput(input, index) {
    try {
      // Get the initial country from AddressHandler or default to US
      const initialCountry = this.#getInitialCountry(input);
      
      const iti = window.intlTelInput(input, {
        utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
        separateDialCode: true,
        initialCountry: initialCountry,
        allowDropdown: true, // Enable country dropdown
        preferredCountries: ['us', 'ca', 'gb', 'au'], // Common countries at top
        dropdownContainer: document.body,
        useFullscreenPopup: false, // Better for desktop
        formatOnDisplay: true,
        autoPlaceholder: 'aggressive',
        customContainer: 'iti-tel-input',
        autoFormat: true,
        nationalMode: false, // Use international mode for better validation
        geoIpLookup: null // Disable GeoIP since we get country from AddressHandler
      });

      input.iti = iti;
      
      // Store the instance for syncing
      const fieldAttr = input.getAttribute('os-checkout-field');
      this.#phoneInstances.set(fieldAttr, { input, iti });
      
      this.#logger.debug(`Phone input ${index} (${fieldAttr ?? 'unknown'}) initialized with country: ${initialCountry}`);

      this.#setupPhoneInputSync(input, iti);
      this.#setupPhoneValidation(input, iti);
      this.#setupCountryChangeListener(input, iti);

      // Add input event listener for formatting and validation
      input.addEventListener('input', () => {
        const number = input.value.trim();
        
        // Clear any existing error if the field is empty
        if (!number) {
          this.#clearError(input);
          return;
        }

        const isValid = iti.isValidNumber();
        const numberType = iti.getNumberType();
        const validationError = iti.getValidationError();
        
        this.#logger.debug('Phone validation:', {
          number,
          isValid,
          formattedNumber: iti.getNumber(),
          country: iti.getSelectedCountryData().iso2,
          type: this.#getNumberTypeName(numberType),
          error: validationError
        });
      });

      // Add blur event for validation and final formatting
      input.addEventListener('blur', () => {
        const number = input.value.trim();
        if (number) {
          const isValid = iti.isValidNumber();
          const countryData = iti.getSelectedCountryData();
          
          this.#logger.debug('Phone field blur - Final validation:', {
            number,
            isValid,
            country: countryData.iso2,
            formattedNumber: iti.getNumber()
          });

          if (!isValid) {
            const countryName = countryData.name || 'selected country';
            this.#showError(input, `Please enter a valid ${countryName} phone number`);
          } else {
            this.#clearError(input);
          }
        }
      });

    } catch (error) {
      this.#logger.error(`Error initializing phone input ${index}:`, error);
    }
  }

  /**
   * Get the initial country for phone input from AddressHandler or URL params
   */
  #getInitialCountry(input) {
    // First check the corresponding country select field (which has been validated by AddressHandler)
    const fieldAttr = input.getAttribute('os-checkout-field');
    const countrySelect = document.querySelector(
      fieldAttr === 'phone' ? '[os-checkout-field="country"]' : '[os-checkout-field="billing-country"]'
    );
    
    if (countrySelect && countrySelect.value) {
      this.#logger.debug(`Using validated country from select for phone input: ${countrySelect.value}`);
      return countrySelect.value.toLowerCase();
    }
    
    // Only check for forced country if no validated country select value exists
    if (window.osAddressHandler && typeof window.osAddressHandler.getForcedCountry === 'function') {
      const forcedCountry = window.osAddressHandler.getForcedCountry();
      if (forcedCountry) {
        // Check if this forced country is actually in the available countries list
        const availableCountries = window.osAddressHandler.getAvailableCountries();
        const isValidCountry = availableCountries.some(country => country.iso2 === forcedCountry);
        
        if (isValidCountry) {
          this.#logger.debug(`Using validated forced country for phone input: ${forcedCountry}`);
          return forcedCountry.toLowerCase();
        } else {
          this.#logger.debug(`Forced country ${forcedCountry} not in available countries list, falling back`);
        }
      }
    }
    
    // Fallback to address config default country or US
    const defaultCountry = window.osConfig?.addressConfig?.defaultCountry || 'US';
    this.#logger.debug(`Using default country for phone input: ${defaultCountry}`);
    return defaultCountry.toLowerCase();
  }

  /**
   * Setup integration with AddressHandler to sync country changes
   */
  #setupAddressHandlerIntegration() {
    // Wait for AddressHandler to be available and initialized
    const waitForAddressHandler = () => {
      if (window.osAddressHandler) {
        // Give AddressHandler a moment to finish its initialization and validation
        setTimeout(() => {
          this.#setupCountrySelectionSync();
          this.#updatePhoneCountriesFromValidatedSelects();
        }, 100);
      } else {
        // Wait for AddressHandler to be available
        const checkInterval = setInterval(() => {
          if (window.osAddressHandler) {
            clearInterval(checkInterval);
            // Give AddressHandler a moment to finish its initialization and validation
            setTimeout(() => {
              this.#setupCountrySelectionSync();
              this.#updatePhoneCountriesFromValidatedSelects();
            }, 100);
          }
        }, 100);
        
        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
      }
    };

    waitForAddressHandler();
  }

  /**
   * Update phone countries from validated country selects after AddressHandler initialization
   */
  #updatePhoneCountriesFromValidatedSelects() {
    this.#phoneInstances.forEach((phoneInstance, fieldType) => {
      const updatedCountry = this.#getInitialCountry(phoneInstance.input);
      this.#updatePhoneCountry(phoneInstance.iti, updatedCountry);
      this.#logger.debug(`Updated ${fieldType} to validated country: ${updatedCountry}`);
    });
  }

  /**
   * Setup synchronization with country select fields
   */
  #setupCountrySelectionSync() {
    const countrySelects = [
      document.querySelector('[os-checkout-field="country"]'),
      document.querySelector('[os-checkout-field="billing-country"]')
    ];

    countrySelects.forEach(countrySelect => {
      if (!countrySelect) return;

      countrySelect.addEventListener('change', (e) => {
        const selectedCountry = e.target.value;
        if (!selectedCountry) return;

        const fieldType = e.target.getAttribute('os-checkout-field');
        const phoneFieldType = fieldType === 'country' ? 'phone' : 'billing-phone';
        const phoneInstance = this.#phoneInstances.get(phoneFieldType);

        if (phoneInstance) {
          this.#updatePhoneCountry(phoneInstance.iti, selectedCountry);
          this.#logger.debug(`Updated phone country to ${selectedCountry} for ${phoneFieldType}`);
        }
      });
    });

    this.#logger.debug('Country selection sync setup complete');
  }

  /**
   * Setup listener for when user changes country in phone input dropdown
   */
  #setupCountryChangeListener(input, iti) {
    input.addEventListener('countrychange', () => {
      const selectedCountryData = iti.getSelectedCountryData();
      const countryCode = selectedCountryData.iso2.toUpperCase();
      
      this.#logger.debug(`Phone country changed to: ${countryCode}`);
      
      // Update the corresponding country select if needed
      const fieldAttr = input.getAttribute('os-checkout-field');
      const countrySelect = document.querySelector(
        fieldAttr === 'phone' ? '[os-checkout-field="country"]' : '[os-checkout-field="billing-country"]'
      );
      
      if (countrySelect && countrySelect.value !== countryCode) {
        this.#logger.debug(`Syncing country select to: ${countryCode}`);
        countrySelect.value = countryCode;
        countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  /**
   * Update phone input country programmatically
   */
  #updatePhoneCountry(iti, countryCode) {
    try {
      iti.setCountry(countryCode.toLowerCase());
    } catch (error) {
      this.#logger.warn(`Failed to set phone country to ${countryCode}:`, error);
    }
  }

  #showError(input, message) {
    // Add error class to input
    input.classList.add('error');
    
    // Add error class to iti container
    const itiContainer = input.closest('.iti');
    if (itiContainer) {
      itiContainer.classList.add('error');
      itiContainer.style.border = '1px solid red';
    }
    
    // Find or create error message element
    const wrapper = input.closest('.frm-flds') || input.closest('.form-group') || input.parentElement;
    let errorElement = wrapper.querySelector('.pb-input-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'pb-input-error';
      wrapper.appendChild(errorElement);
    }
    
    // Set error message and styles
    errorElement.textContent = message;
    Object.assign(errorElement.style, {
      color: 'red',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      display: 'block',
      position: 'relative',
      clear: 'both'
    });
  }

  #clearError(input) {
    // Remove error class from input
    input.classList.remove('error');
    
    // Remove error class from iti container
    const itiContainer = input.closest('.iti');
    if (itiContainer) {
      itiContainer.classList.remove('error');
      itiContainer.style.border = '';
    }
    
    // Remove error message
    const wrapper = input.closest('.frm-flds') || input.closest('.form-group') || input.parentElement;
    const errorElement = wrapper.querySelector('.pb-input-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  // Helper method to convert number type to readable name
  #getNumberTypeName(type) {
    const types = {
      0: 'FIXED_LINE',
      1: 'MOBILE',
      2: 'FIXED_LINE_OR_MOBILE',
      3: 'TOLL_FREE',
      4: 'PREMIUM_RATE',
      5: 'SHARED_COST',
      6: 'VOIP',
      7: 'PERSONAL_NUMBER',
      8: 'PAGER',
      9: 'UAN',
      10: 'UNKNOWN'
    };
    return types[type] || 'UNKNOWN';
  }

  #setupPhoneInputSync(input, iti) {
    const fieldAttr = input.getAttribute('os-checkout-field');
    if (!fieldAttr) {
      this.#logger.warn('Phone input missing os-checkout-field attribute');
      return;
    }

    // Get the initial country and set it
    const initialCountry = this.#getInitialCountry(input);
    this.#updatePhoneCountry(iti, initialCountry);
  }

  #setupPhoneValidation(input, iti) {
    input.validatePhone = () => !input.value.trim() ? !input.hasAttribute('required') : iti.isValidNumber();
    input.getFormattedNumber = () => iti.getNumber();

    const form = input.closest('form');
    form?.addEventListener('submit', () => {
      if (input.value.trim() && iti.isValidNumber()) {
        input.value = iti.getNumber();
        this.#logger.debug(`Formatted phone number set to ${input.value} on submit`);
      }
    });
  }

  // Public methods for external integration
  
  /**
   * Manually update phone country for a specific field
   * @param {string} fieldType - 'phone' or 'billing-phone'
   * @param {string} countryCode - Country code (e.g., 'US', 'GB')
   */
  updatePhoneCountry(fieldType, countryCode) {
    const phoneInstance = this.#phoneInstances.get(fieldType);
    if (phoneInstance) {
      this.#updatePhoneCountry(phoneInstance.iti, countryCode);
      this.#logger.info(`Updated ${fieldType} country to ${countryCode}`);
    } else {
      this.#logger.warn(`Phone instance not found for ${fieldType}`);
    }
  }

  /**
   * Get all phone instances
   * @returns {Map} Map of phone instances
   */
  getPhoneInstances() {
    return this.#phoneInstances;
  }
}