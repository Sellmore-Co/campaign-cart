# Cart Display Overrides

The `CartDisplayManager` allows for overriding certain aspects of how line items are displayed in the cart summary. This is useful for customizing the frequency text for subscriptions or the sale price for specific packages without altering the core product data retrieved from the campaign.

## Configuration

Overrides are configured via the global `window.osConfig` object, specifically within the `cartDisplayConfig` property. This configuration script should be placed in the `<head>` of your HTML, before the main 29next application script is loaded.

### Structure

```javascript
<script>
window.osConfig = window.osConfig || {}; // Initialize if not already present

window.osConfig.cartDisplayConfig = {
  /**
   * Overrides the display text for subscription frequencies.
   * The key should be the 'package_id' of the item (as a string).
   * The value is the string to display.
   */
  frequencyOverrides: {
    // Example:
    // "your_package_id_1": "Ships every 2 weeks",
    // "your_package_id_2": "Billed bi-weekly"
  },

  /**
   * Overrides the sale price displayed for a line item.
   * The key should be the 'package_id' of the item (as a string).
   * The value is the numeric price to display (this does not affect the actual transaction price).
   */
  priceOverrides: {
    // Example:
    // "your_package_id_1": 29.99,
    // "your_package_id_3": 0.00 // E.g., for a free add-on display
  }
};
</script>
```

### Key Points:

*   **`package_id` is Crucial:** The keys in both `frequencyOverrides` and `priceOverrides` must match the `package_id` of the cart items. The `StateManager.js` is responsible for ensuring that items in the cart state have a correct `package_id` property. Typically, this `package_id` is derived from the `item.id` or `packageData.ref_id` when the item is added to the cart.
*   **String Keys:** Ensure the `package_id` keys in your configuration object are strings (e.g., `"4"`, `"product_123"`).
*   **Display Only:** Price overrides affect the displayed sale price in the cart summary only. They do not change the actual price charged during the transaction, which is determined by the campaign settings and backend.
*   **Script Order:** The `<script>` block defining `window.osConfig.cartDisplayConfig` must appear in your HTML *before* the main 29next JavaScript file is loaded and executed. This ensures `CartDisplayManager` can read this configuration during its initialization.

## How it Works

1.  **Initialization (`CartDisplayManager.#initCartDisplay`):**
    *   `CartDisplayManager` reads `window.osConfig.cartDisplayConfig`.
    *   If found, it copies `frequencyOverrides` and `priceOverrides` into its internal `#config` object.

2.  **Line Item Creation (`CartDisplayManager.#createLineItemElement`):**
    *   When a line item element is being created for the cart display:
    *   It retrieves the `package_id` of the current cart item (expected to be set by `StateManager`).
    *   **Frequency Override:** It checks if `this.#config.frequencyOverrides` has an entry for the item's `package_id`. If yes, that text is used. Otherwise, it defaults to the standard subscription frequency text (e.g., "Schedule: Every X Days").
    *   **Price Override:** It checks if `this.#config.priceOverrides` has an entry for the item's `package_id`. If yes, that price is used for display. Otherwise, the item's actual `price` is used.

3.  **Direct DOM Update (Fallback):**
    *   A `setTimeout` in `CartDisplayManager.#updateLineItems` provides a fallback mechanism. After line items are initially rendered, it re-scans the relevant DOM elements.
    *   It finds items by title and then attempts to apply overrides based on their `package_id` and the loaded `#config`. This helps catch cases where overrides might not apply during initial template cloning.

## Example Usage

Assuming you have a package with `package_id: "promo_pack_001"` and another with `package_id: "monthly_sub_002"`:

```html
<head>
  <!-- Other meta tags and scripts -->

  <script>
    window.osConfig = window.osConfig || {};
    window.osConfig.cartDisplayConfig = {
      frequencyOverrides: {
        "monthly_sub_002": "Renews Monthly - Special Offer"
      },
      priceOverrides: {
        "promo_pack_001": 49.99, // Display promo pack at a special price
        "monthly_sub_002": 19.99 // Display subscription at an introductory price
      }
    };
  </script>

  <!-- Main 29next application script -->
  <!-- <script src="path/to/29next.js"></script> -->
</head>
```

When items with these `package_id`s are added to the cart, their frequency text and/or displayed sale price will reflect these overrides. 