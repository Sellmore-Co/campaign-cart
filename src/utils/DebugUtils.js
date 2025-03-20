/**
 * DebugUtils - Utilities for debugging components
 */

export class DebugUtils {
  static #debugStylesInjected = false;
  static #isDebugMode = false;
  static #xrayEnabled = false;
  static #overlays = [];

  /**
   * Initialize debug mode by checking URL parameters
   * @returns {boolean} Whether debug mode is enabled
   */
  static initDebugMode() {
    const urlParams = new URLSearchParams(window.location.search);
    this.#isDebugMode = urlParams.get('debugger') === 'true';
    
    if (this.#isDebugMode && !this.#debugStylesInjected) {
      this.injectDebugStyles();
      this.#xrayEnabled = localStorage.getItem('os_debug_xray_enabled') === 'true';
    }
    
    return this.#isDebugMode;
  }

  /**
   * Check if debug mode is enabled
   * @returns {boolean} Whether debug mode is enabled
   */
  static isDebugMode() {
    return this.#isDebugMode;
  }

  /**
   * Check if X-ray mode is enabled
   * @returns {boolean} Whether X-ray mode is enabled
   */
  static isXrayEnabled() {
    return this.#xrayEnabled;
  }

  /**
   * Toggle X-ray mode on or off
   * @param {boolean} enabled - Whether to enable X-ray mode
   * @returns {boolean} The new state of X-ray mode
   */
  static toggleXray(enabled = !this.#xrayEnabled) {
    if (!this.#isDebugMode) return false;
    
    this.#xrayEnabled = enabled;
    localStorage.setItem('os_debug_xray_enabled', this.#xrayEnabled.toString());
    
    // Toggle visibility of all overlays
    this.#overlays.forEach(overlay => {
      overlay.style.display = this.#xrayEnabled ? 'block' : 'none';
    });
    
    return this.#xrayEnabled;
  }

  /**
   * Inject debug styles into the document head
   */
  static injectDebugStyles() {
    if (this.#debugStylesInjected) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'os-debug-styles';
    styleElement.textContent = `
      /* Common debug styles */
      .os-debug-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        border: 2px dashed rgba(255, 0, 0, 0.7);
        box-sizing: border-box;
      }
      .os-debug-label {
        position: absolute;
        top: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 0 0 0 4px;
        font-family: monospace;
        z-index: 10000;
      }
      
      /* Selector-specific styles */
      .os-debug-card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        border: 1px solid rgba(0, 255, 255, 0.7);
        box-sizing: border-box;
      }
      .os-debug-card-label {
        position: absolute;
        top: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 0 0 0 4px;
        font-family: monospace;
        z-index: 9999;
      }
      .os--selected .os-debug-card-overlay {
        border: 2px solid rgba(0, 255, 0, 0.9);
      }
      .os--active .os-debug-card-overlay {
        background-color: rgba(255, 255, 0, 0.2);
      }
      
      /* Toggle-specific styles */
      .os-debug-toggle-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        border: 1px solid rgba(255, 165, 0, 0.7);
        box-sizing: border-box;
      }
      .os-debug-toggle-label {
        position: absolute;
        top: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 0 0 0 4px;
        font-family: monospace;
        z-index: 9999;
      }
      [data-os-active="true"] .os-debug-toggle-overlay {
        background-color: rgba(255, 165, 0, 0.3);
        border: 2px solid rgba(255, 165, 0, 0.9);
      }
      
      /* Debug bar styles */
      .os-debug-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgba(33, 33, 33, 0.9);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        z-index: 10001;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
      }
      
      .os-debug-bar-title {
        font-weight: 600;
        margin-right: 20px;
      }
      
      .os-debug-bar-controls {
        display: flex;
        align-items: center;
      }
      
      .os-debug-bar-control {
        margin: 0 10px;
        display: flex;
        align-items: center;
      }
      
      .os-debug-bar-toggle {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
        margin-left: 8px;
      }
      
      .os-debug-bar-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .os-debug-bar-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 20px;
      }
      
      .os-debug-bar-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .os-debug-bar-slider {
        background-color: #2196F3;
      }
      
      input:checked + .os-debug-bar-slider:before {
        transform: translateX(20px);
      }
      
      .os-debug-bar-button {
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 12px;
        cursor: pointer;
        margin-left: 10px;
      }
      
      .os-debug-bar-button:hover {
        background-color: #0b7dda;
      }
    `;
    
    document.head.appendChild(styleElement);
    this.#debugStylesInjected = true;
  }

  /**
   * Add a debug overlay to an element
   * @param {HTMLElement} element - The element to add the overlay to
   * @param {string} id - The ID to display
   * @param {string} type - The type of element
   * @param {Object} additionalInfo - Additional information to display
   */
  static addDebugOverlay(element, id, type, additionalInfo = {}) {
    if (!this.#isDebugMode) return;
    
    // Make sure the element has position relative for absolute positioning of the overlay
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }

    const overlay = document.createElement('div');
    overlay.className = `os-debug-${type}-overlay`;
    
    const label = document.createElement('div');
    label.className = `os-debug-${type}-label`;
    
    // Build label text
    let labelText = `ID: ${id}`;
    
    // Add additional info
    Object.entries(additionalInfo).forEach(([key, value]) => {
      labelText += ` | ${key}: ${value}`;
    });
    
    label.textContent = labelText;
    
    // Set initial visibility based on X-ray mode
    if (!this.#xrayEnabled) {
      overlay.style.display = 'none';
      label.style.display = 'none';
    }
    
    element.appendChild(overlay);
    element.appendChild(label);
    
    // Track overlays for toggling
    this.#overlays.push(overlay);
    this.#overlays.push(label);
  }
} 