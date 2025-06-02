export class AddressHandler {
  #form;
  #logger;
  #app;
  #addressConfig;
  #countries = [];
  #states = {};
  #countryConfigs = {};
  #elements;

  constructor(form, logger, app) {
    this.#form = form;
    this.#logger = logger;
    this.#app = app;
    this.#addressConfig = this.#getAddressConfig();
    this.#elements = {
      shippingCountry: document.querySelector('[os-checkout-field="country"]'),
      shippingState: document.querySelector('[os-checkout-field="province"]'),
      billingCountry: document.querySelector('[os-checkout-field="billing-country"]'),
      billingState: document.querySelector('[os-checkout-field="billing-province"]'),
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
    try {
      // Use the /location endpoint to get initial data with auto-detection
      await this.#loadInitialLocationData();
      
      // Initialize country selects with loaded data
      await Promise.all([
        this.#elements.shippingCountry && this.#initCountrySelect(this.#elements.shippingCountry, this.#elements.shippingState),
        this.#elements.billingCountry && this.#initCountrySelect(this.#elements.billingCountry, this.#elements.billingState),
      ]);
      
      this.#setupCountryChangeListeners();
      this.#autoSelectDetectedCountry();
      this.#setupAutocompleteDetection();
    } catch (error) {
      this.#logger.error('Error initializing AddressHandler:', error);
      // Fallback to basic initialization
      await this.#initFallback();
    }
  }

  #getAddressConfig() {
    return {
      defaultCountry: window.osConfig?.addressConfig?.defaultCountry ?? document.querySelector('meta[name="os-address-default-country"]')?.content ?? 'US',
      showCountries: window.osConfig?.addressConfig?.showCountries ?? document.querySelector('meta[name="os-address-show-countries"]')?.content?.split(',').map(c => c.trim()) ?? [],
      dontShowStates: window.osConfig?.addressConfig?.dontShowStates ?? document.querySelector('meta[name="os-address-dont-show-states"]')?.content?.split(',').map(s => s.trim()) ?? [],
      countries: window.osConfig?.addressConfig?.countries ?? [],
    };
  }

  async #loadInitialLocationData() {
    try {
      this.#logger.info('Loading initial location data from Cloudflare Worker');
      
      // Use the app's API client to get location data
      const locationData = await this.#app.api.getLocationData();
      
      if (locationData && locationData.countries) {
        // Store the countries with currency info
        this.#countries = this.#filterCountries(locationData.countries);
        
        // Store detected country data if available
        if (locationData.detectedCountryCode) {
          this.#app.state.setInitialLocationData({
            countries: locationData.countries,
            detectedCountryCode: locationData.detectedCountryCode,
            detectedStates: locationData.detectedStates,
            detectedCountryConfig: locationData.detectedCountryConfig
          });
          
          // Store detected states and config
          if (locationData.detectedStates) {
            this.#states[locationData.detectedCountryCode] = locationData.detectedStates;
          }
          if (locationData.detectedCountryConfig) {
            this.#countryConfigs[locationData.detectedCountryCode] = locationData.detectedCountryConfig;
          }
          
          this.#logger.info(`Detected user country: ${locationData.detectedCountryCode}`);
        }
        
        // Cache the data
        this.#saveCache('os_countries_cache', { countries: this.#countries });
        this.#saveCache('os_country_configs_cache', { configs: this.#countryConfigs });
        this.#saveCache('os_states_cache', { states: this.#states });
        
        this.#logger.info(`Loaded ${this.#countries.length} countries from Cloudflare Worker`);
      } else {
        throw new Error('Invalid response from location worker');
      }
    } catch (error) {
      this.#logger.error('Failed to load initial location data:', error);
      throw error;
    }
  }

  #filterCountries(countries) {
    let filteredCountries = countries;
    
    // Apply showCountries filter if specified
    if (this.#addressConfig.showCountries.length > 0) {
      filteredCountries = countries.filter(c => 
        this.#addressConfig.showCountries.includes(c.code)
      );
      this.#logger.debug(`Filtered countries to: ${this.#addressConfig.showCountries.join(', ')}`);
    }
    
    // Sort countries alphabetically
    filteredCountries.sort((a, b) => a.name.localeCompare(b.name));
    
    return filteredCountries;
  }

  async #initCountrySelect(countrySelect, stateSelect) {
    // Create options using the new data structure (code instead of iso2)
    countrySelect.innerHTML = '<option value="">Select Country</option>' + 
      this.#countries.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
    
    // Set default country if specified
    countrySelect.value = this.#addressConfig.defaultCountry;
    
    // Initialize states for default country
    if (stateSelect && countrySelect.value) {
      await this.#updateStateSelect(stateSelect, countrySelect.value);
    }
    
    this.#logger.debug(`Country select initialized with default ${this.#addressConfig.defaultCountry}`);
  }

  #setupCountryChangeListeners() {
    const pairs = [
      [this.#elements.shippingCountry, this.#elements.shippingState],
      [this.#elements.billingCountry, this.#elements.billingState]
    ];
    
    pairs.forEach(([country, state]) => {
      country?.addEventListener('change', async () => {
        if (state && country.value) {
          await this.#updateStateSelect(state, country.value);
          this.#updateCountrySpecificUI(country.value);
        }
      });
    });
  }

  async #updateStateSelect(stateSelect, countryCode, isPriority = false) {
    if (!countryCode) {
      stateSelect.innerHTML = '<option value="">Select State/Province</option>';
      return;
    }

    try {
      // Get states from cache or load from worker
      let states = this.#states[countryCode];
      let countryConfig = this.#countryConfigs[countryCode];
      
      if (!states || !countryConfig) {
        this.#logger.debug(`Loading states and config for ${countryCode} from worker`);
        const data = await this.#app.api.getCountryStatesAndConfig(countryCode);
        
        if (data) {
          states = data.states || [];
          countryConfig = data.countryConfig || {};
          
          // Store in cache and state manager
          this.#states[countryCode] = states;
          this.#countryConfigs[countryCode] = countryConfig;
          this.#app.state.setCountryStatesAndConfig(countryCode, data);
          
          // Update cache
          this.#saveCache('os_states_cache', { states: this.#states });
          this.#saveCache('os_country_configs_cache', { configs: this.#countryConfigs });
        } else {
          states = [];
          countryConfig = {};
        }
      }

      // Filter out unwanted states
      if (this.#addressConfig.dontShowStates.length > 0) {
        states = states.filter(s => !this.#addressConfig.dontShowStates.includes(s.code));
      }

      this.#populateStateSelect(stateSelect, states, countryConfig);
      this.#logger.debug(`State select updated for ${countryCode} with ${states.length} states`);
      
    } catch (error) {
      this.#logger.error(`Failed to load states for ${countryCode}:`, error);
      this.#populateStateSelect(stateSelect, [], {});
    }
  }

  #populateStateSelect(stateSelect, states, countryConfig = {}) {
    const currentValue = stateSelect.value || stateSelect.getAttribute('data-pending-state') || '';
    
    // Use country-specific label if available
    const stateLabel = countryConfig.stateLabel || 'State/Province';
    
    stateSelect.innerHTML = `<option value="">Select ${stateLabel}</option>` + 
      states.map(s => `<option value="${s.code}">${s.name}</option>`).join('');
    
    // Show/hide state select based on availability and requirements
    const stateContainer = stateSelect.parentElement;
    if (stateContainer) {
      if (states.length > 0) {
        stateContainer.style.display = '';
        // Update label if available
        const label = stateContainer.querySelector('label');
        if (label && countryConfig.stateLabel) {
          label.textContent = countryConfig.stateLabel;
        }
      } else {
        stateContainer.style.display = countryConfig.stateRequired ? '' : 'none';
      }
    }
    
    // Restore previous value if valid
    if (currentValue && Array.from(stateSelect.options).some(o => o.value === currentValue)) {
      stateSelect.value = currentValue;
    }
  }

  #updateCountrySpecificUI(countryCode) {
    const countryConfig = this.#countryConfigs[countryCode];
    if (!countryConfig) return;

    // Update postcode/zip field labels and validation
    const postcodeInputs = document.querySelectorAll('[os-checkout-field="zip"], [os-checkout-field="postal_code"]');
    postcodeInputs.forEach(input => {
      const container = input.parentElement;
      const label = container?.querySelector('label');
      
      if (label && countryConfig.postcodeLabel) {
        label.textContent = countryConfig.postcodeLabel;
      }
      
      if (countryConfig.postcodeExample) {
        input.placeholder = countryConfig.postcodeExample;
      }
      
      // Update validation pattern if available
      if (countryConfig.postcodeRegex) {
        input.pattern = countryConfig.postcodeRegex;
      }
    });
    
    this.#logger.debug(`Updated UI for country ${countryCode}`);
  }

  #autoSelectDetectedCountry() {
    // Get detected country from state manager
    const locationState = this.#app.state.getState('location');
    const detectedCountryCode = locationState?.detectedCountryCode;
    
    if (detectedCountryCode && !this.#elements.shippingCountry?.value && !this.#elements.billingCountry?.value) {
      // Set detected country as default
      [this.#elements.shippingCountry, this.#elements.billingCountry].forEach(countrySelect => {
        if (countrySelect && !countrySelect.value) {
          countrySelect.value = detectedCountryCode;
          countrySelect.dispatchEvent(new Event('change'));
        }
      });
      
      this.#logger.info(`Auto-selected detected country: ${detectedCountryCode}`);
    }
  }

  #loadCachedData() {
    const loadCache = key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) ?? '{}');
        return (Date.now() - (data.timestamp ?? 0) < 24 * 60 * 60 * 1000) ? data : {};
      } catch (error) {
        this.#logger.warn(`Failed to load cache for ${key}:`, error);
        return {};
      }
    };
    
    const countriesCache = loadCache('os_countries_cache');
    this.#countries = countriesCache.countries ?? [];
    
    // Filter cached countries if needed
    if (this.#countries.length && this.#addressConfig.showCountries.length) {
      this.#countries = this.#countries.filter(c => 
        this.#addressConfig.showCountries.includes(c.code || c.iso2)
      );
    }
    
    const statesCache = loadCache('os_states_cache');
    this.#states = statesCache.states ?? {};
    
    const configsCache = loadCache('os_country_configs_cache');
    this.#countryConfigs = configsCache.configs ?? {};
    
    this.#logger.debug(`Loaded cached data: ${this.#countries.length} countries, ${Object.keys(this.#states).length} state sets, ${Object.keys(this.#countryConfigs).length} configs`);
  }

  #saveCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
    } catch (error) {
      this.#logger.warn(`Failed to save cache for ${key}:`, error);
    }
  }

  async #initFallback() {
    this.#logger.warn('Initializing AddressHandler in fallback mode');
    
    // Use configured countries if available, otherwise use basic defaults
    if (this.#addressConfig.countries.length) {
      this.#countries = this.#addressConfig.countries.map(c => ({ 
        code: c.code || c.iso2, 
        name: c.name 
      }));
    } else {
      // Basic country list as fallback
      this.#countries = [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'AU', name: 'Australia' }
      ];
    }
    
    // Initialize selects with fallback data
    await Promise.all([
      this.#elements.shippingCountry && this.#initCountrySelect(this.#elements.shippingCountry, this.#elements.shippingState),
      this.#elements.billingCountry && this.#initCountrySelect(this.#elements.billingCountry, this.#elements.billingState),
    ]);
    
    this.#setupCountryChangeListeners();
  }

  #setupAutocompleteDetection() {
    const fields = Object.values(this.#elements).filter(Boolean);
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'value' && m.target.value) {
          const isShipping = m.target === this.#elements.shippingCountry;
          const state = isShipping ? this.#elements.shippingState : this.#elements.billingState;
          
          if (state) {
            this.#updateStateSelect(state, m.target.value, true);
          }
          
          this.#logger.debug(`Autocomplete detected on ${m.target.getAttribute('os-checkout-field')}`);
        }
      });
    });
    
    fields.forEach(f => observer.observe(f, { attributes: true, attributeFilter: ['value'] }));
    this.#preloadCommonStates();
    this.#logger.debug('Autocomplete detection set up');
  }

  #preloadCommonStates() {
    const countries = this.#addressConfig.showCountries.length ? 
      this.#addressConfig.showCountries : 
      ['US', 'CA', 'GB', 'AU'];
    
    countries.forEach(countryCode => {
      if (!this.#states[countryCode]) {
        this.#updateStateSelect(null, countryCode).catch(error => {
          this.#logger.debug(`Failed to preload states for ${countryCode}:`, error);
        });
      }
    });
    
    this.#logger.debug(`Preloading states for ${countries.join(', ')}`);
  }

  // Public method to refresh data (can be called externally)
  async refresh() {
    this.#logger.info('Refreshing AddressHandler data');
    this.#countries = [];
    this.#states = {};
    this.#countryConfigs = {};
    localStorage.removeItem('os_countries_cache');
    localStorage.removeItem('os_states_cache');
    localStorage.removeItem('os_country_configs_cache');
    await this.#init();
  }

  // Public method to get current country configuration
  getCountryConfig(countryCode) {
    return this.#countryConfigs[countryCode] || {};
  }

  // Public method to validate postcode based on country
  validatePostcode(postcode, countryCode) {
    const config = this.getCountryConfig(countryCode);
    if (!config.postcodeRegex) return true;
    
    try {
      const regex = new RegExp(config.postcodeRegex);
      return regex.test(postcode);
    } catch (error) {
      this.#logger.warn(`Invalid postcode regex for ${countryCode}:`, error);
      return true;
    }
  }
}