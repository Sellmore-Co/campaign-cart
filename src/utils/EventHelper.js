/**
 * EventHelper - Utility for manually triggering events from the frontend
 * 
 * This script provides a simple API for triggering events from the frontend.
 * It can be used by clients who want to fire events in different ways.
 */

(function() {
  // Create a global object for the event helper
  window.OSEvents = window.OSEvents || {};
  
  /**
   * Get the 29next client instance
   * @returns {Object|null} - The 29next client instance or null if not found
   */
  function getClientInstance() {
    // Try to find the client instance
    if (window.twentyNineNext) return window.twentyNineNext;
    if (window.osClient) return window.osClient;
    if (window.os29next) return window.os29next;
    if (window.os) return window.os;
    
    // If not found, look for it in the DOM
    const clientElement = document.querySelector('[data-os-client]');
    if (clientElement) {
      return clientElement.__os_client;
    }
    
    console.warn('29next client instance not found');
    return null;
  }
  
  /**
   * Fire a view_item event
   * @param {string|Object} packageId - The package ID or package data object
   */
  OSEvents.viewItem = function(packageId) {
    const client = getClientInstance();
    if (!client || !client.events) {
      console.warn('Cannot fire view_item event: Client or EventManager not found');
      return;
    }
    
    // If packageId is a string, try to find the package in the campaign data
    if (typeof packageId === 'string' || typeof packageId === 'number') {
      const campaignData = client.getCampaignData();
      if (!campaignData || !campaignData.packages) {
        console.warn('Cannot fire view_item event: Campaign data not found');
        return;
      }
      
      const packageData = campaignData.packages.find(pkg => 
        pkg.ref_id.toString() === packageId.toString() || 
        pkg.external_id?.toString() === packageId.toString()
      );
      
      if (!packageData) {
        console.warn(`Cannot fire view_item event: Package with ID ${packageId} not found`);
        return;
      }
      
      client.events.viewItem(packageData);
    } else if (typeof packageId === 'object') {
      // If packageId is an object, use it directly
      client.events.viewItem(packageId);
    } else {
      console.warn('Cannot fire view_item event: Invalid package ID or data');
    }
  };
  
  /**
   * Fire an add_to_cart event
   * @param {string|Object} packageId - The package ID or package data object
   * @param {number} quantity - The quantity to add to cart
   */
  OSEvents.addToCart = function(packageId, quantity = 1) {
    const client = getClientInstance();
    if (!client || !client.state) {
      console.warn('Cannot fire add_to_cart event: Client or StateManager not found');
      return;
    }
    
    // If packageId is a string, try to find the package in the campaign data
    if (typeof packageId === 'string' || typeof packageId === 'number') {
      const campaignData = client.getCampaignData();
      if (!campaignData || !campaignData.packages) {
        console.warn('Cannot fire add_to_cart event: Campaign data not found');
        return;
      }
      
      const packageData = campaignData.packages.find(pkg => 
        pkg.ref_id.toString() === packageId.toString() || 
        pkg.external_id?.toString() === packageId.toString()
      );
      
      if (!packageData) {
        console.warn(`Cannot fire add_to_cart event: Package with ID ${packageId} not found`);
        return;
      }
      
      // Add the item to the cart, which will trigger the add_to_cart event
      client.state.addToCart({
        id: packageData.ref_id,
        name: packageData.name,
        price: parseFloat(packageData.price) || 0,
        quantity: quantity
      });
    } else if (typeof packageId === 'object') {
      // If packageId is an object, use it directly
      client.state.addToCart({
        ...packageId,
        quantity: quantity || packageId.quantity || 1
      });
    } else {
      console.warn('Cannot fire add_to_cart event: Invalid package ID or data');
    }
  };
  
  /**
   * Fire a begin_checkout event
   */
  OSEvents.beginCheckout = function() {
    const client = getClientInstance();
    if (!client || !client.events) {
      console.warn('Cannot fire begin_checkout event: Client or EventManager not found');
      return;
    }
    
    client.events.beginCheckout();
  };
  
  /**
   * Fire a custom event
   * @param {string} eventName - The name of the event
   * @param {Object} eventData - The event data
   */
  OSEvents.fireCustomEvent = function(eventName, eventData = {}) {
    const client = getClientInstance();
    if (!client || !client.events) {
      console.warn(`Cannot fire ${eventName} event: Client or EventManager not found`);
      return;
    }
    
    client.events.fireCustomEvent(eventName, eventData);
  };
  
  /**
   * Fire a view_item_list event
   */
  OSEvents.viewItemList = function() {
    const client = getClientInstance();
    if (!client || !client.events) {
      console.warn('Cannot fire view_item_list event: Client or EventManager not found');
      return;
    }
    
    const campaignData = client.getCampaignData();
    if (!campaignData) {
      console.warn('Cannot fire view_item_list event: Campaign data not found');
      return;
    }
    
    client.events.viewItemList(campaignData);
  };
  
  /**
   * Fire a purchase event manually
   * @param {Object} orderData - The order data
   * @param {boolean} force - Whether to force firing the event even if the order ID has been processed
   */
  OSEvents.purchase = function(orderData, force = false) {
    const client = getClientInstance();
    if (!client || !client.events) {
      console.warn('Cannot fire purchase event: Client or EventManager not found');
      return;
    }
    
    if (!orderData) {
      console.warn('Cannot fire purchase event: No order data provided');
      return;
    }
    
    client.events.purchase(orderData, force);
  };
  
  // Expose the OSEvents object to the window
  window.OSEvents = OSEvents;
  
  // Auto-initialize when the DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('OSEvents helper initialized');
  });
})(); 