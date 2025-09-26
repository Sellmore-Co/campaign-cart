# Next Campaign Cart SDK vs Elevar DataLayer Comparison Report

## Executive Summary

The Next Campaign Cart SDK datalayer and Elevar datalayer have fundamental structural differences. While both track similar e-commerce events, they use different object structures, field naming conventions, and data organization patterns.

## 1. Event Names Comparison

### ✅ Events with Matching Names
| Event Type | Next SDK | Elevar | Status |
|------------|----------|--------|--------|
| User Data | `dl_user_data` | `dl_user_data` | ✅ Match |
| View Item List | `dl_view_item_list` | `dl_view_item_list` | ✅ Match |
| View Item | `dl_view_item` | `dl_view_item` | ✅ Match |
| Add to Cart | `dl_add_to_cart` | `dl_add_to_cart` | ✅ Match |
| Remove from Cart | `dl_remove_from_cart` | `dl_remove_from_cart` | ✅ Match |
| Select Item | `dl_select_item` | `dl_select_item` | ✅ Match |
| View Cart | `dl_view_cart` | `dl_view_cart` | ✅ Match |
| Sign Up | `sign_up` | `dl_sign_up` | ❌ Missing prefix |
| Login | `login` | `dl_login` | ❌ Missing prefix |
| Subscribe | `subscribe` | `dl_subscribe` | ❌ Missing prefix |

### ❌ Missing Elevar Events in Next SDK
- `dl_view_search_results` - Search results page view

### ➕ Additional Events in Next SDK (Not in Elevar)
- `dl_begin_checkout` - Checkout initiation
- `dl_add_shipping_info` - Shipping information
- `dl_add_payment_info` - Payment information
- `dl_purchase` - Purchase completion
- `dl_package_swapped` - Package swap tracking
- `dl_viewed_upsell` - Upsell views
- `dl_accepted_upsell` - Upsell acceptance
- `dl_skipped_upsell` - Upsell skips

## 2. Ecommerce Object Structure Comparison

### Critical Structural Difference

#### Elevar Structure (Nested by Action)
```javascript
{
  event: "dl_add_to_cart",
  ecommerce: {
    currencyCode: "USD",
    add: {                    // Action-specific nesting
      actionField: { list: "/collections/..." },
      products: [...]
    }
  }
}
```

#### Next SDK Structure (Flat)
```javascript
{
  event: "dl_add_to_cart",
  ecommerce: {
    currency: "USD",          // Different field name
    value: 99.99,
    items: [...]              // Different array name
  }
}
```

### Ecommerce Field Mapping Issues

| Elevar Field | Next SDK Field | Issue |
|--------------|----------------|-------|
| `currencyCode` | `currency` | Field name mismatch |
| `products` | `items` | Array name mismatch |
| `impressions` | `items` | Array name mismatch |
| Action nesting (`add`, `remove`, `detail`, etc.) | None | ❌ Missing structure |
| `actionField` | None | ❌ Missing |
| `cart_contents.products` | `items` | Different structure |

## 3. Product/Item Field Comparison

### Field Name Mismatches

| Elevar Product Field | Next SDK Item Field | Status |
|---------------------|---------------------|--------|
| `id` (SKU) | `item_id` | ❌ Different name |
| `name` | `item_name` | ❌ Different name |
| `brand` | `item_brand` | ❌ Different name |
| `category` | `item_category` | ❌ Different name |
| `variant` | `item_variant` | ❌ Different name |
| `price` | `price` | ✅ Match |
| `quantity` | `quantity` | ✅ Match |
| `position` | `index` | ❌ Different name |
| `list` | `item_list_name` | ❌ Different name |
| `product_id` | Not included | ❌ Missing |
| `variant_id` | Not included | ❌ Missing |
| `compare_at_price` | Not included | ❌ Missing |
| `image` | `item_image` | ❌ Different name |
| `url` | Not included | ❌ Missing |

### Data Type Differences

- **Elevar**: Uses strings for numeric values (`"119.99"`, `"1"`)
- **Next SDK**: Uses numbers for numeric values (`119.99`, `1`)

## 4. User Properties Comparison

### Field Name Mismatches

| Elevar User Property | Next SDK User Property | Status |
|---------------------|------------------------|--------|
| `customer_address_1` | Not available | ❌ Missing |
| `customer_address_2` | Not available | ❌ Missing |
| `customer_city` | `customer_address_city` | ❌ Different structure |
| `customer_country` | `customer_address_country` | ❌ Different structure |
| `customer_email` | `customer_email` | ✅ Match |
| `customer_first_name` | `customer_first_name` | ✅ Match |
| `customer_id` | `customer_id` | ✅ Match |
| `customer_last_name` | `customer_last_name` | ✅ Match |
| `customer_order_count` | `customer_order_count` | ✅ Match |
| `customer_phone` | `customer_phone` | ✅ Match |
| `customer_province` | `customer_address_province` | ❌ Different structure |
| `customer_province_code` | `customer_address_province_code` | ❌ Different structure |
| `customer_tags` | `customer_tags` | ✅ Match |
| `customer_total_spent` | `customer_total_spent` | ✅ Match |
| `customer_zip` | `customer_address_zip` | ❌ Different structure |
| `visitor_type` ("logged_in"/"guest") | `visitor_type` ("guest"/"customer"/"returning_customer") | ❌ Different values |

## 5. Critical Missing Components

### In Next SDK:
1. **Action-specific nesting** - No `add`, `remove`, `detail`, `click` objects
2. **actionField objects** - Missing `list` and `action` properties
3. **Search results event** - No `dl_view_search_results`
4. **List tracking** - Different implementation of list attribution
5. **Cart contents structure** - No `cart_contents.products` in user data event
6. **Product URL** - Not included in product objects
7. **Compare at price** - Not tracked
8. **Product/Variant IDs** - Not included separately from item_id

### In Elevar:
1. **Checkout flow events** - No checkout, shipping, payment events
2. **Purchase event** - Not specified in Elevar docs
3. **Upsell events** - No upsell tracking
4. **Attribution data** - Not included in events

## 6. Implementation Differences

### DataLayer Array
- **Elevar**: Uses `window.ElevarDataLayer`
- **Next SDK**: Uses `window.NextDataLayer`

### Event Pushing
- **Elevar**: `window.ElevarDataLayer.push()`
- **Next SDK**: `dataLayer.push()` or `window.NextDataLayer.push()`

### Route Changes
- **Elevar**: `window.ElevarInvalidateContext()`
- **Next SDK**: `nextAnalytics.invalidateContext()`

## 7. Required Changes for Elevar Compatibility

### High Priority Changes

1. **Restructure ecommerce object** to use action-specific nesting:
   - Add `add`, `remove`, `detail`, `click`, `impressions` sub-objects
   - Include `actionField` with `list` and `action` properties

2. **Rename product fields**:
   - `item_id` → `id`
   - `item_name` → `name`
   - `item_brand` → `brand`
   - `item_category` → `category`
   - `item_variant` → `variant`
   - `index` → `position`

3. **Add missing product fields**:
   - `product_id`
   - `variant_id`
   - `compare_at_price`
   - `url`

4. **Fix user properties**:
   - Remove `address_` prefix from location fields
   - Add `customer_address_1` and `customer_address_2`
   - Change `visitor_type` values to "logged_in"/"guest"

5. **Convert data types**:
   - Change numeric values to strings for Elevar compatibility

6. **Add missing events**:
   - Implement `dl_view_search_results`
   - Add "dl_" prefix to `sign_up`, `login`, `subscribe` events

### Medium Priority Changes

1. **Implement cart_contents structure** in dl_user_data event
2. **Add list tracking** to match Elevar's collection path persistence
3. **Remove or make optional** Next SDK specific features:
   - Attribution object
   - Metadata object
   - Upsell events (unless needed)

### Low Priority Changes

1. **Global array naming** - Consider supporting both arrays
2. **Transform function** to convert between formats
3. **Debug mode alignment** with Elevar's debugging approach

## 8. Recommended Approach

### Option 1: Elevar Adapter
Create an Elevar-specific adapter that transforms Next SDK events to Elevar format:
- Maintains backward compatibility
- Allows gradual migration
- Can be toggled on/off

### Option 2: Direct Implementation
Modify the core event builders to output Elevar format:
- Complete compatibility
- Single source of truth
- Breaking change for existing implementations

### Option 3: Dual Format Support
Support both formats simultaneously:
- Push to both `NextDataLayer` and `ElevarDataLayer`
- Transform events in real-time
- Higher complexity but maximum flexibility

## 9. Files Requiring Modification

For Elevar compatibility, these files need updates:

1. **Core Event Builders**:
   - `src/utils/analytics/events/EventBuilder.ts`
   - `src/utils/analytics/events/EcommerceEvents.ts`
   - `src/utils/analytics/events/UserEvents.ts`

2. **Type Definitions**:
   - `src/utils/analytics/types.ts`

3. **DataLayer Manager**:
   - `src/utils/analytics/DataLayerManager.ts`

4. **Provider Adapters**:
   - Create new `src/utils/analytics/providers/ElevarAdapter.ts`

## 10. Impact Assessment

### Breaking Changes
- Product field renaming will break existing integrations
- Ecommerce object restructuring will affect all tracking
- User property changes will impact customer data

### Data Implications
- Historical data continuity will be broken
- Analytics reports will need reconfiguration
- Tag Manager triggers will need updates

### Testing Requirements
- Full regression testing of all events
- Validation of data in downstream systems
- Performance testing with nested structures

## Conclusion

The Next Campaign Cart SDK and Elevar datalayers are **NOT currently compatible**. Achieving compatibility requires significant structural changes, particularly in:

1. Ecommerce object nesting structure
2. Product/item field naming
3. User property field naming
4. Event naming consistency
5. Data type formatting

The recommended approach is to create an Elevar adapter that can transform Next SDK events into Elevar format, allowing for backward compatibility while providing Elevar integration capabilities.