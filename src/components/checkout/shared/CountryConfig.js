/**
 * CountryConfig - Shared configuration for country-specific settings
 * Centralizes postal patterns, field labels, and country configurations
 */

export const CountryConfig = {
  // Postal code validation patterns - matching your exact format
  postalPatterns: {
    'US': '(^\\d{5}$)|(^\\d{5}-\\d{4}$)',
    'GB': '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$',
    'CA': '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$',
    'AU': '^\\d{4}$',
    'NZ': '^\\d{4}$',
    'DE': '^\\d{5}$',
    'FR': '^\\d{5}$',
    'IT': '^\\d{5}$',
    'ES': '^\\d{5}$',
    'SE': '^\\d{3} ?\\d{2}$',
    'NL': '^\\d{4} ?[A-Z]{2}$',
    'CH': '^\\d{4}$',
    'BE': '^\\d{4}$',
    'AT': '^\\d{4}$',
    'DK': '^\\d{4}$',
    'FI': '^\\d{5}$',
    'NO': '^\\d{4}$',
    'PT': '^\\d{4}-\\d{3}$',
    'IE': '^[A-Za-z]\\d[\\dA-Za-z]? ?\\d[A-Za-z]{2}$',
    'PL': '^\\d{2}-\\d{3}$',
    'CZ': '^\\d{3} ?\\d{2}$',
    'SK': '^\\d{3} ?\\d{2}$',
    'HU': '^\\d{4}$',
    'RO': '^\\d{6}$',
    'BG': '^\\d{4}$',
    'GR': '^\\d{5}$',
    'EE': '^\\d{5}$',
    'LT': '^LT-\\d{5}$',
    'LU': '^\\d{4}$',
    'SI': '^\\d{4}$',
    'HR': '^\\d{5}$',
    'ZA': '^\\d{4}$',
    'IS': '^\\d{3}$',
    'TR': '^\\d{5}$',
    'GI': '^GX11 1AA$',
    'IM': '^IM\\d{1,2} ?\\d[ABD-HJLN-UW-Z]{2}$',
    'JE': '^JE\\d{1,2} ?\\d[ABD-HJLN-UW-Z]{2}$',
    'LI': '^949[0-8]$',
    'MD': '^\\d{4}$',
    'MC': '^980\\d{2}$',
    'RS': '^\\d{5}$',
    'CS': '^\\d{5}$',
    'MT': '^[A-Z]{3}\\d{4}$',
    'BR': '^\\d{5}-?\\d{3}$',
    'JP': '^\\d{3}-?\\d{4}$',
    'IN': '^\\d{6}$',
    'MX': '^\\d{5}$',
    'AR': '^([A-Z]\\d{4}[A-Z]{3}|\\d{4})$',
    'SG': '^\\d{6}$',
    'HK': '^\\d{0}$', // Hong Kong doesn't use postal codes
    'MY': '^\\d{5}$',
    'TH': '^\\d{5}$',
    'ID': '^\\d{5}$',
    'PH': '^\\d{4}$',
    'VN': '^\\d{6}$',
    'KR': '^\\d{5}$',
    'CN': '^\\d{6}$',
    'TW': '^\\d{3}(\\d{2})?$',
    'RU': '^\\d{6}$',
    'UA': '^\\d{5}$',
    'IL': '^\\d{5}(\\d{2})?$',
    'EG': '^\\d{5}$',
    'NG': '^\\d{6}$',
    'KE': '^\\d{5}$'
  },

  // Country-specific field labels
  fieldLabels: {
    'US': {
      postal: 'ZIP Code',
      state: 'State'
    },
    'CA': {
      postal: 'Postal Code',
      state: 'Province'
    },
    'GB': {
      postal: 'Postcode',
      state: 'County'
    },
    'AU': {
      postal: 'Postcode',
      state: 'State/Territory'
    },
    'NZ': {
      postal: 'Postcode',
      state: 'Region'
    },
    'DE': {
      postal: 'Postal Code',
      state: 'State'
    },
    'FR': {
      postal: 'Postal Code',
      state: 'Region'
    },
    'NL': {
      postal: 'Postcode',
      state: 'Province'
    },
    'BR': {
      postal: 'CEP',
      state: 'State'
    },
    'JP': {
      postal: 'Postal Code',
      state: 'Prefecture'
    },
    'IN': {
      postal: 'PIN Code',
      state: 'State'
    },
    'IT': {
      postal: 'Postal Code',
      state: 'Province'
    },
    'ES': {
      postal: 'Postal Code',
      state: 'Province'
    },
    'MX': {
      postal: 'Postal Code',
      state: 'State'
    },
    'AR': {
      postal: 'Postal Code',
      state: 'Province'
    }
  },

  // Country-specific field configurations with min/max length
  countrySettings: {
    'US': { postalMinLength: '5', postalMaxLength: '11', postalFormat: 'NNNNN-NNNN' },
    'GB': { postalMinLength: '5', postalMaxLength: '8', postalFormat: 'AANN NAA' },
    'CA': { postalMinLength: '6', postalMaxLength: '7', postalFormat: 'ANA NAN' },
    'AU': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'NZ': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'DE': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'FR': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'IT': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'ES': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'SE': { postalMinLength: '5', postalMaxLength: '6', postalFormat: 'NNN NN' },
    'NL': { postalMinLength: '6', postalMaxLength: '7', postalFormat: 'NNNN AA' },
    'CH': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'BE': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'AT': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'DK': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'FI': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'NO': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'PT': { postalMinLength: '8', postalMaxLength: '8', postalFormat: 'NNNN-NNN' },
    'IE': { postalMinLength: '7', postalMaxLength: '10', postalFormat: 'ANN NNAA' },
    'PL': { postalMinLength: '6', postalMaxLength: '6', postalFormat: 'NN-NNN' },
    'CZ': { postalMinLength: '5', postalMaxLength: '6', postalFormat: 'NNN NN' },
    'SK': { postalMinLength: '5', postalMaxLength: '6', postalFormat: 'NNN NN' },
    'HU': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'RO': { postalMinLength: '6', postalMaxLength: '6', postalFormat: 'NNNNNN' },
    'BG': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'GR': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'EE': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'LT': { postalMinLength: '8', postalMaxLength: '8', postalFormat: 'LT-NNNNN' },
    'LU': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'SI': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'HR': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'ZA': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'IS': { postalMinLength: '3', postalMaxLength: '3', postalFormat: 'NNN' },
    'TR': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'GI': { postalMinLength: '8', postalMaxLength: '8', postalFormat: 'GX11 1AA' },
    'IM': { postalMinLength: '5', postalMaxLength: '7', postalFormat: 'IMN NAA' },
    'JE': { postalMinLength: '5', postalMaxLength: '7', postalFormat: 'JEN NAA' },
    'LI': { postalMinLength: '4', postalMaxLength: '4', postalFormat: '949N' },
    'MD': { postalMinLength: '4', postalMaxLength: '4', postalFormat: 'NNNN' },
    'MC': { postalMinLength: '5', postalMaxLength: '5', postalFormat: '980NN' },
    'RS': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'CS': { postalMinLength: '5', postalMaxLength: '5', postalFormat: 'NNNNN' },
    'MT': { postalMinLength: '7', postalMaxLength: '7', postalFormat: 'AAANNNN' },
    'BR': { postalMinLength: '8', postalMaxLength: '9', postalFormat: 'NNNNN-NNN' },
    'JP': { postalMinLength: '7', postalMaxLength: '8', postalFormat: 'NNN-NNNN' },
    'IN': { postalMinLength: '6', postalMaxLength: '6', postalFormat: 'NNNNNN' }
  },

  /**
   * Get postal pattern for a country
   * @param {string} countryCode - Two-letter country code
   * @returns {string} Regex pattern for postal code validation
   */
  getPostalPattern(countryCode) {
    return this.postalPatterns[countryCode?.toUpperCase()] || '^.+$';
  },

  /**
   * Get field labels for a country
   * @param {string} countryCode - Two-letter country code
   * @returns {Object} Object with postal and state labels
   */
  getFieldLabels(countryCode) {
    const defaults = {
      postal: 'Postal Code',
      state: 'State/Province'
    };
    return this.fieldLabels[countryCode?.toUpperCase()] || defaults;
  },

  /**
   * Get country settings including min/max length and format
   * @param {string} countryCode - Two-letter country code
   * @returns {Object} Country-specific settings
   */
  getCountrySettings(countryCode) {
    const defaults = {
      postalMinLength: '3',
      postalMaxLength: '20',
      postalFormat: ''
    };
    return {
      ...defaults,
      ...this.countrySettings[countryCode?.toUpperCase()]
    };
  },

  /**
   * Get complete country configuration
   * @param {string} countryCode - Two-letter country code
   * @returns {Object} Complete configuration for the country
   */
  getCountryConfig(countryCode) {
    const labels = this.getFieldLabels(countryCode);
    const settings = this.getCountrySettings(countryCode);
    
    return {
      postalLabel: labels.postal + '*',
      stateLabel: 'Select ' + labels.state,
      postalPattern: this.getPostalPattern(countryCode),
      postalMaxLength: settings.postalMaxLength,
      postalFormat: settings.postalFormat
    };
  },

  /**
   * Format postal code based on country rules
   * @param {string} value - The postal code value to format
   * @param {string} countryCode - Two-letter country code
   * @returns {string} Formatted postal code
   */
  formatPostalCode(value, countryCode) {
    let cleaned = value;
    
    switch (countryCode?.toUpperCase()) {
      case 'CA':
        // Canadian postal code: A1A 1A1
        cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length > 3) {
          cleaned = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6);
        }
        break;
        
      case 'GB':
        // UK postcode - just uppercase, preserve spaces
        cleaned = value.toUpperCase();
        break;
        
      case 'NL':
        // Dutch postcode: 1234 AB
        cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length > 4) {
          cleaned = cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 6);
        }
        break;
        
      case 'JP':
        // Japanese postal code: 123-4567
        cleaned = value.replace(/[^\d-]/g, '');
        if (cleaned.length > 3 && cleaned.charAt(3) !== '-') {
          cleaned = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
        }
        break;
        
      case 'BR':
        // Brazilian CEP: 12345-678
        cleaned = value.replace(/[^\d-]/g, '');
        if (cleaned.length > 5 && cleaned.charAt(5) !== '-') {
          cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5, 8);
        }
        break;
        
      case 'PL':
        // Polish postal code: 12-345
        cleaned = value.replace(/[^\d-]/g, '');
        if (cleaned.length > 2 && cleaned.charAt(2) !== '-') {
          cleaned = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 5);
        }
        break;
        
      case 'PT':
        // Portuguese postal code: 1234-567
        cleaned = value.replace(/[^\d-]/g, '');
        if (cleaned.length > 4 && cleaned.charAt(4) !== '-') {
          cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 7);
        }
        break;
        
      case 'CZ':
      case 'SK':
        // Czech/Slovak postal code: 123 45
        cleaned = value.replace(/[^\d\s]/g, '');
        if (cleaned.length > 3 && cleaned.charAt(3) !== ' ') {
          cleaned = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 5);
        }
        break;
        
      case 'LT':
        // Lithuanian postal code: LT-12345
        cleaned = value.toUpperCase().replace(/[^LT\d-]/g, '');
        if (!cleaned.startsWith('LT-')) {
          cleaned = 'LT-' + cleaned.replace(/[^0-9]/g, '');
        }
        cleaned = cleaned.slice(0, 8);
        break;
        
      case 'IE':
        // Irish Eircode - preserve format
        cleaned = value.toUpperCase();
        break;
        
      case 'MT':
        // Maltese postcode: ABC1234
        cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;
        
      case 'SE':
      case 'NO':
      case 'DK':
      case 'FI':
        // Nordic postal codes: 123 45
        cleaned = value.replace(/[^\d\s]/g, '');
        if (cleaned.length > 3 && cleaned.charAt(3) !== ' ') {
          cleaned = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 5);
        }
        break;
        
      case 'US':
        // US ZIP code
        cleaned = value.replace(/[^\d-]/g, '');
        if (cleaned.length > 5) {
          const firstPart = cleaned.slice(0, 5);
          if (cleaned.charAt(5) !== '-') {
            const secondPart = cleaned.slice(5).replace(/-/g, '');
            cleaned = `${firstPart}-${secondPart}`;
          } else {
            const secondPart = cleaned.slice(6).replace(/-/g, '');
            cleaned = `${firstPart}-${secondPart}`;
          }
        }
        if (cleaned.includes('-')) {
          const [first, second] = cleaned.split('-');
          cleaned = `${first.slice(0, 5)}-${second.slice(0, 4)}`;
        } else {
          cleaned = cleaned.slice(0, 5);
        }
        break;
        
      default:
        // For other countries, just clean up basic formatting
        cleaned = value.trim();
        break;
    }
    
    return cleaned;
  },

  /**
   * Get validation configuration in JustValidate format
   * @param {string} countryCode - Two-letter country code
   * @returns {Object} Validation configuration with regex, min, max, and msg
   */
  getValidationConfig(countryCode) {
    const code = countryCode?.toUpperCase();
    const pattern = this.postalPatterns[code];
    const settings = this.getCountrySettings(code);
    const labels = this.getFieldLabels(code);
    
    if (!pattern) {
      // Default validation for unknown countries
      return {
        regex: /^.+$/,
        min: 3,
        max: 20,
        msg: 'Please enter a valid postal code'
      };
    }
    
    // Country-specific error messages
    const errorMessages = {
      'US': `Not a valid US ZIP Code (e.g., 12345 or 12345-6789)`,
      'GB': `Not a valid UK postcode (e.g., SW1A 1AA)`,
      'CA': `Not a valid Canadian postcode (e.g., K1A 0B1)`,
      'AU': `Not a valid Australian postcode (e.g., 2000)`,
      'NZ': `Not a valid NZ postcode (e.g., 6011)`,
      'DE': `Not a valid German postcode (e.g., 10115)`,
      'FR': `Not a valid French postcode (e.g., 75001)`,
      'IT': `Not a valid Italian postcode (e.g., 00100)`,
      'ES': `Not a valid Spanish postcode (e.g., 28013)`,
      'SE': `Not a valid Swedish postcode (e.g., 123 45)`,
      'NL': `Not a valid Dutch postcode (e.g., 1234 AB)`,
      'CH': `Not a valid Swiss postcode (e.g., 8001)`,
      'BE': `Not a valid Belgian postcode (e.g., 1000)`,
      'AT': `Not a valid Austrian postcode (e.g., 1010)`,
      'DK': `Not a valid Danish postcode (e.g., 2100)`,
      'FI': `Not a valid Finnish postcode (e.g., 00100)`,
      'NO': `Not a valid Norwegian postcode (e.g., 0150)`,
      'PT': `Not a valid Portuguese postcode (e.g., 1000-001)`,
      'IE': `Not a valid Irish Eircode (e.g., D02 X285)`,
      'PL': `Not a valid Polish postcode (e.g., 00-001)`,
      'CZ': `Not a valid Czech postcode (e.g., 123 45)`,
      'SK': `Not a valid Slovak postcode (e.g., 123 45)`,
      'HU': `Not a valid Hungarian postcode (e.g., 1051)`,
      'RO': `Not a valid Romanian postcode (e.g., 010011)`,
      'BG': `Not a valid Bulgarian postcode (e.g., 1000)`,
      'GR': `Not a valid Greek postcode (e.g., 10558)`,
      'EE': `Not a valid Estonian postcode (e.g., 10111)`,
      'LT': `Not a valid Lithuanian postcode (e.g., LT-01100)`,
      'LU': `Not a valid Luxembourg postcode (e.g., 1009)`,
      'SI': `Not a valid Slovenian postcode (e.g., 1000)`,
      'HR': `Not a valid Croatian postcode (e.g., 10000)`,
      'ZA': `Not a valid South African postcode (e.g., 8000)`,
      'IS': `Not a valid Icelandic postcode (e.g., 101)`,
      'TR': `Not a valid Turkish postcode (e.g., 34000)`,
      'GI': `Gibraltar postcode is GX11 1AA`,
      'IM': `Not a valid Isle of Man postcode (e.g., IM2 1AA)`,
      'JE': `Not a valid Jersey postcode (e.g., JE2 3ZZ)`,
      'LI': `Not a valid Liechtenstein postcode (e.g., 9490)`,
      'MD': `Not a valid Moldovan postcode (e.g., 2001)`,
      'MC': `Not a valid Monaco postcode (e.g., 98000)`,
      'RS': `Not a valid Serbian postcode (e.g., 11000)`,
      'CS': `Not a valid postcode (Serbia and Montenegro)`,
      'MT': `Not a valid Maltese postcode (e.g., VLT1111)`
    };
    
    return {
      regex: new RegExp(pattern, 'i'),
      min: parseInt(settings.postalMinLength),
      max: parseInt(settings.postalMaxLength),
      msg: errorMessages[code] || `Please enter a valid ${labels.postal}`
    };
  }
};