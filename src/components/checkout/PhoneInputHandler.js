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
      });

      input.iti = iti;
      this.#logger.debug(`Phone input ${index} (${input.getAttribute('os-checkout-field') ?? 'unknown'}) initialized`);

      this.#setupPhoneInputSync(input, iti);
      this.#setupPhoneValidation(input, iti);
    } catch (error) {
      this.#logger.error(`Error initializing phone input ${index}:`, error);
    }
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