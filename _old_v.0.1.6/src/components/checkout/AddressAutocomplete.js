export class AddressAutocomplete {
    #logger;
    #fieldsShown = false;
    #elements;
    #enableAutocomplete;
    #autocompleteInstances = {};
  
    constructor(logger, options = {}) {
      this.#logger = logger;
      this.#enableAutocomplete = options.enableGoogleMapsAutocomplete !== false;
      
      this.#elements = {
        shipping: {
          address: document.querySelector('[os-checkout-field="address1"]'),
          city: document.querySelector('[os-checkout-field="city"]'),
          state: document.querySelector('[os-checkout-field="province"]'),
          zip: document.querySelector('[os-checkout-field="postal"]'),
          country: document.querySelector('[os-checkout-field="country"]'),
        },
        billing: {
          address: document.querySelector('[os-checkout-field="billing-address1"]'),
          city: document.querySelector('[os-checkout-field="billing-city"]'),
          state: document.querySelector('[os-checkout-field="billing-province"]'),
          zip: document.querySelector('[os-checkout-field="billing-postal"]'),
          country: document.querySelector('[os-checkout-field="billing-country"]'),
        },
        locations: document.querySelectorAll('[data-os-component="location"]'),
      };
  
      this.#logger.info(`AddressAutocomplete initialized (autocomplete ${this.#enableAutocomplete ? 'enabled' : 'disabled'})`);
      this.#hideLocationFields();
      this.#init();
    }
  
    async #init() {
      this.#setupAutofillDetection();
      
      // Skip Google Maps initialization if autocomplete is disabled
      if (!this.#enableAutocomplete) {
        this.#logger.debug('Google Maps autocomplete disabled, using basic field listeners');
        return this.#setupBasicFieldListeners();
      }
      
      await this.#initAutocompleteWithRetry();
    }
  
    #hideLocationFields() {
      if (this.#fieldsShown) return;
      this.#elements.locations.forEach(el => el.classList.add('cc-hidden'));
      this.#logger.debug('Location fields hidden');
    }
  
    #showLocationFields() {
      if (this.#fieldsShown) return;
      this.#elements.locations.forEach(el => el.classList.remove('cc-hidden'));
      this.#fieldsShown = true;
      document.dispatchEvent(new CustomEvent('location-fields-shown'));
      this.#logger.debug('Location fields shown');
    }
  
    #isGoogleMapsAvailable() {
      return !!window.google?.maps?.places;
    }
  
    async #initAutocompleteWithRetry(attempt = 0) {
      // Skip if autocomplete is disabled
      if (!this.#enableAutocomplete) {
        return this.#setupBasicFieldListeners();
      }
      
      if (this.#isGoogleMapsAvailable()) {
        this.#logger.debug('Google Maps API available');
        return this.#initializeAutocomplete();
      }
      if (attempt >= 3) {
        this.#logger.warn('Google Maps API unavailable after 3 attempts');
        return this.#setupBasicFieldListeners();
      }
  
      this.#logger.debug(`Retrying Google Maps check, attempt ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * 1.5 ** attempt));
      return this.#initAutocompleteWithRetry(attempt + 1);
    }
  
    #initializeAutocomplete() {
      const { shipping, billing } = this.#elements;
      [shipping, billing].forEach(fields => {
        if (fields.address) {
          this.#setupAutocomplete(fields.address, fields);
          this.#logger.debug(`Autocomplete set up for ${fields.address.getAttribute('os-checkout-field')}`);
        }
      });
      
      // Listen for country changes to update restrictions
      if (shipping.country) {
        shipping.country.addEventListener('change', () => {
          const autocomplete = this.#autocompleteInstances['address1'];
          if (autocomplete && shipping.country.value && shipping.country.value.length === 2) {
            autocomplete.setComponentRestrictions({ country: shipping.country.value });
          }
        });
      }
      
      if (billing.country) {
        billing.country.addEventListener('change', () => {
          const autocomplete = this.#autocompleteInstances['billing-address1'];
          if (autocomplete && billing.country.value && billing.country.value.length === 2) {
            autocomplete.setComponentRestrictions({ country: billing.country.value });
          }
        });
      }
    }
  
    #setupAutocomplete(input, fields) {
      try {
        // Get country value - either from field or default config (same as AddressHandler)
        const countryValue = fields.country?.value || 
          window.osConfig?.addressConfig?.defaultCountry || 
          document.querySelector('meta[name="os-address-default-country"]')?.content || 
          'US';
        
        const options = {
          types: ['address'],
          fields: ['address_components', 'formatted_address'],
        };
        
        // Always set country restriction
        options.componentRestrictions = { country: countryValue };
        this.#logger.debug(`Autocomplete for ${input.getAttribute('os-checkout-field')} restricted to: ${countryValue}`);
        
        const autocomplete = new google.maps.places.Autocomplete(input, options);
        
        // Store the instance for later updates
        const fieldKey = input.getAttribute('os-checkout-field');
        this.#autocompleteInstances[fieldKey] = autocomplete;
  
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.address_components) return;
  
          this.#showLocationFields();
          const components = Object.fromEntries(
            place.address_components.map(c => [c.types[0], { long: c.long_name, short: c.short_name }])
          );
  
          fields.address.value = [components.street_number?.long, components.route?.long].filter(Boolean).join(' ');
          fields.city && (fields.city.value = components.locality?.long ?? '');
          fields.zip && (fields.zip.value = components.postal_code?.long ?? '');
  
          if (fields.country && components.country) {
            const countryCode = components.country.short;
            if (fields.country.value !== countryCode) {
              fields.country.value = countryCode;
              fields.country.dispatchEvent(new Event('change', { bubbles: true }));
              this.#logger.debug(`Country set to ${countryCode}`);
            }
            if (fields.state && components.administrative_area_level_1) {
              this.#setStateWithRetry(fields.state, components.administrative_area_level_1.short);
            }
          }
  
          [fields.address, fields.city, fields.zip].forEach(el => el?.dispatchEvent(new Event('change', { bubbles: true })));
        });
  
        input.addEventListener('blur', () => input.value.length > 10 && this.#showLocationFields());
        input.addEventListener('keydown', e => e.key === 'Enter' && e.preventDefault());
      } catch (error) {
        this.#logger.error('Autocomplete setup failed:', error);
        this.#setupBasicFieldListeners();
      }
    }
  
    async #setStateWithRetry(stateSelect, stateCode, attempt = 0) {
      if (attempt >= 5) {
        this.#logger.warn(`Failed to set state ${stateCode} after 5 attempts`);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 300 * 1.5 ** attempt));
  
      const hasOption = Array.from(stateSelect.options).some(opt => opt.value === stateCode);
      if (hasOption) {
        stateSelect.value = stateCode;
        stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
        this.#logger.debug(`State set to ${stateCode}`);
      } else {
        this.#setStateWithRetry(stateSelect, stateCode, attempt + 1);
      }
    }
  
    #setupBasicFieldListeners() {
      [this.#elements.shipping.address, this.#elements.billing.address].forEach(field => {
        field?.addEventListener('blur', () => field.value.length > 10 && this.#showLocationFields());
      });
      this.#logger.debug('Basic field listeners set up');
    }
  
    #setupAutofillDetection() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes onAutoFillStart { from { opacity: 0.99; } to { opacity: 1; } }
        input:-webkit-autofill { animation-name: onAutoFillStart; }
      `;
      document.head.appendChild(style);
  
      const fields = [this.#elements.shipping.address, this.#elements.billing.address].filter(Boolean);
      fields.forEach(field => {
        field.addEventListener('input', () => field.value.length > 10 && this.#showLocationFields());
        field.addEventListener('change', () => field.value.length > 0 && this.#showLocationFields());
        field.addEventListener('animationstart', e => {
          if (e.animationName === 'onAutoFillStart') {
            this.#logger.debug(`Autofill detected on ${field.getAttribute('os-checkout-field')}`);
            this.#showLocationFields();
          }
        });
      });
      this.#logger.debug('Autofill detection initialized');
    }
  }