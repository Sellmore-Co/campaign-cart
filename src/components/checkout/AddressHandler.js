/**
 * AddressHandler - Manages country/state dropdowns and related UI based on centralized location data.
 */
export class AddressHandler {
  #form;
  #logger;
  #app; // Added reference to the main app instance
  #elements;
  #uiElements; // For labels etc.
  #merchantConfig; // Added: To store merchant-specific config
  initialized = false; // Track initialization state

  constructor(form, logger, app) { // Added app instance
    this.#form = form;
    this.#logger = logger;
    this.#app = app; // Store the app instance
    this.#merchantConfig = this.#readMerchantConfig(); // Read merchant config
    this.#elements = {
      shippingCountry: document.querySelector('[os-checkout-field="country"]'),
      shippingState: document.querySelector('[os-checkout-field="province"]'),
      billingCountry: document.querySelector('[os-checkout-field="billing-country"]'),
      billingState: document.querySelector('[os-checkout-field="billing-province"]'),
    };
    // Define UI elements for labels here
    this.#uiElements = {
        shippingStateLabel: document.querySelector('label[for="' + this.#elements.shippingState?.id + '"]'),
        shippingPostcodeLabel: document.querySelector('label[for="' + document.querySelector('[os-checkout-field="postal"]')?.id + '"]'),
        billingStateLabel: document.querySelector('label[for="' + this.#elements.billingState?.id + '"]'),
        billingPostcodeLabel: document.querySelector('label[for="' + document.querySelector('[os-checkout-field="billing-postal"]')?.id + '"]'),
    };

    // Basic check if essential elements are present
    if (this.#elements.shippingCountry || this.#elements.billingCountry) {
      this.#logger.info('AddressHandler initializing...');
      // No immediate #init() call, wait for state data
      // Subscribe to state changes for location data
      this.#app.state.subscribe('location', this.#handleLocationStateUpdate.bind(this));
      // Check initial state in case data arrived before subscription
      this.#handleLocationStateUpdate(this.#app.state.getState('location'));
    } else {
      this.#logger.warn('No country select elements found, AddressHandler inactive.');
    }
  }

  /**
   * Read merchant-specific address configuration from window.osConfig or meta tags.
   */
  #readMerchantConfig() {
      const config = {
          defaultCountry: window.osConfig?.addressConfig?.defaultCountry ?? document.querySelector('meta[name="os-address-default-country"]')?.content ?? null,
          showCountries: window.osConfig?.addressConfig?.showCountries ?? document.querySelector('meta[name="os-address-show-countries"]')?.content?.split(',').map(c => c.trim().toUpperCase()) ?? [],
          // dontShowStates is likely superseded by worker config, but we could read it as a fallback?
          // dontShowStates: window.osConfig?.addressConfig?.dontShowStates ?? document.querySelector('meta[name="os-address-dont-show-states"]')?.content?.split(',').map(s => s.trim().toUpperCase()) ?? [],
      };
      this.#logger.info('Read merchant address config:', config);
      return config;
  }

  /**
   * Handle updates to the location state data.
   * This function is called initially and whenever location state changes.
   */
  #handleLocationStateUpdate(locationState) {
    if (!locationState || !locationState.countries || locationState.countries.length === 0) {
      this.#logger.warn('Location state update received, but country data is missing or empty. Cannot initialize.');
      // Optionally disable dropdowns here
      return;
    }

    this.#logger.info('Received location state update, initializing/updating address fields.');
    
    // Only initialize once
    if (!this.initialized) {
        this.#initializeAddressFields(locationState);
        this.initialized = true; // Mark as initialized
    }
  }
  
  /**
   * Perform the initial population of address fields based on fetched location data
   * and merchant configuration.
   */
  #initializeAddressFields(locationState) {
      const allCountries = locationState.countries || [];
      const detectedCountryCode = locationState.detectedCountryCode; // From worker
      const merchantDefaultCountry = this.#merchantConfig.defaultCountry; // From osConfig
      const allowedCountriesList = this.#merchantConfig.showCountries; // From osConfig

      // Filter countries based on merchant config
      const filteredCountries = (allowedCountriesList && allowedCountriesList.length > 0) 
          ? allCountries.filter(c => allowedCountriesList.includes(c.code.toUpperCase()))
          : allCountries; // Show all if config is empty

      this.#logger.debug(`Initializing with ${filteredCountries.length} allowed countries. Detected: ${detectedCountryCode}. Merchant Default: ${merchantDefaultCountry}`);
      
      // Determine the initial country to select
      let initialSelectedCountryCode = null;
      const detectedCountryAllowed = detectedCountryCode && filteredCountries.some(c => c.code === detectedCountryCode);
      const merchantDefaultAllowed = merchantDefaultCountry && filteredCountries.some(c => c.code === merchantDefaultCountry);

      if (detectedCountryAllowed) {
          initialSelectedCountryCode = detectedCountryCode;
          this.#logger.debug(`Using detected country (${detectedCountryCode}) as initial selection.`);
      } else if (merchantDefaultAllowed) {
          initialSelectedCountryCode = merchantDefaultCountry;
          this.#logger.debug(`Detected country not allowed or not found. Using merchant default (${merchantDefaultCountry}) as initial selection.`);
      } else if (filteredCountries.length > 0) {
          // Fallback: if neither detected nor merchant default is allowed/available, select the first allowed country
          initialSelectedCountryCode = filteredCountries[0].code;
          this.#logger.debug(`Neither detected nor merchant default allowed/available. Falling back to first allowed country: ${initialSelectedCountryCode}`);
      }
      
      // Store the final initial selected country and allowed codes in the state
      this.#app.state.setState('location.initialSelectedCountryCode', initialSelectedCountryCode, false); // No separate notify
      const allowedCodesLowercase = filteredCountries.map(c => c.code.toLowerCase());
      this.#app.state.setState('location.allowedCountryCodes', allowedCodesLowercase, false); // No separate notify
      this.#logger.debug('Stored initialSelectedCountryCode and allowedCountryCodes in state', { initial: initialSelectedCountryCode, allowed: allowedCodesLowercase });

      // Populate Country Dropdowns with filtered list and determined selection
      this.#populateCountrySelect(this.#elements.shippingCountry, filteredCountries, initialSelectedCountryCode);
      this.#populateCountrySelect(this.#elements.billingCountry, filteredCountries, initialSelectedCountryCode);

      // Populate Initial State Dropdown (for the selected country if applicable)
      if (initialSelectedCountryCode) {
          const initialStates = locationState.statesByCountry?.[initialSelectedCountryCode] || [];
          const initialConfig = locationState.configsByCountry?.[initialSelectedCountryCode] || {};
          this.#logger.debug(`Populating initial states for selected country ${initialSelectedCountryCode}:`, { states: initialStates, config: initialConfig });
          
          this.#updateStateSelect(this.#elements.shippingState, initialSelectedCountryCode, initialStates, initialConfig);
          this.#updateStateSelect(this.#elements.billingState, initialSelectedCountryCode, initialStates, initialConfig);
          
          // Also update labels based on initial config
          this.#updateUiLabels(initialConfig, 'shipping');
          this.#updateUiLabels(initialConfig, 'billing'); // Assume billing uses same labels initially
      }

      this.#setupCountryChangeListeners();
      this.#logger.info('AddressHandler fields initialized with merchant config applied.');
  }

  /**
   * Populates a country select dropdown with the provided (filtered) list.
   * @param {HTMLSelectElement} countrySelect - The dropdown element.
   * @param {Array} countriesToShow - Filtered array of country objects.
   * @param {string|null} selectedValue - The country code to pre-select.
   */
  #populateCountrySelect(countrySelect, countriesToShow, selectedValue) {
    if (!countrySelect) return;

    const currentVal = countrySelect.value; // Preserve value if already set?
    countrySelect.innerHTML = '<option value="">Select Country...</option>'; // Clear previous options

    countriesToShow.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code; 
      option.textContent = country.name; 
      if(country.phonecode) option.dataset.phonecode = country.phonecode;
      countrySelect.appendChild(option);
    });

    // Set the selected value
    if (selectedValue && countriesToShow.some(c => c.code === selectedValue)) {
        countrySelect.value = selectedValue;
        this.#logger.debug(`Set initial country ${selectedValue} in dropdown:`, countrySelect.name || countrySelect.id);
    } else if (currentVal && countriesToShow.some(c => c.code === currentVal)) {
       countrySelect.value = currentVal; // Restore previous value only if it's in the allowed list
       this.#logger.debug(`Restored previous country ${currentVal} in dropdown:`, countrySelect.name || countrySelect.id);
    } else {
        countrySelect.value = ""; // Ensure prompt is selected if no valid selection
    }
  }

  #setupCountryChangeListeners() {
    const pairs = [
      { country: this.#elements.shippingCountry, state: this.#elements.shippingState, type: 'shipping' },
      { country: this.#elements.billingCountry, state: this.#elements.billingState, type: 'billing' }
    ];
    pairs.forEach(({ country, state, type }) => {
      if (country) {
        country.addEventListener('change', (event) => {
            this.#handleCountryChange(event.target.value, state, type);
        });
      }
    });
    this.#logger.debug('Country change listeners set up.');
  }

  /**
   * Handle the change event when a country is selected.
   * Fetches states/config if not already in state.
   * @param {string} selectedCountryCode - The newly selected country code.
   * @param {HTMLSelectElement} stateSelect - The corresponding state dropdown element.
   * @param {string} addressType - 'shipping' or 'billing'
   */
  async #handleCountryChange(selectedCountryCode, stateSelect, addressType) {
    if (!stateSelect) return; // No corresponding state dropdown

    this.#logger.info(`Country changed to: ${selectedCountryCode} for ${addressType} address.`);

    if (!selectedCountryCode) {
        // No country selected, clear states and config
        this.#updateStateSelect(stateSelect, selectedCountryCode, [], {});
        this.#updateUiLabels({}, addressType); // Reset labels
        return;
    }

    // Check if data exists in state
    let states = this.#app.state.getState(`location.statesByCountry.${selectedCountryCode}`);
    let config = this.#app.state.getState(`location.configsByCountry.${selectedCountryCode}`);

    if (states && config) {
      this.#logger.debug(`Using cached states and config for ${selectedCountryCode} from state.`);
      this.#updateStateSelect(stateSelect, selectedCountryCode, states, config);
      this.#updateUiLabels(config, addressType);
    } else {
      this.#logger.debug(`No cached data for ${selectedCountryCode}, fetching from worker...`);
      stateSelect.innerHTML = '<option value="">Loading States...</option>';
      stateSelect.disabled = true;
      try {
        const data = await this.#app.api.getCountryStatesAndConfig(selectedCountryCode);
        // Store fetched data in state (StateManager handles merging/updating)
        this.#app.state.setCountryStatesAndConfig(selectedCountryCode, data);
        // Now update the UI with the fetched (and now cached) data
        this.#updateStateSelect(stateSelect, selectedCountryCode, data.states || [], data.countryConfig || {});
        this.#updateUiLabels(data.countryConfig || {}, addressType);
      } catch (error) {
        this.#logger.error(`Failed to fetch states/config for ${selectedCountryCode}:`, error);
        stateSelect.innerHTML = '<option value="">Error loading</option>';
        stateSelect.disabled = true;
        this.#updateUiLabels({}, addressType); // Reset labels on error
      }
    }
  }

  /**
   * Updates the state dropdown and its associated UI based on fetched/cached data.
   * @param {HTMLSelectElement} stateSelect - The state dropdown element.
   * @param {string} countryCode - The selected country code.
   * @param {Array} states - Array of state objects { code, name }.
   * @param {Object} config - The countryConfig object.
   */
  #updateStateSelect(stateSelect, countryCode, states, config) {
    if (!stateSelect) return;

    const currentValue = stateSelect.value || stateSelect.getAttribute('data-pending-state') || '';
    this.#logger.debug(`Updating state select for ${countryCode}`, { numStates: states.length, config });

    if (!states || states.length === 0) {
        stateSelect.innerHTML = '<option value="">N/A</option>';
        stateSelect.disabled = true;
        // Hide the parent element if desired when no states
        stateSelect.parentElement.style.display = 'none';
    } else {
        stateSelect.innerHTML = `<option value="">Select ${config.stateLabel || 'State/Province'}...</option>`;
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.code;
            option.textContent = state.name;
            stateSelect.appendChild(option);
        });
        
        // Restore previous/pending value if valid
        if (currentValue && states.some(s => s.code === currentValue)) {
            stateSelect.value = currentValue;
        } else {
             stateSelect.value = ""; // Ensure default prompt is selected
        }

        stateSelect.disabled = !(config.stateRequired ?? false); // Disable if state not required
        stateSelect.parentElement.style.display = ''; // Ensure parent is visible
    }
  }

  /**
   * Updates UI labels based on country configuration.
   * @param {Object} config - The countryConfig object.
   * @param {string} addressType - 'shipping' or 'billing'.
   */
  #updateUiLabels(config, addressType) {
      this.#logger.debug(`Updating UI labels for ${addressType} address with config:`, config);
      const stateLabelElement = (addressType === 'shipping') ? this.#uiElements.shippingStateLabel : this.#uiElements.billingStateLabel;
      const postcodeLabelElement = (addressType === 'shipping') ? this.#uiElements.shippingPostcodeLabel : this.#uiElements.billingPostcodeLabel;

      if (stateLabelElement) {
          stateLabelElement.textContent = config.stateLabel || 'State / Province';
          // Optionally add asterisk if required
          if (config.stateRequired) {
             stateLabelElement.innerHTML += ' <span class="required">*</span>'; 
          } else {
             // Remove asterisk if previously added
             const requiredSpan = stateLabelElement.querySelector('span.required');
             if(requiredSpan) requiredSpan.remove();
          }
      }
      if (postcodeLabelElement) {
          postcodeLabelElement.textContent = config.postcodeLabel || 'Postal / ZIP Code';
          // Postcode is generally always required, but could add asterisk logic if needed
          // postcodeLabelElement.innerHTML += ' <span class="required">*</span>'; 
      }
  }
}