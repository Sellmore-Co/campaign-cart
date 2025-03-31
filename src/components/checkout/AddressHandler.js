export class AddressHandler {
  #form;
  #logger;
  #addressConfig;
  #countries = [];
  #states = {};
  #elements;

  constructor(form, logger) {
    this.#form = form;
    this.#logger = logger;
    this.#addressConfig = this.#getAddressConfig();
    this.#elements = {
      shippingCountry: document.querySelector('[os-checkout-field="country"]'),
      shippingState: document.querySelector('[os-checkout-field="province"]'),
      billingCountry: document.querySelector('[os-checkout-field="billing-country"]'),
      billingState: document.querySelector('[os-checkout-field="billing-province"]'),
    };

    this.#loadCachedData();
    if (this.#elements.shippingCountry || this.#elements.billingCountry) {
      this.#logger.info('AddressHandler initialized');
      this.#init();
    } else {
      this.#logger.warn('No country selects found');
    }
  }

  async #init() {
    await this.#loadCountriesAndStates();
    await Promise.all([
      this.#elements.shippingCountry && this.#initCountrySelect(this.#elements.shippingCountry, this.#elements.shippingState),
      this.#elements.billingCountry && this.#initCountrySelect(this.#elements.billingCountry, this.#elements.billingState),
    ]);
    this.#setupCountryChangeListeners();
    this.#detectUserCountry();
    this.#setupAutocompleteDetection();
  }

  #getAddressConfig() {
    return {
      defaultCountry: window.osConfig?.addressConfig?.defaultCountry ?? document.querySelector('meta[name="os-address-default-country"]')?.content ?? 'US',
      showCountries: window.osConfig?.addressConfig?.showCountries ?? document.querySelector('meta[name="os-address-show-countries"]')?.content?.split(',').map(c => c.trim()) ?? [],
      dontShowStates: window.osConfig?.addressConfig?.dontShowStates ?? document.querySelector('meta[name="os-address-dont-show-states"]')?.content?.split(',').map(s => s.trim()) ?? [],
      countries: window.osConfig?.addressConfig?.countries ?? [],
    };
  }

  async #initCountrySelect(countrySelect, stateSelect) {
    countrySelect.innerHTML = '<option value="">Select Country</option>' + 
      this.#countries.map(c => `<option value="${c.iso2}">${c.name}</option>`).join('');
    countrySelect.value = this.#addressConfig.defaultCountry;
    if (stateSelect && countrySelect.value) await this.#updateStateSelect(stateSelect, countrySelect.value);
    this.#logger.debug(`Country select initialized with default ${this.#addressConfig.defaultCountry}`);
  }

  #setupCountryChangeListeners() {
    const pairs = [
      [this.#elements.shippingCountry, this.#elements.shippingState],
      [this.#elements.billingCountry, this.#elements.billingState]
    ];
    pairs.forEach(([country, state]) => {
      country?.addEventListener('change', () => state && this.#updateStateSelect(state, country.value));
    });
  }

  async #updateStateSelect(stateSelect, countryCode, isPriority = false) {
    if (!countryCode) return stateSelect.innerHTML = '<option value="">Select State/Province</option>';
    const states = this.#states[countryCode] || (await this.#loadStates(countryCode));
    if (isPriority) await states;
    this.#populateStateSelect(stateSelect, states);
    this.#logger.debug(`State select updated for ${countryCode}`);
  }

  #populateStateSelect(stateSelect, states) {
    const currentValue = stateSelect.value || stateSelect.getAttribute('data-pending-state') || '';
    stateSelect.innerHTML = '<option value="">Select State/Province</option>' + 
      states.map(s => `<option value="${s.iso2}">${s.name}</option>`).join('');
    stateSelect.parentElement.style.display = states.length ? '' : 'none';
    if (currentValue && Array.from(stateSelect.options).some(o => o.value === currentValue)) stateSelect.value = currentValue;
  }

  #loadCachedData() {
    const loadCache = key => {
      const data = JSON.parse(localStorage.getItem(key) ?? '{}');
      return (Date.now() - (data.timestamp ?? 0) < 24 * 60 * 60 * 1000) ? data : {};
    };
    this.#countries = loadCache('os_countries_cache').countries ?? [];
    
    // Filter cached countries if showCountries is specified
    if (this.#countries.length && this.#addressConfig.showCountries.length) {
      this.#countries = this.#countries.filter(c => 
        this.#addressConfig.showCountries.includes(c.iso2));
      this.#logger.debug(`Filtered cached countries to: ${this.#addressConfig.showCountries.join(', ')}`);
    }
    
    this.#states = loadCache('os_states_cache').states ?? {};
    this.#logger.debug(`Loaded cached data: ${this.#countries.length} countries, ${Object.keys(this.#states).length} state sets`);
  }

  #saveCache(key, data) {
    localStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
  }

  async #loadCountriesAndStates() {
    if (this.#countries.length) return;
    this.#countries = this.#addressConfig.countries.length ? 
      this.#addressConfig.countries.map(c => ({ iso2: c.iso2 || c.code, name: c.name })) :
      (await (await fetch('https://api.countrystatecity.in/v1/countries', { 
        headers: { 'X-CSCAPI-KEY': 'c2R3MzNhYmpvYUJPdmhkUlE5TUJWYUtJUGs2TTlNU3cyRmxmVW9wVQ==' } 
      })).json()).filter(c => !this.#addressConfig.showCountries.length || this.#addressConfig.showCountries.includes(c.iso2));
    this.#countries.sort((a, b) => a.name.localeCompare(b.name));
    this.#saveCache('os_countries_cache', { countries: this.#countries });
    this.#logger.info(`Loaded ${this.#countries.length} countries`);
  }

  async #loadStates(countryCode) {
    if (this.#states[countryCode]) return this.#states[countryCode];
    try {
      const states = (await (await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, { 
        headers: { 'X-CSCAPI-KEY': 'c2R3MzNhYmpvYUJPdmhkUlE5TUJWYUtJUGs2TTlNU3cyRmxmVW9wVQ==' } 
      })).json()).filter(s => !this.#addressConfig.dontShowStates.includes(s.iso2));
      this.#states[countryCode] = states;
      this.#saveCache('os_states_cache', { states: this.#states });
      this.#logger.debug(`Loaded ${states.length} states for ${countryCode}`);
      return states;
    } catch (error) {
      this.#logger.error(`Failed to load states for ${countryCode}:`, error);
      this.#states[countryCode] = countryCode === 'US' ? /* US states list */ [] : [];
      return this.#states[countryCode];
    }
  }

  async #detectUserCountry() {
    // Try to detect country from IP regardless of current selection
    let countryCode = this.#addressConfig.defaultCountry;
    this.#logger.info(`Starting country detection. Default country from config: ${countryCode}`);
    
    try {
      this.#logger.info('Attempting to detect country from IP services...');
      const ipServices = ['https://ipapi.co/json/', 'https://ipinfo.io/json'];
      
      for (const url of ipServices) {
        try {
          this.#logger.info(`Trying IP service: ${url}`);
          const response = await fetch(url);
          const data = await response.json();
          console.log(`IP service response from ${url}:`, data);
          
          if (data?.country_code || data?.country) {
            countryCode = data.country_code || data.country;
            this.#logger.info(`Country detected from IP service (${url}): ${countryCode}`);
            break;
          } else {
            this.#logger.warn(`No country code found in response from ${url}`);
          }
        } catch (e) {
          this.#logger.warn(`IP service ${url} failed:`, e);
          console.error(`IP service ${url} error:`, e);
        }
      }
    } catch (error) {
      this.#logger.warn('All IP detection services failed:', error);
      console.error('All IP detection services failed:', error);
    }

    // Check if detected country is in the allowed list
    const isCountryAllowed = this.#countries.some(c => c.iso2 === countryCode);
    this.#logger.info(`Checking if country ${countryCode} is allowed. Allowed: ${isCountryAllowed}`);
    
    if (!isCountryAllowed) {
      this.#logger.info(`Detected country ${countryCode} not in allowed list, defaulting to US`);
      countryCode = 'US';
    }

    // Check current values and update if they're just the default US
    const currentShippingCountry = this.#elements.shippingCountry?.value;
    const currentBillingCountry = this.#elements.billingCountry?.value;
    
    this.#logger.info(`Current shipping country: ${currentShippingCountry}, Current billing country: ${currentBillingCountry}`);
    
    // Update if either field is empty or has the default US value
    if (!currentShippingCountry || !currentBillingCountry || 
        currentShippingCountry === 'US' || currentBillingCountry === 'US') {
      // Set the country and trigger change event for fields that are empty or have default US
      [this.#elements.shippingCountry, this.#elements.billingCountry].forEach(c => {
        if (c && (!c.value || c.value === 'US')) {
          this.#logger.info(`Setting country ${countryCode} on ${c.getAttribute('os-checkout-field')}`);
          c.value = countryCode;
          c.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      this.#logger.info(`User country set to ${countryCode}`);
    } else {
      this.#logger.info('Country already selected on both shipping and billing, skipping update');
    }
  }

  #setupAutocompleteDetection() {
    const fields = Object.values(this.#elements).filter(Boolean);
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'value' && m.target.value) {
          const state = m.target === this.#elements.shippingCountry ? this.#elements.shippingState : this.#elements.billingState;
          state && this.#updateStateSelect(state, m.target.value, true);
          this.#logger.debug(`Autocomplete detected on ${m.target.getAttribute('os-checkout-field')}`);
        }
      });
    });
    fields.forEach(f => observer.observe(f, { attributes: true, attributeFilter: ['value'] }));
    this.#preloadCommonStates();
    this.#logger.debug('Autocomplete detection set up');
  }

  #preloadCommonStates() {
    const countries = this.#addressConfig.showCountries.length ? this.#addressConfig.showCountries : ['US', 'CA', 'GB', 'AU'];
    countries.forEach(c => !this.#states[c] && this.#loadStates(c));
    this.#logger.debug(`Preloading states for ${countries.join(', ')}`);
  }
}