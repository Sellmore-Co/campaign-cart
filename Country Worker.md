# Frontend Integration Guide

This guide explains how to use the Cloudflare Worker API endpoints (`/location` and `/countries/.../states`) on your checkout page frontend to populate country and state dropdowns effectively.

## Goal

*   Populate a country dropdown with all available countries.
*   Automatically select the user's country based on their IP address (if possible).
*   Populate a state/province dropdown based on the selected country.
*   Update the state/province dropdown dynamically when the user selects a different country.

## Workflow

### 1. Initial Page Load

When your checkout page loads, make a single API call to the `/location` endpoint.

```javascript
async function initializeLocationDropdowns() {
  try {
    // Response will look like:
    // {
    //   "detectedCountryCode": "US",
    //   "detectedCountryConfig": { stateLabel: "State", postcodeRegex: "...", ... },
    //   "detectedStates": [ { "code": "CA", "name": "California" }, ... ],
    //   "countries": [
    //     { "code": "US", "name": "United States", "phonecode": "+1", "currency": "USD", "currencySymbol": "$" }, 
    //     ...
    //   ]
    // }
    const response = await fetch('https://YOUR_WORKER_SUBDOMAIN.workers.dev/location'); // Replace with your worker URL
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const countryDropdown = document.getElementById('country-select'); // Assuming <select id="country-select">
    const stateDropdown = document.getElementById('state-select');   // Assuming <select id="state-select">

    // Clear existing options (optional)
    countryDropdown.innerHTML = '<option value="">Select Country...</option>';
    stateDropdown.innerHTML = '<option value="">Select State/Province...</option>';

    // Populate Country Dropdown
    data.countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code; // e.g., "US"
      option.textContent = country.name; // e.g., "United States"
      countryDropdown.appendChild(option);
    });

    // Pre-select detected country
    if (data.detectedCountryCode) {
      countryDropdown.value = data.detectedCountryCode;
    }

    // Populate State Dropdown with detected states
    if (data.detectedStates && data.detectedStates.length > 0) {
        data.detectedStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state.code; // e.g., "CA"
            option.textContent = state.name; // e.g., "California"
            stateDropdown.appendChild(option);
        });
    } else {
        // Handle cases where detected country has no states or detection failed
        stateDropdown.disabled = true; // Optional: Disable state dropdown
    }

    // Add event listener for country changes *after* initial population
    countryDropdown.addEventListener('change', handleCountryChange);

  } catch (error) {
    console.error("Failed to initialize location dropdowns:", error);
    // Handle error appropriately, maybe disable dropdowns
  }
}

// Call this function when the page loads
initializeLocationDropdowns();
```

### 2. Handling Country Selection Change

Add an event listener to your country dropdown. When the user selects a new country, fetch the corresponding states and config.

```javascript
async function handleCountryChange(event) {
  const selectedCountryCode = event.target.value;
  const stateDropdown = document.getElementById('state-select');

  // Clear existing state options
  stateDropdown.innerHTML = '<option value="">Loading States...</option>';
  stateDropdown.disabled = true; // Disable while loading

  if (!selectedCountryCode) {
      stateDropdown.innerHTML = '<option value="">Select State/Province...</option>';
      // Keep disabled or enable as needed
      return; // No country selected
  }

  try {
    // Fetch states and config for the newly selected country
    // Response will look like:
    // {
    //   "countryConfig": { stateLabel: "Province", ... },
    //   "states": [ { "code": "AB", "name": "Alberta" }, ... ]
    // }
    const response = await fetch(`https://YOUR_WORKER_SUBDOMAIN.workers.dev/countries/${selectedCountryCode}/states`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // Contains countryConfig and states
    const states = data.states;
    const config = data.countryConfig;

    // --- Update UI using config --- 
    // Example: Update state label
    const stateLabel = document.querySelector('label[for="state-select"]');
    if (stateLabel && config.stateLabel) {
        stateLabel.textContent = config.stateLabel;
    }
    // Example: Update postcode label
    const postcodeLabel = document.querySelector('label[for="postcode-input"]'); // Assuming <input id="postcode-input">
    if (postcodeLabel && config.postcodeLabel) {
        postcodeLabel.textContent = config.postcodeLabel;
    }
    // --- End UI Update --- 

    // Populate state dropdown
    stateDropdown.innerHTML = '<option value="">Select State/Province...</option>'; // Reset default option
    if (states && states.length > 0) { // Check states array from response data
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.code;
            option.textContent = state.name;
            stateDropdown.appendChild(option);
        });
        stateDropdown.disabled = !config.stateRequired; // Disable if state not required per config
    } else {
        stateDropdown.innerHTML = '<option value="">N/A</option>';
        stateDropdown.disabled = true; // Disable if no states or not required
    }

    // --- Update Validation using config --- 
    // Example: Using a hypothetical 'updateValidation' function 
    // that takes the config object and applies rules to your validation library
    // updateValidation('state', config);
    // updateValidation('postcode', config);
    // --- End Validation Update ---

  } catch (error) {
    console.error(`Failed to fetch states/config for ${selectedCountryCode}:`, error);
    stateDropdown.innerHTML = '<option value="">Error loading states</option>';
    // Handle error appropriately
  }
}

// Note: The event listener is added inside initializeLocationDropdowns
// after the initial population to avoid triggering it immediately.
```

## Summary

*   Use `/location` on initial load for a smart default including country list (with currency/phone info), detected state list, and config for the detected country.
*   Use `/countries/{countryCode}/states` dynamically when the user changes the country selection to get the states list *and* the UI/validation config for the selected country.
*   This leverages the worker's caching efficiently while centralizing country-specific data and configuration. 