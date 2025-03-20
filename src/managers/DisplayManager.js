/**
 * DisplayManager - Manages conditional display of elements based on cart contents
 * 
 * This class handles showing/hiding elements based on what's in the cart,
 * using data-os-in-cart attributes.
 */

export class DisplayManager {
  #app;
  #logger;
  #displayElements = new Map();

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('DISPLAY');
    this.#initDisplayElements();
    
    // Subscribe to cart updates to refresh display elements
    this.#app.state.subscribe('cart', () => this.refreshDisplayElements());
    
    this.#logger.infoWithTime('DisplayManager initialized');
  }

  /**
   * Initialize all display elements on the page
   */
  #initDisplayElements() {
    this.#logger.infoWithTime('Initializing display elements');
    
    // Find all swap display containers
    const swapContainers = document.querySelectorAll('[data-os-cart="swap-display"]');
    
    if (swapContainers.length === 0) {
      this.#logger.debugWithTime('No swap display containers found on page');
      return;
    }
    
    this.#logger.debugWithTime(`Found ${swapContainers.length} swap display containers`);
    
    // Process each container
    swapContainers.forEach((container, index) => {
      const containerId = container.dataset.osId || `auto-container-${index}`;
      
      // Find all display elements within this container
      const displayElements = container.querySelectorAll('[data-os-in-cart="display"]');
      
      if (displayElements.length === 0) {
        this.#logger.warnWithTime(`Container ${containerId} has no display elements`);
        return;
      }
      
      // Store the container and its display elements
      this.#displayElements.set(container, {
        id: containerId,
        elements: Array.from(displayElements).map(element => ({
          element,
          packageId: element.dataset.osPackage
        }))
      });
      
      this.#logger.debugWithTime(`Initialized container ${containerId} with ${displayElements.length} display elements`);
    });
    
    // Initial update of all display elements
    this.refreshDisplayElements();
  }

  /**
   * Refresh all display elements based on current cart contents
   */
  refreshDisplayElements() {
    this.#logger.debugWithTime('Refreshing display elements');
    
    // Get current cart items
    const cart = this.#app.state.getState('cart');
    const cartItemIds = cart.items.map(item => item.id.toString());
    
    // Update each container
    this.#displayElements.forEach((containerData, container) => {
      this.#updateContainerDisplay(container, containerData, cartItemIds);
    });
  }

  /**
   * Update the display of elements within a container based on cart contents
   * @param {HTMLElement} container - The container element
   * @param {Object} containerData - Data about the container and its elements
   * @param {Array<string>} cartItemIds - IDs of items currently in the cart
   */
  #updateContainerDisplay(container, containerData, cartItemIds) {
    const { id, elements } = containerData;
    let hasVisibleElement = false;
    
    // First pass: check if any element should be visible
    for (const { element, packageId } of elements) {
      if (packageId && cartItemIds.includes(packageId)) {
        // Show this element
        element.style.display = 'block';
        hasVisibleElement = true;
        this.#logger.debugWithTime(`Showing element for package ${packageId} in container ${id}`);
      } else {
        // Hide this element
        element.style.display = 'none';
      }
    }
    
    // If no elements are visible, show the first one as fallback (optional)
    if (!hasVisibleElement && elements.length > 0) {
      // Option 1: Show nothing (current behavior)
      // Option 2: Show the first element as fallback
      // elements[0].element.style.display = 'block';
      // this.#logger.debugWithTime(`No matching packages in cart, showing first element as fallback in container ${id}`);
    }
    
    // Trigger a custom event
    this.#triggerDisplayEvent('updated', container, {
      containerId: id,
      hasVisibleElement,
      visiblePackageIds: elements
        .filter(({ element }) => element.style.display === 'block')
        .map(({ packageId }) => packageId)
    });
  }

  /**
   * Trigger a display event
   * @param {string} eventName - Name of the event
   * @param {HTMLElement} element - Element that triggered the event
   * @param {Object} detail - Event details
   */
  #triggerDisplayEvent(eventName, element, detail = {}) {
    const event = new CustomEvent(`os:display.${eventName}`, {
      bubbles: true,
      cancelable: true,
      detail: { ...detail, manager: this }
    });
    
    element.dispatchEvent(event);
    document.dispatchEvent(event);
    this.#logger.debugWithTime(`Display event triggered: ${eventName}`);
  }

  /**
   * Manually refresh display elements
   * This can be called after dynamic content is loaded
   */
  refresh() {
    this.#logger.infoWithTime('Manually refreshing display elements');
    this.#displayElements.clear();
    this.#initDisplayElements();
  }
} 