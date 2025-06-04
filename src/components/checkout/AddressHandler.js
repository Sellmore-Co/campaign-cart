export class AddressHandler {
  #form;
  #logger;
  #addressConfig;
  #countries = [];
  #states = {};
  #countryConfigs = {}; // Store country-specific configurations
  #elements;
  #workerBaseUrl = 'https://cdn-countries.muddy-wind-c7ca.workers.dev';

  constructor(form, logger) {
    this.#form = form;
    this.#logger = logger;
    this.#addressConfig = this.#getAddressConfig();
    this.#elements = {
      shippingCountry: document.querySelector('[os-checkout-field="country"]'),
      shippingState: document.querySelector('[os-checkout-field="province"]'),
      billingCountry: document.querySelector('[os-checkout-field="billing-country"]'),
      billingState: document.querySelector('[os-checkout-field="billing-province"]'),
      // Get form field labels for dynamic updates
      shippingStateLabel: document.querySelector('label[for*="province"], label[for*="state"]'),
      billingStateLabel: document.querySelector('label[for*="billing-province"], label[for*="billing-state"]'),
      postcodeLabel: document.querySelector('label[for*="postal"], label[for*="zip"]'),
      billingPostcodeLabel: document.querySelector('label[for*="billing-postal"], label[for*="billing-zip"]'),
      // Get postcode input fields for validation
      postcodeField: document.querySelector('[os-checkout-field="postal"]'),
      billingPostcodeField: document.querySelector('[os-checkout-field="billing-postal"]'),
    };

    this.#loadCachedData();
    if (this.#elements.shippingCountry || this.#elements.billingCountry) {
      this.#logger.info('AddressHandler initialized with Cloudflare Worker integration');
      this.#init();
    } else {
      this.#logger.warn('No country selects found');
    }
  }

  async #init() {
    await this.#loadCountriesAndInitialState();
    await Promise.all([
      this.#elements.shippingCountry && this.#initCountrySelect(this.#elements.shippingCountry, this.#elements.shippingState),
      this.#elements.billingCountry && this.#initCountrySelect(this.#elements.billingCountry, this.#elements.billingState),
    ]);
    this.#setupCountryChangeListeners();
    this.#setupAutocompleteDetection();
    this.#setupPostcodeValidation();
  }

  #getAddressConfig() {
    return {
      defaultCountry: window.osConfig?.addressConfig?.defaultCountry ?? document.querySelector('meta[name="os-address-default-country"]')?.content ?? 'US',
      showCountries: window.osConfig?.addressConfig?.showCountries ?? document.querySelector('meta[name="os-address-show-countries"]')?.content?.split(',').map(c => c.trim()) ?? [],
      dontShowStates: window.osConfig?.addressConfig?.dontShowStates ?? document.querySelector('meta[name="os-address-dont-show-states"]')?.content?.split(',').map(s => s.trim()) ?? [],
      countries: window.osConfig?.addressConfig?.countries ?? [],
    };
  }

  async #loadCountriesAndInitialState() {
    // Try to load from cache first
    if (this.#countries.length && Object.keys(this.#states).length > 0) {
      this.#logger.debug('Using cached countries and states data');
      
      // Check for forced country even with cached data
      const forcedCountry = this.#checkForForcedCountry();
      if (forcedCountry) {
        await this.#handleForcedCountry(forcedCountry);
      }
      return;
    }

    // Use globally cached localization data (should always be available)
    const localizationData = window.osLocalizationData;
    if (!localizationData) {
      this.#logger.error('No global localization data available! TwentyNineNext should have loaded this first.');
      await this.#loadCountriesAndStatesFallback();
      return;
    }

    this.#logger.info('Using globally cached localization data from TwentyNineNext');
    
    try {
      // Process countries list from global cache
      if (localizationData.countries && Array.isArray(localizationData.countries)) {
        this.#countries = localizationData.countries
          .filter(country => {
            // Apply showCountries filter if specified
            if (this.#addressConfig.showCountries.length > 0) {
              return this.#addressConfig.showCountries.includes(country.code);
            }
            return true;
          })
          .map(country => ({
            iso2: country.code,
            name: country.name,
            phonecode: country.phonecode,
            currency: country.currency,
            currencySymbol: country.currencySymbol
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.#logger.info(`Loaded ${this.#countries.length} countries from global cache`);
      }

      // Check for forced country override before processing detected country
      const forcedCountry = this.#checkForForcedCountry();
      let effectiveCountryCode = localizationData.detectedCountryCode;

      if (forcedCountry) {
        // Validate that forced country exists in our countries list
        const countryExists = this.#countries.some(country => country.iso2 === forcedCountry);
        if (countryExists) {
          effectiveCountryCode = forcedCountry;
          this.#logger.info(`🔧 Forced country override: ${forcedCountry} (detected: ${localizationData.detectedCountryCode})`);
          
          // Load states for forced country instead of detected country
          await this.#loadStatesForForcedCountry(forcedCountry);
        } else {
          this.#logger.warn(`⚠️ Invalid forced country code: ${forcedCountry} - not found in available countries`);
          // Fall back to default country since forced country is invalid
          effectiveCountryCode = this.#addressConfig.defaultCountry;
        }
              } else {
        // CHECK: Is the detected country actually allowed by showCountries?
        const detectedCountryAllowed = this.#countries.some(country => country.iso2 === localizationData.detectedCountryCode);
        
        if (!detectedCountryAllowed) {
          this.#logger.warn(`⚠️ Detected country ${localizationData.detectedCountryCode} not in showCountries list, using default: ${this.#addressConfig.defaultCountry}`);
          effectiveCountryCode = this.#addressConfig.defaultCountry;
        } else {
          // Process detected country and its states from global cache
          if (localizationData.detectedCountryCode && localizationData.detectedStates) {
            this.#states[localizationData.detectedCountryCode] = localizationData.detectedStates
              .filter(state => !this.#addressConfig.dontShowStates.includes(state.code))
              .map(state => ({
                iso2: state.code,
                name: state.name
              }))
              .sort((a, b) => a.name.localeCompare(b.name));

            this.#logger.debug(`Loaded ${this.#states[localizationData.detectedCountryCode].length} states for detected country: ${localizationData.detectedCountryCode}`);
          }

          // Store detected country config from global cache
          if (localizationData.detectedCountryCode && localizationData.detectedCountryConfig) {
            this.#countryConfigs[localizationData.detectedCountryCode] = localizationData.detectedCountryConfig;
            this.#logger.debug(`Stored config for detected country: ${localizationData.detectedCountryCode}`, localizationData.detectedCountryConfig);
          }
        }
      }

      // Update default country to effective country (forced or detected)
      if (effectiveCountryCode) {
        this.#addressConfig.defaultCountry = effectiveCountryCode;
        this.#logger.info(`Set default country to: ${effectiveCountryCode}${forcedCountry ? ' (forced)' : ' (detected)'}`);
      }

      // Cache the data locally as well
      this.#saveCache('os_countries_cache', { countries: this.#countries });
      this.#saveCache('os_states_cache', { states: this.#states });
      this.#saveCache('os_country_configs_cache', { configs: this.#countryConfigs });

    } catch (error) {
      this.#logger.error('Error processing global localization data:', error);
      await this.#loadCountriesAndStatesFallback();
    }
  }

  async #initCountrySelect(countrySelect, stateSelect) {
    countrySelect.innerHTML = '<option value="">Select Country</option>' + 
      this.#countries.map(c => `<option value="${c.iso2}">${c.name}</option>`).join('');
    
    // Set default country
    const defaultCountry = this.#addressConfig.defaultCountry;
    if (defaultCountry) {
      countrySelect.value = defaultCountry;
      
      // Apply country configuration if available
      await this.#applyCountryConfig(defaultCountry);
      
      // Load and populate states for default country
      if (stateSelect) {
        await this.#updateStateSelect(stateSelect, defaultCountry);
      }
    }
    
    this.#logger.debug(`Country select initialized with default ${defaultCountry}`);
  }

  #setupCountryChangeListeners() {
    const pairs = [
      [this.#elements.shippingCountry, this.#elements.shippingState],
      [this.#elements.billingCountry, this.#elements.billingState]
    ];
    
    pairs.forEach(([country, state]) => {
      country?.addEventListener('change', async (event) => {
        const selectedCountryCode = event.target.value;
        this.#logger.debug(`Country changed to: ${selectedCountryCode}`);
        
        if (selectedCountryCode) {
          // Update default country so global localization data gets updated
          this.#addressConfig.defaultCountry = selectedCountryCode;
          
          // Apply country configuration
          await this.#applyCountryConfig(selectedCountryCode);
          
          // Update state select
          if (state) {
            await this.#updateStateSelect(state, selectedCountryCode);
          }
          
          // Update phone input country if PhoneInputHandler is available
          this.#updatePhoneInputCountry(country, selectedCountryCode);
          
          // Trigger country campaign change if CountryCampaignManager is available
          this.#triggerCountryCampaignChange(selectedCountryCode);
        } else {
          // Reset to default labels when no country selected
          this.#resetFormLabels();
          if (state) {
            state.innerHTML = '<option value="">Select State</option>';
            state.parentElement.style.display = 'none';
          }
        }
      });
    });
  }

  async #updateStateSelect(stateSelect, countryCode, isPriority = false) {
    if (!countryCode) {
      stateSelect.innerHTML = '<option value="">Select State/Province</option>';
      stateSelect.parentElement.style.display = 'none';
      return;
    }

    // Show loading state
    stateSelect.innerHTML = '<option value="">Loading States...</option>';
    stateSelect.disabled = true;

    try {
      const states = this.#states[countryCode] || await this.#loadStates(countryCode);
    if (isPriority) await states;
      
      this.#populateStateSelect(stateSelect, states, countryCode);
    this.#logger.debug(`State select updated for ${countryCode}`);
    } catch (error) {
      this.#logger.error(`Failed to update state select for ${countryCode}:`, error);
      stateSelect.innerHTML = '<option value="">Error loading states</option>';
    } finally {
      stateSelect.disabled = false;
    }
  }

  #populateStateSelect(stateSelect, states, countryCode) {
    const currentValue = stateSelect.value || stateSelect.getAttribute('data-pending-state') || '';
    const config = this.#countryConfigs[countryCode];
    
    // Use country-specific state label or default
    const stateLabel = config?.stateLabel || 'State/Province';
    stateSelect.innerHTML = `<option value="">Select ${stateLabel}</option>` + 
      states.map(s => `<option value="${s.iso2}">${s.name}</option>`).join('');
    
    // Show/hide state field based on country requirements
    const shouldShow = states.length > 0 && (config?.stateRequired !== false);
    stateSelect.parentElement.style.display = shouldShow ? '' : 'none';
    
    // Set required attribute based on country config
    if (config?.stateRequired !== undefined) {
      if (config.stateRequired) {
        stateSelect.setAttribute('required', 'required');
        stateSelect.setAttribute('os-checkout-validate', 'required');
      } else {
        stateSelect.removeAttribute('required');
        stateSelect.removeAttribute('os-checkout-validate');
      }
    }
    
    // Restore previous value if available
    if (currentValue && Array.from(stateSelect.options).some(o => o.value === currentValue)) {
      stateSelect.value = currentValue;
    }
  }

  async #loadStates(countryCode) {
    if (this.#states[countryCode]) return this.#states[countryCode];
    
    try {
      this.#logger.debug(`Loading states for ${countryCode} from Worker`);
      const response = await fetch(`${this.#workerBaseUrl}/countries/${countryCode}/states`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.#logger.debug(`Received states data for ${countryCode}:`, data);

      // Process states
      let states = [];
      if (data.states && Array.isArray(data.states)) {
        states = data.states
          .filter(state => !this.#addressConfig.dontShowStates.includes(state.code))
          .map(state => ({
            iso2: state.code,
            name: state.name
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      // Store country config
      if (data.countryConfig) {
        this.#countryConfigs[countryCode] = data.countryConfig;
        this.#logger.debug(`Stored config for ${countryCode}:`, data.countryConfig);
        
        // Update global localization data with fresh currency information
        this.#updateGlobalLocalizationData(countryCode, data.countryConfig);
      }

      // Cache the data
      this.#states[countryCode] = states;
      this.#saveCache('os_states_cache', { states: this.#states });
      this.#saveCache('os_country_configs_cache', { configs: this.#countryConfigs });

      this.#logger.debug(`Loaded and cached ${states.length} states for ${countryCode}`);
      return states;
      
    } catch (error) {
      this.#logger.error(`Failed to load states for ${countryCode}:`, error);
      this.#states[countryCode] = [];
      return [];
    }
  }

  /**
   * Update global localization data with fresh currency information
   * @param {string} countryCode - The country code  
   * @param {Object} countryConfig - The country configuration from the API
   */
  #updateGlobalLocalizationData(countryCode, countryConfig) {
    try {
      if (window.osLocalizationData) {
        // Ensure the global localization data reflects the currently processed country.
        window.osLocalizationData.detectedCountryCode = countryCode;
        window.osLocalizationData.detectedCountryConfig = {
          ...(window.osLocalizationData.detectedCountryConfig || {}), // Preserve other existing fields
          // Overwrite with specific fields from the new countryConfig
          currencyCode: countryConfig.currencyCode,
          currencySymbol: countryConfig.currencySymbol,
          ...countryConfig // Spread the rest of the new countryConfig
        };
        
        // Update the timestamp to indicate freshness for this specific update
        window.osLocalizationData.timestamp = Date.now();

        this.#logger.info(`🔄 Updated global currency data via AddressHandler: ${countryCode} → ${countryConfig.currencyCode} (${countryConfig.currencySymbol})`);
      }
    } catch (error) {
      this.#logger.error('Error updating global localization data:', error);
    }
  }

  async #applyCountryConfig(countryCode) {
    try {
      // Get config from cache or load it
      let config = this.#countryConfigs[countryCode];
      
      if (!config) {
        // Load config by fetching states (which includes config)
        await this.#loadStates(countryCode);
        config = this.#countryConfigs[countryCode];
      }

      if (config) {
        this.#logger.debug(`Applying config for ${countryCode}:`, config);

        // Ensure global localization data reflects this config, even if it was cached
        this.#updateGlobalLocalizationData(countryCode, config);

        // Update form labels
        this.#updateFormLabels(config);
        
        // Update postcode validation
        this.#updatePostcodeValidation(config);
        
        this.#logger.debug(`Applied country configuration for ${countryCode}`);
      } else {
        this.#logger.debug(`No specific configuration found for ${countryCode}, using defaults`);
        this.#resetFormLabels();
      }
    } catch (error) {
      this.#logger.error(`Failed to apply country config for ${countryCode}:`, error);
    }
  }

  #updateFormLabels(config) {
    // Update state/province labels
    if (config.stateLabel) {
      [this.#elements.shippingStateLabel, this.#elements.billingStateLabel].forEach(label => {
        if (label) {
          label.textContent = config.stateLabel;
        }
      });
    }

    // Update postcode labels
    if (config.postcodeLabel) {
      [this.#elements.postcodeLabel, this.#elements.billingPostcodeLabel].forEach(label => {
        if (label) {
          label.textContent = config.postcodeLabel;
        }
      });
    }

    // Update input placeholders and examples
    [this.#elements.postcodeField, this.#elements.billingPostcodeField].forEach(field => {
      if (field && config.postcodeExample) {
        field.setAttribute('placeholder', config.postcodeExample);
        field.setAttribute('title', `Format: ${config.postcodeExample}`);
      }
    });
  }

  #resetFormLabels() {
    // Reset to default labels
    [this.#elements.shippingStateLabel, this.#elements.billingStateLabel].forEach(label => {
      if (label) {
        label.textContent = 'State';
      }
    });

    [this.#elements.postcodeLabel, this.#elements.billingPostcodeLabel].forEach(label => {
      if (label) {
        label.textContent = 'Postal Code';
      }
    });

    [this.#elements.postcodeField, this.#elements.billingPostcodeField].forEach(field => {
      if (field) {
        field.setAttribute('placeholder', 'Postal Code');
        field.removeAttribute('title');
      }
    });
  }

  #updatePostcodeValidation(config) {
    [this.#elements.postcodeField, this.#elements.billingPostcodeField].forEach(field => {
      if (field) {
        // Set validation attributes based on country config
        if (config.postcodeRegex) {
          field.setAttribute('pattern', config.postcodeRegex);
        } else {
          field.removeAttribute('pattern');
        }

        if (config.postcodeMinLength) {
          field.setAttribute('minlength', config.postcodeMinLength);
        } else {
          field.removeAttribute('minlength');
        }

        if (config.postcodeMaxLength) {
          field.setAttribute('maxlength', config.postcodeMaxLength);
        } else {
          field.removeAttribute('maxlength');
        }
      }
    });
  }

  #setupPostcodeValidation() {
    [this.#elements.postcodeField, this.#elements.billingPostcodeField].forEach(field => {
      if (field) {
        field.addEventListener('input', (event) => {
          this.#validatePostcodeField(event.target);
        });

        field.addEventListener('blur', (event) => {
          this.#validatePostcodeField(event.target);
        });
      }
    });
  }

  #validatePostcodeField(field) {
    if (!field.value) return;

    const countryField = field.getAttribute('os-checkout-field') === 'postal' 
      ? this.#elements.shippingCountry 
      : this.#elements.billingCountry;
    
    if (!countryField || !countryField.value) return;

    const config = this.#countryConfigs[countryField.value];
    if (!config || !config.postcodeRegex) return;

    const regex = new RegExp(config.postcodeRegex);
    const isValid = regex.test(field.value);

    // Add/remove validation classes
    field.classList.toggle('invalid', !isValid);
    field.classList.toggle('valid', isValid);

    // Set custom validity message
    if (!isValid && config.postcodeExample) {
      field.setCustomValidity(`Please enter a valid ${config.postcodeLabel || 'postcode'}. Example: ${config.postcodeExample}`);
    } else {
      field.setCustomValidity('');
    }
  }

  #loadCachedData() {
    const loadCache = key => {
      const data = JSON.parse(localStorage.getItem(key) ?? '{}');
      return (Date.now() - (data.timestamp ?? 0) < 24 * 60 * 60 * 1000) ? data : {};
    };
    
    const countriesCache = loadCache('os_countries_cache');
    this.#countries = countriesCache.countries ?? [];
    
    // Filter cached countries if showCountries is specified
    if (this.#countries.length && this.#addressConfig.showCountries.length) {
      this.#countries = this.#countries.filter(c => 
        this.#addressConfig.showCountries.includes(c.iso2));
      this.#logger.debug(`Filtered cached countries to: ${this.#addressConfig.showCountries.join(', ')}`);
    }
    
    const statesCache = loadCache('os_states_cache');
    this.#states = statesCache.states ?? {};
    
    const configsCache = loadCache('os_country_configs_cache');
    this.#countryConfigs = configsCache.configs ?? {};
    
    this.#logger.debug(`Loaded cached data: ${this.#countries.length} countries, ${Object.keys(this.#states).length} state sets, ${Object.keys(this.#countryConfigs).length} country configs`);
  }

  #saveCache(key, data) {
    localStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
  }

  // Fallback method for loading countries/states from old API
  async #loadCountriesAndStatesFallback() {
    if (this.#countries.length) return;
    
    this.#logger.warn('Using fallback method for loading countries');
    
    this.#countries = this.#addressConfig.countries.length ? 
      this.#addressConfig.countries.map(c => ({ iso2: c.iso2 || c.code, name: c.name })) :
      [];
    
    // If no countries in config, provide basic fallback
    if (this.#countries.length === 0) {
      this.#countries = [
        { iso2: 'US', name: 'United States' },
        { iso2: 'CA', name: 'Canada' },
        { iso2: 'GB', name: 'United Kingdom' },
        { iso2: 'AU', name: 'Australia' }
      ];
    }
    
    this.#countries.sort((a, b) => a.name.localeCompare(b.name));
    this.#saveCache('os_countries_cache', { countries: this.#countries });
    this.#logger.info(`Loaded ${this.#countries.length} countries from fallback`);
  }

  #setupAutocompleteDetection() {
    const fields = Object.values(this.#elements).filter(field => 
      field && (field.tagName === 'SELECT' || field.tagName === 'INPUT')
    );
    
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'value' && m.target.value) {
          const isCountryField = m.target === this.#elements.shippingCountry || m.target === this.#elements.billingCountry;
          const isStateField = m.target === this.#elements.shippingState || m.target === this.#elements.billingState;
          
          if (isCountryField) {
            const stateField = m.target === this.#elements.shippingCountry ? 
              this.#elements.shippingState : this.#elements.billingState;
            
            if (stateField) {
              this.#updateStateSelect(stateField, m.target.value, true);
            }
            
            // Apply country config
            this.#applyCountryConfig(m.target.value);
          }
          
          this.#logger.debug(`Autocomplete detected on ${m.target.getAttribute('os-checkout-field') || 'field'}`);
        }
      });
    });
    
    fields.forEach(f => observer.observe(f, { attributes: true, attributeFilter: ['value'] }));
    this.#preloadCommonStates();
    this.#logger.debug('Autocomplete detection set up');
  }

  #preloadCommonStates() {
    const countries = this.#addressConfig.showCountries.length ? 
      this.#addressConfig.showCountries : ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'BR'];
    
    countries.forEach(countryCode => {
      if (!this.#states[countryCode]) {
        this.#loadStates(countryCode).catch(error => {
          this.#logger.debug(`Failed to preload states for ${countryCode}:`, error);
        });
      }
    });
    
    this.#logger.debug(`Preloading states for ${countries.join(', ')}`);
  }

  /**
   * Check URL parameters for forced country override
   * @returns {string|null} The forced country code or null
   */
  #checkForForcedCountry() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forcedCountry = urlParams.get('forceCountry');
      
      if (forcedCountry) {
        // Normalize to uppercase for consistency
        const normalizedCountry = forcedCountry.toUpperCase();
        this.#logger.debug(`🔧 Found forceCountry parameter: ${normalizedCountry}`);
        return normalizedCountry;
      }
      
      return null;
    } catch (error) {
      this.#logger.error('Error checking for forced country parameter:', error);
      return null;
    }
  }

  /**
   * Handle forced country when we already have cached data
   * @param {string} forcedCountry - The forced country code
   */
  async #handleForcedCountry(forcedCountry) {
    // Validate that forced country exists in our countries list
    const countryExists = this.#countries.some(country => country.iso2 === forcedCountry);
    if (countryExists) {
      this.#logger.info(`🔧 Applying forced country override: ${forcedCountry}`);
      this.#addressConfig.defaultCountry = forcedCountry;
      
      // Load states for forced country if not already cached
      if (!this.#states[forcedCountry]) {
        await this.#loadStates(forcedCountry);
      }
    } else {
      this.#logger.warn(`⚠️ Invalid forced country code: ${forcedCountry} - not found in available countries`);
    }
  }

  /**
   * Load states for a forced country from the Worker API
   * @param {string} countryCode - The country code to load states for
   */
  async #loadStatesForForcedCountry(countryCode) {
    try {
      this.#logger.debug(`Loading states for forced country: ${countryCode}`);
      const response = await fetch(`${this.#workerBaseUrl}/countries/${countryCode}/states`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.#logger.debug(`Received states data for forced country ${countryCode}:`, data);

      // Process states
      let states = [];
      if (data.states && Array.isArray(data.states)) {
        states = data.states
          .filter(state => !this.#addressConfig.dontShowStates.includes(state.code))
          .map(state => ({
            iso2: state.code,
            name: state.name
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      // Store country config
      if (data.countryConfig) {
        this.#countryConfigs[countryCode] = data.countryConfig;
        this.#logger.debug(`Stored config for forced country ${countryCode}:`, data.countryConfig);
        
        // Update global localization data with fresh currency information
        this.#updateGlobalLocalizationData(countryCode, data.countryConfig);
      }

      // Cache the data
      this.#states[countryCode] = states;
      this.#saveCache('os_states_cache', { states: this.#states });
      this.#saveCache('os_country_configs_cache', { configs: this.#countryConfigs });

      this.#logger.info(`✅ Loaded and cached ${states.length} states for forced country: ${countryCode}`);
      
    } catch (error) {
      this.#logger.error(`Failed to load states for forced country ${countryCode}:`, error);
      this.#states[countryCode] = [];
    }
  }

  // Public methods for external access
  getCountryConfig(countryCode) {
    return this.#countryConfigs[countryCode] || null;
  }

  async refreshCountryData(countryCode) {
    delete this.#states[countryCode];
    delete this.#countryConfigs[countryCode];
    return await this.#loadStates(countryCode);
  }

  getAvailableCountries() {
    return [...this.#countries];
  }

  getStatesForCountry(countryCode) {
    return this.#states[countryCode] || [];
  }

  /**
   * Get the currently forced country from URL parameters
   * @returns {string|null} The forced country code or null
   */
  getForcedCountry() {
    return this.#checkForForcedCountry();
  }

  /**
   * Update phone input country when address country changes
   * @param {HTMLSelectElement} countrySelect - The country select element that changed
   * @param {string} countryCode - The new country code
   */
  #updatePhoneInputCountry(countrySelect, countryCode) {
    // Check if PhoneInputHandler is available globally
    const phoneHandler = window.osPhoneInputHandler;
    
    if (!phoneHandler || typeof phoneHandler.updatePhoneCountry !== 'function') {
      this.#logger.debug('PhoneInputHandler not available for country sync');
      return;
    }

    try {
      // Determine which phone field to update based on which country select changed
      const fieldType = countrySelect.getAttribute('os-checkout-field');
      const phoneFieldType = fieldType === 'country' ? 'phone' : 'billing-phone';
      
      // Update the phone input country
      phoneHandler.updatePhoneCountry(phoneFieldType, countryCode);
      this.#logger.debug(`Updated phone input country: ${phoneFieldType} → ${countryCode}`);
    } catch (error) {
      this.#logger.error('Error updating phone input country:', error);
    }
  }

  /**
   * Trigger country campaign change when address country changes
   * @param {string} countryCode - The new country code
   */
  #triggerCountryCampaignChange(countryCode) {
    // Check if CountryCampaignManager is available globally
    const countryCampaignManager = window.osCountryCampaignManager;
    
    if (!countryCampaignManager) {
      this.#logger.debug('CountryCampaignManager not available - country campaigns not configured');
      return;
    }

    // Only switch if it's a different country
    const currentCountry = countryCampaignManager.getCurrentCountry();
    if (currentCountry === countryCode.toUpperCase()) {
      this.#logger.debug(`Country is already ${countryCode}, no switch needed`);
      return;
    }

    // Add debouncing to prevent rapid successive calls
    if (this._countryChangeTimeout) {
      clearTimeout(this._countryChangeTimeout);
    }
    
    this._countryChangeTimeout = setTimeout(() => {
      try {
        this.#logger.info(`Triggering country campaign switch to: ${countryCode}`);
        
        // Switch country campaign
        countryCampaignManager.switchCountry(countryCode).then(result => {
          if (result && result.success) {
            this.#logger.info(`Successfully switched country campaign from ${result.previousCountry} to ${result.newCountry}`);
          } else if (result && !result.success) {
            this.#logger.warn(`Country campaign switch failed: ${result.message || result.error}`);
          }
        }).catch(error => {
          this.#logger.error('Error switching country campaign:', error);
        });
      } catch (error) {
        this.#logger.error('Error triggering country campaign change:', error);
      }
    }, 100); // 100ms debounce
  }
}