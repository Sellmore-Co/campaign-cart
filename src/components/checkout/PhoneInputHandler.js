export class PhoneInputHandler {
  #logger;
  #intlTelInputAvailable = !!window.intlTelInput;

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
  }

  #initializePhoneInput(input, index) {
    try {
      const iti = window.intlTelInput(input, {
        utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
        separateDialCode: true,
        onlyCountries: ['us'],
        initialCountry: 'us',
        allowDropdown: false,
        dropdownContainer: document.body,
        useFullscreenPopup: true,
        formatOnDisplay: true,
        autoPlaceholder: 'aggressive',
        customContainer: 'iti-tel-input',
        autoFormat: true,
        nationalMode: true
      });

      input.iti = iti;
      this.#logger.debug(`Phone input ${index} (${input.getAttribute('os-checkout-field') ?? 'unknown'}) initialized`);

      this.#setupPhoneInputSync(input, iti);
      this.#setupPhoneValidation(input, iti);

      // Add input event listener for formatting and validation
      input.addEventListener('input', () => {
        const number = input.value.trim();
        
        // Format the number as user types
        if (number) {
          // Remove all non-numeric characters
          const numericValue = number.replace(/\D/g, '');
          
          // Format according to US pattern (XXX) XXX-XXXX
          let formattedNumber = '';
          if (numericValue.length > 0) {
            if (numericValue.length <= 3) {
              formattedNumber = `(${numericValue}`;
            } else if (numericValue.length <= 6) {
              formattedNumber = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3)}`;
            } else {
              formattedNumber = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)}-${numericValue.slice(6, 10)}`;
            }
          }
          
          // Only update if the format is different to avoid cursor jumping
          if (input.value !== formattedNumber) {
            // Store cursor position
            const cursorPos = input.selectionStart;
            const oldLength = input.value.length;
            
            // Update value
            input.value = formattedNumber;
            
            // Calculate new cursor position
            if (cursorPos !== null) {
              const newLength = formattedNumber.length;
              const cursorOffset = newLength - oldLength;
              input.setSelectionRange(cursorPos + cursorOffset, cursorPos + cursorOffset);
            }
          }
        }

        const isValid = iti.isValidNumber();
        const numberType = iti.getNumberType();
        const validationError = iti.getValidationError();

        // Clear any existing error if the field is empty
        if (!number) {
          this.#clearError(input);
          return;
        }

        console.group('Phone Number Validation');
        console.log('Number:', number);
        console.log('Is Valid:', isValid);
        console.log('Formatted Number:', iti.getNumber());
        console.log('Number Type:', this.#getNumberTypeName(numberType));
        console.log('Validation Error:', validationError);
        console.groupEnd();

        this.#logger.debug('Phone validation:', {
          number,
          isValid,
          formattedNumber: iti.getNumber(),
          type: this.#getNumberTypeName(numberType),
          error: validationError
        });
      });

      // Add blur event for validation and final formatting
      input.addEventListener('blur', () => {
        const number = input.value.trim();
        if (number) {
          const isValid = iti.isValidNumber();
          
          // On blur, ensure the number is in full international format
          if (isValid) {
            input.value = iti.getNumber(intlTelInputUtils.numberFormat.NATIONAL);
          }
          
          console.log('Phone field blur - Final validation:', {
            number,
            isValid,
            formattedNumber: iti.getNumber()
          });

          if (!isValid) {
            this.#showError(input, 'Please enter a valid US phone number (e.g. 555-555-5555)');
          } else {
            this.#clearError(input);
          }
        }
      });

    } catch (error) {
      this.#logger.error(`Error initializing phone input ${index}:`, error);
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
    const wrapper = input.closest('.frm-flds') || input.closest('.form-group');
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
    const wrapper = input.closest('.frm-flds') || input.closest('.form-group');
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

    const countrySelect = document.querySelector(
      fieldAttr === 'phone' ? '[os-checkout-field="country"]' : '[os-checkout-field="billing-country"]'
    );

    if (!countrySelect) {
      this.#logger.warn(`Country select not found for ${fieldAttr}`);
      return;
    }

    // Set country select to US if it exists
    if (countrySelect.value !== 'US') {
      countrySelect.value = 'US';
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
      this.#logger.debug('Country select updated to US');
    }
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
}