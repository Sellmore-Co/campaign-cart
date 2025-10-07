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
  private mutationObserver: MutationObserver | null = null;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Get selector configuration
    this.selectorId = this.getRequiredAttribute('data-next-selector-id') || 
                     this.getRequiredAttribute('data-next-id') ||
                     `selector-${Date.now()}`;
    
    this.mode = (this.getAttribute('data-next-selection-mode') || 'swap') as 'swap' | 'select';
    
    // Find and register all selector cards
    this.initializeSelectorCards();
    
    // Set up mutation observer to watch for changes
    this.setupMutationObserver();
    
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

    let packageId = parseInt(packageIdAttr, 10);
    
    // Check if we should apply profile mapping at the selector level
    // By default, let the cart store handle profile mapping
    // Only apply here if explicitly requested via data-next-apply-profile="true"
    const applyProfileHere = cardElement.getAttribute('data-next-apply-profile') === 'true';
    if (applyProfileHere) {
      const { useProfileStore } = require('@/stores/profileStore');
      const profileStore = useProfileStore.getState();
      const mappedId = profileStore.getMappedPackageId(packageId);
      if (mappedId !== packageId) {
        this.logger.debug(`Selector card pre-mapped package ${packageId} -> ${mappedId}`);
        packageId = mappedId;
      }
    }
    const quantity = parseInt(cardElement.getAttribute('data-next-quantity') || '1', 10);
    const isPreSelected = cardElement.getAttribute('data-next-selected') === 'true';
    const shippingId = cardElement.getAttribute('data-next-shipping-id');

    // Check if we already have this element registered
    const existingItemIndex = this.items.findIndex(item => item.element === cardElement);
    if (existingItemIndex !== -1) {
      // Update existing item
      const existingItem = this.items[existingItemIndex];
      if (existingItem) {
        existingItem.packageId = packageId;
        existingItem.quantity = quantity;
        existingItem.isPreSelected = isPreSelected;
        existingItem.shippingId = shippingId || undefined;
        
        // Update package data
        this.updateItemPackageData(existingItem);
      }
      
      this.logger.debug(`Updated existing selector card:`, {
        packageId,
        quantity,
        isPreSelected,
        shippingId
      });
      return;
    }

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

  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Handle attribute changes on existing cards
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          
          // Check if this is a selector card and if package ID changed
          if (target.hasAttribute('data-next-selector-card') && 
              mutation.attributeName === 'data-next-package-id') {
            this.handlePackageIdChange(target);
          }
        }
        
        // Handle new nodes being added
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Check if the added node is a selector card
              if (node.hasAttribute('data-next-selector-card')) {
                this.registerCard(node);
              }
              
              // Also check children of added nodes
              const cards = node.querySelectorAll('[data-next-selector-card]');
              cards.forEach((card) => {
                if (card instanceof HTMLElement) {
                  this.registerCard(card);
                }
              });
            }
          });
          
          // Handle removed nodes
          mutation.removedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.handleCardRemoval(node);
            }
          });
        }
      });
    });
    
    // Observe the selector element for changes
    this.mutationObserver.observe(this.element, {
      attributes: true,
      attributeFilter: ['data-next-package-id', 'data-next-quantity', 'data-next-selected', 'data-next-shipping-id'],
      childList: true,
      subtree: true
    });
  }

  private handlePackageIdChange(cardElement: HTMLElement): void {
    const item = this.items.find(i => i.element === cardElement);
    if (!item) {
      // Card not registered yet, register it now
      this.registerCard(cardElement);
      return;
    }
    
    const newPackageIdAttr = cardElement.getAttribute('data-next-package-id');
    if (!newPackageIdAttr) {
      this.logger.warn('Card package ID removed', cardElement);
      return;
    }
    
    const newPackageId = parseInt(newPackageIdAttr, 10);
    const oldPackageId = item.packageId;
    
    if (newPackageId !== oldPackageId) {
      // Update item properties
      item.packageId = newPackageId;
      item.quantity = parseInt(cardElement.getAttribute('data-next-quantity') || '1', 10);
      item.shippingId = cardElement.getAttribute('data-next-shipping-id') || undefined;
      
      // Update package data (name, price)
      this.updateItemPackageData(item);
      
      // If this was the selected item and we're in swap mode, update the cart
      if (this.selectedItem === item && this.mode === 'swap') {
        this.updateCart({ ...item, packageId: oldPackageId }, item).catch(error => {
          this.logger.error('Failed to update cart after package ID change:', error);
        });
      }
      
      // Re-sync with cart to update UI states
      this.syncWithCart(useCartStore.getState());
      
      this.logger.debug('Package ID changed on selector card:', {
        oldPackageId,
        newPackageId,
        isSelected: this.selectedItem === item
      });
    }
  }
  
  private updateItemPackageData(item: SelectorItem): void {
    try {
      const campaignState = useCampaignStore.getState();
      const packageData = campaignState.getPackage(item.packageId);
      
      if (packageData) {
        item.price = packageData.price ? parseFloat(packageData.price) : item.price;
        item.name = packageData.name || item.name;
      } else {
        // Fallback to extracting from DOM
        item.price = ElementDataExtractor.extractPrice(item.element);
        item.name = ElementDataExtractor.extractName(item.element) || `Package ${item.packageId}`;
      }
    } catch (error) {
      this.logger.debug('Failed to update package data:', error);
    }
  }
  
  private handleCardRemoval(element: HTMLElement): void {
    // Check if this element or any of its children were selector cards
    const cardsToRemove: HTMLElement[] = [];
    
    if (element.hasAttribute('data-next-selector-card')) {
      cardsToRemove.push(element);
    }
    
    const childCards = element.querySelectorAll('[data-next-selector-card]');
    childCards.forEach((card) => {
      if (card instanceof HTMLElement) {
        cardsToRemove.push(card);
      }
    });
    
    cardsToRemove.forEach((cardElement) => {
      const itemIndex = this.items.findIndex(item => item.element === cardElement);
      if (itemIndex !== -1) {
        const removedItem = this.items[itemIndex];
        
        // Remove click handler
        const handler = this.clickHandlers.get(cardElement);
        if (handler) {
          cardElement.removeEventListener('click', handler);
          this.clickHandlers.delete(cardElement);
        }
        
        // Remove from items array
        this.items.splice(itemIndex, 1);
        
        // If this was the selected item, clear selection
        if (this.selectedItem === removedItem) {
          this.selectedItem = null;
          this.element.removeAttribute('data-selected-package');
        }
        
        this.logger.debug('Removed selector card:', {
          packageId: removedItem?.packageId
        });
      }
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

    // In swap mode, we need to find any item from this selector that's currently in cart
    // This is important when profiles change, as the previousItem tracking may be stale
    if (this.mode === 'swap') {
      // Find any item in cart that originated from this selector
      const existingCartItem = cartStore.items.find(cartItem => {
        // Check if this cart item matches any of our selector's packages
        return this.items.some(selectorItem =>
          cartItem.packageId === selectorItem.packageId ||
          cartItem.originalPackageId === selectorItem.packageId
        );
      });

      if (existingCartItem) {
        // We found an item from this selector in cart - swap it
        // Use the cart item's packageId (which may be mapped) for removal
        if (existingCartItem.packageId !== selectedItem.packageId) {
          this.logger.debug(`Swapping cart item from selector: ${existingCartItem.packageId} -> ${selectedItem.packageId}`);
          await cartStore.swapPackage(existingCartItem.packageId, {
            packageId: selectedItem.packageId,
            quantity: selectedItem.quantity,
            isUpsell: false
          });
        }
      } else if (!cartStore.hasItem(selectedItem.packageId)) {
        // No item from this selector in cart - add the selected item
        this.logger.debug(`Adding new item from selector: ${selectedItem.packageId}`);
        await cartStore.addItem({
          packageId: selectedItem.packageId,
          quantity: selectedItem.quantity,
          isUpsell: false
        });
      }
    } else {
      // Non-swap mode - original behavior
      if (previousItem && previousItem.packageId !== selectedItem.packageId) {
        await cartStore.swapPackage(previousItem.packageId, {
          packageId: selectedItem.packageId,
          quantity: selectedItem.quantity,
          isUpsell: false
        });
      } else if (!cartStore.hasItem(selectedItem.packageId)) {
        await cartStore.addItem({
          packageId: selectedItem.packageId,
          quantity: selectedItem.quantity,
          isUpsell: false
        });
      }
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
        // Check if this selector item matches any cart item
        // Cart items may have originalPackageId if they were mapped through a profile
        const isInCart = cartState.items.some(cartItem =>
          cartItem.originalPackageId === item.packageId ||
          cartItem.packageId === item.packageId
        );

        item.element.classList.toggle('next-in-cart', isInCart);
        item.element.setAttribute('data-next-in-cart', isInCart.toString());
      });

      // Find which item should be selected based on cart contents
      const cartItemsInSelector = this.items.filter(item =>
        cartState.items.some(cartItem =>
          cartItem.originalPackageId === item.packageId ||
          cartItem.packageId === item.packageId
        )
      );

      if (cartItemsInSelector.length > 0 && this.mode === 'swap') {
        // In swap mode, select the item that's in cart
        const itemToSelect = cartItemsInSelector[0];
        if (itemToSelect && this.selectedItem !== itemToSelect) {
          this.selectItem(itemToSelect);
        }
      } else if (!this.selectedItem) {
        // No selection yet - try to find a pre-selected item or select first
        // This applies to both select mode and when cart is empty
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
          // The cart store will handle any profile mapping needed
          if (this.mode !== 'select' && cartState.isEmpty) {
            this.updateCart(null, preSelected).catch(error => {
              this.logger.error('Failed to add pre-selected item:', error);
            });
          }
        } else if (this.mode === 'select' && this.items.length > 0) {
          // In select mode with no pre-selected item, select the first item
          // This ensures display values work
          const firstItem = this.items[0];
          if (firstItem) {
            this.selectItem(firstItem);
            this.logger.debug('Select mode: Auto-selected first item since no pre-selected item found');
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
    
    // Stop mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
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