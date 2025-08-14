Home
Products
Google Analytics
Developer documentation
Reference
Was this helpful?

Send feedbackRecommended events

bookmark_border

Google Analytics sends some event types automatically. This page describes optional, additional events you can configure to measure more behaviors and generate more useful reports for your business. These additional events take more effort to configure before you can use them, so Google Analytics 4 can't send them automatically. For step-by-step instructions on how to configure recommended and custom events for your website or app, see Set up events.

To view details of each event you can use, select your tag management platform:

gtag.js Tag Manager Firebase

add_payment_info
This event signifies a user has submitted their payment information in an ecommerce checkout process.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the event.

Event-level and item-level coupon parameters are independent.
payment_type	string	No	Credit Card	The chosen method of payment.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "add_payment_info",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    coupon: "SUMMER_FUN",
    payment_type: "Credit Card",
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
Note: To ensure data populates properly in reports, follow the format in this document.
If you need to set the items array outside of the ecommerce array, set the currency parameter at the event level when you send value (revenue) data.

add_shipping_info
This event signifies a user has submitted their shipping information in an ecommerce checkout process.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the event.

Event-level and item-level coupon parameters are independent.
shipping_tier	string	No	Ground	The shipping tier (e.g. Ground, Air, Next-day) selected for delivery of the purchased item.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "add_shipping_info",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    coupon: "SUMMER_FUN",
    shipping_tier: "Ground",
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
add_to_cart
This event signifies that an item was added to a cart for purchase.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "add_to_cart",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
add_to_wishlist
The event signifies that an item was added to a wishlist. Use this event to identify popular gift items in your app.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "add_to_wishlist",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
begin_checkout
This event signifies that a user has begun a checkout.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the event.

Event-level and item-level coupon parameters are independent.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "begin_checkout",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    coupon: "SUMMER_FUN",
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
close_convert_lead
This event measures when a lead has been converted and closed (for example, through a purchase).

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the value of the event, in 3-letter ISO 4217 format.

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
close_unconvert_lead
This event measures when a user is marked as not becoming a converted lead, along with the reason.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the value of the event, in 3-letter ISO 4217 format.

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
unconvert_lead_reason	string	No	Never responded	The reason the lead was unconverted.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
disqualify_lead
This event measures when a user is marked as disqualified to become a lead, along with the reason for the disqualification.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the value of the event, in 3-letter ISO 4217 format.

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
disqualified_lead_reason	string	No	Not looking to buy	The reason a lead was marked as disqualified.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
earn_virtual_currency
This event measures when a user is awarded virtual currency in a game. Log this along with spend_virtual_currency to better understand your virtual economy.

Parameters
Name	Type	Required	Example value	Description
virtual_currency_name	string	No	Gems	The name of the virtual currency.
value	number	No	5	The value of the virtual currency.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
generate_lead
This event measures when a lead has been generated (for example, through a form). Log this to understand the effectiveness of your marketing campaigns and how many customers re-engage with your business after remarketing to the customers.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the value of the event, in 3-letter ISO 4217 format.

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
lead_source	string	No	Trade show	The source of the lead.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
join_group
Log this event when a user joins a group such as a guild, team, or family. Use this event to analyze how popular certain groups or social features are.

Parameters
Name	Type	Required	Example value	Description
group_id	string	No	G_12345	The ID of the group.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
level_end
This event signifies that a player has reached the end of a level in a game.

Parameters
Name	Type	Required	Example value	Description
level_name	string	No	The journey begins...	The name of the level.
success	boolean	No	true	Set to true if the level was completed successfully.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
level_start
This event signifies that a player has started a level in a game.

Parameters
Name	Type	Required	Example value	Description
level_name	string	No	The journey begins...	The name of the level.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
level_up
This event signifies that a player has leveled up in a game. Use it to gauge the level distribution of your user base and identify levels that are difficult to complete.

Parameters
Name	Type	Required	Example value	Description
level	number	No	5	The level of the character.
character	string	No	Player 1	The character that leveled up.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
login
Send this event to signify that a user has logged in to your website or app.

Parameters
Name	Type	Required	Example value	Description
method	string	No	Google	The method used to login.
Example
Show me the tag configuration
post_score
Send this event when the user posts a score. Use this event to understand how users are performing in your game and correlate high scores with audiences or behaviors.

Parameters
Name	Type	Required	Example value	Description
score	number	Yes	10000	The score to post.
level	number	No	5	The level for the score.
character	string	No	Player 1	The character that achieved the score.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
purchase
This event signifies when one or more items is purchased by a user.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
transaction_id	string	Yes	T_12345	The unique identifier of a transaction.

The transaction_id parameter helps you avoid getting duplicate events for a purchase.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the event.

Event-level and item-level coupon parameters are independent.
shipping	number	No	3.33	Shipping cost associated with a transaction.
tax	number	No	1.11	Tax cost associated with a transaction.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "purchase",
  ecommerce: {
    transaction_id: "T_12345",
    // Sum of (price * quantity) for all items.
    value: 72.05,
    tax: 3.60,
    shipping: 5.99,
    currency: "USD",
    coupon: "SUMMER_SALE",
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    },
    {
      item_id: "SKU_12346",
      item_name: "Google Grey Women's Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 3.33,
      index: 1,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "gray",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 21.01,
      promotion_id: "P_12345",
      promotion_name: "Summer Sale",
      quantity: 2
    }]
  }
});
qualify_lead
This event measures when a user is marked as meeting the criteria to become a qualified lead.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the value of the event, in 3-letter ISO 4217 format.

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
refund
This event signifies when one or more items is refunded to a user.

Note: We recommend that you include item information in your refund event to see item-level refund metrics in Analytics.
Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
transaction_id	string	Yes	T_12345	The unique identifier of a transaction.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the event.

Event-level and item-level coupon parameters are independent.
shipping	number	No	3.33	Shipping cost associated with a transaction.
tax	number	No	1.11	Tax cost associated with a transaction.
items	Array<Item>	No*		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "refund",
  ecommerce: {
    currency: "USD",
    transaction_id: "T_12345", // Transaction ID. Required for purchases and refunds.
    value: 30.03,
    coupon: "SUMMER_FUN",
    shipping: 3.33,
    tax: 1.11,
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
remove_from_cart
This event signifies that an item was removed from a cart.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "remove_from_cart",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
search
Log this event to indicate when the user has performed a search. You can use this event to identify what users are searching for on your website or app. For example, you could send this event when a user views a search results page after performing a search.

Parameters
Name	Type	Required	Example value	Description
search_term	string	Yes	t-shirts	The term that was searched for.
Show me the tag configuration
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
select_content
This event signifies that a user has selected some content of a certain type. This event can help you identify popular content and categories of content on your website or app.

Parameters
Name	Type	Required	Example value	Description
content_type	string	No	product	The type of selected content.
content_id	string	No	C_12345	An identifier for the content that was selected.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
select_item
This event signifies an item was selected from a list.

Parameters
Name	Type	Required	Example value	Description
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

Ignored if set at the item-level.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

Ignored if set at the item-level.
items	Array<Item>	Yes*		The items for the event.

* The items array is expected to have a single element, representing the selected item. If multiple elements are provided, only the first element in items will be used.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "select_item",
  ecommerce: {
    item_list_id: "related_products",
    item_list_name: "Related products",
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
select_promotion
This event signifies a promotion was selected from a list.

Parameters
Name	Type	Required	Example value	Description
creative_name	string	No	summer_banner2	The name of the promotional creative.

Ignored if set at the item-level.
creative_slot	string	No	featured_app_1	The name of the promotional creative slot associated with the event.

Ignored if set at the item-level.
promotion_id	string	No	P_12345	The ID of the promotion associated with the event.

Ignored if set at the item-level.
promotion_name	string	No	Summer Sale	The name of the promotion associated with the event.

Ignored if set at the item-level.
items	Array<Item>	No		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
creative_name	string	No	summer_banner2	The name of the promotional creative.

If set, event-level creative_name is ignored.
If not set, event-level creative_name is used, if present.
creative_slot	string	No	featured_app_1	The name of the promotional creative slot associated with the item.

If set, event-level creative_slot is ignored.
If not set, event-level creative_slot is used, if present.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
promotion_id	string	No	P_12345	The ID of the promotion associated with the item.

If set, event-level promotion_id is ignored.
If not set, event-level promotion_id is used, if present.
promotion_name	string	No	Summer Sale	The name of the promotion associated with the item.

If set, event-level promotion_name is ignored.
If not set, event-level promotion_name is used, if present.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "select_promotion",
  ecommerce: {
    creative_name: "Summer Banner",
    creative_slot: "featured_app_1",
    promotion_id: "P_12345",
    promotion_name: "Summer Sale",
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
share
Use this event when a user has shared content.

Parameters
Name	Type	Required	Example value	Description
method	string	No	Twitter	The method in which the content is shared.
content_type	string	No	image	The type of shared content.
item_id	string	No	C_12345	The ID of the shared content.
The following example is for Tag Manager implementations:

Show me the tag configuration
Example
Show me the tag configuration
sign_up
This event indicates that a user has signed up for an account. Use this event to understand the different behaviors of logged in and logged out users.

Parameters
Name	Type	Required	Example value	Description
method	string	No	Google	The method used for sign up.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
spend_virtual_currency
This event measures the sale of virtual goods in your app and helps you identify which virtual goods are the most popular.

Parameters
Name	Type	Required	Example value	Description
value	number	Yes	5	The value of the virtual currency.
virtual_currency_name	string	Yes	Gems	The name of the virtual currency.
item_name	string	No	Starter Boost	The name of the item the virtual currency is being used for.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
tutorial_begin
This event signifies the start of the on-boarding process. Use this in a funnel with tutorial_complete to understand how many users complete the tutorial.

Parameters
There are no parameters for this event.

Example
The following example is for Tag Manager implementations:

Show me the tag configuration
tutorial_complete
This event signifies the user's completion of your on-boarding process. Use this in a funnel with tutorial_begin to understand how many users complete the tutorial.

Parameters
No parameters are suggested for this event.

Example
The following example is for Tag Manager implementations:

Show me the tag configuration
unlock_achievement
Log this event when the user has unlocked an achievement. This event can help you understand how users are experiencing your game.

Parameters
Name	Type	Required	Example value	Description
achievement_id	string	Yes	A_12345	The id of the achievement that was unlocked.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration
view_cart
This event signifies that a user viewed their cart.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "view_cart",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
view_item
This event signifies that some content was shown to the user. Use this event to discover the most popular items viewed.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* Set value to the sum of (price * quantity) for all items in items. Don't include shipping or tax.
* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "view_item",
  ecommerce: {
    currency: "USD",
    value: 30.03,
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
view_item_list
Log this event when the user has been presented with a list of items of a certain category.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the items associated with the event, in 3-letter ISO 4217 format.

Value metrics on the view_item event to not contribute to revenue

* If you set value then currency is required for revenue metrics to be computed accurately.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

Ignored if set at the item-level.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

Ignored if set at the item-level.
items	Array<Item>	Yes		The items for the event.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "view_item_list",
  ecommerce: {
    item_list_id: "related_products",
    item_list_name: "Related products",
    items: [
     {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.03,
      quantity: 3
    },
    {
      item_id: "SKU_12346",
      item_name: "Google Grey Women's Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 3.33,
      index: 1,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "gray",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 21.01,
      promotion_id: "P_12345",
      promotion_name: "Summer Sale",
      quantity: 2
    }]
  }
});
view_promotion
This event signifies a promotion was viewed from a list.

Parameters
Name	Type	Required	Example value	Description
creative_name	string	No	summer_banner2	The name of the promotional creative.

Ignored if set at the item-level.
creative_slot	string	No	featured_app_1	The name of the promotional creative slot associated with the event.

Ignored if set at the item-level.
promotion_id	string	No	P_12345	The ID of the promotion associated with the event.

Ignored if set at the item-level.
promotion_name	string	No	Summer Sale	The name of the promotion associated with the event.

Ignored if set at the item-level.
items	Array<Item>	Yes*		The items for the event.

* The items array is expected to have a single element, representing the item associated with the promotion. If multiple elements are provided, only the first element in items will be used.
Item parameters
Name	Type	Required	Example value	Description
item_id	string	Yes*	SKU_12345	
The ID of the item.

*One of item_id or item_name is required.

item_name	string	Yes*	Stan and Friends Tee	
The name of the item.

*One of item_id or item_name is required.

affiliation	string	No	Google Store	A product affiliation to designate a supplying company or brick and mortar store location.
Note: `affiliation` is only available at the item-scope.
coupon	string	No	SUMMER_FUN	The coupon name/code associated with the item.

Event-level and item-level coupon parameters are independent.
creative_name	string	No	summer_banner2	The name of the promotional creative.

If set, event-level creative_name is ignored.
If not set, event-level creative_name is used, if present.
creative_slot	string	No	featured_app_1	The name of the promotional creative slot associated with the item.

If set, event-level creative_slot is ignored.
If not set, event-level creative_slot is used, if present.
discount	number	No	2.22	The unit monetary discount value associated with the item.
index	number	No	5	The index/position of the item in a list.
item_brand	string	No	Google	The brand of the item.
item_category	string	No	Apparel	The category of the item. If used as part of a category hierarchy or taxonomy then this will be the first category.
item_category2	string	No	Adult	The second category hierarchy or additional taxonomy for the item.
item_category3	string	No	Shirts	The third category hierarchy or additional taxonomy for the item.
item_category4	string	No	Crew	The fourth category hierarchy or additional taxonomy for the item.
item_category5	string	No	Short sleeve	The fifth category hierarchy or additional taxonomy for the item.
item_list_id	string	No	related_products	The ID of the list in which the item was presented to the user.

If set, event-level item_list_id is ignored.
If not set, event-level item_list_id is used, if present.
item_list_name	string	No	Related products	The name of the list in which the item was presented to the user.

If set, event-level item_list_name is ignored.
If not set, event-level item_list_name is used, if present.
item_variant	string	No	green	The item variant or unique code or description for additional item details/options.
location_id	string	No	ChIJIQBpAG2ahYAR_6128GcTUEo (the Google Place ID for San Francisco)	The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used.
Note: `location id` is only available at the item-scope.
price	number	No	10.01	The monetary unit price of the item, in units of the specified currency parameter.
If a discount applies to the item, set price to the discounted unit price and specify the unit price discount in the discount parameter.
promotion_id	string	No	P_12345	The ID of the promotion associated with the item.

If set, event-level promotion_id is ignored.
If not set, event-level promotion_id is used, if present.
promotion_name	string	No	Summer Sale	The name of the promotion associated with the item.

If set, event-level promotion_name is ignored.
If not set, event-level promotion_name is used, if present.
quantity	number	No	3	
Item quantity.

If not set, quantity is set to 1.

In addition to the prescribed parameters, you can include up to 27 custom parameters in the items array.
Example
The following example is for Tag Manager implementations:

Show me the tag configuration

dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
dataLayer.push({
  event: "view_promotion",
  ecommerce: {
    creative_name: "Summer Banner",
    creative_slot: "featured_app_1",
    promotion_id: "P_12345",
    promotion_name: "Summer Sale",
    items: [
    {
      item_id: "SKU_12345",
      item_name: "Stan and Friends Tee",
      affiliation: "Google Merchandise Store",
      coupon: "SUMMER_FUN",
      discount: 2.22,
      index: 0,
      item_brand: "Google",
      item_category: "Apparel",
      item_category2: "Adult",
      item_category3: "Shirts",
      item_category4: "Crew",
      item_category5: "Short sleeve",
      item_list_id: "related_products",
      item_list_name: "Related Products",
      item_variant: "green",
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      price: 10.01,
      quantity: 3
    }
    ]
  }
});
working_lead
This event measures when a user contacts or is contacted by a representative.

Parameters
Name	Type	Required	Example value	Description
currency	string	Yes*	USD	Currency of the value of the event, in 3-letter ISO 4217 format.

* If you set value then currency is required for revenue metrics to be computed accurately.
value	number	Yes*	30.03	The monetary value of the event.

* value is typically required for meaningful reporting. If you mark the event as a key event then it's recommended you set value.
* currency is required if you set value.
lead_status	string	No	Started conversations	The status of the lead.
Example
The following example is for Tag Manager implementations: