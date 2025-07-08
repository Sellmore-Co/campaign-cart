/**
 * Package Selector Enhancer
 * Manages selector components that swap entire cart contents with selected package
 * Similar to the old SelectorManager with swap functionality
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { ElementDataExtractor } from '@/utils/dom/ElementDataExtractor';
import type { CartState, SelectorItem } from '@/types/global';
import type { Package } from '@/types/campaign';


export class PackageSelectorEnhancer extends BaseEnhancer {
  private selectorId!: string;
  private mode!: 'swap' | 'select';
  private items: SelectorItem[] = [];
  private selectedItem: SelectorItem | null = null;
  private clickHandlers = new Map<HTMLElement, (event: Event) => void>();

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Get selector configuration
    this.selectorId = this.getRequiredAttribute('data-next-selector-id') || 
                     this.getRequiredAttribute('data-next-id') ||
                     `selector-${Date.now()}`;
    
    this.mode = (this.getAttribute('data-next-selection-mode') || 'swap') as 'swap' | 'select';
    
    // Find and register all selector cards
    this.initializeSelectorCards();
    
    // Subscribe to cart changes
    this.subscribe(useCartStore, this.syncWithCart.bind(this));
    
    // Initial sync with cart
    this.syncWithCart(useCartStore.getState());
    
    // Expose getter methods on the element for external access
    (this.element as any)._getSelectedItem = () => this.selectedItem;
    (this.element as any)._getSelectedPackageId = () => this.selectedItem?.packageId;
    
    this.logger.debug(`Initialized package selector:`, {
      selectorId: this.selectorId,
      mode: this.mode,
      itemCount: this.items.length,
      element: this.element,
      initialSelectedPackage: this.selectedItem?.packageId
    });
    
    // Log initialization for debugging
    this.logger.info(`Selector "${this.selectorId}" initialized with ${this.items.length} items in ${this.mode} mode`);
  }

  private initializeSelectorCards(): void {
    // Find all card elements within this selector
    const cardElements = this.element.querySelectorAll('[data-next-selector-card]');
    
    cardElements.forEach((cardElement) => {
      if (cardElement instanceof HTMLElement) {
        this.registerCard(cardElement);
      }
    });

    if (this.items.length === 0) {
      this.logger.warn('No selector cards found in selector', this.element);
    }
  }


  private registerCard(cardElement: HTMLElement): void {
    const packageIdAttr = cardElement.getAttribute('data-next-package-id');
    
    if (!packageIdAttr) {
      this.logger.warn('Card missing package ID attribute', cardElement);
      return;
    }

    const packageId = parseInt(packageIdAttr, 10);
    const quantity = parseInt(cardElement.getAttribute('data-next-quantity') || '1', 10);
    const isPreSelected = cardElement.getAttribute('data-next-selected') === 'true';
    const shippingId = cardElement.getAttribute('data-next-shipping-id');

    // Try to get package data for name and price
    let packageData: Package | undefined;
    try {
      const campaignState = useCampaignStore.getState();
      packageData = campaignState.getPackage(packageId) || undefined;
    } catch (error) {
      this.logger.debug('Package data not yet available for:', packageId);
    }

    const extractedPrice = packageData?.price ? parseFloat(packageData.price) : ElementDataExtractor.extractPrice(cardElement);
    const extractedName = packageData?.name || ElementDataExtractor.extractName(cardElement) || `Package ${packageId}`;
    
    const item: SelectorItem = {
      element: cardElement,
      packageId,
      quantity,
      price: extractedPrice,
      name: extractedName,
      isPreSelected,
      shippingId: shippingId || undefined
    };

    this.items.push(item);

    // Set up click handler
    const clickHandler = (event: Event) => this.handleCardClick(event, item);
    this.clickHandlers.set(cardElement, clickHandler);
    cardElement.addEventListener('click', clickHandler);

    // Add selector classes for styling
    cardElement.classList.add('next-selector-card');
    
    this.logger.debug(`Registered selector card:`, {
      packageId,
      quantity,
      isPreSelected,
      shippingId
    });
  }


  private async handleCardClick(event: Event, item: SelectorItem): Promise<void> {
    event.preventDefault();
    
    try {
      // If already selected, do nothing
      if (this.selectedItem === item) {
        return;
      }

      const previousItem = this.selectedItem;
      
      // Select the new item
      this.selectItem(item);
      
      // Emit selection event
      this.eventBus.emit('selector:item-selected', {
        selectorId: this.selectorId,
        packageId: item.packageId,
        previousPackageId: previousItem?.packageId || undefined,
        mode: this.mode,
        pendingAction: this.mode === 'select' ? true : undefined
      });
      
      // Store selected item info on element for debugging
      this.element.setAttribute('data-selected-package', item.packageId.toString());
      
      // Also make selectedItem available via a method
      (this.element as any)._selectedItem = item;
      
      // For swap mode, update cart immediately. 'select' mode doesn't auto-add
      if (this.mode === 'swap') {
        await this.updateCart(previousItem, item);
        
        // Handle shipping method if specified
        if (item.shippingId) {
          await this.setShippingMethod(item.shippingId);
        }
      }
      // In select mode, we allow selecting items even if they're already in cart
      // This allows users to add multiple quantities of the same item

    } catch (error) {
      this.handleError(error, 'handleCardClick');
    }
  }


  private selectItem(item: SelectorItem): void {
    // Clear previous selection
    this.items.forEach(i => {
      i.element.classList.remove('next-selected');
      i.element.setAttribute('data-next-selected', 'false');
    });

    // Select new item
    item.element.classList.add('next-selected');
    item.element.setAttribute('data-next-selected', 'true');
    
    this.selectedItem = item;
    
    // Store on element for button to access
    this.element.setAttribute('data-selected-package', item.packageId.toString());
    
    this.logger.debug(`Selected item in selector ${this.selectorId}:`, {
      packageId: item.packageId,
      name: item.name,
      quantity: item.quantity
    });
    
    // Emit event for buttons to update
    this.emit('selector:selection-changed', {
      selectorId: this.selectorId,
      packageId: item.packageId,
      item: item
    });
  }


  private async updateCart(previousItem: SelectorItem | null, selectedItem: SelectorItem): Promise<void> {
    const cartStore = useCartStore.getState();

    // Swap mode: use swapPackage method to handle atomic swap
    if (previousItem && previousItem.packageId !== selectedItem.packageId) {
      await cartStore.swapPackage(previousItem.packageId, {
        packageId: selectedItem.packageId,
        quantity: selectedItem.quantity,
        isUpsell: false
      });
    } else if (!cartStore.hasItem(selectedItem.packageId)) {
      // No previous item or same item - just add if not in cart
      await cartStore.addItem({
        packageId: selectedItem.packageId,
        quantity: selectedItem.quantity,
        isUpsell: false
      });
    }
  }

  private async setShippingMethod(shippingId: string): Promise<void> {
    try {
      const shippingIdNum = parseInt(shippingId, 10);
      
      if (isNaN(shippingIdNum)) {
        this.logger.error('Invalid shipping ID:', shippingId);
        return;
      }
      
      // Simply delegate to cart store which handles all the logic
      const cartStore = useCartStore.getState();
      await cartStore.setShippingMethod(shippingIdNum);
      
      this.logger.debug(`Shipping method ${shippingIdNum} set via selector`);
      
    } catch (error) {
      this.logger.error('Failed to set shipping method:', error);
    }
  }

  private syncWithCart(cartState: CartState): void {
    try {
      // Update card states based on cart contents
      this.items.forEach(item => {
        const isInCart = cartState.items.some(cartItem => 
          cartItem.packageId === item.packageId
        );
        
        item.element.classList.toggle('next-in-cart', isInCart);
        item.element.setAttribute('data-next-in-cart', isInCart.toString());
      });

      // Find which item should be selected based on cart contents
      const cartItemsInSelector = this.items.filter(item =>
        cartState.items.some(cartItem => cartItem.packageId === item.packageId)
      );

      if (cartItemsInSelector.length > 0 && this.mode === 'swap') {
        // Select the first item found in cart
        const itemToSelect = cartItemsInSelector[0];
        if (itemToSelect && this.selectedItem !== itemToSelect) {
          this.selectItem(itemToSelect);
        }
      } else if (!this.selectedItem) {
        // No selection and nothing in cart - select pre-selected item if any
        const preSelectedItems = this.items.filter(item => item.isPreSelected);
        
        if (preSelectedItems.length > 1) {
          // Multiple pre-selected items - warn and select first one
          this.logger.warn(`Multiple pre-selected items found in selector ${this.selectorId}. Only one should be pre-selected.`);
          
          // Clear all but the first one
          preSelectedItems.slice(1).forEach(item => {
            item.element.classList.remove('next-selected');
            item.element.setAttribute('data-next-selected', 'false');
            item.isPreSelected = false;
          });
        }
        
        const preSelected = preSelectedItems[0];
        if (preSelected) {
          this.selectItem(preSelected);
          // Auto-add pre-selected item to cart (except in select mode)
          if (this.mode !== 'select') {
            this.updateCart(null, preSelected).catch(error => {
              this.logger.error('Failed to add pre-selected item:', error);
            });
          }
        }
      }

    } catch (error) {
      this.handleError(error, 'syncWithCart');
    }
  }

  public update(): void {
    // Update selector state based on current cart
    this.syncWithCart(useCartStore.getState());
  }

  public getSelectedItem(): SelectorItem | null {
    return this.selectedItem;
  }

  public getSelectorConfig(): { id: string; mode: string; itemCount: number } {
    return {
      id: this.selectorId,
      mode: this.mode,
      itemCount: this.items.length
    };
  }

  protected override cleanupEventListeners(): void {
    // Remove all click handlers
    this.clickHandlers.forEach((handler, element) => {
      element.removeEventListener('click', handler);
    });
    this.clickHandlers.clear();
  }

  public override destroy(): void {
    this.cleanupEventListeners();
    
    // Remove any classes we added
    this.items.forEach(item => {
      item.element.classList.remove(
        'next-selector-card', 
        'next-selected', 
        'next-in-cart'
      );
    });

    super.destroy();
  }
}