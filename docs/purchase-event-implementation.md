# Purchase Event Implementation

## Overview

This document describes the implementation of the purchase event tracking system in the Campaign Cart application. The system ensures that purchase events are properly tracked across different pages and sessions while preventing duplicate events.

## Problem Statement

The application needs to reliably track purchase events with the following requirements:

1. Purchase events should fire when an order is successfully created
2. If a user leaves before the event is fired, it should fire when they first visit any page with the order's ref_id
3. Events should not be duplicated within a session or when revisiting pages with ref_id
4. The implementation should work consistently across both receipt pages and upsell pages
5. Purchase events should be triggered for each accepted upsell

## Implementation

The solution uses flags in sessionStorage to track which orders and upsells need events fired:

### 1. Main Order Purchase Tracking

When an order is successfully created in `PaymentHandler.js`:

```javascript
#handleOrderSuccess(orderData) {
  sessionStorage.setItem('order_reference', orderData.ref_id);
  
  // Set pending purchase event flag
  sessionStorage.setItem(`pending_purchase_event_${orderData.ref_id}`, 'true');
  
  // Trigger order.created event for the EventManager
  this.#app?.triggerEvent?.('order.created', orderData);
  
  // Redirect user to next page
  // ...
}
```

### 2. Check for Pending Events on Page Load

During initialization in `TwentyNineNext.js`, check if there's a pending event:

```javascript
async #checkForPendingPurchaseEvents() {
  const refId = new URLSearchParams(window.location.search).get('ref_id');
  if (!refId) return;
  
  // Check if this order has a pending purchase event
  const hasPendingEvent = sessionStorage.getItem(`pending_purchase_event_${refId}`) === 'true';
  
  if (hasPendingEvent) {
    this.coreLogger.info(`Found pending purchase event for order ${refId}`);
    
    try {
      const orderData = await this.api.getOrder(refId);
      if (orderData) {
        // Trigger the event
        this.triggerEvent('order.loaded', { order: orderData });
        this.coreLogger.info(`Triggered order.loaded event for pending purchase ${refId}`);
        
        // Clear the pending flag
        sessionStorage.removeItem(`pending_purchase_event_${refId}`);
      }
    } catch (error) {
      this.coreLogger.error(`Failed to load order data for pending purchase ${refId}:`, error);
    }
  } else {
    this.coreLogger.debug(`No pending purchase event for order ${refId}`);
  }
}
```

### 3. Upsell Purchase Tracking

When an upsell is accepted in `UpsellManager.js`:

```javascript
async acceptUpsell(packageId, quantity, nextUrl) {
  // Call API to add upsell to order
  const response = await this.#api.createOrderUpsell(this.#orderRef, upsellData);
  
  // Store upsell information for tracking
  this.#storeUpsellPurchaseData(response, packageId, quantity);
  
  // Redirect to next page
  // ...
}

#storeUpsellPurchaseData(response, packageId, quantity) {
  // Create purchase data object for the upsell
  const upsellPurchaseData = {
    // Upsell order data
    // ...
  };
  
  // Store data in sessionStorage
  sessionStorage.setItem('pending_upsell_purchase', 'true');
  sessionStorage.setItem('upsell_purchase_data', JSON.stringify(upsellPurchaseData));
}
```

### 4. Check for Pending Upsell Purchases

On page load in `UpsellManager.js`:

```javascript
#checkForPendingUpsellPurchase() {
  const hasPendingUpsell = sessionStorage.getItem('pending_upsell_purchase') === 'true';
  
  if (hasPendingUpsell) {
    // Get stored upsell data
    const purchaseData = JSON.parse(sessionStorage.getItem('upsell_purchase_data'));
    
    // Send the purchase event with force=true to ensure it's tracked
    this.#app.eventManager.purchase(purchaseData, true);
    
    // Clear the flags
    sessionStorage.removeItem('pending_upsell_purchase');
    sessionStorage.removeItem('upsell_purchase_data');
  }
}
```

## Event Flow

1. **Main Order Creation:**
   - Order is created
   - Pending flag is set in sessionStorage
   - First page with ref_id checks for flag and fires purchase event

2. **Upsell Acceptance:**
   - Upsell is added to the order via API
   - Upsell purchase data is stored in sessionStorage
   - After redirect, UpsellManager checks for pending upsell and fires a separate purchase event

## Benefits

1. **Reliability:** Events will be tracked even if a user closes their browser after order creation
2. **Upsell Tracking:** Each upsell is tracked as a separate purchase event
3. **Deduplication:** Built-in mechanisms prevent duplicate events
4. **Page Type Agnostic:** Works on any page with ref_id (upsell, receipt, etc.)

## Limitations

1. Session-specific: If a user opens a link with ref_id on a different device, there's no way to know if the event has already been fired on another device
2. Relies on sessionStorage: Events may be duplicated if sessionStorage is cleared or unavailable 