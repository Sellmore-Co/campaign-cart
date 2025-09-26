
Overview
What is the Data Layer?
Google Tag Manager (GTM) relies on a global array (window.dataLayer) to push event objects to and process them from. GTM listens to this array for events and reacts to each event. For example, after an add to cart event on a website a snapshot of the data layer may look as follows...

javascript

window.dataLayer = [
	{ event: "gtm.dom", ... }, // user loads a page
	{ event: "dl_view_item",  ... }, // user views a product
	{ event: "dl_add_to_cart",  ... }, //	user adds a product
  ...
];

// Pushing a new event into the data layer
window.dataLayer.push({ event: "dl_remove_from_cart", ... });
Elevar has its own global array (window.ElevarDataLayer). Any events that you want to be handled and processed by Elevar must be pushed to this array instead (We forward events to window.dataLayer too).

Add Initialization Code
Add this code to run before any of your Data Layer pushes occur (before any window.ElevarDataLayer.push calls)
If this code is not run before your pushes, those calls will fail, so make sure the above code runs first.

 window.ElevarDataLayer = window.ElevarDataLayer ?? [];
Special Properties and Utilities
Elevar only processes data layer events that are pushed via the window.ElevarDataLayer.push utility function.


// Elevar will process
window.ElevarDataLayer.push({ event: "dl_sign_up",  ... });

// Elevar will not process
window.dataLayer.push({ event: "dl_sign_up", ... });
The Processing Enables Elevar To Do The Following:
Data Layer event enrichment (Elevar-specific identifiers and device-specific information).
Debugging to make the developers life easier.
Send data layer events server-side.
Route Changes
Any navigation changes without a reload will ideally notify Elevar via a utility.
If you want to update the context using the codebase, use the following snippet:

window.ElevarInvalidateContext?.()
If you want to update it using GTM, use the following snippet:

if (window.ElevarInvalidateContext) {  
window.ElevarInvalidateContext();  
}
👍
Learn More: Route Changes

Read this guide to learn more about the Refresh UTMs, Cookies, and Click IDs known to Elevar!

Data Layer Events
Some of these events are automatically pushed to our data layer by our script. What you’ll need to implement and push into the data layer at the correct times are the following events:

Base Event:
User Data dl_user_data: The base event that should be fired before any other event, and on all virtual page changes.
Account Management Events:
Signup dl_sign_up: When a user signup occurs. If account management is handled on Shopify’s online store and not on the headless site, then this event can be disregarded.
Login dl_login: When a user logs in. If account management is handled on Shopify’s online store and not on the headless site, then this event can be disregarded.
Ecommerce Funnel Events:
View Item List dl_view_item_list: Collection/Product Listing page view.
View Search Results dl_view_search_results: Search results page view.
Item Click dl_select_item: Item clicked from collection or search page.
Product Detail View dl_view_item: Item page view.
Product Add to Cart dl_add_to_cart: Item add to cart.
Remove From Cart dl_remove_from_cart: Item remove from cart.
View Cart dl_view_cart: View cart or mini cart.
Subscribe Event:
If your site contains any newsletter signup boxes/popups, please follow the instructions below:

Should I push my own newsletter subscription events?
Our script automatically handles newsletter signups for certain providers (currently Klaviyo, Postscript, and Attentive), but the logic for these is tailored towards how the Shopify apps for these providers work in non-headless environments. Due to headless stores being a lot more custom, we cannot guarantee that any integrations you have with the providers listed above will work automatically. Also, if your provider isn’t listed above, our logic likely won’t pick these newsletter subscribe events up either.
To see if your integration is automatically picked up by our script, perform the newsletter signup action on your site, then check to see if window.ElevarDataLayer contains an item with an event property with the value dl_subscribe. If there is an item that matches this criteria, then nothing extra needs to be done by you! If there isn’t an item that matches this criteria and you want to track these events. We recommend you do even if you don’t/won’t push any such events to you destinations, as this event works to provide information to our “Session Enrichment” feature.
If our script doesn’t support your newsletter signup integration, you must push an event to our data layer in your code. If you are managing the UI for the newsletter signup yourself, you may have easier access to call our code after the submission occurs. If not, then you may need to consult the documentation of your provider to see if you can listen for submissions. Either way, when a submission occurs, you will need access to the data that was submitted.
Once you have figured when things should go, call the following code after submissions:


window.ElevarDataLayer.push({
  event: "dl_subscribe",
  lead_type: "...", // should be "email" or "phone"
  user_properties: {
    customer_email: "...", // required if lead type is "email"
    customer_phone: "..." // required if lead type is "phone"
  }
});
📘
Note the following:

If the submission is for an email and a phone number, you should call the above code twice, once with a lead type of "email", and once with a lead type of "phone".
If the submission is for only an email or a phone number but you have access to the email and the phone number, the lead type should match what was submitted, but both the email and phone number should be provided in the event.
Event Examples

let products = [];
let impressions = [];
let userProperties = {};

/** Elevar Base Data Layer **/
// Should be fired before all other events and on virtual page change
window.ElevarDataLayer.push({
	event: "dl_user_data",
	cart_total: "100.00",
	user_properties: userProperties, // See user properties object below
	ecommerce: {
		currencyCode: "USD",
		cart_contents: {
			products: products // See the products array below
		}
	}
});


/** Customer creates new account **/
// If your users don’t typically sign up this event is not required
window.ElevarDataLayer.push({
	event: "dl_sign_up"
	user_properties: userProperties // See user properties object below
});

/** Customer Logs into their account **/ // If your users don’t typically login this event is not required
window.ElevarDataLayer.push({
	event: "dl_login",
	user_properties: userProperties // See user properties object below
});

/** Collection page product impressions **/
window.ElevarDataLayer.push({
	event: "dl_view_item_list",
	user_properties: userProperties,
	ecommerce: {
		currencyCode: "USD",
		impressions: impressions, // See impressions array below
	}
});

/** Search page product impressions  **/
window.ElevarDataLayer.push({
	event: "dl_view_search_results",
	user_properties: userProperties,
	ecommerce: {
		currencyCode: "USD",
		actionField: { 
			"list": "search results"
		},
		impressions: impressions, // See impressions array below
	}
});

/** Collection/Search page product click...
this is the product the user clicks on from collection page **/
window.ElevarDataLayer.push({
	event: "dl_select_item",
	user_properties: userProperties,
	ecommerce: {
		currencyCode: "USD",
		click: {
			actionField: {
				list: location.pathname, // this should be the collection page URL
				action: "click"
			},
			products: products // See the products array below
		}
	},
});

/** Product detail view // note the list object which carries from collection page
When user selects variant this will push an additional event with revised product data
**/
window.ElevarDataLayer.push({
	event: "dl_view_item",
	user_properties: userProperties,
	ecommerce: {
		currencyCode: "USD",
		detail: {
			actionField: {
				list: location.pathname, // this should be the collection page URL that user clicked product from
				action: "detail"
			},
			"products": products // See the products array below
		}
	}
});

/** Add to Cart // note the list object which carries from collection page **/
window.ElevarDataLayer.push({
	event: "dl_add_to_cart",
	user_properties: userProperties,
	ecommerce: {
		currencyCode: "USD",
		add: {
			actionField: {
				list: location.pathname // this should be the collection page URL that user clicked product from
			},
			products: products // See the products array below
		}
	}
});

/** Remove from Cart // note the list object which carries from collection page **/
window.ElevarDataLayer.push({
	event: "dl_remove_from_cart",
	user_properties: userProperties,
	ecommerce: {
		currencyCode: "USD",
		remove: {
			actionField: {
				list: location.pathname // this should be the collection page URL that user clicked product from
			},
			products: products // See the products array below
		}
	}
});

/** View Cart/Mini Cart **/
window.ElevarDataLayer.push({
	event: "dl_view_cart",
	user_properties: userProperties,
	cart_total: "100.00",
	ecommerce: {
		currencyCode: "USD",
		actionField: {
		},
		impressions: impressions, // See impressions array below
	}
});
Reference Examples

/** Products Array **/
const products = [
	{
		id: "LB00161-34689553170476", // SKU
    name: "Lovebox Original Color & Photo", // Product title
    brand: "Lovebox INC",
    category: "Home,Living,Art & Objects,Tabletop",
    variant: "USA wall plug",
    price: "119.99",
    quantity: "1", // Not required for dl_select_item & dl_view_item
		position: item.position, // Only required for dl_select_item; position in the list of search results, collection views and position in cart indexed starting at 1
    list: "/art/wallhangings", // The list the product was discovered from
    product_id: "6979886940352", // The product_id
    variant_id: "41141193965760", // id or variant_id
    compare_at_price: "139.99", // If available on dl_view_item & dl_add_to_cart otherwise use "0.0"
    image: "https://cdn.shopify.com/small.png", // If available, otherwise use an empty string
		url: "https://domain.com/products/womens-shoe?variant=123", // URL for the Product Page. Only required for dl_add_to_cart.
	},
  ...
]

/** Impressions Array **/
// The impressions array must be less than 4000 characters.
// The most logical way to limit this is by the number of products you send
const impressions = [
	{
		id: "LB00161-34689553170476", // SKU
    name: "Lovebox Original Color & Photo", // Product title
    brand: "Lovebox INC",
    category: "Home,Living,Art & Objects,Tabletop",
    variant: "USA wall plug",
    price: "119.99",
		quantity: "1", // Only required for dl_view_cart
    list: "/art/wallhangings", // Not required for dl_view_cart; The list the product is displayed in
    product_id: "6979886940352", // The product_id
    variant_id: "41141193965760", // id or variant_id
		compare_at_price: "139.99", // If available 
		position: item.position // position in the list of search results, collection views and position in cart indexed starting at 1
	},
  ...
]

/** User Properties Object **/
// The majority of this information can only be retrieved for a logged in user
const userProperties = {
	// The following fields aren't required if unavailable
  customer_address_1: "1 Hills Plantation Drive",
	customer_address_2: "",
	customer_city: "Charleston",
	customer_country: "United States",
	customer_email: "bill@gmail.com",
	customer_first_name: "Bill",
	customer_id: "5928549548188",
	customer_last_name: "Call",
	customer_order_count: "1",
	customer_phone: "999-999-9999",
	customer_province: "South Carolina",
	customer_province_code: "SC",
	customer_tags: "",
	customer_total_spent: "0.0",
	customer_zip: "22222",

  // The following field is required 
	visitor_type: "logged_in" // "logged_in" || "guest"
}
The list property
The list property contains the collection path (for ex. /collections/shoes/) the user came from before taking a particular action on a product page. For example, if a dl_add_to_cart event is pushed to the data layer, to populate the list property, you will need to persist the collection path (page URL) the user was on prior to clicking into the product page and taking that action.
If the user hasn’t seen a collection page at the time of the event, this property can be an empty string.
Hydrogen Builds
For those using Hydrogen, consider exploring the useAnalytics feature https://shopify.dev/docs/api/hydrogen/2024-07/hooks/useanalytics
