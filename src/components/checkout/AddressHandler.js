import { CountryConfig } from './shared/CountryConfig.js';
import { FormFieldUtils } from './shared/FormFieldUtils.js';

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
    
    // Update field labels based on initial country
    const type = countrySelect === this.#elements.shippingCountry ? 'shipping' : 'billing';
    this.#updateFieldLabelsForCountry(countrySelect.value, type);
    
    this.#logger.debug(`Country select initialized with default ${this.#addressConfig.defaultCountry}`);
  }

  #setupCountryChangeListeners() {
    const pairs = [
      [this.#elements.shippingCountry, this.#elements.shippingState],
      [this.#elements.billingCountry, this.#elements.billingState]
    ];
    pairs.forEach(([country, state]) => {
      country?.addEventListener('change', () => {
        if (state) {
          this.#updateStateSelect(state, country.value);
        }
        // Update placeholders and labels based on country
        this.#updateFieldLabelsForCountry(country.value, country === this.#elements.shippingCountry ? 'shipping' : 'billing');
      });
    });
  }

  #updateFieldLabelsForCountry(countryCode, type = 'shipping') {
    const isBilling = type === 'billing';
    
    // Find fields using shared utility
    const postalField = FormFieldUtils.findPostalField(isBilling);
    const stateField = FormFieldUtils.findStateField(isBilling);
    
    // Get country configuration from shared module
    const config = CountryConfig.getCountryConfig(countryCode);
    
    // Update postal field
    if (postalField) {
      FormFieldUtils.updateFieldAttributes(postalField, {
        label: config.postalLabel,
        pattern: config.postalPattern,
        maxLength: config.postalMaxLength
      });
    }
    
    // Update state/province field
    if (stateField) {
      const defaultOption = stateField.querySelector('option[value=""]');
      if (defaultOption) {
        defaultOption.textContent = config.stateLabel;
      }
    }
    
    this.#logger.debug(`Updated field labels for ${type} address to ${countryCode} format`);
  }

  async #updateStateSelect(stateSelect, countryCode, isPriority = false) {
    if (!countryCode) return stateSelect.innerHTML = '<option value="">Select State</option>';
    const states = this.#states[countryCode] || (await this.#loadStates(countryCode));
    if (isPriority) await states;
    this.#populateStateSelect(stateSelect, states);
    this.#logger.debug(`State select updated for ${countryCode}`);
  }

  #populateStateSelect(stateSelect, states) {
    const currentValue = stateSelect.value || stateSelect.getAttribute('data-pending-state') || '';
    stateSelect.innerHTML = '<option value="">Select State</option>' + 
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
      let states = (await (await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, { 
        headers: { 'X-CSCAPI-KEY': 'c2R3MzNhYmpvYUJPdmhkUlE5TUJWYUtJUGs2TTlNU3cyRmxmVW9wVQ==' } 
      })).json()).filter(s => !this.#addressConfig.dontShowStates.includes(s.iso2));
      
      states.sort((a, b) => a.name.localeCompare(b.name));
      
      this.#states[countryCode] = states;
      this.#saveCache('os_states_cache', { states: this.#states });
      this.#logger.debug(`Loaded and sorted ${states.length} states for ${countryCode}`);
      return states;
    } catch (error) {
      this.#logger.error(`Failed to load states for ${countryCode}:`, error);
      this.#states[countryCode] = countryCode === 'US' ? /* US states list */ [] : [];
      return this.#states[countryCode];
    }
  }

  async #detectUserCountry() {
    if (this.#elements.shippingCountry?.value || this.#elements.billingCountry?.value) return;
    const countryCode = this.#addressConfig.defaultCountry || (await Promise.any(['https://ipapi.co/json/', 'https://ipinfo.io/json'].map(u => fetch(u).then(r => r.json()))))?.country_code;
    [this.#elements.shippingCountry, this.#elements.billingCountry].forEach(c => {
      if (c) {
        c.value = countryCode;
        c.dispatchEvent(new Event('change'));
      }
    });
    this.#logger.debug(`User country detected/set to ${countryCode}`);
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