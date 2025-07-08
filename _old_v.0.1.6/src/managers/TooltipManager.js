/**
 * TooltipManager - Manages tooltips for checkout elements
 * 
 * This class provides a tooltip system using the floating-ui library.
 * It dynamically loads required dependencies and handles tooltip positioning and display.
 */

import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

export class TooltipManager {
  #app;
  #logger;
  #tooltip;
  #arrowElement;
  #textContainer;
  #currentElement = null;
  #showTimeout = null;
  #hideTimeout = null;
  #initialized = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('TOOLTIP');
    
    this.#init();
    this.#logger.info('TooltipManager initialized');
  }

  /**
   * Initialize the tooltip system
   */
  #init() {
    if (this.#initialized) return;
    
    this.#tooltip = this.#createTooltip();
    this.#arrowElement = this.#tooltip.querySelector('#checkout-tooltip-arrow');
    this.#textContainer = this.#tooltip.querySelector('#checkout-tooltip-text');
    
    this.#setupEventListeners();
    this.#initialized = true;
    this.#logger.info('Tooltip system initialized with floating-ui');
  }

  /**
   * Create the tooltip element
   */
  #createTooltip() {
    // Check if tooltip already exists
    const existingTooltip = document.getElementById('checkout-tooltip');
    if (existingTooltip) return existingTooltip;
    
    const tooltip = document.createElement('div');
    tooltip.setAttribute('role', 'tooltip');
    tooltip.id = 'checkout-tooltip';
    tooltip.style.display = 'none';
    
    // Create text container
    const textContainer = document.createElement('div');
    textContainer.id = 'checkout-tooltip-text';
    tooltip.appendChild(textContainer);
    
    // Create arrow element
    const arrowElement = document.createElement('div');
    arrowElement.id = 'checkout-tooltip-arrow';
    tooltip.appendChild(arrowElement);
    
    document.body.appendChild(tooltip);
    return tooltip;
  }

  /**
   * Set up event listeners for tooltips
   */
  #setupEventListeners() {
    // Event delegation for better performance
    document.addEventListener('mouseover', (e) => {
      const element = e.target.closest('[data-os-tooltip]');
      if (!element) return;

      clearTimeout(this.#showTimeout);
      this.#showTimeout = setTimeout(() => {
        this.#showTooltip(element);
      }, 200);
    });

    document.addEventListener('mouseout', (e) => {
      const element = e.target.closest('[data-os-tooltip]');
      if (!element) return;

      clearTimeout(this.#showTimeout);
      this.#hideTooltip();
    });

    // Handle focus events for accessibility
    document.addEventListener('focus', (e) => {
      const element = e.target.closest('[data-os-tooltip]');
      if (!element) return;
      this.#showTooltip(element);
    }, true);

    document.addEventListener('blur', (e) => {
      const element = e.target.closest('[data-os-tooltip]');
      if (!element) return;
      this.#hideTooltip();
    }, true);

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.#currentElement) {
        this.#hideTooltip();
      }
    });
  }

  /**
   * Show the tooltip for a specific element
   */
  #showTooltip(element) {
    if (!this.#initialized) {
      this.#logger.warn('Cannot show tooltip: system not initialized');
      return;
    }
    
    clearTimeout(this.#hideTimeout);
    this.#currentElement = element;
    
    const text = element.getAttribute('data-os-tooltip');
    const position = element.getAttribute('data-os-tooltip-position') || 'top';
    
    this.#textContainer.textContent = text;
    this.#tooltip.style.display = 'block';

    computePosition(element, this.#tooltip, {
      placement: position,
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ['top', 'right', 'bottom', 'left'],
        }),
        shift({ padding: 5 }),
        arrow({ element: this.#arrowElement }),
      ],
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(this.#tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Arrow positioning
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      Object.assign(this.#arrowElement.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-4px',
      });

      requestAnimationFrame(() => {
        this.#tooltip.classList.add('checkout-tooltip-visible');
      });
    });
  }

  /**
   * Hide the tooltip
   */
  #hideTooltip() {
    if (!this.#tooltip) return;
    
    this.#tooltip.classList.remove('checkout-tooltip-visible');
    this.#hideTimeout = setTimeout(() => {
      if (!this.#tooltip.classList.contains('checkout-tooltip-visible')) {
        this.#tooltip.style.display = 'none';
      }
      this.#currentElement = null;
    }, 200);
  }
} 