/**
 * Standalone Debug Test File - Analytics Tracking
 * Access via: http://localhost:3000/debug/test-analytics.js
 * 
 * This is a standalone test file for debugging analytics events
 */

(function() {
  'use strict';

  console.log('%c[DEBUG] Analytics Test Script Loaded', 'color: #FF9800; font-weight: bold');

  // Analytics debug tracker
  window.debugAnalytics = {
    events: [],
    
    track: function(eventName, data) {
      const event = {
        name: eventName,
        data: data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      this.events.push(event);
      console.log(`📊 [Analytics] ${eventName}`, data);
      
      // Also send to any existing analytics
      if (window.gtag) {
        window.gtag('event', eventName, data);
      }
      if (window.dataLayer) {
        window.dataLayer.push({
          event: eventName,
          ...data
        });
      }
      
      return event;
    },
    
    getEvents: function() {
      return this.events;
    },
    
    clearEvents: function() {
      this.events = [];
      console.log('Analytics events cleared');
    },
    
    exportEvents: function() {
      const blob = new Blob([JSON.stringify(this.events, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('Events exported to file');
    },
    
    // Test common e-commerce events
    testEvents: {
      pageView: () => debugAnalytics.track('page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      }),
      
      addToCart: () => debugAnalytics.track('add_to_cart', {
        currency: 'USD',
        value: 29.99,
        items: [{
          item_id: 'TEST_001',
          item_name: 'Test Product',
          price: 29.99,
          quantity: 1
        }]
      }),
      
      removeFromCart: () => debugAnalytics.track('remove_from_cart', {
        currency: 'USD',
        value: 29.99,
        items: [{
          item_id: 'TEST_001',
          item_name: 'Test Product',
          price: 29.99,
          quantity: 1
        }]
      }),
      
      beginCheckout: () => debugAnalytics.track('begin_checkout', {
        currency: 'USD',
        value: 59.98,
        items: [{
          item_id: 'TEST_001',
          item_name: 'Test Product',
          price: 29.99,
          quantity: 2
        }]
      }),
      
      purchase: () => debugAnalytics.track('purchase', {
        transaction_id: 'TEST_' + Date.now(),
        value: 59.98,
        currency: 'USD',
        tax: 5.00,
        shipping: 10.00,
        items: [{
          item_id: 'TEST_001',
          item_name: 'Test Product',
          price: 29.99,
          quantity: 2
        }]
      })
    },
    
    // Create floating debug panel
    createPanel: function() {
      const panel = document.createElement('div');
      panel.innerHTML = `
        <style>
          #analytics-debug-panel {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #263238;
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            z-index: 999998;
            font-family: 'Courier New', monospace;
            max-width: 350px;
          }
          #analytics-debug-panel h4 {
            margin: 0 0 10px 0;
            color: #FF9800;
            font-size: 14px;
          }
          #analytics-debug-panel button {
            background: #FF9800;
            color: white;
            border: none;
            padding: 6px 12px;
            margin: 3px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
          }
          #analytics-debug-panel button:hover {
            background: #F57C00;
          }
          #analytics-debug-panel .event-log {
            background: #37474F;
            padding: 8px;
            margin-top: 10px;
            border-radius: 4px;
            max-height: 200px;
            overflow-y: auto;
            font-size: 11px;
          }
          #analytics-debug-panel .event-count {
            color: #4CAF50;
            font-weight: bold;
          }
        </style>
        <div id="analytics-debug-panel">
          <h4>📊 Analytics Debugger</h4>
          <div>
            <button onclick="debugAnalytics.testEvents.pageView()">Page View</button>
            <button onclick="debugAnalytics.testEvents.addToCart()">Add to Cart</button>
            <button onclick="debugAnalytics.testEvents.removeFromCart()">Remove</button>
            <button onclick="debugAnalytics.testEvents.beginCheckout()">Checkout</button>
            <button onclick="debugAnalytics.testEvents.purchase()">Purchase</button>
          </div>
          <div style="margin-top: 10px;">
            <button onclick="debugAnalytics.exportEvents()">Export Events</button>
            <button onclick="debugAnalytics.clearEvents(); debugAnalytics.updatePanel();">Clear</button>
            <span class="event-count">Events: <span id="event-count">0</span></span>
          </div>
          <div class="event-log" id="analytics-event-log">
            No events tracked yet...
          </div>
        </div>
      `;
      document.body.appendChild(panel);
    },
    
    updatePanel: function() {
      const countEl = document.getElementById('event-count');
      const logEl = document.getElementById('analytics-event-log');
      
      if (countEl) {
        countEl.textContent = this.events.length;
      }
      
      if (logEl) {
        if (this.events.length === 0) {
          logEl.innerHTML = 'No events tracked yet...';
        } else {
          const recentEvents = this.events.slice(-5).reverse();
          logEl.innerHTML = recentEvents.map(e => 
            `<div>[${new Date(e.timestamp).toLocaleTimeString()}] ${e.name}</div>`
          ).join('');
        }
      }
    }
  };

  // Override track method to update panel
  const originalTrack = debugAnalytics.track;
  debugAnalytics.track = function() {
    const result = originalTrack.apply(this, arguments);
    debugAnalytics.updatePanel();
    return result;
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      debugAnalytics.createPanel();
    });
  } else {
    debugAnalytics.createPanel();
  }

  // Listen for real analytics events
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
        debugAnalytics.track('performance_metric', {
          metric_name: entry.name,
          value: entry.duration,
          start_time: entry.startTime
        });
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  } catch (e) {
    console.log('Performance observer not supported');
  }

  console.log('%cAnalytics debugger available at: window.debugAnalytics', 'color: #FF9800');
})();