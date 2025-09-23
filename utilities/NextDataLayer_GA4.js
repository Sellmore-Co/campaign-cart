// TRANSFORMER: This script converts Next Commerce dataLayer events prefixed with "dl_" to standard GA4 events. Also swaps dl_accepted_upsell to purchase.


// GA4 DataLayer Bridge - Converts dl_ prefixed events to standard GA4 events
  (function() {
    'use strict';

    // Initialize global dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Track processed events to avoid duplicates
    const processedEvents = new Set();
    
    // Store transaction data for upsell tracking (includes order number)
    const transactionMap = new Map();

    // Standard GA4 ecommerce events that need conversion
    const ECOMMERCE_EVENT_MAP = {
      'dl_add_to_cart': 'add_to_cart',
      'dl_remove_from_cart': 'remove_from_cart',
      'dl_view_item': 'view_item',
      'dl_view_item_list': 'view_item_list',
      'dl_begin_checkout': 'begin_checkout',
      'dl_purchase': 'purchase',
      'dl_add_payment_info': 'add_payment_info',
      'dl_add_shipping_info': 'add_shipping_info',
      'dl_view_cart': 'view_cart',
      'dl_select_item': 'select_item',
      'dl_select_promotion': 'select_promotion',
      'dl_view_promotion': 'view_promotion',
      'dl_refund': 'refund',
      // Map upsell events to purchase
      'dl_accepted_upsell': 'purchase',
      'dl_viewed_upsell': 'view_item'
    };

    // User events that might need conversion
    const USER_EVENT_MAP = {
      'dl_login': 'login',
      'dl_sign_up': 'sign_up'
    };

    // Combine all event maps
    const ALL_EVENT_MAPS = { ...ECOMMERCE_EVENT_MAP, ...USER_EVENT_MAP };

    // Wait for NextDataLayer to be available
    const initBridge = () => {
      if (!window.NextDataLayer) {
        // Try again in 100ms
        setTimeout(initBridge, 100);
        return;
      }

      console.log('[GA4 Bridge] Initializing dataLayer bridge');

      // Override the push method of NextDataLayer
      const originalPush = window.NextDataLayer.push;

      window.NextDataLayer.push = function(...args) {
        // Call original push
        const result = originalPush.apply(window.NextDataLayer, args);

        // Process each pushed item
        args.forEach(item => {
          if (item && typeof item === 'object' && item.event) {
            processEvent(item);
          }
        });

        return result;
      };

      // Process any existing events in NextDataLayer
      window.NextDataLayer.forEach(item => {
        if (item && typeof item === 'object' && item.event) {
          processEvent(item);
        }
      });

      console.log('[GA4 Bridge] Bridge initialized successfully');
    };

    // Process individual events
    const processEvent = (event) => {
      // Skip if not a dl_ prefixed event we care about
      if (!event.event || !ALL_EVENT_MAPS[event.event]) {
        return;
      }

      // Store transaction data for initial purchase
      if (event.event === 'dl_purchase' && event.ecommerce?.transaction_id) {
        const orderId = event.order_id || event.data?.order_id;
        const orderNumber = event.ecommerce?.order_number || event.data?.order_number;
        if (orderId) {
          transactionMap.set(orderId, {
            transaction_id: event.ecommerce.transaction_id,
            order_number: orderNumber
          });
          console.log(`[GA4 Bridge] Stored transaction_id ${event.ecommerce.transaction_id} and order_number ${orderNumber} for order ${orderId}`);
        }
      }

      // Create unique event ID to prevent duplicates
      const eventId = `${event.event}_${event._metadata?.sequence_number || Date.now()}_${JSON.stringify(event.ecommerce?.items?.[0]?.item_id || '')}_${event.order_id || ''}`;

      // Skip if already processed
      if (processedEvents.has(eventId)) {
        return;
      }

      processedEvents.add(eventId);

      // Get the GA4 standard event name
      const ga4EventName = ALL_EVENT_MAPS[event.event];

      // Build GA4-compliant event
      const ga4Event = {
        event: ga4EventName,
        event_timestamp: event.event_timestamp || new Date().toISOString(),
        event_id: event.event_id
      };

      // Handle ecommerce events
      if (ECOMMERCE_EVENT_MAP[event.event] && (event.ecommerce || event.event === 'dl_accepted_upsell')) {
        // Clear ecommerce object first (GTM best practice)
        window.dataLayer.push({ ecommerce: null });

        // Handle upsell events specially
        if (event.event === 'dl_accepted_upsell') {
          // Build ecommerce data for upsell as purchase
          const orderId = event.order_id || event.data?.order_id;
          const transactionData = transactionMap.get(orderId);
          const transactionId = transactionData?.transaction_id || orderId;
          const orderNumber = transactionData?.order_number;
          
          ga4Event.ecommerce = {
            transaction_id: transactionId, // Use same transaction_id as initial purchase
            value: event.upsell?.value || event.upsell?.price || 0,
            currency: event.upsell?.currency || 'USD',
            items: []
          };
          
          // Include order_number if available
          if (orderNumber) {
            ga4Event.ecommerce.order_number = orderNumber;
          }

          // Add upsell item
          if (event.upsell) {
            ga4Event.ecommerce.items.push({
              item_id: event.upsell.package_id || event.upsell.id,
              item_name: event.upsell.package_name || event.upsell.name || `Upsell Package ${event.upsell.package_id}`,
              price: event.upsell.price || event.upsell.value || 0,
              quantity: event.upsell.quantity || 1,
              item_category: 'Upsell',
              item_variant: event.upsell.variant
            });
          }

          console.log(`[GA4 Bridge] Upsell converted to purchase with transaction_id: ${transactionId}`, ga4Event);
        } 
        // Handle viewed upsell as view_item
        else if (event.event === 'dl_viewed_upsell') {
          ga4Event.ecommerce = {
            currency: event.upsell?.currency || 'USD',
            value: event.upsell?.value || event.upsell?.price || 0,
            items: []
          };

          // Add upsell item
          if (event.upsell) {
            ga4Event.ecommerce.items.push({
              item_id: event.upsell.package_id || event.upsell.id,
              item_name: event.upsell.package_name || event.upsell.name || `Upsell Package ${event.upsell.package_id}`,
              price: event.upsell.price || event.upsell.value || 0,
              quantity: 1,
              item_category: 'Upsell'
            });
          }
        }
        // Handle regular ecommerce events
        else if (event.ecommerce) {
          ga4Event.ecommerce = {
            ...event.ecommerce
          };

          // Ensure items array exists and is properly formatted
          if (ga4Event.ecommerce.items) {
            ga4Event.ecommerce.items = ga4Event.ecommerce.items.map(item => ({
              item_id: item.item_id || item.id,
              item_name: item.item_name || item.name,
              affiliation: item.affiliation,
              coupon: item.coupon,
              currency: item.currency || ga4Event.ecommerce.currency,
              discount: item.discount,
              index: item.index,
              item_brand: item.item_brand,
              item_category: item.item_category,
              item_category2: item.item_category2,
              item_category3: item.item_category3,
              item_category4: item.item_category4,
              item_category5: item.item_category5,
              item_list_id: item.item_list_id,
              item_list_name: item.item_list_name,
              item_variant: item.item_variant,
              location_id: item.location_id,
              price: item.price,
              quantity: item.quantity
            }));
          }
        }
      }

      // Handle user events
      if (USER_EVENT_MAP[event.event]) {
        // Copy over user properties if they exist
        if (event.user_properties) {
          ga4Event.user_properties = event.user_properties;
        }

        // Copy over method if it exists (for login/signup)
        if (event.method) {
          ga4Event.method = event.method;
        }
      }

      // Copy over any custom parameters (excluding internal metadata)
      Object.keys(event).forEach(key => {
        if (!['event', 'ecommerce', '_metadata', 'event_timestamp', 'event_id', 'user_properties', 'method', 'upsell', 'order_id'].includes(key)) {
          ga4Event[key] = event[key];
        }
      });

      // Push to dataLayer
      window.dataLayer.push(ga4Event);

      // Debug logging (remove in production)
      if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
        console.log(`[GA4 Bridge] Converted ${event.event} → ${ga4EventName}`, ga4Event);
      }
    };

    // Clean up old processed events periodically (prevent memory leak)
    setInterval(() => {
      if (processedEvents.size > 1000) {
        const entriesToKeep = Array.from(processedEvents).slice(-500);
        processedEvents.clear();
        entriesToKeep.forEach(entry => processedEvents.add(entry));
      }
      
      // Clean up old transaction IDs (keep last 100)
      if (transactionMap.size > 100) {
        const entries = Array.from(transactionMap.entries()).slice(-50);
        transactionMap.clear();
        entries.forEach(([key, value]) => transactionMap.set(key, value));
      }
    }, 60000); // Every minute

    // Start the bridge
    initBridge();

    // Expose for debugging
    window.GA4Bridge = {
      getProcessedCount: () => processedEvents.size,
      getEventMap: () => ALL_EVENT_MAPS,
      getTransactionMap: () => Object.fromEntries(transactionMap),
      isActive: () => true
    };
  })();