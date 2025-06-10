[Intervention] Images loaded lazily and replaced with placeholders. Load events are deferred. See https://go.microsoft.com/fwlink/?linkid=2048113
checkout?debug=true:50 Stylesheet loaded successfully: http://localhost:3000/dist/global.css
checkout?debug=true:1314 [RudderStack] Event listeners set up successfully 
checkout?debug=true:1314 [RudderStack] RudderStack integration initialized 
webfont.js:21 [Intervention] Slow network is detected. See https://www.chromestatus.com/feature/5636954674692096 for more details. Fallback font will be used while loading: https://fonts.gstatic.com/s/inter/v19/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2
webfont.js:21 [Intervention] Slow network is detected. See https://www.chromestatus.com/feature/5636954674692096 for more details. Fallback font will be used while loading: https://fonts.gstatic.com/s/fraunces/v37/6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2
optimize.js?key=g23zJvlwd1QG4dEk7PbV9W:1 mida v1.1.50
index.js:29 29next Client: Initializing with config {"apiKey":"✓ Set","campaignId":"✗ Not set","debug":true}
Logger.js:60 29next [CORE] API key from meta: ✓ Set
Logger.js:60 29next [CORE] Campaign ID from meta: ✗ Not set
Logger.js:60 29next [CORE] Debug mode: ✓ Enabled
Logger.js:60 29next [CORE] Found custom Spreedly configuration
Logger.js:60 29next [CORE] Initializing CountryCampaignManager for country detection
Logger.js:60 29next [COUNTRY_CAMPAIGN] CountryCampaignManager initialized
Logger.js:80 29next [PROFILE] +1ms Loaded 3 product profiles (single campaign mode)
Logger.js:80 29next [PROFILE] +1ms ProductProfileManager initialized
Logger.js:60 29next [CORE] Initializing CurrencyService (multi-currency enabled)
Logger.js:80 29next [CURRENCY] +2ms CurrencyService initialized with multi-currency support
Logger.js:60 29next [STATE] StateManager initialized (core state loaded)
Logger.js:60 29next [ATTRIBUTION] Initializing AttributionManager
Logger.js:60 29next [ATTRIBUTION] AttributionManager initialized successfully
Logger.js:60 29next [DISCOUNT] DiscountManager initialized
Logger.js:60 29next [CART] CartManager initialized
Logger.js:64  29next [UPSELL] No order reference ID found, upsell functionality will be limited
warn_fn @ Logger.js:64
warn @ Logger.js:49
init_fn10 @ UpsellManager.js:49
UpsellManager @ UpsellManager.js:34
TwentyNineNext @ TwentyNineNext.js:87
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [UPSELL] UpsellManager initialized
Logger.js:60 29next [STATE] [StateManager] Finalizing initialization: performing initial cart calculations.
Logger.js:80 29next [CURRENCY] +6ms 💱 [CurrencyService] getCurrencyCode() → "USD" (from default fallback)
Logger.js:60 29next [CORE] Initializing 29next client (async init phase)
Logger.js:60 29next [CORE] Loading localization data from Cloudflare Worker...
checkout?debug=true:38 Script loaded successfully: http://localhost:3000/dist/29next.js
[NEW] Explain Console errors by using Copilot in Edge: click
         
         to explain an error. 
        Learn more
        Don't show again
Logger.js:60 29next [CORE] Localization data loaded for country: CA
Logger.js:60 29next [CORE] Initializing country campaign system...
Logger.js:60 29next [COUNTRY_CAMPAIGN] Initializing country system
Logger.js:60 29next [COUNTRY_CAMPAIGN] 🔍 Starting country detection...
Logger.js:60 29next [COUNTRY_CAMPAIGN] 🌐 Using cached localization data: CA
Logger.js:60 29next [COUNTRY_CAMPAIGN] ✅ Detected country CA is in allowed list
Logger.js:60 29next [COUNTRY_CAMPAIGN] 🌍 Detected country: CA
Logger.js:60 29next [COUNTRY_CAMPAIGN] 🔔 Country initialized event triggered: CA
Logger.js:60 29next [CORE] Country campaign system initialized: CA
Logger.js:60 29next [API] Initializing ApiClient
Logger.js:64  29next [API] No campaign ID found in session storage or meta tag
warn_fn @ Logger.js:64
warn @ Logger.js:49
getCampaignId_fn @ ApiClient.js:84
init @ ApiClient.js:27
init @ TwentyNineNext.js:397
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [API] API key retrieved from meta tag
Logger.js:64  29next [CORE] window.on29NextReady is not an array, resetting it
warn_fn @ Logger.js:64
warn @ Logger.js:49
init @ TwentyNineNext.js:401
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [CORE] Fetching campaign data...
Logger.js:60 29next [CORE] Campaign data retrieved successfully
Logger.js:60 29next [ATTRIBUTION] Funnel name set to: Lem - USD
checkout?debug=true:1314 [RudderStack] Campaign Loaded and Page View tracked {campaignName: 'Lem - USD', pageType: 'checkout', pageName: 'unknown', eventName: 'Checkout Page View'}
js?key=AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs&libraries=places&region=CA:1441  Google Maps JavaScript API has been loaded directly without loading=async. This can result in suboptimal performance. For best-practice loading patterns please see https://goo.gle/js-api-loading
dda @ js?key=AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs&libraries=places&region=CA:1441
google.maps.Load @ js?key=AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs&libraries=places&region=CA:14
(anonymous) @ js?key=AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs&libraries=places&region=CA:1676
(anonymous) @ js?key=AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs&libraries=places&region=CA:1676
Logger.js:60 29next [CORE] 🔄 Initializing exchange rates for multi-currency support...
Logger.js:60 29next [CORE] 🔄 Currency service available: true
Logger.js:60 29next [CURRENCY] 💱 [CurrencyService] Initializing exchange rates...
Logger.js:60 29next [CURRENCY] 💱 [CurrencyService] Fetching fresh exchange rates from worker...
Logger.js:60 29next [CURRENCY] 💱 [CurrencyService] Exchange rates cached: 337 rates
Logger.js:60 29next [CORE] ✅ Exchange rates initialized successfully
Logger.js:80 29next [CURRENCY] +5186ms 💱 [CurrencyService] getCurrencyCode() → "CAD" (from current localization (CA))
Logger.js:60 29next [CORE] 🔄 Post-init currency check - Detected: "CAD", Base: "USD"
Logger.js:60 29next [SELECTOR] Initializing unit pricing for selectors
Logger.js:60 29next [SELECTOR] SelectorManager initialized
Logger.js:60 29next [TOGGLE] Found 3 toggle item button elements.
Logger.js:60 29next [TOGGLE] ToggleManager initialized
Logger.js:80 29next [TIMER] +5188ms Initializing timers
Logger.js:80 29next [TIMER] +5189ms TimerManager initialized
Logger.js:80 29next [DISPLAY] +5189ms Initializing display elements
Logger.js:80 29next [DISPLAY] +5189ms Initializing package pricing elements
Logger.js:80 29next [DISPLAY] +5189ms DisplayManager initialized
Logger.js:60 29next [EVENT] Initializing EventManager
Logger.js:60 29next [EVENT] Google Tag Manager detected
Logger.js:60 29next [EVENT] Facebook Pixel detected
Logger.js:60 29next [EVENT] Google Analytics 4 not detected
Logger.js:60 29next [EVENT] EventManager initialized
Logger.js:60 29next [TOOLTIP] Tooltip system initialized with floating-ui
Logger.js:60 29next [TOOLTIP] TooltipManager initialized
Logger.js:60 29next [CORE] Cart display elements detected, initializing CartDisplayManager
Logger.js:80 29next [CART_DISPLAY] +5191ms [INIT] Initializing cart display
Logger.js:80 29next [CART_DISPLAY] +5194ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "CAD"
Logger.js:80 29next [CART_DISPLAY] +5196ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:80 29next [CART_DISPLAY] +5198ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "CAD"
Logger.js:80 29next [CART_DISPLAY] +5202ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:80 29next [CART_DISPLAY] +5202ms CartDisplayManager initialized
Logger.js:60 29next [DEBUG] DebugManager initialized
Logger.js:60 29next [CORE] Checkout page detected
Logger.js:60 29next [CORE] Fixing billing form by duplicating shipping form
Logger.js:60 29next [CORE] Found shipping form and billing container
Logger.js:60 29next [CORE] Billing form successfully created from shipping form
Logger.js:60 29next [CORE] 🔧 [AddressHandler] Found form elements: {shippingCountry: true, billingCountry: true, postcodeField: 'shipping_postal_code', billingPostcodeField: 'billing_shipping_postal_code', postcodeLabel: null, …}
Logger.js:60 29next [CORE] AddressHandler initialized with Cloudflare Worker integration
Logger.js:60 29next [CORE] Using globally cached localization data from TwentyNineNext
Logger.js:60 29next [CORE] Loaded 2 countries from global cache
Logger.js:60 29next [CORE] Set default country to: CA (detected)
Logger.js:60 29next [CORE] AddressAutocomplete initialized (autocomplete enabled, country: CA)
2js?key=AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs&libraries=places&region=CA:83  As of March 1st, 2025, google.maps.places.Autocomplete is not available to new customers. Please use google.maps.places.PlaceAutocompleteElement instead. At this time, google.maps.places.Autocomplete is not scheduled to be discontinued, but google.maps.places.PlaceAutocompleteElement is recommended over google.maps.places.Autocomplete. While google.maps.places.Autocomplete will continue to receive bug fixes for any major regressions, existing bugs in google.maps.places.Autocomplete will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/legacy for additional details and https://developers.google.com/maps/documentation/javascript/places-migration-overview for the migration guide.
vD @ js?key=AIzaSyBmrv1QRE41P9FhFOTwUhRMGg6LcFH1ehs&libraries=places&region=CA:83
setupAutocomplete_fn @ AddressAutocomplete.js:110
(anonymous) @ AddressAutocomplete.js:90
initializeAutocomplete_fn @ AddressAutocomplete.js:88
initAutocompleteWithRetry_fn @ AddressAutocomplete.js:74
init_fn4 @ AddressAutocomplete.js:45
AddressAutocomplete @ AddressAutocomplete.js:33
initAddressAutocomplete_fn @ CheckoutManager.js:251
initializeComponents_fn @ CheckoutManager.js:105
CheckoutPage @ CheckoutManager.js:84
initCheckoutPage_fn @ TwentyNineNext.js:617
init @ TwentyNineNext.js:419
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [CORE] intlTelInput available, initializing phone inputs
Logger.js:60 29next [CORE] Found 2 phone inputs
Logger.js:60 29next [PROSPECT] Initializing ProspectCartHandler
Logger.js:60 29next [PROSPECT] ProspectCartHandler initialized successfully
Logger.js:60 29next [CORE] ProspectCartHandler initialized
Logger.js:60 29next [CORE] Checkout page components initialized successfully
Logger.js:60 29next [CORE] Initializing UI utilities
UtmTransfer.js:41 UTM Transfer: Initialized with config {"enabled":true,"applyToExternalLinks":false,"excludedDomains":[],"paramsToCopy":[]}
UtmTransfer.js:65 UTM Transfer: Available parameters: debug=true
UtmTransfer.js:88 UTM Transfer: No specific parameters configured, will copy all parameters
UtmTransfer.js:93 UTM Transfer: Found 2 links on the page
UtmTransfer.js:103 UTM Transfer: Event listeners attached to links
Logger.js:60 29next [CORE] UTM parameter transfer initialized
checkout?debug=true:1876 29next initialized, setting up tracking
checkout?debug=true:1856 Initializing tracking with campaign: txWe1gxeT8wctMeq5EQir1lA5k7eU7qeS7GNCipg country: CA
checkout?debug=true:1314 [RudderStack] Page view already sent, skipping duplicate 
checkout?debug=true:1805 29next client is ready!
checkout?debug=true:1834 ✅ ViewItem: LEM (CA: pkg 1)
EventManager.js:472 🔥 Firing view_item event to dataLayer
checkout?debug=true:1314 [RudderStack] Product Viewed tracked {item_id: 1, item_name: 'Lem (Core Offer)', price: 85, currency: 'USD', quantity: 1}
EventManager.js:472 🔥 Firing add_to_cart event to dataLayer
checkout?debug=true:1314 [RudderStack] Product Added tracked {item_id: 168, item_name: 'Lem (Core Offer)', price: 85, currency: 'USD', quantity: 1}
Logger.js:60 29next [CORE] 🔧 [AddressHandler] Applying config for CA: {stateLabel: 'Province', postcodeLabel: 'Postal Code', postcodeExample: 'K1A 0B1', postcodeRegex: '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$', inputmode: 'text', …}
Logger.js:60 29next [CORE] 🔄 Updated global currency data via AddressHandler: CA → CAD ($)
Logger.js:60 29next [COUNTRY_CAMPAIGN] Localization updated from AddressHandler: CA
Logger.js:80 29next [CURRENCY] +5254ms 💱 [CurrencyService] Localization updated from AddressHandler: CA → CAD
Logger.js:80 29next [CURRENCY] +5254ms 💱 [CurrencyService] getCurrencyCode() → "CAD" (from current localization (CA))
Logger.js:80 29next [CURRENCY] +5254ms 💱 [CurrencyService] Currency refreshed: CAD ($)
Logger.js:60 29next [STATE] 💱 [StateManager] Display refresh from CurrencyService: CAD ($)
Logger.js:80 29next [CART_DISPLAY] +5258ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "CAD"
Logger.js:80 29next [CART_DISPLAY] +5259ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:80 29next [CART_DISPLAY] +5260ms 💱 [CartDisplay] Display refresh from CurrencyService: CAD ($) for CA
Logger.js:80 29next [CART_DISPLAY] +5262ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "CAD"
Logger.js:80 29next [CART_DISPLAY] +5263ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:60 29next [CORE] 🏷️ [AddressHandler] Updating form labels with config: {stateLabel: 'Province', postcodeLabel: 'Postal Code', postcodeExample: 'K1A 0B1'}
Logger.js:64  29next [CORE] 🏷️ State label element 1 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:480
updateFormLabels_fn @ AddressHandler.js:474
applyCountryConfig_fn @ AddressHandler.js:450
init_fn @ AddressHandler.js:61
await in init_fn
AddressHandler @ AddressHandler.js:43
initAddressHandler_fn @ CheckoutManager.js:174
initializeComponents_fn @ CheckoutManager.js:99
CheckoutPage @ CheckoutManager.js:84
initCheckoutPage_fn @ TwentyNineNext.js:617
init @ TwentyNineNext.js:419
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ State label element 2 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:480
updateFormLabels_fn @ AddressHandler.js:474
applyCountryConfig_fn @ AddressHandler.js:450
init_fn @ AddressHandler.js:61
await in init_fn
AddressHandler @ AddressHandler.js:43
initAddressHandler_fn @ CheckoutManager.js:174
initializeComponents_fn @ CheckoutManager.js:99
CheckoutPage @ CheckoutManager.js:84
initCheckoutPage_fn @ TwentyNineNext.js:617
init @ TwentyNineNext.js:419
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ Postcode label element 1 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:493
updateFormLabels_fn @ AddressHandler.js:487
applyCountryConfig_fn @ AddressHandler.js:450
init_fn @ AddressHandler.js:61
await in init_fn
AddressHandler @ AddressHandler.js:43
initAddressHandler_fn @ CheckoutManager.js:174
initializeComponents_fn @ CheckoutManager.js:99
CheckoutPage @ CheckoutManager.js:84
initCheckoutPage_fn @ TwentyNineNext.js:617
init @ TwentyNineNext.js:419
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ Postcode label element 2 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:493
updateFormLabels_fn @ AddressHandler.js:487
applyCountryConfig_fn @ AddressHandler.js:450
init_fn @ AddressHandler.js:61
await in init_fn
AddressHandler @ AddressHandler.js:43
initAddressHandler_fn @ CheckoutManager.js:174
initializeComponents_fn @ CheckoutManager.js:99
CheckoutPage @ CheckoutManager.js:84
initCheckoutPage_fn @ TwentyNineNext.js:617
init @ TwentyNineNext.js:419
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [CORE] 📝 Updated postcode field 1: {placeholder: '"ZIP Code*" → "Postal Code"', title: '"null" → "Format: K1A 0B1"', element: 'shipping_postal_code'}
Logger.js:60 29next [CORE] 📝 Updated postcode field 2: {placeholder: '"ZIP Code*" → "Postal Code"', title: '"null" → "Format: K1A 0B1"', element: 'billing_shipping_postal_code'}
Logger.js:60 29next [CORE] ✅ [AddressHandler] Applied country configuration for CA - Postcode: "Postal Code" (K1A 0B1), Regex: ^[A-Z]\d[A-Z] ?\d[A-Z]\d$
Logger.js:64  29next [SELECTOR] No matching packages found between selectors and campaign data
warn_fn @ Logger.js:64
warn @ Logger.js:49
triggerViewItemList @ SelectorManager.js:613
(anonymous) @ SelectorManager.js:37
setTimeout
initSelectors_fn @ SelectorManager.js:37
SelectorManager @ SelectorManager.js:18
initializeManagers_fn @ TwentyNineNext.js:549
init @ TwentyNineNext.js:412
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
checkout?debug=true:1899 Selected card: null
checkout?debug=true:1902  No selected card found.
updateCouponSaving @ checkout?debug=true:1902
setTimeout
(anonymous) @ checkout?debug=true:1953
(anonymous) @ TwentyNineNext.js:827
wrappedCallback @ TwentyNineNext.js:125
triggerEvent @ TwentyNineNext.js:686
init @ TwentyNineNext.js:435
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [CORE] 🔧 [AddressHandler] Stored fresh config for US: {stateLabel: 'State', postcodeLabel: 'ZIP Code', postcodeExample: '12345 or 12345-6789', postcodeRegex: '^(\\d{5}|\\d{5}-\\d{4})$', currency: 'USD ($)'}
Logger.js:60 29next [CORE] 🔄 Updated global currency data via AddressHandler: US → USD ($)
Logger.js:60 29next [COUNTRY_CAMPAIGN] Localization updated from AddressHandler: US
Logger.js:60 29next [COUNTRY_CAMPAIGN] Updating current country: CA → US
Logger.js:80 29next [CURRENCY] +5560ms 💱 [CurrencyService] Localization updated from AddressHandler: US → USD
Logger.js:80 29next [CURRENCY] +5560ms 💱 [CurrencyService] getCurrencyCode() → "USD" (from current localization (US))
Logger.js:80 29next [CURRENCY] +5560ms 💱 [CurrencyService] Currency refreshed: USD ($)
Logger.js:60 29next [STATE] 💱 [StateManager] Display refresh from CurrencyService: USD ($)
Logger.js:80 29next [CART_DISPLAY] +5564ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "USD"
Logger.js:80 29next [CART_DISPLAY] +5565ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:80 29next [CART_DISPLAY] +5565ms 💱 [CartDisplay] Display refresh from CurrencyService: USD ($) for US
Logger.js:80 29next [CART_DISPLAY] +5566ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "USD"
Logger.js:80 29next [CART_DISPLAY] +5567ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:60 29next [COUNTRY_CAMPAIGN] Syncing country select to: US
Logger.js:60 29next [CORE] 🔧 [AddressHandler] Applying config for US: {stateLabel: 'State', postcodeLabel: 'ZIP Code', postcodeExample: '12345 or 12345-6789', postcodeRegex: '^(\\d{5}|\\d{5}-\\d{4})$', inputmode: 'text', …}
Logger.js:60 29next [CORE] 🔄 Updated global currency data via AddressHandler: US → USD ($)
Logger.js:60 29next [COUNTRY_CAMPAIGN] Localization updated from AddressHandler: US
Logger.js:80 29next [CURRENCY] +5747ms 💱 [CurrencyService] Localization updated from AddressHandler: US → USD
Logger.js:80 29next [CURRENCY] +5747ms 💱 [CurrencyService] getCurrencyCode() → "USD" (from current localization (US))
Logger.js:80 29next [CURRENCY] +5747ms 💱 [CurrencyService] Currency refreshed: USD ($)
Logger.js:60 29next [STATE] 💱 [StateManager] Display refresh from CurrencyService: USD ($)
Logger.js:80 29next [CART_DISPLAY] +5750ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "USD"
Logger.js:80 29next [CART_DISPLAY] +5752ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:80 29next [CART_DISPLAY] +5752ms 💱 [CartDisplay] Display refresh from CurrencyService: USD ($) for US
Logger.js:80 29next [CART_DISPLAY] +5754ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "USD"
Logger.js:80 29next [CART_DISPLAY] +5756ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:60 29next [CORE] 🏷️ [AddressHandler] Updating form labels with config: {stateLabel: 'State', postcodeLabel: 'ZIP Code', postcodeExample: '12345 or 12345-6789'}
Logger.js:64  29next [CORE] 🏷️ State label element 1 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:480
updateFormLabels_fn @ AddressHandler.js:474
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ BillingAddressHandler.js:235
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ State label element 2 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:480
updateFormLabels_fn @ AddressHandler.js:474
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ BillingAddressHandler.js:235
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ Postcode label element 1 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:493
updateFormLabels_fn @ AddressHandler.js:487
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ BillingAddressHandler.js:235
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ Postcode label element 2 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:493
updateFormLabels_fn @ AddressHandler.js:487
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ BillingAddressHandler.js:235
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [CORE] 📝 Updated postcode field 1: {placeholder: '"Postal Code" → "ZIP Code"', title: '"Format: K1A 0B1" → "Format: 12345 or 12345-6789"', element: 'shipping_postal_code'}
Logger.js:60 29next [CORE] 📝 Updated postcode field 2: {placeholder: '"Postal Code" → "ZIP Code"', title: '"Format: K1A 0B1" → "Format: 12345 or 12345-6789"', element: 'billing_shipping_postal_code'}
Logger.js:60 29next [CORE] ✅ [AddressHandler] Applied country configuration for US - Postcode: "ZIP Code" (12345 or 12345-6789), Regex: ^(\d{5}|\d{5}-\d{4})$
Logger.js:60 29next [CORE] 🔧 [AddressHandler] Applying config for US: {stateLabel: 'State', postcodeLabel: 'ZIP Code', postcodeExample: '12345 or 12345-6789', postcodeRegex: '^(\\d{5}|\\d{5}-\\d{4})$', inputmode: 'text', …}
Logger.js:60 29next [CORE] 🔄 Updated global currency data via AddressHandler: US → USD ($)
Logger.js:60 29next [COUNTRY_CAMPAIGN] Localization updated from AddressHandler: US
Logger.js:80 29next [CURRENCY] +5757ms 💱 [CurrencyService] Localization updated from AddressHandler: US → USD
Logger.js:80 29next [CURRENCY] +5757ms 💱 [CurrencyService] getCurrencyCode() → "USD" (from current localization (US))
Logger.js:80 29next [CURRENCY] +5758ms 💱 [CurrencyService] Currency refreshed: USD ($)
Logger.js:60 29next [STATE] 💱 [StateManager] Display refresh from CurrencyService: USD ($)
Logger.js:80 29next [CART_DISPLAY] +5760ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "USD"
Logger.js:80 29next [CART_DISPLAY] +5762ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:80 29next [CART_DISPLAY] +5762ms 💱 [CartDisplay] Display refresh from CurrencyService: USD ($) for US
Logger.js:80 29next [CART_DISPLAY] +5765ms 💰 [CartDisplay] Updating currency elements - Symbol: "$", Code: "USD"
Logger.js:80 29next [CART_DISPLAY] +5767ms 💰 [CartDisplay] Updated 0 symbol + 2 code elements
Logger.js:60 29next [CORE] 🏷️ [AddressHandler] Updating form labels with config: {stateLabel: 'State', postcodeLabel: 'ZIP Code', postcodeExample: '12345 or 12345-6789'}
Logger.js:64  29next [CORE] 🏷️ State label element 1 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:480
updateFormLabels_fn @ AddressHandler.js:474
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ State label element 2 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:480
updateFormLabels_fn @ AddressHandler.js:474
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ Postcode label element 1 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:493
updateFormLabels_fn @ AddressHandler.js:487
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:64  29next [CORE] 🏷️ Postcode label element 2 not found
warn_fn @ Logger.js:64
warn @ Logger.js:49
(anonymous) @ AddressHandler.js:493
updateFormLabels_fn @ AddressHandler.js:487
applyCountryConfig_fn @ AddressHandler.js:450
(anonymous) @ AddressHandler.js:227
await in (anonymous)
(anonymous) @ CountryCampaignManager.js:277
syncCountrySelection @ CountryCampaignManager.js:271
(anonymous) @ TwentyNineNext.js:424
setTimeout
init @ TwentyNineNext.js:422
await in init
TwentyNineNext @ TwentyNineNext.js:105
initialize @ index.js:44
(anonymous) @ index.js:64
(anonymous) @ index.js:65
Logger.js:60 29next [CORE] 📝 Updated postcode field 1: {placeholder: '"ZIP Code" → "ZIP Code"', title: '"Format: 12345 or 12345-6789" → "Format: 12345 or 12345-6789"', element: 'shipping_postal_code'}
Logger.js:60 29next [CORE] 📝 Updated postcode field 2: {placeholder: '"ZIP Code" → "ZIP Code"', title: '"Format: 12345 or 12345-6789" → "Format: 12345 or 12345-6789"', element: 'billing_shipping_postal_code'}
Logger.js:60 29next [CORE] ✅ [AddressHandler] Applied country configuration for US - Postcode: "ZIP Code" (12345 or 12345-6789), Regex: ^(\d{5}|\d{5}-\d{4})$
Logger.js:60 29next [CORE] 🔍 [AddressHandler] Debug: Current form element states for US:
Logger.js:60 29next [CORE] 🔍 Postcode field 1 (shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
Logger.js:60 29next [CORE] 🔍 Postcode field 2 (billing_shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
Logger.js:60 29next [CORE] Updated billing-phone country to US
Logger.js:60 29next [CORE] 🔍 [AddressHandler] Debug: Current form element states for US:
Logger.js:60 29next [CORE] 🔍 Postcode field 1 (shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
Logger.js:60 29next [CORE] 🔍 Postcode field 2 (billing_shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
Logger.js:60 29next [CORE] Updated phone country to US
Logger.js:60 29next [CORE] Hiding preloader element
Logger.js:60 29next [CORE] 🕐 [AddressHandler] Debug: Form element states after 500ms delay for US:
Logger.js:60 29next [CORE] 🔍 [AddressHandler] Debug: Current form element states for US:
Logger.js:60 29next [CORE] 🔍 Postcode field 1 (shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
Logger.js:60 29next [CORE] 🔍 Postcode field 2 (billing_shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
Logger.js:60 29next [CORE] 🕐 [AddressHandler] Debug: Form element states after 500ms delay for US:
Logger.js:60 29next [CORE] 🔍 [AddressHandler] Debug: Current form element states for US:
Logger.js:60 29next [CORE] 🔍 Postcode field 1 (shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
Logger.js:60 29next [CORE] 🔍 Postcode field 2 (billing_shipping_postal_code): {placeholder: 'ZIP Code', title: 'Format: 12345 or 12345-6789', pattern: '^(\\d{5}|\\d{5}-\\d{4})$', minlength: '5', maxlength: '10', …}
8Tracking Prevention blocked access to storage for <URL>.