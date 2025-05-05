/**
 * ShippingSelector - Handles shipping method selection UI on the checkout page.
 */

export class ShippingSelector {
  #app;
  #logger;
  #container;
  #shippingMethods; // Collection of { element, input, id }

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('SHIPPING_SELECTOR');
    this.#container = document.querySelector('[os-component="shipping-mode"]');
    
    if (!this.#container) {
      this.#logger.warn('Shipping selector container [os-component="shipping-mode"] not found.');
      return;
    }
    
    this.#shippingMethods = this.#findShippingMethods();
    
    if (this.#shippingMethods.length > 0) {
      this.#logger.debug(`Found ${this.#shippingMethods.length} shipping methods.`);
      this.#init();
    } else {
      this.#logger.warn('No shipping methods found within the container.');
    }
  }

  #findShippingMethods() {
    const methods = [];
    this.#container.querySelectorAll('.shipping-method').forEach(methodElement => {
      const input = methodElement.querySelector('input[name="shipping_method"][type="radio"]');
      if (input) {
        methods.push({
          element: methodElement,
          input: input,
          id: input.value // Assuming the value attribute holds the shipping method ID
        });
      } else {
        this.#logger.warn('Shipping method element found without a radio input.', methodElement);
      }
    });
    return methods;
  }

  #init() {
    // Add change event listeners
    this.#shippingMethods.forEach(method => {
      method.input.addEventListener('change', () => this.#handleShippingChange(method.id));
    });

    // Sync initial state with cart
    this.#syncWithCartState();

    // Listen for cart updates to keep UI in sync
    this.#app.state.subscribe('cart.shippingMethod', () => this.#syncWithCartState());

    this.#logger.debug('ShippingSelector initialized and event listeners attached.');
  }

  #handleShippingChange(shippingMethodId) {
    this.#logger.info(`Shipping method selected via UI: ${shippingMethodId}`);
    try {
      // Update the cart state
      this.#app.cart.setShippingMethod(shippingMethodId);
      // Note: The UI update will happen automatically via the state subscription (#syncWithCartState)
    } catch (error) {
      this.#logger.error(`Failed to set shipping method ${shippingMethodId}:`, error);
      // Optionally: Revert UI selection or show an error to the user
      this.#syncWithCartState(); // Re-sync UI to the actual cart state
    }
  }

  #syncWithCartState() {
    const currentShippingMethod = this.#app.state.getState('cart.shippingMethod');
    const currentShippingId = currentShippingMethod?.ref_id?.toString(); // Use ref_id from the full object

    this.#logger.debug(`Syncing UI with cart state. Current shipping ID: ${currentShippingId}`);

    this.#shippingMethods.forEach(method => {
      const isSelected = method.id === currentShippingId;
      method.element.classList.toggle('os--active', isSelected);
      // Ensure the correct radio button is checked visually
      if (method.input.checked !== isSelected) {
        method.input.checked = isSelected;
      }
      this.#logger.debug(`Method ID ${method.id}: selected=${isSelected}, input.checked=${method.input.checked}`);
    });
  }
} 