# Address Configuration

The 29next client library allows you to customize the country and state/province dropdowns in checkout forms. This document explains how to configure these options.

## API-Based Approach

The address fields (countries and states) are now loaded on-demand from the [countrystatecity.in](https://countrystatecity.in/) API. This approach has several benefits:

1. **Reduced Bundle Size**: No need to include all countries and states data in your bundle
2. **On-demand Loading**: Data is fetched only when needed
3. **Always Up-to-date**: The API provides the most current data without requiring updates to your codebase

## Configuration Options

You can configure the following aspects of address fields:

1. **Default Country**: Set the default selected country in the dropdown
2. **Filtered Countries**: Show only specific countries in the dropdown
3. **Filtered States/Provinces**: Hide specific states/provinces from the dropdown

## Configuration Methods

There are two ways to configure address fields:


### 1. Using JavaScript Configuration

Add the following JavaScript code before loading the 29next library:

```javascript
// Initialize global configuration object
window.osConfig = window.osConfig || {};

// Address configuration
window.osConfig.addressConfig = {
  defaultCountry: "US",
  // Filter countries to display (if empty, all countries shown but defaultCountry is preselected)
  showCountries: [
    'US', // United States
    'GB', // United Kingdom
    'AU', // Australia
    'DE', // Germany
  ],
  // Filter states to hide
  dontShowStates: [
    "AS", "UM-81", "GU", "HI", "UM-84", "UM-86", "UM-67", 
    "UM-89", "UM-71", "UM-76", "MP", "UM-95", "PR", "UM", 
    "VI", "UM-79"
  ]
};
```

## Country and State ISO Codes

### Common Country ISO Codes

- `US` - United States
- `GB` - United Kingdom
- `CA` - Canada
- `AU` - Australia
- `DE` - Germany
- `FR` - France
- `ES` - Spain
- `IT` - Italy
- `JP` - Japan
- `CN` - China

For a complete list of country codes, refer to the [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) standard.

### US State ISO Codes

US states use their standard two-letter abbreviations as ISO codes:

- `AL` - Alabama
- `AK` - Alaska
- `AZ` - Arizona
- `AR` - Arkansas
- `CA` - California
- etc.

US territories and outlying areas that you might want to filter out:

- `AS` - American Samoa
- `GU` - Guam
- `MP` - Northern Mariana Islands
- `PR` - Puerto Rico
- `VI` - U.S. Virgin Islands
- `UM` - U.S. Minor Outlying Islands (and its subdivisions like `UM-81`, `UM-84`, etc.)

## Fallback Mechanism

In case the API is unavailable or returns an error, the system will fall back to a minimal list of countries:

- United States (US)
- United Kingdom (GB)
- Australia (AU)
- Germany (DE)

## API Key Security

The API key is embedded in the client-side code. While this is acceptable for the countrystatecity.in API (which has rate limiting), for production use you might want to consider:

# 29NEXT SUGGESTION
Maybe that would be a good idea to implement an api endpoint on 29next from the country-state-city source so we don't get rate limited.
