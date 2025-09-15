/**
 * Cart Toggle Enhancer
 * 
 * Simple toggle functionality for cart items with automatic state management.
 * Click to add, click again to remove. Supports quantity sync for warranties/accessories.
 * 
 * @example Basic toggle:
 * <button data-next-toggle data-next-package-id="123">Add to Cart</button>
 * 
 * @example With dynamic text:
 * <button data-next-toggle 
 *         data-next-package-id="123"
 *         data-add-text="Add to Cart"
 *         data-remove-text="✓ In Cart">
 *   Add to Cart
 * </button>
 * 
 * @example Quantity sync (for warranties):
 * <button data-next-toggle 
 *         data-next-package-id="warranty-123"
 *         data-next-qty-sync="product-123">
 *   Add Protection Plan
 * </button>
 * 
 * @example Multi-package sync with qty consideration:
 * <button data-next-toggle 
 *         data-next-package-id="warranty-123"
 *         data-next-package-sync="2,4,9">
 *   Add Protection for All Items
 * </button>
 * 
 * @example Auto-add on page load:
 * <button data-next-toggle 
 *         data-next-package-id="123"
 *         data-next-selected="true">
 *   Pre-selected Item
 * </button>
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import type { CartState } from '@/types/global';

// Global tracking of auto-added packages to prevent duplicates
const autoAddedPackages = new Set<number>();

// Reset tracker when navigating away (for SPAs)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    autoAddedPackages.clear();
  });
}

export class CartToggleEnhancer extends BaseEnhancer {
  // Core properties
  private packageId?: number;
  private quantity: number = 1;
  
  // Sync mode
  private syncPackageIds: number[] = [];
  private isSyncMode: boolean = false;
  
  // UI state
  private stateContainer?: HTMLElement;
  private isUpsell: boolean = false;
  
  // Event handling
  private clickHandler?: (event: Event) => void;
  
  // Initialization guard
  private isInitialized: boolean = false;
  private isAutoAdding: boolean = false;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Prevent double initialization
    if (this.isInitialized) {
      this.logger.warn('CartToggleEnhancer already initialized, skipping');
      return;
    }
    
    // Mark element as being initialized to prevent race conditions
    if (this.element.hasAttribute('data-toggle-initializing')) {
      this.logger.warn('CartToggleEnhancer initialization already in progress, skipping');
      return;
    }
    this.element.setAttribute('data-toggle-initializing', 'true');
    
    // Require data-next-toggle attribute
    if (!this.hasAttribute('data-next-toggle')) {
      this.element.removeAttribute('data-toggle-initializing');
      throw new Error('data-next-toggle attribute is required');
    }
    
    // 1. Find state container (parent element that receives state classes)
    this.findStateContainer();
    
    // 2. Determine package ID (from element, container)
    this.resolvePackageIdentifier();
    
    // 3. Check for quantity sync mode
    this.checkSyncMode();
    
    // 4. Set quantity (if not in sync mode)
    if (!this.isSyncMode) {
      this.setQuantity();
    }
    
    // 5. Detect if this is an upsell/bump
    this.detectUpsellContext();
    
    // 6. Set up event listeners
    this.setupEventListeners();
    
    // 7. Initial state update
    this.updateState(useCartStore.getState());
    
    // 8. Check for auto-add on page load
    await this.checkAutoAdd();
    
    // Mark as fully initialized
    this.isInitialized = true;
    this.element.removeAttribute('data-toggle-initializing');
    this.element.setAttribute('data-toggle-initialized', 'true');
    
    this.logger.debug('Toggle initialized:', {
      packageId: this.packageId,
      quantity: this.quantity,
      isSyncMode: this.isSyncMode,
      syncPackageIds: this.syncPackageIds,
      isUpsell: this.isUpsell
    });
  }

  private findStateContainer(): void {
    let element: HTMLElement | null = this.element;
    
    // Search up the DOM for a container element
    while (element && element !== document.body) {
      // Check for explicit container markers
      if (element.hasAttribute('data-next-toggle-container') ||
          element.hasAttribute('data-next-bump') ||
          element.hasAttribute('data-next-upsell-item') ||
          element.classList.contains('upsell') ||
          element.classList.contains('bump')) {
        this.stateContainer = element;
        break;
      }
      
      // Check if element has package context
      if (element.hasAttribute('data-next-package-id') ||
          element.hasAttribute('data-package-id')) {
        this.stateContainer = element;
        break;
      }
      
      element = element.parentElement;
    }
    
    // Fallback to toggle element itself
    if (!this.stateContainer) {
      this.stateContainer = this.element;
    }
  }

  private resolvePackageIdentifier(): void {
    // Priority order: element → container
    
    // 1. Check toggle element
    const elementPackageId = this.getAttribute('data-next-package-id') || 
                            this.getAttribute('data-package-id');
    if (elementPackageId) {
      this.packageId = parseInt(elementPackageId, 10);
      return;
    }
    
    // 2. Check container
    if (this.stateContainer && this.stateContainer !== this.element) {
      const containerPackageId = this.stateContainer.getAttribute('data-next-package-id') ||
                                this.stateContainer.getAttribute('data-package-id');
      if (containerPackageId) {
        this.packageId = parseInt(containerPackageId, 10);
        return;
      }
    }
    
    
    throw new Error('Package identifier required: data-next-package-id');
  }

  private checkSyncMode(): void {
    // Check both element and container for sync attributes
    const packageSyncAttr = this.getAttribute('data-next-package-sync') || 
                           this.stateContainer?.getAttribute('data-next-package-sync');
    const qtySyncAttr = this.getAttribute('data-next-qty-sync') || 
                        this.stateContainer?.getAttribute('data-next-qty-sync');
    
    if (packageSyncAttr) {
      // Parse comma-separated package IDs
      this.syncPackageIds = packageSyncAttr.split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));
      
      if (this.syncPackageIds.length > 0) {
        this.isSyncMode = true;
        this.quantity = 0; // Will be set dynamically
      }
    } else if (qtySyncAttr) {
      // Legacy support for single package sync
      const syncId = parseInt(qtySyncAttr, 10);
      if (!isNaN(syncId)) {
        this.syncPackageIds = [syncId];
        this.isSyncMode = true;
        this.quantity = 0; // Will be set dynamically
      }
    }
  }

  private setQuantity(): void {
    // Check element and container for quantity
    const qtyAttr = this.getAttribute('data-next-quantity') ||
                    this.getAttribute('data-quantity') ||
                    this.stateContainer?.getAttribute('data-next-quantity');
    
    this.quantity = qtyAttr ? parseInt(qtyAttr, 10) : 1;
  }

  private detectUpsellContext(): void {
    // Check various upsell indicators
    this.isUpsell = 
      this.getAttribute('data-next-is-upsell') === 'true' ||
      this.stateContainer?.hasAttribute('data-next-upsell') ||
      this.stateContainer?.hasAttribute('data-next-bump') ||
      this.element.closest('[data-next-upsell-section]') !== null ||
      this.element.closest('[data-next-bump-section]') !== null;
  }

  private async checkAutoAdd(): Promise<void> {
    // Check if element should be auto-selected on page load
    const isSelected = this.getAttribute('data-next-selected') === 'true' ||
                      this.stateContainer?.getAttribute('data-next-selected') === 'true';
    
    if (isSelected && this.packageId) {
      // Check global tracker to prevent duplicate auto-adds for same package
      if (autoAddedPackages.has(this.packageId)) {
        this.logger.debug('Package already auto-added by another element, skipping:', {
          packageId: this.packageId
        });
        return;
      }
      
      // Prevent concurrent auto-adds
      if (this.isAutoAdding) {
        this.logger.debug('Auto-add already in progress, skipping');
        return;
      }
      
      const cartState = useCartStore.getState();
      const isInCart = this.isInCart(cartState);
      
      if (!isInCart) {
        // Mark this package as being auto-added globally
        autoAddedPackages.add(this.packageId);
        
        this.logger.debug('Auto-adding item on page load:', {
          packageId: this.packageId,
          quantity: this.quantity
        });
        
        this.isAutoAdding = true;
        
        try {
          // Update quantity from sync if needed
          if (this.isSyncMode) {
            this.updateSyncedQuantity(cartState);
          }
          
          await this.addToCart();
        } catch (error) {
          this.logger.error('Failed to auto-add item:', error);
          // Remove from global tracker on error
          autoAddedPackages.delete(this.packageId);
        } finally {
          this.isAutoAdding = false;
        }
      }
    }
  }

  private setupEventListeners(): void {
    // Click handler
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener('click', this.clickHandler);
    
    // Subscribe to cart changes
    this.subscribe(useCartStore, (state) => this.updateState(state));
  }

  private async handleClick(event: Event): Promise<void> {
    event.preventDefault();
    
    try {
      // Add loading state
      this.setLoadingState(true);
      
      const cartState = useCartStore.getState();
      
      // Update quantity from sync if needed
      if (this.isSyncMode) {
        this.updateSyncedQuantity(cartState);
      }
      
      // Toggle: add if not in cart, remove if in cart
      const isInCart = this.isInCart(cartState);
      
      this.logger.debug('Toggle click:', {
        packageId: this.packageId,
        isInCart,
        quantity: this.quantity,
        isSyncMode: this.isSyncMode
      });
      
      if (isInCart) {
        await this.removeFromCart();
      } else {
        await this.addToCart();
      }
      

      
    } catch (error) {
      this.handleError(error, 'handleClick');
    } finally {
      this.setLoadingState(false);
    }
  }

  private async addToCart(): Promise<void> {
    const cartStore = useCartStore.getState();
    
    this.logger.debug('Adding to cart:', {
      packageId: this.packageId,
      quantity: this.quantity
    });
    
    if (this.packageId) {
      // Get package info from campaign store if available
      let title = `Package ${this.packageId}`;
      let price = 0;
      
      try {
        const campaign = useCampaignStore.getState();
        const pkg = campaign.getPackage(this.packageId);
        if (pkg) {
          title = pkg.name;
          price = parseFloat(pkg.price);
          this.logger.debug('Found package data:', { title, price });
        } else {
          this.logger.debug('Package not found in campaign store');
        }
      } catch (e) {
        this.logger.debug('Error getting package data:', e);
      }
      
      await cartStore.addItem({
        packageId: this.packageId,
        quantity: this.quantity,
        title,
        price,
        isUpsell: this.isUpsell
      });
      
      this.logger.debug('Added to cart successfully');
    }
  }

  private async removeFromCart(): Promise<void> {
    const cartStore = useCartStore.getState();
    
    if (this.packageId) {
      await cartStore.removeItem(this.packageId);
    }
  }

  private updateState(cartState: CartState): void {
    const inCart = this.isInCart(cartState);
    
    // Update state container
    if (this.stateContainer) {
      this.stateContainer.setAttribute('data-in-cart', String(inCart));
      this.stateContainer.setAttribute('data-next-active', String(inCart));
      this.stateContainer.classList.toggle('next-in-cart', inCart);
      this.stateContainer.classList.toggle('next-not-in-cart', !inCart);
      this.stateContainer.classList.toggle('next-active', inCart);
      
      // Legacy support
      this.stateContainer.classList.toggle('os--active', inCart);
    }
    
    // Update toggle element
    this.setAttribute('data-in-cart', String(inCart));
    this.setAttribute('data-next-active', String(inCart));
    this.toggleClass('next-in-cart', inCart);
    this.toggleClass('next-not-in-cart', !inCart);
    this.toggleClass('next-active', inCart);
    
    // Update button text
    const addText = this.getAttribute('data-add-text');
    const removeText = this.getAttribute('data-remove-text');
    if (addText && removeText) {
      this.updateTextContent(inCart ? removeText : addText);
    }
    
    // Handle sync mode
    if (this.isSyncMode && this.syncPackageIds.length > 0) {
      this.handleSyncUpdate(cartState);
    }
  }

  private updateSyncedQuantity(cartState: CartState): void {
    if (this.syncPackageIds.length === 0) return;

    let totalQuantity = 0;

    // Sum up quantities from all synced packages
    // Check both the original package ID and if it was mapped through a profile
    this.syncPackageIds.forEach(syncId => {
      const syncedItem = cartState.items.find(item =>
        item.packageId === syncId ||
        item.originalPackageId === syncId
      );
      if (syncedItem) {
        // Consider the qty field (items per package) if available
        const itemsPerPackage = (syncedItem as any).qty || 1;
        const totalItemsForPackage = syncedItem.quantity * itemsPerPackage;
        totalQuantity += totalItemsForPackage;

        this.logger.debug(`Sync package ${syncId}: ${syncedItem.quantity} packages × ${itemsPerPackage} items/package = ${totalItemsForPackage} total`);
      }
    });

    this.quantity = totalQuantity;

    this.logger.debug(`Total sync quantity: ${this.quantity} (from packages: ${this.syncPackageIds.join(', ')})`);
  }

  private async handleSyncUpdate(cartState: CartState): Promise<void> {
    if (!this.packageId || this.syncPackageIds.length === 0) return;

    // Calculate total quantity from all synced packages
    let totalSyncQuantity = 0;
    let anySyncedItemExists = false;

    this.syncPackageIds.forEach(syncId => {
      // Check both the original package ID and if it was mapped through a profile
      const syncedItem = cartState.items.find(item =>
        item.packageId === syncId ||
        item.originalPackageId === syncId
      );
      if (syncedItem) {
        anySyncedItemExists = true;
        // Consider the qty field (items per package) if available
        const itemsPerPackage = (syncedItem as any).qty || 1;
        totalSyncQuantity += syncedItem.quantity * itemsPerPackage;
      }
    });

    const currentItem = cartState.items.find(item => item.packageId === this.packageId);

    if (anySyncedItemExists && totalSyncQuantity > 0) {
      // At least one synced package is in cart
      if (currentItem && currentItem.quantity !== totalSyncQuantity) {
        // Update quantity to match total
        this.logger.debug(`Auto-sync: Updating quantity to ${totalSyncQuantity}`);
        await useCartStore.getState().updateQuantity(this.packageId, totalSyncQuantity);
      }
    } else if (currentItem && !cartState.swapInProgress) {
      // Additional safety check: if the item is an upsell/bump, be more conservative about removing
      if (currentItem.is_upsell) {
        // For upsells, only remove if we're SURE the synced packages don't exist
        // Give a small delay to let any profile operations complete
        this.logger.debug('Auto-sync: Upsell item detected, delaying removal check');

        setTimeout(async () => {
          const updatedState = useCartStore.getState();

          // Re-check for synced packages after delay
          let stillNoSyncedPackages = true;
          this.syncPackageIds.forEach(syncId => {
            const syncedItem = updatedState.items.find(item =>
              item.packageId === syncId ||
              item.originalPackageId === syncId
            );
            if (syncedItem) {
              stillNoSyncedPackages = false;
            }
          });

          // Also check if item still exists and swap is not in progress
          const itemStillExists = updatedState.items.find(item => item.packageId === this.packageId);

          if (stillNoSyncedPackages && itemStillExists && !updatedState.swapInProgress) {
            this.logger.debug('Auto-sync: After delay, still no synced packages - removing upsell');
            await this.removeFromCart();
          } else {
            this.logger.debug('Auto-sync: After delay, conditions changed - keeping upsell');
          }
        }, 500); // 500ms delay to let profile operations complete
      } else {
        // For non-upsells, remove immediately
        this.logger.debug('Auto-sync: No synced packages found and not swapping - removing item');
        await this.removeFromCart();
      }
    } else if (currentItem && cartState.swapInProgress) {
      // Swap in progress - don't remove yet
      this.logger.debug('Auto-sync: Swap in progress - keeping item for now');
    }
  }

  private isInCart(cartState: CartState): boolean {
    if (this.packageId) {
      return cartState.items.some(item => item.packageId === this.packageId);
    }
    return false;
  }

  private setLoadingState(loading: boolean): void {
    if (loading) {
      this.addClass('next-loading');
      this.setAttribute('disabled', 'true');
    } else {
      this.removeClass('next-loading');
      this.removeAttribute('disabled');
    }
  }

  public update(): void {
    this.updateState(useCartStore.getState());
  }

  protected override cleanupEventListeners(): void {
    if (this.clickHandler) {
      this.element.removeEventListener('click', this.clickHandler);
    }
  }
}