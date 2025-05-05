/**
 * KonamiCodeHandler - Utility class for handling the Konami code Easter egg
 * 
 * This class provides functionality for detecting the Konami code sequence
 * and triggering a test order with predefined data.
 */

export class KonamiCodeHandler {
  #konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  #konamiCodePosition = 0;
  #indicatorTimeout;
  #indicator;
  #logger;
  #callback;
  
  /**
   * Create a new KonamiCodeHandler instance
   * @param {Object} options - Configuration options
   * @param {Function} options.callback - Function to call when Konami code is detected
   * @param {Object} options.logger - Logger instance for logging
   */
  constructor({ callback, logger } = {}) {
    this.#logger = logger;
    this.#callback = callback;
    this.#createIndicator();
    this.#initListener();
    
    if (this.#logger) {
      this.#logger.debug('KonamiCodeHandler initialized');
    }
  }
  
  /**
   * Create the visual indicator element
   * @private
   */
  #createIndicator() {
    this.#indicator = document.createElement('div');
    this.#indicator.style.position = 'fixed';
    this.#indicator.style.bottom = '10px';
    this.#indicator.style.right = '10px';
    this.#indicator.style.background = 'rgba(0, 0, 0, 0.7)';
    this.#indicator.style.color = '#fff';
    this.#indicator.style.padding = '5px 10px';
    this.#indicator.style.borderRadius = '5px';
    this.#indicator.style.fontFamily = 'monospace';
    this.#indicator.style.fontSize = '12px';
    this.#indicator.style.zIndex = '9999';
    this.#indicator.style.display = 'none';
    this.#indicator.textContent = 'Konami: 0/' + this.#konamiCodeSequence.length;
    document.body.appendChild(this.#indicator);
  }
  
  /**
   * Initialize the keydown event listener
   * @private
   */
  #initListener() {
    document.addEventListener('keydown', (e) => {
      // Check if the pressed key matches the next key in the sequence
      if (e.key === this.#konamiCodeSequence[this.#konamiCodePosition]) {
        // Move to the next position in the sequence
        this.#konamiCodePosition++;
        
        // Only show the indicator after the first 4 keystrokes (up, up, down, down)
        if (this.#konamiCodePosition >= 4) {
          this.#indicator.style.display = 'block';
          this.#indicator.textContent = `Konami: ${this.#konamiCodePosition}/${this.#konamiCodeSequence.length}`;
        }
        
        // If we've reached the end of the sequence, trigger the callback
        if (this.#konamiCodePosition === this.#konamiCodeSequence.length) {
          if (this.#callback) {
            this.#callback();
          }
          
          // Reset the position for next time
          this.#konamiCodePosition = 0;
          
          // Hide the indicator
          setTimeout(() => {
            this.#indicator.style.display = 'none';
          }, 500);
        }
        
        // Hide the indicator after a delay if not completed
        if (this.#konamiCodePosition >= 4) {
          clearTimeout(this.#indicatorTimeout);
          this.#indicatorTimeout = setTimeout(() => {
            this.#indicator.style.display = 'none';
          }, 3000);
        }
      } else {
        // Reset the position if the wrong key is pressed
        if (this.#konamiCodePosition > 0) {
          this.#konamiCodePosition = 0;
          
          // Only hide the indicator if it's currently shown
          if (this.#indicator.style.display === 'block') {
            this.#indicator.textContent = `Konami: 0/${this.#konamiCodeSequence.length}`;
            
            // Hide the indicator after a delay
            clearTimeout(this.#indicatorTimeout);
            this.#indicatorTimeout = setTimeout(() => {
              this.#indicator.style.display = 'none';
            }, 1500);
          }
        }
      }
    });
  }
  
  /**
   * Set Konami code test mode in session storage
   * This can be used by other components to detect when Konami code is active
   */
  static setTestMode() {
    sessionStorage.setItem('konami_test_mode', 'true');
    return true;
  }
  
  /**
   * Check if Konami code test mode is active
   * @returns {boolean} True if Konami code test mode is active
   */
  static isTestMode() {
    return sessionStorage.getItem('konami_test_mode') === 'true';
  }
  
  /**
   * Clear Konami code test mode from session storage
   */
  static clearTestMode() {
    sessionStorage.removeItem('konami_test_mode');
  }
  
  /**
   * Get predefined test order data for Konami code test mode
   * @param {Object} state - Application state
   * @param {Function} getPackageIdFromUrl - Function to get package ID from URL
   * @param {Function} getCartLines - Function to get cart lines
   * @returns {Object} Test order data
   */
  static getTestOrderData(state, getPackageIdFromUrl, getCartLines) {
    try {
      // Get cart items from the app state
      const cartItems = state?.cart?.items || [];
      
      // If cart is empty, create a dummy item
      const packageId = getPackageIdFromUrl ? getPackageIdFromUrl() : 1;
      const lines = cartItems.length > 0 && getCartLines ? 
        getCartLines(cartItems) : 
        [{ package_id: packageId || 1, quantity: 1 }];
        
      // Get the correct shipping method ID from the state
      const shippingMethodObject = state?.cart?.shippingMethod;
      const shippingMethodId = parseInt(shippingMethodObject?.ref_id, 10) || 1; // Use the ref_id from state
      
      // Create a complete test order data object
      return {
        user: {
          email: 'test@test.com',
          first_name: 'Test',
          last_name: 'Order'
        },
        shipping_address: {
          first_name: 'Test',
          last_name: 'Order',
          line1: 'Test Address 123',
          line2: '',
          line3: '',
          line4: 'Tempe',
          state: 'AZ',
          postcode: '85281',
          country: 'US',
          phone_number: '+14807581224'
        },
        billing_address: {
          first_name: 'Test',
          last_name: 'Order',
          line1: 'Test Address 123',
          line2: '',
          line3: '',
          line4: 'Tempe',
          state: 'AZ',
          postcode: '85281',
          country: 'US',
          phone_number: '+14807581224'
        },
        shipping_method: shippingMethodId, // Use the ID read from state
        attribution: state?.cart?.attribution || {},
        lines: lines,
        // Don't include payment-related fields here as they'll be added by the payment handler
        success_url: window.location.origin + '/checkout/confirmation/'
      };
    } catch (error) {
      console.error('Error getting Konami test order data:', error);
      return null;
    }
  }
  
  /**
   * Show a message to the user when Konami code is activated
   * @returns {HTMLElement} The message element
   */
  static showActivationMessage() {
    const messageElement = document.createElement('div');
    messageElement.style.position = 'fixed';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.background = 'rgba(0, 0, 0, 0.8)';
    messageElement.style.color = '#fff';
    messageElement.style.padding = '20px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.zIndex = '9999';
    messageElement.style.textAlign = 'center';
    messageElement.style.fontFamily = 'monospace';
    messageElement.style.fontSize = '18px';
    messageElement.innerHTML = `
      <h3>🎮 KONAMI CODE ACTIVATED! 🎮</h3>
      <p>Creating test order with predefined data:</p>
      <p style="font-size: 14px; margin-top: 10px; text-align: left;">
        Email: test@test.com<br>
        Name: Test Order<br>
        Address: Test Address 123<br>
        City: Tempe, AZ 85281<br>
        Country: US<br>
        Phone: +14807581224<br>
        Card: 4111111111111111 (test mode)
      </p>
    `;
    document.body.appendChild(messageElement);
    return messageElement;
  }
} 