/**
 * Example configuration for multi-currency campaign setup
 * 
 * Add this configuration to your HTML page before loading the 29next SDK:
 * 
 * <script>
 *   window.osConfig = {
 *     // ... your existing config ...
 *     countryCampaigns: {
 *       // Configuration from implementation document
 *     }
 *   };
 * </script>
 */

window.osConfig = window.osConfig || {};

// Multi-currency campaign configuration
window.osConfig.countryCampaigns = {
  // Map countries to their campaign IDs
  campaignIds: {
    'US': 'VKfNQPC2Sh9haYMJWZJbocoUnYRKvTcAjY6xaPzz', // USD campaign
    'CA': 'mvjijeLnHTVTePB5BDdTvBZs8kEJY97Oel69hbOo'  // CAD campaign
  },
  
  // Map external package IDs to internal campaign package IDs
  packageMaps: {
    'US': { 
      '1': '1',  // External package 1 maps to US campaign package 1
      '2': '2',  // External package 2 maps to US campaign package 2
      '6': '6'   // External package 6 maps to US campaign package 6
    },
    'CA': { 
      '1': '1',  // External package 1 maps to CA campaign package 1
      '2': '2',  // External package 2 maps to CA campaign package 2
      '6': '6'   // External package 6 maps to CA campaign package 6
    }
  }
};

/**
 * Example usage in your application:
 * 
 * 1. The system will automatically detect the user's country on page load
 * 2. Load the appropriate campaign (US or CA)
 * 3. Show prices in the correct currency (USD vs CAD)
 * 4. Allow users to switch countries with a dropdown
 * 5. Automatically update cart items and prices when switching
 * 
 * Testing with URL parameters:
 * - ?forceCountry=CA - Force Canadian pricing
 * - ?forceCountry=US - Force US pricing
 * 
 * JavaScript API:
 * - window.osCountryCampaignManager.getCurrentCountry()
 * - window.osCountryCampaignManager.switchCountry('CA')
 * - window.osCountryCampaignManager.getCurrentCampaignData()
 */

/**
 * Example HTML for country selector:
 * 
 * <select id="country-selector" onchange="switchCountry(this.value)">
 *   <option value="US">United States (USD)</option>
 *   <option value="CA">Canada (CAD)</option>
 * </select>
 * 
 * <script>
 *   function switchCountry(countryCode) {
 *     if (window.osCountryCampaignManager) {
 *       window.osCountryCampaignManager.switchCountry(countryCode)
 *         .then((result) => {
 *           console.log('Country switched successfully:', result);
 *           // Update UI to reflect new country
 *           updateCountryUI(result.newCountry, result.campaignData);
 *         })
 *         .catch((error) => {
 *           console.error('Failed to switch country:', error);
 *         });
 *     }
 *   }
 * 
 *   function updateCountryUI(country, campaignData) {
 *     // Update country selector
 *     document.getElementById('country-selector').value = country;
 *     
 *     // Update any currency displays
 *     const currencyElements = document.querySelectorAll('[data-currency]');
 *     currencyElements.forEach(el => {
 *       el.textContent = campaignData.currency;
 *     });
 *   }
 * 
 *   // Listen for country changes
 *   document.addEventListener('os:country.changed', (event) => {
 *     const { country, campaignData } = event.detail;
 *     console.log(`Country changed to ${country}`, campaignData);
 *     updateCountryUI(country, campaignData);
 *   });
 * </script>
 */ 