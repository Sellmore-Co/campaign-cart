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
  #forcedCountry = null; // Added: To store forced country from URL parameter
  initialized = false; // Track initialization state

  constructor(form, logger, app) { // Added app instance
    this.#form = form;
    this.#logger = logger;
    this.#app = app; // Store the app instance
    this.#merchantConfig = this.#readMerchantConfig(); // Read merchant config
    this.#forcedCountry = this.#readForcedCountryParam(); // Read URL parameter
    this.#elements = {
      shippingCountry: document.querySelector('[os-checkout-field="country"]'),
      shippingState: document.querySelector('[os-checkout-field="province"]'),
      shippingPostcode: document.querySelector('[os-checkout-field="postal"]'),
      billingCountry: document.querySelector('[os-checkout-field="billing-country"]'),
      billingState: document.querySelector('[os-checkout-field="billing-province"]'),
      billingPostcode: document.querySelector('[os-checkout-field="billing-postal"]'),
    };
    // Define UI elements for labels here
    this.#uiElements = {
      shippingStateLabel: document.querySelector('label[for="' + this.#elements.shippingState?.id + '"]'),
      shippingPostcodeLabel: document.querySelector('label[for="' + this.#elements.shippingPostcode?.id + '"]'),
      billingStateLabel: document.querySelector('label[for="' + this.#elements.billingState?.id + '"]'),
      billingPostcodeLabel: document.querySelector('label[for="' + this.#elements.billingPostcode?.id + '"]'),
    };

    // Basic check if essential elements are present
    if (this.#elements.shippingCountry || this.#elements.billingCountry) {
      this.#logger.info('AddressHandler initializing...');
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
      defaultCountry: window.osConfig?.addressConfig?.defaultCountry ?? 
                     document.querySelector('meta[name="os-address-default-country"]')?.content ?? 
                     null,
      showCountries: window.osConfig?.addressConfig?.showCountries ?? 
                    document.querySelector('meta[name="os-address-show-countries"]')?.content?.split(',').map(c => c.trim().toUpperCase()) ?? 
                    [],
    };
    this.#logger.info('Read merchant address config:', config);
    return config;
  }

  /**
   * Read the forceCountry URL parameter if present
   * @returns {string|null} The forced country code or null
   */
  #readForcedCountryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const forceCountry = urlParams.get('forceCountry');
    
    if (forceCountry) {
      this.#logger.info(`Found forceCountry parameter: ${forceCountry}`);
      return forceCountry.toUpperCase();
    }
    
    return null;
  }

  /**
   * Handle updates to the location state data.
   * This function is called initially and whenever location state changes.
   */
  #handleLocationStateUpdate(locationState) {
    if (!locationState || !locationState.countries || locationState.countries.length === 0) {
      this.#logger.warn('Location state update received, but country data is missing or empty. Cannot initialize.');
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

    // Check if we have a forced country that exists in the available countries
    const forcedCountryExists = this.#forcedCountry && allCountries.some(c => c.code.toUpperCase() === this.#forcedCountry);
    
    // If forceCountry parameter exists and is valid, log it
    if (this.#forcedCountry) {
      if (forcedCountryExists) {
        this.#logger.info(`Using forced country from URL parameter: ${this.#forcedCountry}`);
      } else {
        this.#logger.warn(`Forced country ${this.#forcedCountry} from URL parameter not found in available countries.`);
      }
    }

    // Filter countries based on merchant config (unless we're forcing a country)
    const shouldFilterCountries = !(this.#forcedCountry && forcedCountryExists);
    let filteredCountries = allCountries;
    
    if (shouldFilterCountries && allowedCountriesList && allowedCountriesList.length > 0) {
      filteredCountries = allCountries.filter(c => allowedCountriesList.includes(c.code.toUpperCase()));
    }

    this.#logger.debug(`Initializing with ${filteredCountries.length} allowed countries. Detected: ${detectedCountryCode}. Merchant Default: ${merchantDefaultCountry}. Forced: ${this.#forcedCountry || 'none'}`);
    
    // Determine the initial country to select
    let initialSelectedCountryCode = null;
    
    // Forced country takes precedence if it exists in available countries
    if (forcedCountryExists) {
      initialSelectedCountryCode = this.#forcedCountry;
      this.#logger.debug(`Using forced country (${this.#forcedCountry}) from URL parameter as initial selection.`);
    } else {
      // Original priority logic if no force parameter
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
    }
    
    // Store the final initial selected country in the state
    this.#app.state.setState('location.initialSelectedCountryCode', initialSelectedCountryCode, false); // No separate notify
    
    // For the allowed country codes, use either all countries or filtered list
    const allowedCodesLowercase = shouldFilterCountries ? 
      filteredCountries.map(c => c.code.toLowerCase()) : 
      allCountries.map(c => c.code.toLowerCase());
    
    this.#app.state.setState('location.allowedCountryCodes', allowedCodesLowercase, false); // No separate notify
    this.#logger.debug('Stored initialSelectedCountryCode and allowedCountryCodes in state', { 
      initial: initialSelectedCountryCode, 
      allowed: allowedCodesLowercase,
      allowedCount: allowedCodesLowercase.length,
      forcedCountry: this.#forcedCountry || 'none'
    });

    // Populate Country Dropdowns with filtered list and determined selection
    this.#populateCountrySelect(this.#elements.shippingCountry, filteredCountries, initialSelectedCountryCode);
    this.#populateCountrySelect(this.#elements.billingCountry, filteredCountries, initialSelectedCountryCode);

    // Populate Initial State Dropdown (for the selected country if applicable)
    if (initialSelectedCountryCode) {
      const initialStates = locationState.statesByCountry?.[initialSelectedCountryCode] || [];
      const initialConfig = locationState.configsByCountry?.[initialSelectedCountryCode] || {};
      this.#logger.debug(`Populating initial states for selected country ${initialSelectedCountryCode}:`, { states: initialStates, config: initialConfig });
      
      // If this is a forced country and we don't have states data yet, fetch it
      if (this.#forcedCountry && 
          this.#forcedCountry.toUpperCase() === initialSelectedCountryCode.toUpperCase() && 
          (!initialStates || initialStates.length === 0)) {
        
        this.#logger.info(`Forced country ${this.#forcedCountry} selected but no states loaded. Fetching states data...`);
        
        // Show loading state in dropdowns
        this.#updateStateDropdownsWithLoadingState();
        
        // Fetch states for the forced country
        this.#app.api.getCountryStatesAndConfig(initialSelectedCountryCode)
          .then(data => {
            // Store the fetched data in state
            this.#app.state.setCountryStatesAndConfig(initialSelectedCountryCode, data);
            
            // Update the UI with the fetched data
            const states = data.states || [];
            const config = data.countryConfig || {};
            
            this.#logger.debug(`Fetched ${states.length} states for forced country ${initialSelectedCountryCode}`, config);
            
            this.#updateAddressFields(initialSelectedCountryCode, states, config);
          })
          .catch(error => {
            this.#logger.error(`Failed to fetch states for forced country ${initialSelectedCountryCode}:`, error);
            
            // Reset state dropdowns on error
            this.#updateAddressFields(initialSelectedCountryCode, [], {});
          });
      } else {
        // Normal flow with existing data
        this.#updateAddressFields(initialSelectedCountryCode, initialStates, initialConfig);
      }
    }

    this.#setupCountryChangeListeners();
    this.#logger.info('AddressHandler fields initialized with merchant config applied.');
  }

  /**
   * Helper method to update both state dropdowns with loading state
   */
  #updateStateDropdownsWithLoadingState() {
    if (this.#elements.shippingState) {
      this.#elements.shippingState.innerHTML = '<option value="">Loading States...</option>';
    }
    if (this.#elements.billingState) {
      this.#elements.billingState.innerHTML = '<option value="">Loading States...</option>';
    }
  }

  /**
   * Helper method to update both shipping and billing address fields
   */
  #updateAddressFields(countryCode, states, config) {
    this.#updateStateSelect(this.#elements.shippingState, countryCode, states, config);
    this.#updateStateSelect(this.#elements.billingState, countryCode, states, config);
    
    // Update labels based on config
    this.#updateUiLabels(config, 'shipping');
    this.#updateUiLabels(config, 'billing');
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

    // Get all countries for potential forced country
    const allCountries = this.#app.state.getState('location.countries') || [];
    
    // If we have a forced country but it's not in the filtered list, find it from all countries
    const forcedCountryObj = this.#forcedCountry && 
                            !countriesToShow.some(c => c.code.toUpperCase() === this.#forcedCountry) && 
                            allCountries.find(c => c.code.toUpperCase() === this.#forcedCountry);
    
    // If forced country exists but isn't in filtered list, add it
    if (forcedCountryObj && this.#forcedCountry) {
      this.#logger.debug(`Adding forced country ${this.#forcedCountry} to dropdown options`);
      countriesToShow = [...countriesToShow, forcedCountryObj];
    }

    countriesToShow.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code; 
      option.textContent = country.name; 
      if(country.phonecode) option.dataset.phonecode = country.phonecode;
      countrySelect.appendChild(option);
    });

    // Determine which country code to select
    let countryToSelect = null;
    
    if (this.#forcedCountry && countriesToShow.some(c => 
        c.code.toUpperCase() === this.#forcedCountry.toUpperCase() || 
        c.code.toLowerCase() === this.#forcedCountry.toLowerCase())) {
      countryToSelect = this.#forcedCountry;
      this.#logger.debug(`Attempting to set forced country ${this.#forcedCountry} in dropdown:`, countrySelect.name || countrySelect.id);
    } else if (selectedValue && countriesToShow.some(c => c.code === selectedValue)) {
      countryToSelect = selectedValue;
      this.#logger.debug(`Attempting to set initial country ${selectedValue} in dropdown:`, countrySelect.name || countrySelect.id);
    } else if (currentVal && countriesToShow.some(c => c.code === currentVal)) {
      countryToSelect = currentVal;
      this.#logger.debug(`Attempting to restore previous country ${currentVal} in dropdown:`, countrySelect.name || countrySelect.id);
    }
    
    if (countryToSelect) {
      this.#setCountryWithDelay(countrySelect, countryToSelect);
    } else {
      countrySelect.value = ""; // Ensure prompt is selected if no valid selection
    }
  }

  /**
   * Set the country with a small delay to ensure DOM is ready
   * @param {HTMLSelectElement} selectEl - The country select element
   * @param {string} countryCode - The country code to select
   */
  #setCountryWithDelay(selectEl, countryCode) {
    // Ensure consistent case handling
    const normalizedCode = countryCode.toLowerCase();
    
    // First immediate attempt
    selectEl.value = normalizedCode;
    
    // If that didn't work, try with uppercase
    if (selectEl.value !== normalizedCode) {
      selectEl.value = countryCode.toUpperCase();
    }
    
    // If still not working, try with a delay and direct DOM selection
    if (selectEl.value !== normalizedCode && selectEl.value !== countryCode.toUpperCase()) {
      setTimeout(() => {
        // Try standard property setting first
        selectEl.value = normalizedCode;
        
        // If that doesn't work, try uppercase
        if (selectEl.value !== normalizedCode) {
          selectEl.value = countryCode.toUpperCase();
        }
        
        // If that still doesn't work, try finding and selecting the option by direct DOM manipulation
        if (selectEl.value !== normalizedCode && selectEl.value !== countryCode.toUpperCase()) {
          const option = Array.from(selectEl.options).find(opt => 
            opt.value.toLowerCase() === normalizedCode || 
            opt.value.toUpperCase() === countryCode.toUpperCase()
          );
          
          if (option) {
            option.selected = true;
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            this.#logger.debug(`Force selected country ${countryCode} using direct option selection`);
          } else {
            this.#logger.warn(`Failed to select country ${countryCode}. Option not found in dropdown.`);
          }
        } else {
          // Success with property setting
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          this.#logger.debug(`Force selected country ${countryCode} after delay`);
        }
      }, 100);
    } else {
      // Success without delay
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      this.#logger.debug(`Selected country ${countryCode} immediately`);
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

    // Find the form-group div (the top-level container to hide/show)
    const formGroup = stateSelect.closest('.form-group');
    
    // Get the direct parent of the select (usually the select-form-wrapper)
    const stateContainer = stateSelect.closest('.select-form-wrapper') || stateSelect.parentElement;
    
    // Check if the country requires states
    const stateRequired = config.stateRequired ?? true; // Default to true if not specified
    
    if (!states || states.length === 0 || !stateRequired) {
      // No states available or state field not required for this country
      stateSelect.innerHTML = '<option value="">N/A</option>';
      stateSelect.disabled = true;
      
      // Hide the entire form-group
      if (formGroup) {
        formGroup.style.display = 'none';
        this.#logger.debug(`Hiding state field form-group for country ${countryCode} - stateRequired: ${stateRequired}, states: ${states?.length || 0}`);
      } 
      // If form-group not found, fall back to hiding the direct container
      else if (stateContainer) {
        stateContainer.style.display = 'none';
        this.#logger.debug(`Hiding state container for country ${countryCode} - stateRequired: ${stateRequired}, states: ${states?.length || 0}`);
      }
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

      // Enable if required
      stateSelect.disabled = false;
      
      // Show the entire form-group
      if (formGroup) {
        formGroup.style.display = '';
        this.#logger.debug(`Showing state field form-group for country ${countryCode} with ${states.length} states`);
      } 
      // If form-group not found, fall back to showing the direct container
      else if (stateContainer) {
        stateContainer.style.display = '';
        this.#logger.debug(`Showing state container for country ${countryCode} with ${states.length} states`);
      }
    }
    
    // Update the corresponding postcode field based on the country config
    const isShippingState = stateSelect.getAttribute('os-checkout-field') === 'province';
    const postcodeField = isShippingState ? this.#elements.shippingPostcode : this.#elements.billingPostcode;
    this.#updatePostcodeField(postcodeField, config);
  }

  /**
   * Updates the postcode/ZIP field with country-specific settings
   * @param {HTMLInputElement} postcodeField - The postcode input field
   * @param {Object} config - The country configuration object
   */
  #updatePostcodeField(postcodeField, config) {
    if (!postcodeField) return;
    
    // Update placeholder text
    const postcodeLabel = config.postcodeLabel || 'Postal / ZIP Code';
    postcodeField.placeholder = `${postcodeLabel}${postcodeField.hasAttribute('required') || postcodeField.getAttribute('os-checkout-validate') === 'required' ? '*' : ''}`;
    
    // Determine if postcode contains letters (alphanumeric)
    const hasLetters = this.#isAlphanumericPostcode(config);
    
    // For alphanumeric postcodes, make more aggressive changes to ensure text input works
    if (hasLetters) {
      // For alphanumeric postcodes (like UK's "SW1A 0AA")
      postcodeField.inputMode = "text";
      postcodeField.type = "text";
      postcodeField.removeAttribute('data-numeric-only');
      postcodeField.removeAttribute('data-numbers-only');
      
      // Set the correct pattern for validation
      if (config.postcodeRegex) {
        postcodeField.pattern = config.postcodeRegex;
        this.#logger.debug(`Set alphanumeric postcode pattern: ${config.postcodeRegex}`);
      }
      
      // Remove any input restrictions from the element
      this.#removeInputRestrictions(postcodeField);
      
      this.#logger.debug(`Configured alphanumeric postcode field for ${postcodeLabel}`);
      
      // Setup mutation observer to ensure our settings persist
      this.#setupPostcodeMutationObserver(postcodeField, hasLetters, config);
    } else {
      // For numeric-only postcodes (like US ZIP codes)
      postcodeField.inputMode = "numeric";
      
      // Update validation pattern if available
      if (config.postcodeRegex) {
        postcodeField.pattern = config.postcodeRegex;
      } else {
        // Default US format if no specific pattern
        postcodeField.pattern = "(^\\d{5}$)|(^\\d{5}-\\d{4}$)";
      }
      
      this.#logger.debug(`Configured numeric-only postcode field for ${postcodeLabel}`);
    }
    
    // Update maxlength if specified
    if (config.postcodeMaxLength) {
      postcodeField.maxLength = config.postcodeMaxLength;
    }
    
    // Add an example as placeholder if available
    if (config.postcodeExample) {
      // Keep the label but add example
      postcodeField.placeholder = `${postcodeLabel}* (e.g. ${config.postcodeExample})`;
    }
    
    this.#logger.debug(`Updated postcode field: ${postcodeLabel}, pattern: ${postcodeField.pattern || 'none'}, inputmode: ${postcodeField.inputMode}`);
  }
  
  /**
   * Remove any input restrictions that might prevent typing letters
   * @param {HTMLInputElement} inputField - The input field to update
   */
  #removeInputRestrictions(inputField) {
    // Remove any event listeners that might be restricting input
    // This is a bit hacky but necessary for some implementations
    const newInput = inputField.cloneNode(true);
    if (inputField.parentNode) {
      inputField.parentNode.replaceChild(newInput, inputField);
      
      // Add keypress event listener to the new input for debugging
      newInput.addEventListener('keypress', (e) => {
        this.#logger.debug(`Keypress in postcode field: ${e.key}, code: ${e.code}, prevented: ${e.defaultPrevented}`);
      });
      
      // Re-add to elements reference if this is one of our tracked elements
      if (this.#elements.shippingPostcode === inputField) {
        this.#elements.shippingPostcode = newInput;
      } else if (this.#elements.billingPostcode === inputField) {
        this.#elements.billingPostcode = newInput;
      }
    }
  }
  
  /**
   * Setup a mutation observer to ensure our input settings persist
   * @param {HTMLInputElement} postcodeField - The postcode input field
   * @param {boolean} hasLetters - Whether this is an alphanumeric postcode
   * @param {Object} config - The country config object
   */
  #setupPostcodeMutationObserver(postcodeField, hasLetters, config) {
    // If already observed, don't add another observer
    if (postcodeField.dataset.postcodeObserved === 'true') return;
    
    // Create a mutation observer to watch for attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          // If inputmode or type was changed back, reset it
          if (mutation.attributeName === 'inputmode' && postcodeField.inputMode !== 'text') {
            postcodeField.inputMode = 'text';
            this.#logger.debug('Restored text inputmode on postcode field after external change');
          }
          if (mutation.attributeName === 'type' && postcodeField.type !== 'text') {
            postcodeField.type = 'text';
            this.#logger.debug('Restored text type on postcode field after external change');
          }
          if (mutation.attributeName === 'pattern' && config.postcodeRegex && postcodeField.pattern !== config.postcodeRegex) {
            postcodeField.pattern = config.postcodeRegex;
            this.#logger.debug('Restored correct pattern on postcode field after external change');
          }
        }
      });
    });
    
    // Start observing the postcode field for attribute changes
    observer.observe(postcodeField, { attributes: true });
    
    // Add a data attribute to mark this field as observed
    postcodeField.dataset.postcodeObserved = 'true';
  }
  
  /**
   * Determines if a country uses alphanumeric postcodes (containing letters)
   * @param {Object} config - The country configuration
   * @returns {boolean} True if the postcode format includes letters
   */
  #isAlphanumericPostcode(config) {
    // Check postcode example if available
    if (config.postcodeExample && /[A-Za-z]/.test(config.postcodeExample)) {
      return true;
    }
    
    // Check postcode regex if available
    if (config.postcodeRegex && 
        (config.postcodeRegex.includes('[A-Z]') || 
         config.postcodeRegex.includes('[a-z]') ||
         config.postcodeRegex.includes('A-Z') ||
         config.postcodeRegex.includes('a-z'))) {
      return true;
    }
    
    // Default to false (numeric only)
    return false;
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

    // Update state label if element exists
    if (stateLabelElement) {
      stateLabelElement.textContent = config.stateLabel || 'State / Province';
      
      // Handle required asterisk
      const requiredSpan = stateLabelElement.querySelector('span.required');
      if (config.stateRequired && !requiredSpan) {
        stateLabelElement.innerHTML += ' <span class="required">*</span>';
      } else if (!config.stateRequired && requiredSpan) {
        requiredSpan.remove();
      }
    }
    
    // Update postcode label if element exists
    if (postcodeLabelElement) {
      postcodeLabelElement.textContent = config.postcodeLabel || 'Postal / ZIP Code';
      
      // Ensure required asterisk is present
      if (!postcodeLabelElement.querySelector('span.required')) {
        postcodeLabelElement.innerHTML += ' <span class="required">*</span>';
      }
    }
    
    // Update the postcode field placeholder too
    const postcodeField = (addressType === 'shipping') ? this.#elements.shippingPostcode : this.#elements.billingPostcode;
    if (postcodeField) {
      this.#updatePostcodeField(postcodeField, config);
    }
  }
}