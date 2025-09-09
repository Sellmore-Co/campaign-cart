Using page-provided nextConfig in debug mode
grounded-footwear.js:854 [Debug] SDK not ready, waiting...
logger.ts:69 [SDKInitializer] Initializing 29Next Campaign Cart SDK v2...
logger.ts:69 [ProfileStore] Profile "exit_10" registered with 72 mappings
logger.ts:69 [SDKInitializer] Initializing attribution...
VM3009:29 Next Commerce Campaign-Cart SDK v0.2.20 — DEV build loaded
VM3009:30 Load time: 399.10ms
VM3009:31 Try nextDebug.cartStore() or nextDebug.orderStore()
grounded-footwear.js:854 [Debug] SDK not ready, waiting...
logger.ts:69 [CampaignStore] 🎯 Using cached campaign data (expires in 154 seconds)
logger.ts:69 [SDKInitializer] Initializing analytics v2 (lazy)...
AttributeScanner.ts:40 🐛 AttributeScanner: Debug mode enabled for performance tracking
grounded-footwear.js:854 [Debug] SDK not ready, waiting...
main.js:1 Unable to track. Missing "offer_id" or "transaction_id" parameter.
grounded-footwear.js:1777 [Debug] Checking for preselected values...
grounded-footwear.js:1787 [Debug] Slot 1 - Color dropdown: 
grounded-footwear.js:1788 [Debug] Slot 1 - Size dropdown: 
grounded-footwear.js:1799 [Debug] Slot 1 color value: obsidian-grey
grounded-footwear.js:1807 [Debug] Set color for slot 1: obsidian-grey
grounded-footwear.js:1817 [Debug] Slot 1 size value: single
grounded-footwear.js:1825 [Debug] Set size for slot 1: single
grounded-footwear.js:1830 [Debug] Slot 1 has preselection, checking completion
grounded-footwear.js:1787 [Debug] Slot 2 - Color dropdown: 
grounded-footwear.js:1788 [Debug] Slot 2 - Size dropdown: 
grounded-footwear.js:1799 [Debug] Slot 2 color value: obsidian-grey
grounded-footwear.js:1807 [Debug] Set color for slot 2: obsidian-grey
grounded-footwear.js:1817 [Debug] Slot 2 size value: single
grounded-footwear.js:1825 [Debug] Set size for slot 2: single
grounded-footwear.js:1830 [Debug] Slot 2 has preselection, checking completion
grounded-footwear.js:854 [Debug] SDK not ready, waiting...
grounded-footwear.js:1870 [Debug] updateCampaignCart called: 
{slotNumber: 1, variant: 25}
errorHandler.ts:33 [Debug] window.next is undefined
grounded-footwear.js:1870 [Debug] updateCampaignCart called: 
{slotNumber: 2, variant: 25}
errorHandler.ts:33 [Debug] window.next is undefined
logger.ts:69 [NextCampaignAdapter] NextCampaign adapter initializing...
logger.ts:69 [NextCampaignAdapter] API key from config store: found
logger.ts:69 [NextCampaignAdapter] NextCampaign API key found: UEJRnPJx...Dtkl
3
logger.ts:59 [ProductDisplayEnhancer] No package context found - package ID required
grounded-footwear.js:854 [Debug] SDK not ready, waiting...
logger.ts:69 [ExpressCheckoutContainerEnhancer] Payment capabilities detected: 
{applePay: true, googlePay: true, paypal: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb…KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', platform: 'Win32'}
grounded-footwear.js:854 [Debug] SDK not ready, waiting...
CheckoutFormEnhancer.ts:555 [PROD] Setting initial billing state 
{toggleFound: true, sectionFound: true, toggleChecked: true, currentHeight: '', currentOverflow: '', …}
logger.ts:69 [CheckoutFormEnhancer] [Billing] Setting initial state 
{toggleFound: true, sectionFound: true, toggleChecked: true, currentHeight: '', currentOverflow: '', …}
logger.ts:69 [CheckoutFormEnhancer] [Billing] Initial state: COLLAPSED (checkbox checked)
logger.ts:69 [ProspectCartEnhancer] Initializing ProspectCartEnhancer 
{element: 'FORM', config: {…}}
grounded-footwear.js:854 [Debug] SDK not ready, waiting...
logger.ts:69 [NextCampaignAdapter] Initial page_view event sent to NextCampaign
logger.ts:69 [NextCampaignAdapter] NextCampaign SDK loaded and initialized successfully ✅
logger.ts:69 [NextAnalytics] NextCampaign adapter initialized
logger.ts:69 [NextAnalytics] Facebook Pixel adapter initialized 
{blockedEvents: Array(2), storeName: undefined}
logger.ts:69 [ViewItemListTracker] ViewItemListTracker initialized
logger.ts:69 [UserDataTracker] UserDataTracker initialized
logger.ts:69 [AutoEventListener] AutoEventListener initialized
logger.ts:69 [NextAnalytics] Auto-tracking initialized
logger.ts:69 [NextAnalytics] NextAnalytics initialized successfully 
{providers: Array(2), mode: 'auto'}
AttributeScanner.ts:509 🚀 Enhancement Performance Report
AttributeScanner.ts:522 
(index)
Enhancer
Total Time (ms)
Average Time (ms)
Count
Impact
0	'checkout'	'36.90'	'36.90'	1	'🟡 Medium'
1	'display'	'4.60'	'0.38'	12	'🟢 Low'
2	'conditional'	'2.50'	'0.83'	3	'🟢 Low'
3	'express-checkout-container'	'1.40'	'1.40'	1	'🟢 Low'
4	'cart-items'	'0.50'	'0.50'	1	'🟢 Low'
5	'tooltip'	'0.20'	'0.10'	2	'🟢 Low'
Array(6)
﻿