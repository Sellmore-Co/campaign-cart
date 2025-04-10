# Purchase Event Implementation

## Overview

This document describes the implementation of the purchase event tracking system in the Campaign Cart application. The system ensures that purchase events are properly tracked across different pages and sessions while preventing duplicate events.

## Problem Statement

The application needs to reliably track purchase events with the following requirements:

1. Purchase events should fire when an order is successfully created
2. If a user leaves before the event is fired, it should fire when they first visit any page with the order's ref_id
3. Events should not be duplicated within a session or when revisiting pages with ref_id
4. The implementation should work consistently across both receipt pages and upsell pages

## Implementation

The solution uses a "pending purchase event" flag in sessionStorage to track which orders need events fired:

### 1. Set Pending Flag on Order Creation

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

### 3. Process the Event in EventManager.js

The EventManager listens for the 'order.loaded' event and handles deduplication:

```javascript
this.#app.on('order.loaded', (data) => {
  if (data.order) {
    this.#logger.info('Order loaded on receipt page, checking if purchase event needed');
    this.purchase(data.order);
  }
});
```

## Event Flow

1. **Order Creation:**
   - Order is created
   - `pending_purchase_event_{ref_id}` flag is set in sessionStorage
   - The 'order.created' event is immediately dispatched
   - EventManager may fire purchase event if it catches this event

2. **First Page with ref_id:**
   - System checks if there's a pending event flag for this ref_id
   - If found, loads the order data and triggers 'order.loaded'
   - Clears the pending flag to prevent future triggering
   - EventManager receives the event and fires purchase event

3. **Subsequent Pages with ref_id:**
   - No pending flag exists
   - No purchase event is triggered

## Benefits

1. **Reliability:** Events will be tracked even if a user closes their browser after order creation
2. **Deduplication:** Built-in mechanisms prevent duplicate events
3. **Page Type Agnostic:** Works on any page with ref_id (upsell, receipt, etc.)
4. **Maintains Original Flow:** Uses existing event handlers in EventManager

## Limitations

1. Session-specific: If a user opens a link with ref_id on a different device, there's no way to know if the event has already been fired on another device
2. Relies on sessionStorage: Events may be duplicated if sessionStorage is cleared or unavailable 