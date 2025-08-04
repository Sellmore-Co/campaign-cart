/**
 * Quantity Text Enhancer
 * Displays dynamic text based on quantity with support for multiplication factors
 * 
 * Usage:
 * <div data-next-quantity-text="Pack, Get {qty*2} Pillowcases">1 Pack, Get 2 Pillowcases</div>
 * 
 * Supported patterns:
 * - {qty} - Shows the current quantity
 * - {qty*2} - Shows quantity multiplied by 2
 * - {qty+1} - Shows quantity plus 1
 * - {qty-1} - Shows quantity minus 1
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';

export class QuantityTextEnhancer extends BaseEnhancer {
  private template: string = '';
  private currentQuantity: number = 1;
  private quantitySelectorId?: string;
  private containerPackageId?: number;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Get the template from the attribute
    this.template = this.getAttribute('data-next-quantity-text') || '';
    if (!this.template) {
      this.logger.warn('QuantityTextEnhancer requires data-next-quantity-text attribute');
      return;
    }
    
    // Get optional selector ID for linking to specific quantity controls
    this.quantitySelectorId = this.getAttribute('data-next-quantity-selector-id') || '';
    
    // Try to find the package ID from container context
    const container = this.element.closest('[data-next-package-id]');
    if (container) {
      const packageIdAttr = container.getAttribute('data-next-package-id');
      if (packageIdAttr) {
        this.containerPackageId = parseInt(packageIdAttr, 10);
      }
    }
    
    // Set up listeners
    this.setupQuantityListeners();
    
    // Get initial quantity
    this.getInitialQuantity();
    
    // Initial render
    this.updateText();
    
    this.logger.debug('QuantityTextEnhancer initialized', {
      template: this.template,
      quantitySelectorId: this.quantitySelectorId,
      packageId: this.containerPackageId
    });
  }
  
  private setupQuantityListeners(): void {
    // Listen for quantity change events
    this.eventBus.on('upsell:quantity-changed', (data) => {
      // Check if this quantity change is relevant to us
      if (this.quantitySelectorId && data.selectorId === this.quantitySelectorId) {
        this.currentQuantity = data.quantity;
        this.updateText();
      } else if (!this.quantitySelectorId && !data.selectorId) {
        // No selector IDs - match by package ID
        if (data.packageId === this.containerPackageId) {
          this.currentQuantity = data.quantity;
          this.updateText();
        }
      } else if (!this.quantitySelectorId) {
        // Check container context
        const container = this.element.closest('[data-next-selector-id]');
        if (container) {
          const containerSelectorId = container.getAttribute('data-next-selector-id');
          if (containerSelectorId === data.selectorId) {
            this.currentQuantity = data.quantity;
            this.updateText();
          }
        } else if (data.packageId === this.containerPackageId) {
          // Fallback to package ID matching
          this.currentQuantity = data.quantity;
          this.updateText();
        }
      }
    });
  }
  
  private getInitialQuantity(): void {
    // Try to get initial quantity from the container
    if (this.quantitySelectorId) {
      const quantityDisplay = document.querySelector(
        `[data-next-upsell-quantity="display"][data-next-quantity-selector-id="${this.quantitySelectorId}"]`
      );
      if (quantityDisplay && quantityDisplay.textContent) {
        const qty = parseInt(quantityDisplay.textContent, 10);
        if (!isNaN(qty)) {
          this.currentQuantity = qty;
        }
      }
    } else {
      // Try to find quantity display in same container
      const container = this.element.closest('[data-next-upsell="offer"]');
      if (container) {
        const quantityDisplay = container.querySelector('[data-next-upsell-quantity="display"]');
        if (quantityDisplay && quantityDisplay.textContent) {
          const qty = parseInt(quantityDisplay.textContent, 10);
          if (!isNaN(qty)) {
            this.currentQuantity = qty;
          }
        }
      }
    }
  }
  
  private updateText(): void {
    // Process the template and replace placeholders
    let text = this.template;
    
    // Find all {qty} patterns and their variations
    text = text.replace(/\{qty([*+\-]?\d*)\}/g, (_match, operation) => {
      let result = this.currentQuantity;
      
      if (operation) {
        const operator = operation[0];
        const value = parseInt(operation.substring(1), 10);
        
        switch (operator) {
          case '*':
            result = this.currentQuantity * value;
            break;
          case '+':
            result = this.currentQuantity + value;
            break;
          case '-':
            result = Math.max(0, this.currentQuantity - value);
            break;
        }
      }
      
      return result.toString();
    });
    
    // Handle singular/plural forms
    // Format: {singular|plural} will choose based on quantity
    text = text.replace(/\{([^|]+)\|([^}]+)\}/g, (_match, singular, plural) => {
      return this.currentQuantity === 1 ? singular : plural;
    });
    
    // Update the element content
    this.element.textContent = text;
  }
  
  public update(): void {
    this.updateText();
  }
  
  public override destroy(): void {
    super.destroy();
  }
}