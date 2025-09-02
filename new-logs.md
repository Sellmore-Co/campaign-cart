[CountrySelector] Country select changed to: BR
logger.ts:69 [CountrySelector] Changing country to BR
logger.ts:69 [CountrySelector] Saved selected country to session: BR
logger.ts:69 [CountryService] Using detected country: BR
logger.ts:69 [CountrySelector] Country currency is USD, updating...
logger.ts:79 [StorageManager] Retrieved value for key: next-campaign-cache_USD
logger.ts:69 [CampaignStore] 🎯 Using cached campaign data for USD (expires in 219 seconds)
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for compareTotal
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for subtotal
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 27.891, formatted: '$27.89', currency: 'USD'}
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for shipping
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for totalSavingsPercentage
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for currency
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for subtotal
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 27.891, formatted: '$27.89', currency: 'USD'}
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for shipping
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for totalSavingsAmount
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for totalSavingsPercentage
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for currency
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for total
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for totalSavingsAmount
logger.ts:79 [CurrencySelector] Campaign currency changed or data loaded, re-rendering currency selector
logger.ts:69 [CartStore] Refreshing cart item prices with new currency data...
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 27.891, formatted: '$27.89', currency: 'USD'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 27.891, formatted: '$27.89', currency: 'USD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:69 [RudderStack] Processing event "dl_user_data" {eventName: 'dl_user_data', eventData: {…}}
logger.ts:79 [UserDataTracker] Tracked user data: {hasUserId: false, hasEmail: false, cartValue: 27.891, cartItems: 1}
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
logger.ts:69 [CartStore] Cart item prices refreshed with new currency
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.compareTotal
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.subtotal
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.shipping
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsPercentage
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.currency
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.subtotal
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.shipping
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsPercentage
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.currency
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.total
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:79 [CartDisplayEnhancer] Currency changed, updating display for cart.totalSavingsAmount
errorHandler.ts:33 [ErrorHandler] Captured error: TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9) {message: 'Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function', filename: 'http://localhost:3000/src/enhancers/display/DisplayEnhancerCore.ts?t=1756853090546', lineno: 185, colno: 24, sdk: {…}}
console.error @ errorHandler.ts:33
error @ logger.ts:49
handleError @ errorHandler.ts:79
(anonymous) @ errorHandler.ts:14
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
DisplayEnhancerCore.ts:252 Uncaught TypeError: DisplayFormatter.clearCurrencyCache is not a function
    at HTMLDocument.<anonymous> (DisplayEnhancerCore.ts:252:24)
    at EventTarget.dispatchEvent (EventTimelinePanel.ts:294:31)
    at CountrySelector.handleCountryChange (CountrySelector.ts:404:18)
    at async ShadowRoot.<anonymous> (CountrySelector.ts:309:9)
(anonymous) @ DisplayEnhancerCore.ts:252
EventTarget.dispatchEvent @ EventTimelinePanel.ts:294
handleCountryChange @ CountrySelector.ts:404
await in handleCountryChange
handleMouseUp_ @ unknown
await in handleMouseUp_
handleMouseUp_ @ unknown
await in handleMouseUp_
(anonymous) @ CountrySelector.ts:309
handleMouseUp_ @ unknownUnderstand this error
logger.ts:69 [CountrySelector] Country changed successfully to BR
logger.ts:69 [CheckoutFormEnhancer] Handling country change to: BR
logger.ts:79 [CountrySelector] External country change detected, re-rendering selector
logger.ts:79 [CheckoutFormEnhancer] No valid state found, showing placeholder: Select State / Province
logger.ts:69 [CheckoutFormEnhancer] Country field updated to: BR
logger.ts:79 [CheckoutFormEnhancer] No valid state found, showing placeholder: Select State / Province
logger.ts:79 [CheckoutFormEnhancer] Saved user's country selection to session: BR
logger.ts:79 [CheckoutFormEnhancer] Currency already set to USD
logger.ts:79 [CouponEnhancer] Rendered applied coupons: 1
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 27.891, formatted: '$27.89', currency: 'USD'}
logger.ts:79 [CouponEnhancer] Rendered applied coupons: 1
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 27.891, formatted: '$27.89', currency: 'USD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
logger.ts:79 [CartDisplayEnhancer] Cart updated {isEmpty: false, itemCount: 1, total: 17.991, totalsFormatted: '$17.99'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 17.991, formatted: '$17.99', currency: 'USD'}
logger.ts:79 [CartDisplayEnhancer] Cart updated {isEmpty: false, itemCount: 1, total: 17.991, totalsFormatted: '$17.99'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 17.991, formatted: '$17.99', currency: 'USD'}
logger.ts:79 [CartDisplayEnhancer] Cart updated {isEmpty: false, itemCount: 1, total: 17.991, totalsFormatted: '$17.99'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
4logger.ts:79 [CartItemListEnhancer] Cart items HTML unchanged, skipping DOM update
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
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 17.991, formatted: '$17.99', currency: 'USD'}
logger.ts:79 [CartDisplayEnhancer] Handling subtotal with discounts {subtotal: {…}, discounts: {…}}
logger.ts:79 [CartDisplayEnhancer] Returning discounted subtotal {discountedSubtotal: 17.991, formatted: '$17.99', currency: 'USD'}
logger.ts:79 [UserDataTracker] Cart store changed, tracking user data
logger.ts:79 [UserDataTracker] User data tracking debounced
logger.ts:79 [StorageManager] Stored value for key: next-cart-state
2logger.ts:79 [CartItemListEnhancer] Cart items HTML unchanged, skipping DOM update
logger.ts:79 [CurrencySelector] External currency change detected, re-rendering selector
DebugOverlay.ts:100 [Debug] Event added: event-timeline Active panel: cart Expanded: false
logger.ts:69 [CheckoutFormEnhancer] Browser autofill detected for fields: ['country']
logger.ts:79 [CheckoutFormEnhancer] Stopped autofill detection after 30 seconds