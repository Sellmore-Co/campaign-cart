# Handling Upsells Programmatically

This guide explains how to programmatically add and manage post-purchase upsells using the Campaign Cart SDK v0.2.0.

## Overview

The Campaign Cart SDK provides methods to add upsells to completed orders through the global `window.next` object. This allows you to implement custom upsell flows, integrate with third-party systems, or create dynamic upsell experiences.

## Prerequisites

Before adding upsells programmatically:

1. An order must exist (post-purchase only)
2. The order must support post-purchase upsells (`supports_post_purchase_upsells: true`)
3. The SDK must be fully initialized
4. Valid package IDs from your campaign

## Available Methods

### `addUpsell(options)`
Adds one or more upsell items to the current order.

**Parameters:**
- `options.packageId` (number, optional): Single package ID to add
- `options.quantity` (number, optional): Quantity for single item (default: 1)
- `options.items` (array, optional): Array of items to add
  - `items[].packageId` (number, required): Package ID
  - `items[].quantity` (number, optional): Quantity (default: 1)

**Returns:** Promise resolving to:
- `order`: Updated order object
- `addedLines`: Array of newly added order lines
- `totalValue`: Total value of added upsells

### `canAddUpsells()`
Checks if upsells can be added to the current order.

**Returns:** boolean

### `getCompletedUpsells()`
Gets list of already completed upsell package IDs.

**Returns:** string[]

### `isUpsellAlreadyAdded(packageId)`
Checks if a specific upsell has already been added.

**Parameters:**
- `packageId` (number): Package ID to check

**Returns:** boolean

## Usage Examples

### Basic Single Upsell

```javascript
// Add a single upsell item
async function addSingleUpsell() {
  try {
    const result = await window.next.addUpsell({
      packageId: 123,
      quantity: 1  // Optional, defaults to 1
    });
    
    console.log('Upsell added successfully:', {
      orderId: result.order.ref_id,
      totalValue: result.totalValue,
      addedLines: result.addedLines
    });
    
    // Redirect to next upsell or thank you page
    window.location.href = '/thank-you';
    
  } catch (error) {
    console.error('Failed to add upsell:', error.message);
    // Handle error - maybe show error message to user
  }
}
```

### Multiple Upsells in One Call

```javascript
// Add multiple upsell items at once
async function addBundleUpsell() {
  try {
    const result = await window.next.addUpsell({
      items: [
        { packageId: 123, quantity: 1 },
        { packageId: 456, quantity: 2 },
        { packageId: 789 }  // quantity defaults to 1
      ]
    });
    
    console.log(`Added ${result.addedLines.length} upsells`);
    console.log(`Total value: ${result.totalValue}`);
    
    // Show success message
    showSuccessNotification('Bundle added to your order!');
    
  } catch (error) {
    console.error('Failed to add bundle:', error.message);
    showErrorNotification('Unable to add items. Please try again.');
  }
}
```

### Check Before Adding

```javascript
// Safely add upsell with validation
async function safeAddUpsell(packageId, quantity = 1) {
  // First check if upsells are allowed
  if (!window.next.canAddUpsells()) {
    console.log('Cannot add upsells at this time');
    return false;
  }
  
  // Check if already added
  if (window.next.isUpsellAlreadyAdded(packageId)) {
    const confirmAdd = await showConfirmDialog(
      'You already have this item. Add it again?'
    );
    
    if (!confirmAdd) {
      return false;
    }
  }
  
  try {
    const result = await window.next.addUpsell({
      packageId,
      quantity
    });
    
    return result;
  } catch (error) {
    console.error('Error adding upsell:', error);
    return false;
  }
}
```

### Dynamic Upsell Selection

```javascript
// Create dynamic upsell based on order value
async function addDynamicUpsell() {
  const orderData = window.next.getCartData();
  const orderTotal = parseFloat(orderData.cartTotals.total);
  
  let upsellPackageId;
  
  // Select upsell based on order value
  if (orderTotal > 100) {
    upsellPackageId = 789; // Premium upsell
  } else if (orderTotal > 50) {
    upsellPackageId = 456; // Mid-tier upsell
  } else {
    upsellPackageId = 123; // Basic upsell
  }
  
  try {
    const result = await window.next.addUpsell({
      packageId: upsellPackageId
    });
    
    console.log('Dynamic upsell added:', result);
  } catch (error) {
    console.error('Failed to add dynamic upsell:', error);
  }
}
```

### Upsell with Event Tracking

```javascript
// Add upsell with comprehensive tracking
async function addUpsellWithTracking(packageId, source = 'custom') {
  // Track upsell view
  await window.next.trackCustomEvent('upsell_viewed', {
    packageId,
    source
  });
  
  try {
    // Add the upsell
    const result = await window.next.addUpsell({ packageId });
    
    // Track successful addition
    await window.next.trackCustomEvent('upsell_accepted', {
      packageId,
      value: result.totalValue,
      source
    });
    
    return result;
    
  } catch (error) {
    // Track failure
    await window.next.trackCustomEvent('upsell_failed', {
      packageId,
      error: error.message,
      source
    });
    
    throw error;
  }
}
```

### Complete Upsell Flow Example

```javascript
// Full upsell implementation with UI
class UpsellManager {
  constructor() {
    this.completedUpsells = window.next.getCompletedUpsells();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Listen for upsell events
    window.next.on('upsell:added', (data) => {
      this.onUpsellAdded(data);
    });
  }
  
  async presentUpsell(packageId, config = {}) {
    const {
      title = 'Special Offer!',
      description = 'Add this to your order',
      imageUrl = null,
      discount = 0
    } = config;
    
    // Check if can add upsells
    if (!window.next.canAddUpsells()) {
      console.log('Upsells not available');
      return;
    }
    
    // Check if already added
    if (window.next.isUpsellAlreadyAdded(packageId)) {
      const shouldContinue = await this.showDuplicateWarning();
      if (!shouldContinue) return;
    }
    
    // Show upsell UI
    this.showUpsellModal({
      title,
      description,
      imageUrl,
      discount,
      onAccept: () => this.acceptUpsell(packageId),
      onDecline: () => this.declineUpsell(packageId)
    });
  }
  
  async acceptUpsell(packageId) {
    this.showLoading(true);
    
    try {
      const result = await window.next.addUpsell({ packageId });
      
      // Update UI
      this.showSuccess('Added to your order!');
      
      // Update completed list
      this.completedUpsells = window.next.getCompletedUpsells();
      
      // Navigate after delay
      setTimeout(() => {
        window.location.href = '/next-upsell';
      }, 2000);
      
    } catch (error) {
      this.showError('Unable to add item. Please try again.');
      console.error('Upsell error:', error);
    } finally {
      this.showLoading(false);
    }
  }
  
  async declineUpsell(packageId) {
    // Track declined upsell
    await window.next.trackCustomEvent('upsell_declined', { packageId });
    
    // Navigate to next page
    window.location.href = '/thank-you';
  }
  
  onUpsellAdded(data) {
    console.log('Upsell added event:', {
      packageId: data.packageId,
      quantity: data.quantity,
      value: data.value
    });
  }
  
  // UI methods (implement based on your UI framework)
  showUpsellModal(config) { /* ... */ }
  showLoading(show) { /* ... */ }
  showSuccess(message) { /* ... */ }
  showError(message) { /* ... */ }
  showDuplicateWarning() { /* ... */ }
}

// Usage
const upsellManager = new UpsellManager();
upsellManager.presentUpsell(123, {
  title: 'Protect Your Purchase',
  description: 'Add warranty protection for just $19.99',
  imageUrl: '/images/warranty.jpg'
});
```

## Error Handling

The `addUpsell` method can throw errors in several scenarios:

```javascript
try {
  await window.next.addUpsell({ packageId: 123 });
} catch (error) {
  switch (error.message) {
    case 'No order found. Upsells can only be added after order completion.':
      // No active order
      console.error('No order available');
      break;
      
    case 'Order does not support post-purchase upsells or is currently processing.':
      // Order doesn't support upsells
      console.error('Upsells not supported for this order');
      break;
      
    case 'Either packageId or items array must be provided':
      // Invalid parameters
      console.error('Invalid upsell configuration');
      break;
      
    default:
      // API or network error
      console.error('Unexpected error:', error.message);
  }
}
```

## Best Practices

1. **Always Check Availability**: Use `canAddUpsells()` before attempting to add
2. **Handle Duplicates**: Check with `isUpsellAlreadyAdded()` to avoid confusion
3. **Track Events**: Use the tracking API to monitor upsell performance
4. **Error Handling**: Always wrap upsell calls in try-catch blocks
5. **User Feedback**: Show loading states and clear success/error messages
6. **Navigation**: Plan the user flow after accepting/declining upsells

## Integration with UI Components

The programmatic API works alongside the declarative HTML enhancers:

```html
<!-- HTML-based upsell (handled by UpsellEnhancer) -->
<div data-next-upsell="offer" data-next-package-id="123">
  <button data-next-upsell-action="add">Add to Order</button>
</div>

<!-- Custom button using programmatic API -->
<button onclick="addCustomUpsell(123)">Add Special Offer</button>

<script>
async function addCustomUpsell(packageId) {
  try {
    await window.next.addUpsell({ packageId });
    alert('Added to your order!');
  } catch (error) {
    alert('Unable to add item');
  }
}
</script>
```

## Testing Upsells

During development, you can test upsells using the debug API:

```javascript
// Check current order state
console.log('Can add upsells:', window.next.canAddUpsells());
console.log('Completed upsells:', window.next.getCompletedUpsells());

// In debug mode (?debugger=true)
if (window.nextDebug) {
  // Access order store directly
  const orderStore = window.nextDebug.stores.order.getState();
  console.log('Order:', orderStore.order);
  console.log('Supports upsells:', orderStore.order?.supports_post_purchase_upsells);
}
```

## Conclusion

The programmatic upsell API provides flexibility to create custom post-purchase experiences while maintaining consistency with the Campaign Cart SDK's architecture. Use these methods to build dynamic upsell flows that maximize order value and enhance the customer experience.