[CheckoutFormEnhancer] Reusing existing state loading promise for AU
logger.ts:79 [CountryService] States data fetched for AU {statesCount: 8, stateLabel: 'State / Territory'}
2logger.ts:79 [CheckoutFormEnhancer] No valid state found, showing placeholder: Select State / Territory
logger.ts:79 [CheckoutFormEnhancer] Saved user's country selection to session: AU
logger.ts:69 [CheckoutFormEnhancer] Auto-switching currency from USD to AUD for country AU
logger.ts:79 [CheckoutFormEnhancer] Saved user's country selection to session: AU
logger.ts:69 [CheckoutFormEnhancer] Auto-switching currency from USD to AUD for country AU
logger.ts:79 [StorageManager] No value found for key: next-campaign-cache_AUD
logger.ts:69 [CampaignStore] 🌐 Fetching fresh campaign data from API with currency: AUD...
logger.ts:79 [StorageManager] No value found for key: next-campaign-cache_AUD
logger.ts:69 [CampaignStore] 🌐 Fetching fresh campaign data from API with currency: AUD...
2logger.ts:79 [ApiClient] API Request: GET https://campaigns.apps.29next.com/api/v1/campaigns/?currency=AUD
logger.ts:79 [ApiClient] API Response: 200 {name: 'Drone Hawk', currency: 'AUD', language: 'en', payment_env_key: '6xZrSiBNS0fsn2GHI1zjrWrPWFw', packages: Array(10), …}
logger.ts:69 [CampaignStore] 💳 Spreedly environment key updated from campaign API: 6xZrSiBNS0fsn2GHI1zjrWrPWFw
logger.ts:79 [StorageManager] Stored value for key: next-campaign-cache_AUD
logger.ts:69 [CampaignStore] 💾 Campaign data cached for AUD (10 minutes)
logger.ts:79 [CurrencySelector] Campaign currency changed or data loaded, re-rendering currency selector
logger.ts:69 [CartStore] Refreshing cart item prices with new currency data...
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 19.99, formatted: '$19.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 19.99, formatted: '$19.99', currency: 'AUD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:69 [RudderStack] Processing event "dl_user_data" {eventName: 'dl_user_data', eventData: {…}}
logger.ts:79 [UserDataTracker] Tracked user data: {hasUserId: false, hasEmail: false, cartValue: 19.99, cartItems: 1}
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
logger.ts:69 [CartStore] Cart item prices refreshed with new currency
logger.ts:69 [CheckoutFormEnhancer] Currency auto-switched to AUD for country AU
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.compareTotal
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.subtotal
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 19.99, formatted: '$19.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.shipping
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsPercentage
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.currency
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.subtotal
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 19.99, formatted: '$19.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.shipping
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsPercentage
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.currency
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [ApiClient] API Response: 200 {name: 'Drone Hawk', currency: 'AUD', language: 'en', payment_env_key: '6xZrSiBNS0fsn2GHI1zjrWrPWFw', packages: Array(10), …}
logger.ts:69 [CampaignStore] 💳 Spreedly environment key updated from campaign API: 6xZrSiBNS0fsn2GHI1zjrWrPWFw
logger.ts:79 [StorageManager] Stored value for key: next-campaign-cache_AUD
logger.ts:69 [CampaignStore] 💾 Campaign data cached for AUD (10 minutes)
logger.ts:69 [CartStore] Refreshing cart item prices with new currency data...
logger.ts:79 [CartDisplayEnhancer] Cart updated {isEmpty: false, itemCount: 1, total: 30.99, totalsFormatted: '$30.99'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Cart updated {isEmpty: false, itemCount: 1, total: 30.99, totalsFormatted: '$30.99'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [CartDisplayEnhancer] Cart updated {isEmpty: false, itemCount: 1, total: 30.99, totalsFormatted: '$30.99'}
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
2logger.ts:79 [CartItemListEnhancer] Cart items HTML unchanged, skipping DOM update
logger.ts:79 [QuantityControlEnhancer] QuantityControlEnhancer initialized for package 2 with action decrease
logger.ts:79 [CartItemListEnhancer] Enhanced quantity control button <div data-package-id=​"2" data-next-quantity=​"decrease" role=​"button" class=​"quantity-controls__button quantity-controls__button--decrease has-item" aria-disabled=​"false" data-original-content=​"-" data-quantity=​"1" data-in-cart=​"true">​-​</div>​flex
logger.ts:79 [QuantityControlEnhancer] QuantityControlEnhancer initialized for package 2 with action increase
logger.ts:79 [CartItemListEnhancer] Enhanced quantity control button <div data-package-id=​"2" data-next-quantity=​"increase" role=​"button" class=​"quantity-controls__button quantity-controls__button--increase has-item" aria-disabled=​"false" data-original-content=​"+" data-quantity=​"1" data-in-cart=​"true">​+​</div>​flex
logger.ts:79 [CartItemListEnhancer] Enhanced 2 quantity buttons and 0 remove buttons
logger.ts:79 [QuantityControlEnhancer] QuantityControlEnhancer initialized for package 2 with action decrease
logger.ts:79 [CartItemListEnhancer] Enhanced quantity control button <div data-package-id=​"2" data-next-quantity=​"decrease" role=​"button" class=​"quantity-controls__button quantity-controls__button--decrease has-item" aria-disabled=​"false" data-original-content=​"-" data-quantity=​"1" data-in-cart=​"true">​-​</div>​flex
logger.ts:79 [QuantityControlEnhancer] QuantityControlEnhancer initialized for package 2 with action increase
logger.ts:79 [CartItemListEnhancer] Enhanced quantity control button <div data-package-id=​"2" data-next-quantity=​"increase" role=​"button" class=​"quantity-controls__button quantity-controls__button--increase has-item" aria-disabled=​"false" data-original-content=​"+" data-quantity=​"1" data-in-cart=​"true">​+​</div>​flex
logger.ts:79 [CartItemListEnhancer] Enhanced 2 quantity buttons and 0 remove buttons
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
logger.ts:69 [CartStore] Cart item prices refreshed with new currency
2logger.ts:79 [CartItemListEnhancer] Cart items HTML unchanged, skipping DOM update
logger.ts:69 [CheckoutFormEnhancer] Currency auto-switched to AUD for country AU
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.compareTotal
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.subtotal
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.shipping
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsPercentage
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.currency
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.subtotal
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.shipping
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsPercentage
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.currency
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
2logger.ts:79 [CartItemListEnhancer] Cart items HTML unchanged, skipping DOM update
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
2logger.ts:79 [CartItemListEnhancer] Cart items HTML unchanged, skipping DOM update
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 30.99, formatted: '$30.99', currency: 'AUD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
2logger.ts:79 [CartItemListEnhancer] Cart items HTML unchanged, skipping DOM update
DebugOverlay.ts:100 [Debug] Event added: event-timeline Active panel: cart Expanded: false
logger.ts:79 [CurrencySelector] External currency change detected, re-rendering selector
logger.ts:79 [CheckoutFormEnhancer] No valid state found, showing placeholder: Select State / Territory
logger.ts:79 [CheckoutFormEnhancer] Saved user's country selection to session: AU
logger.ts:79 [CheckoutFormEnhancer] Currency already set to AUD