/**
 * Add to Cart Enhancer
 * Handles buttons that add items to cart, either from a selector or directly
 * 
 * Attributes:
 * - data-next-action="add-to-cart" (required)
 * - data-next-package-id: Direct package ID to add
 * - data-next-selector-id: ID of selector to get package from
 * - data-next-quantity: Quantity to add (default: 1)
 * - data-next-url: URL to redirect to after successful add to cart (optional)
 * - data-next-clear-cart: If "true", clears cart before adding item (optional)
 */

import { BaseActionEnhancer } from '@/enhancers/base/BaseActionEnhancer';
import { useCartStore } from '@/stores/cartStore';
import type { SelectorItem } from '@/types/global';
import { preserveQueryParams } from '@/utils/url-utils';

export class AddToCartEnhancer extends BaseActionEnhancer {
  private packageId?: number;
  private quantity: number = 1;
  private selectorId?: string;
  private selectedItem?: SelectorItem | null;
  private clickHandler?: (event: Event) => void;
  private redirectUrl?: string;
  private clearCart: boolean = false;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Get optional attributes
    const packageIdAttr = this.getAttribute('data-next-package-id');
    if (packageIdAttr) {
      this.packageId = parseInt(packageIdAttr, 10);
    }
    
    const quantityAttr = this.getAttribute('data-next-quantity');
    this.quantity = quantityAttr ? parseInt(quantityAttr, 10) : 1;
    
    const selectorIdAttr = this.getAttribute('data-next-selector-id');
    if (selectorIdAttr) {
      this.selectorId = selectorIdAttr;
    }
    
    // Get redirect URL
    const redirectUrlAttr = this.getAttribute('data-next-url');
    if (redirectUrlAttr) {
      this.redirectUrl = redirectUrlAttr;
    }
    
    // Get clear cart option
    const clearCartAttr = this.getAttribute('data-next-clear-cart');
    this.clearCart = clearCartAttr === 'true';
    
    // Set up click handler
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener('click', this.clickHandler);
    
    // Listen to selector events if we have a selector ID
    if (this.selectorId) {
      this.setupSelectorListener();
    }
    
    // Initial state
    this.updateButtonState();
    
    this.logger.debug('AddToCartEnhancer initialized', {
      packageId: this.packageId,
      selectorId: this.selectorId,
      quantity: this.quantity,
      redirectUrl: this.redirectUrl,
      clearCart: this.clearCart
    });
  }

  private setupSelectorListener(): void {
    // Try to get selector immediately, then retry if not found
    const checkSelector = (retryCount: number = 0) => {
      const selectorElement = this.findSelectorElement();

      if (!selectorElement && retryCount < 5) {
        // Retry after a short delay
        setTimeout(() => checkSelector(retryCount + 1), 50);
        return;
      }

      if (!selectorElement) {
        this.logger.warn(`Selector with id "${this.selectorId}" not found after retries. Button may not work properly.`);
      } else {
        // Get initial selected item
        this.selectedItem = this.getSelectedItemFromElement(selectorElement);

        // If no selected item but selector has data-selected-package, try to find it
        if (!this.selectedItem) {
          const selectedPackage = selectorElement.getAttribute('data-selected-package');
          if (selectedPackage) {
            const packageId = parseInt(selectedPackage, 10);
            if (!isNaN(packageId)) {
              // Try to find the selected card element
              const selectedCard = selectorElement.querySelector(
                `[data-next-selector-card][data-next-package-id="${packageId}"]`
              );

              // Create item from found card or minimal item
              this.selectedItem = {
                packageId: packageId,
                quantity: this.quantity || 1,
                element: selectedCard as HTMLElement || null as any,
                price: undefined,
                name: undefined,
                isPreSelected: false,
                shippingId: undefined
              };
            }
          }
        }

        // For select mode, also check for any card with data-next-selected="true"
        const isSelectMode = selectorElement.getAttribute('data-next-selection-mode') === 'select';
        if (isSelectMode && !this.selectedItem) {
          const selectedCard = selectorElement.querySelector('[data-next-selector-card][data-next-selected="true"]');
          if (selectedCard) {
            const packageIdAttr = selectedCard.getAttribute('data-next-package-id');
            if (packageIdAttr) {
              const packageId = parseInt(packageIdAttr, 10);
              if (!isNaN(packageId)) {
                this.selectedItem = {
                  packageId: packageId,
                  quantity: this.quantity || 1,
                  element: selectedCard as HTMLElement,
                  price: undefined,
                  name: undefined,
                  isPreSelected: false,
                  shippingId: undefined
                };
                // Also update the selector's data-selected-package attribute
                selectorElement.setAttribute('data-selected-package', packageId.toString());
              }
            }
          }
        }

        this.updateButtonState();
      }
    };

    // Start checking immediately
    checkSelector();

    // Listen to selector events
    this.eventBus.on('selector:item-selected', this.handleSelectorChange.bind(this));
    this.eventBus.on('selector:selection-changed', this.handleSelectorChange.bind(this));
  }

  private findSelectorElement(): HTMLElement | null {
    return document.querySelector(
      `[data-next-cart-selector][data-next-selector-id="${this.selectorId}"], ` +
      `[data-next-package-selector][data-next-selector-id="${this.selectorId}"]`
    );
  }

  private getSelectedItemFromElement(element: HTMLElement): SelectorItem | null {
    // Try getter methods first (more reliable)
    const getSelectedItem = (element as any)._getSelectedItem;
    if (typeof getSelectedItem === 'function') {
      return getSelectedItem();
    }
    
    // Fallback to direct property access
    const selectedItem = (element as any)._selectedItem;
    if (selectedItem) {
      return selectedItem;
    }
    
    // Try data-selected-package attribute
    const selectedPackageAttr = element.getAttribute('data-selected-package');
    if (selectedPackageAttr) {
      const packageId = parseInt(selectedPackageAttr, 10);
      if (!isNaN(packageId)) {
        return {
          packageId: packageId,
          quantity: 1,
          element: null as any,
          price: undefined,
          name: undefined,
          isPreSelected: false,
          shippingId: undefined
        };
      }
    }
    
    return null;
  }

  private handleSelectorChange(event: any): void {
    // Only handle events from our specific selector
    if (event.selectorId !== this.selectorId) {
      return;
    }
    
    const selectorElement = this.findSelectorElement();
    if (selectorElement) {
      this.selectedItem = this.getSelectedItemFromElement(selectorElement);
    } else if (event.item) {
      // Use item from event
      this.selectedItem = event.item;
    } else if (event.packageId) {
      // Create minimal item from event data
      this.selectedItem = {
        packageId: event.packageId,
        quantity: event.quantity || 1,
        element: null as any,
        price: undefined,
        name: undefined,
        isPreSelected: false,
        shippingId: undefined
      };
    } else {
      this.selectedItem = null;
    }
    
    this.updateButtonState();
  }

  private updateButtonState(): void {
    if (this.selectorId) {
      // Check if selector is in select mode
      const selectorElement = this.findSelectorElement();
      const isSelectMode = selectorElement?.getAttribute('data-next-selection-mode') === 'select';

      if (isSelectMode) {
        // In select mode, always enable the button if there's a selected item
        // even if it's already in cart (user might want to add more)
        const hasSelection = this.selectedItem !== null ||
                           !!selectorElement?.getAttribute('data-selected-package');
        this.setEnabled(hasSelection);
      } else {
        // In swap mode or default mode, enable if item selected
        const hasSelection = this.selectedItem !== null;
        this.setEnabled(hasSelection);
      }
    } else if (this.packageId) {
      // Direct package: always enable
      this.setEnabled(true);
    }
  }

  private setEnabled(enabled: boolean): void {
    if (enabled) {
      this.element.removeAttribute('disabled');
      this.removeClass('next-disabled');
    } else {
      this.element.setAttribute('disabled', 'true');
      this.addClass('next-disabled');
    }
  }

  private async handleClick(event: Event): Promise<void> {
    event.preventDefault();
    
    // Check for profile override attribute
    const profileOverride = this.getAttribute('data-next-profile');
    if (profileOverride) {
      const { ProfileManager } = await import('@/core/ProfileManager');
      const profileManager = ProfileManager.getInstance();
      await profileManager.applyProfile(profileOverride);
    }
    
    await this.executeAction(
      async () => {
        await this.addToCart();
      },
      { showLoading: true, disableOnProcess: true }
    );
  }

  private async addToCart(): Promise<void> {
    const cartStore = useCartStore.getState();
    
    // Determine what package to add
    let packageIdToAdd: number | undefined;
    let quantityToAdd = this.quantity;
    
    if (this.selectorId && this.selectedItem) {
      // Use selection from selector
      packageIdToAdd = this.selectedItem.packageId;
      quantityToAdd = this.selectedItem.quantity || this.quantity;
    } else if (this.packageId) {
      // Use direct package ID
      packageIdToAdd = this.packageId;
    }
    
    if (!packageIdToAdd) {
      this.logger.warn('No package ID available for add-to-cart action');
      return;
    }
    
    try {
      // Clear cart if requested
      if (this.clearCart) {
        this.logger.debug('Clearing cart before adding item');
        await cartStore.clear();
      }
      
      await cartStore.addItem({
        packageId: packageIdToAdd,
        quantity: quantityToAdd,
        isUpsell: undefined
      });
      
      // Re-enable button (allow multiple adds)
      this.updateButtonState();
      
      // Emit success event
      this.eventBus.emit('cart:item-added', {
        packageId: packageIdToAdd,
        quantity: quantityToAdd,
        source: this.selectorId ? 'selector' : 'direct'
      });
      
      // Redirect if URL provided
      if (this.redirectUrl) {
        const finalUrl = preserveQueryParams(this.redirectUrl);
        this.logger.debug('Redirecting to:', finalUrl);
        window.location.href = finalUrl;
      }
    } catch (error) {
      this.logger.error('Failed to add item to cart:', error);
      throw error;
    }
  }

  public update(_data?: any): void {
    // No-op for action enhancers
  }

  public override destroy(): void {
    if (this.clickHandler) {
      this.element.removeEventListener('click', this.clickHandler);
    }
    
    if (this.selectorId) {
      this.eventBus.off('selector:item-selected', this.handleSelectorChange.bind(this));
      this.eventBus.off('selector:selection-changed', this.handleSelectorChange.bind(this));
    }
    
    super.destroy();
  }
}