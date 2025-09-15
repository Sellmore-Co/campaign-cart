/**
 * Upsell Enhancer
 * Handles post-purchase upsell functionality for completed orders
 * 
 * Supports both direct and selector modes:
 * - Direct mode: Single package with yes/no choice
 * - Selector mode: Multiple options to choose from
 * 
 * Features:
 * - Automatic mode detection based on attributes
 * - Integration with order store for upsell tracking
 * - Navigation support after upsell actions
 * - State management (processing, success, error)
 * 
 * Display is handled by ProductDisplayEnhancer automatically:
 * 
 * Direct mode:
 * <div data-next-upsell="offer" data-next-package-id="123">
 *   <span data-next-display="package.name">Product Name</span>
 *   <span data-next-display="package.price">$19.99</span>
 *   <button data-next-upsell-action="add">Add to Order</button>
 * </div>
 * 
 * Selector mode:
 * <div data-next-upsell-selector data-next-selector-id="protection">
 *   <div data-next-upsell-option data-next-package-id="123">Option 1</div>
 *   <div data-next-upsell-option data-next-package-id="456">Option 2</div>
 *   <button data-next-upsell-action="add">Add Selected</button>
 * </div>
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useOrderStore } from '@/stores/orderStore';
import { useConfigStore } from '@/stores/configStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { ApiClient } from '@/api/client';
import { preserveQueryParams } from '@/utils/url-utils';
import { GeneralModal } from '@/components/modals/GeneralModal';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import type { AddUpsellLine } from '@/types/api';

export class UpsellEnhancer extends BaseEnhancer {
  private static pageViewTracked = false;
  private static currentPagePath: string | null = null;
  private apiClient!: ApiClient;
  private packageId?: number; // Optional for selector mode
  private quantity: number = 1;
  private actionButtons: HTMLElement[] = [];
  private clickHandler?: (event: Event) => void;
  private keydownHandler?: (event: KeyboardEvent) => void;
  private loadingOverlay: LoadingOverlay;
  private pageShowHandler?: (event: PageTransitionEvent) => void;
  private isProcessing: boolean = false;

  constructor(element: HTMLElement) {
    super(element);
    this.loadingOverlay = new LoadingOverlay();
  }
  
  // Selector mode properties
  private isSelector: boolean = false;
  private selectorId?: string;
  private options: Map<number, HTMLElement> = new Map();
  private selectedPackageId?: number;
  private currentPagePath?: string;
  
  // Quantity management per selector
  private quantityBySelectorId: Map<string, number> = new Map();
  private currentQuantitySelectorId?: string;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Handle browser back button - hide loading overlay when page is shown from bfcache
    this.pageShowHandler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        this.loadingOverlay.hide(true); // Hide immediately
        this.isProcessing = false; // Reset processing flag
        this.setProcessingState(false); // Reset processing state
      }
    };
    window.addEventListener('pageshow', this.pageShowHandler);
    
    // Check if this is an upsell page and track it
    // Delay to ensure analytics system is initialized
    setTimeout(() => {
      this.trackUpsellPageView();
    }, 100);
    
    // Check if this is a selector mode
    this.selectorId = this.getAttribute('data-next-selector-id') || '';
    this.isSelector = !!this.selectorId;
    
    if (this.isSelector) {
      // Selector mode - no direct package ID needed
      this.initializeSelectorMode();
    } else {
      // Direct mode - requires package ID
      const packageIdAttr = this.getAttribute('data-next-package-id');
      
      if (!packageIdAttr) {
        throw new Error('UpsellEnhancer requires data-next-package-id attribute (or use selector mode with data-next-selector-id)');
      }
      
      this.packageId = parseInt(packageIdAttr, 10);
      if (isNaN(this.packageId)) {
        throw new Error('Invalid package ID provided');
      }
      
      // Mark this upsell as viewed (for internal tracking only)
      const orderStore = useOrderStore.getState();
      if (orderStore.order) {
        orderStore.markUpsellViewed(this.packageId.toString());
      }
      // NO analytics event here - we only track page-level views
    }
    
    // Get quantity (optional, defaults to 1)
    const quantityAttr = this.getAttribute('data-next-quantity');
    if (quantityAttr) {
      this.quantity = parseInt(quantityAttr, 10) || 1;
    }
    
    // Initialize API client
    const config = useConfigStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    
    // Scan for upsell elements
    this.scanUpsellElements();
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Subscribe to stores
    this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));
    // Campaign updates are handled by ProductDisplayEnhancer for any display elements
    
    // Listen for quantity changes from other containers
    this.eventBus.on('upsell:quantity-changed', (data) => {
      // Match by selector ID if both have one, otherwise match by package ID
      const shouldSync = (this.selectorId && data.selectorId === this.selectorId) ||
                        (!this.selectorId && !data.selectorId && this.packageId && data.packageId === this.packageId);
      
      if (shouldSync) {
        if (this.selectorId) {
          // Update our local quantity map for selector-based sync
          this.quantityBySelectorId.set(this.selectorId, data.quantity);
          this.currentQuantitySelectorId = this.selectorId;
        } else {
          // Update quantity directly for package-based sync
          this.quantity = data.quantity;
        }
        // Update displays
        this.updateQuantityDisplay();
      }
    });
    
    // Listen for option selection changes from other containers
    // This handles both the main selector and any nested selectors
    this.eventBus.on('upsell:option-selected', (data) => {
      // Check if this event is for a selector within our container or a matching selector elsewhere
      const ourSelectors = this.element.querySelectorAll('[data-next-selector-id]');
      let shouldUpdate = false;
      
      ourSelectors.forEach(selector => {
        const selectorId = selector.getAttribute('data-next-selector-id');
        if (selectorId === data.selectorId) {
          shouldUpdate = true;
        }
      });
      
      // Also check if our main selector matches
      if (this.selectorId === data.selectorId) {
        shouldUpdate = true;
      }
      
      if (shouldUpdate) {
        // Update our local state
        this.selectedPackageId = data.packageId;
        this.packageId = data.packageId;
        
        // Update visual state of our options
        this.options.forEach((element, id) => {
          if (id === data.packageId) {
            element.classList.add('next-selected');
            element.setAttribute('data-next-selected', 'true');
          } else {
            element.classList.remove('next-selected');
            element.setAttribute('data-next-selected', 'false');
          }
        });
      }
    });
    
    // Initial state update
    this.updateUpsellDisplay();
    
    this.logger.debug('UpsellEnhancer initialized', {
      mode: this.isSelector ? 'selector' : 'direct',
      packageId: this.packageId,
      selectorId: this.selectorId,
      quantity: this.quantity,
      actionButtons: this.actionButtons.length,
      options: this.options.size,
      currentPagePath: this.currentPagePath
    });
    
    this.emit('upsell:initialized', { 
      packageId: this.packageId || 0,
      element: this.element 
    });
  }

  private trackUpsellPageView(): void {
    // Check if this is an upsell page by looking for the meta tag
    const pageTypeMeta = document.querySelector('meta[name="next-page-type"]');
    if (pageTypeMeta && pageTypeMeta.getAttribute('content') === 'upsell') {
      // Get the current page path
      this.currentPagePath = window.location.pathname;
      
      // Only track if we haven't already tracked this specific page
      if (!UpsellEnhancer.pageViewTracked || UpsellEnhancer.currentPagePath !== this.currentPagePath) {
        UpsellEnhancer.pageViewTracked = true;
        UpsellEnhancer.currentPagePath = this.currentPagePath;
        
        // Track this page view
        const orderStore = useOrderStore.getState();
        if (orderStore.order) {
          orderStore.markUpsellPageViewed(this.currentPagePath);
          this.logger.debug('Tracked upsell page view:', this.currentPagePath);
          
          // Emit event for analytics - page level only, no package ID
          this.eventBus.emit('upsell:viewed', {
            pagePath: this.currentPagePath,
            orderId: orderStore.order.ref_id
          });
        }
      }
    }
  }
  
  private initializeSelectorMode(): void {
    // Initialize quantity for this selector if not already done
    if (this.selectorId && !this.quantityBySelectorId.has(this.selectorId)) {
      this.quantityBySelectorId.set(this.selectorId, this.quantity);
    }
    
    // Find all option elements (including those in nested selectors)
    const optionElements = this.element.querySelectorAll('[data-next-upsell-option]');
    
    optionElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const packageIdAttr = element.getAttribute('data-next-package-id');
        if (packageIdAttr) {
          const packageId = parseInt(packageIdAttr, 10);
          if (!isNaN(packageId)) {
            this.options.set(packageId, element);
            
            // Add click handler for option
            element.addEventListener('click', () => this.selectOption(packageId));
            
            // Check if pre-selected
            if (element.getAttribute('data-next-selected') === 'true') {
              this.selectOption(packageId);
            }
          }
        }
      }
    });
    
    // Also check for select element (either as main element or child)
    let selectElement: HTMLSelectElement | null = null;
    
    if (this.element.tagName === 'SELECT') {
      selectElement = this.element as HTMLSelectElement;
    } else {
      // Look for select element with matching selector ID
      selectElement = this.element.querySelector(`[data-next-upsell-select="${this.selectorId}"]`) as HTMLSelectElement;
    }
    
    if (selectElement) {
      selectElement.addEventListener('change', () => {
        const value = selectElement.value;
        if (value) {
          const packageId = parseInt(value, 10);
          if (!isNaN(packageId)) {
            this.selectOption(packageId);
          }
        } else {
          delete this.selectedPackageId;
          delete this.packageId;
        }
      });
      
      // Check initial selection
      if (selectElement.value) {
        const packageId = parseInt(selectElement.value, 10);
        if (!isNaN(packageId)) {
          this.selectOption(packageId);
        }
      }
    }
  }
  
  private selectOption(packageId: number): void {
    // Update visual state for card options in THIS container
    this.options.forEach((element, id) => {
      if (id === packageId) {
        element.classList.add('next-selected');
        element.setAttribute('data-next-selected', 'true');
      } else {
        element.classList.remove('next-selected');
        element.setAttribute('data-next-selected', 'false');
      }
    });
    
    this.selectedPackageId = packageId;
    this.packageId = packageId; // Set for compatibility
    
    // Find the actual selector ID from the option's parent selector element
    let actualSelectorId = this.selectorId;
    const selectedOption = this.options.get(packageId);
    if (selectedOption) {
      const parentSelector = selectedOption.closest('[data-next-selector-id]');
      if (parentSelector) {
        actualSelectorId = parentSelector.getAttribute('data-next-selector-id') || this.selectorId;
      }
    }
    
    // Emit selection event for both old and new event names
    this.eventBus.emit('upsell-selector:item-selected', {
      selectorId: actualSelectorId || '',
      packageId: packageId
    });
    
    // Emit new event for cross-container sync
    this.eventBus.emit('upsell:option-selected', {
      selectorId: actualSelectorId || '',
      packageId: packageId
    });
    
    // Sync option selection across all containers with same selector
    if (actualSelectorId) {
      this.syncOptionSelectionAcrossContainers(actualSelectorId, packageId);
    }
    
    // Store on element for external access
    (this.element as any)._selectedPackageId = packageId;
    
    this.logger.debug('Upsell option selected:', { packageId, selectorId: actualSelectorId });
  }

  private scanUpsellElements(): void {
    // Scan for action buttons
    const actionSelectors = [
      '[data-next-upsell-action]'
    ];
    
    actionSelectors.forEach(selector => {
      this.element.querySelectorAll(selector).forEach(element => {
        if (element instanceof HTMLElement) {
          this.actionButtons.push(element);
          this.logger.debug('Found upsell action button:', element);
        }
      });
    });
    
    // Scan for quantity controls
    const increaseBtn = this.element.querySelector('[data-next-upsell-quantity="increase"]');
    const decreaseBtn = this.element.querySelector('[data-next-upsell-quantity="decrease"]');
    
    // Check if quantity controls should be tied to a specific selector
    const quantitySelectorId = increaseBtn?.getAttribute('data-next-quantity-selector-id') || 
                              decreaseBtn?.getAttribute('data-next-quantity-selector-id') ||
                              this.selectorId;
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        if (quantitySelectorId) {
          const currentQty = this.quantityBySelectorId.get(quantitySelectorId) || 1;
          const newQty = Math.min(10, currentQty + 1);
          this.quantityBySelectorId.set(quantitySelectorId, newQty);
          this.currentQuantitySelectorId = quantitySelectorId;
          
          // Emit event for cross-container sync
          this.eventBus.emit('upsell:quantity-changed', {
            selectorId: quantitySelectorId,
            quantity: newQty,
            packageId: this.packageId
          });
        } else {
          this.quantity = Math.min(10, this.quantity + 1);
          // Emit event even without selector ID, using package ID for identification
          this.eventBus.emit('upsell:quantity-changed', {
            quantity: this.quantity,
            packageId: this.packageId
          });
        }
        this.updateQuantityDisplay();
        this.syncQuantityAcrossContainers(quantitySelectorId, this.packageId);
      });
    }
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        if (quantitySelectorId) {
          const currentQty = this.quantityBySelectorId.get(quantitySelectorId) || 1;
          const newQty = Math.max(1, currentQty - 1);
          this.quantityBySelectorId.set(quantitySelectorId, newQty);
          this.currentQuantitySelectorId = quantitySelectorId;
          
          // Emit event for cross-container sync
          this.eventBus.emit('upsell:quantity-changed', {
            selectorId: quantitySelectorId,
            quantity: newQty,
            packageId: this.packageId
          });
        } else {
          this.quantity = Math.max(1, this.quantity - 1);
          // Emit event even without selector ID, using package ID for identification
          this.eventBus.emit('upsell:quantity-changed', {
            quantity: this.quantity,
            packageId: this.packageId
          });
        }
        this.updateQuantityDisplay();
        this.syncQuantityAcrossContainers(quantitySelectorId, this.packageId);
      });
    }
    
    // Scan for quantity toggle cards
    const quantityToggles = this.element.querySelectorAll('[data-next-upsell-quantity-toggle]');
    quantityToggles.forEach(toggle => {
      if (toggle instanceof HTMLElement) {
        const qty = parseInt(toggle.getAttribute('data-next-upsell-quantity-toggle') || '1', 10);
        toggle.addEventListener('click', () => {
          this.quantity = qty;
          this.updateQuantityDisplay();
          this.updateQuantityToggles();
          
          // Emit event for cross-container sync and price updates
          this.eventBus.emit('upsell:quantity-changed', {
            selectorId: this.selectorId,
            quantity: this.quantity,
            packageId: this.packageId
          });
        });
        
        // Set initial state
        if (qty === this.quantity) {
          toggle.classList.add('next-selected');
        }
      }
    });
  }
  
  private updateQuantityDisplay(): void {
    // Determine which selector ID we're working with
    const selectorId = this.currentQuantitySelectorId || this.selectorId;
    
    if (selectorId && this.quantityBySelectorId.has(selectorId)) {
      // Update ALL displays across the page with this selector ID
      const allDisplays = document.querySelectorAll(
        `[data-next-upsell-quantity="display"][data-next-quantity-selector-id="${selectorId}"]`
      );
      
      const quantity = this.quantityBySelectorId.get(selectorId)!;
      
      allDisplays.forEach(display => {
        if (display instanceof HTMLElement) {
          display.textContent = quantity.toString();
        }
      });
      
      // Also update displays without selector ID within the current container
      const localDisplay = this.element.querySelector('[data-next-upsell-quantity="display"]:not([data-next-quantity-selector-id])');
      if (localDisplay && localDisplay instanceof HTMLElement) {
        localDisplay.textContent = quantity.toString();
      }
    } else {
      // Fallback: update only the display in current container
      const display = this.element.querySelector('[data-next-upsell-quantity="display"]');
      if (display) {
        display.textContent = this.quantity.toString();
      }
    }
  }
  
  private updateQuantityToggles(): void {
    const toggles = this.element.querySelectorAll('[data-next-upsell-quantity-toggle]');
    toggles.forEach(toggle => {
      if (toggle instanceof HTMLElement) {
        const qty = parseInt(toggle.getAttribute('data-next-upsell-quantity-toggle') || '1', 10);
        if (qty === this.quantity) {
          toggle.classList.add('next-selected');
        } else {
          toggle.classList.remove('next-selected');
        }
      }
    });
  }
  
  /**
   * Synchronize quantity across all containers with the same selector ID or package ID
   * This ensures all upsell containers for the same offer stay in sync
   */
  private syncQuantityAcrossContainers(selectorId?: string, packageId?: number): void {
    // Try selector-based sync first
    if (selectorId) {
      const quantity = this.quantityBySelectorId.get(selectorId);
      if (!quantity) return;
      
      // Update all option elements with this selector ID to reflect the new quantity
      const allOptions = document.querySelectorAll(
        `[data-next-selector-id="${selectorId}"] [data-next-upsell-option]`
      );
      
      allOptions.forEach(option => {
        if (option instanceof HTMLElement) {
          // Update the data-next-quantity attribute on each option
          option.setAttribute('data-next-quantity', quantity.toString());
        }
      });
      
      // Also sync any select elements
      const selectElements = document.querySelectorAll(
        `[data-next-upsell-select="${selectorId}"]`
      );
      
      selectElements.forEach(select => {
        if (select instanceof HTMLSelectElement) {
          // Update quantity data attribute on select options if needed
          const options = select.querySelectorAll('option[data-next-package-id]');
          options.forEach(option => {
            if (option instanceof HTMLOptionElement) {
              option.setAttribute('data-next-quantity', quantity.toString());
            }
          });
        }
      });
    } else if (packageId) {
      // Package-based sync for containers without selector ID
      // Find all containers with the same package ID
      const allContainers = document.querySelectorAll(
        `[data-next-upsell="offer"][data-next-package-id="${packageId}"]:not([data-next-selector-id])`
      );
      
      allContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          // Update quantity display in each container
          const display = container.querySelector('[data-next-upsell-quantity="display"]');
          if (display && display instanceof HTMLElement) {
            display.textContent = this.quantity.toString();
          }
        }
      });
    }
  }
  
  /**
   * Synchronize option selection across all containers with the same selector ID
   * This ensures all option groups stay in sync when one is selected
   */
  private syncOptionSelectionAcrossContainers(selectorId: string, selectedPackageId: number): void {
    // Find all option groups with this selector ID across the page
    const allSelectors = document.querySelectorAll(`[data-next-selector-id="${selectorId}"]`);
    
    allSelectors.forEach(selectorElement => {
      if (selectorElement instanceof HTMLElement) {
        // Find all options within this selector
        const options = selectorElement.querySelectorAll('[data-next-upsell-option]');
        
        options.forEach(option => {
          if (option instanceof HTMLElement) {
            const packageId = parseInt(option.getAttribute('data-next-package-id') || '0', 10);
            
            if (packageId === selectedPackageId) {
              // Mark as selected
              option.classList.add('next-selected');
              option.setAttribute('data-next-selected', 'true');
            } else {
              // Mark as not selected
              option.classList.remove('next-selected');
              option.setAttribute('data-next-selected', 'false');
            }
          }
        });
        
        // Also update any select elements
        const selectElement = selectorElement.querySelector('select');
        if (selectElement) {
          selectElement.value = selectedPackageId.toString();
        }
      }
    });
  }

  private setupEventHandlers(): void {
    this.clickHandler = this.handleActionClick.bind(this);
    
    this.actionButtons.forEach(button => {
      button.addEventListener('click', this.clickHandler!);
    });
    
    // Prevent Enter key submissions during processing
    this.keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && this.isProcessing) {
        event.preventDefault();
        event.stopPropagation();
        this.logger.debug('Enter key blocked - upsell is processing');
      }
    };
    
    // Add keydown listener to the entire element to catch Enter key presses
    this.element.addEventListener('keydown', this.keydownHandler, true);
  }

  private async handleActionClick(event: Event): Promise<void> {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (this.isProcessing) {
      this.logger.debug('Upsell action blocked - already processing');
      return;
    }
    
    const button = event.currentTarget as HTMLElement;
    const action = button.getAttribute('data-next-upsell-action') || '';
    
    // Get next URL for navigation after action (support legacy data-os-next-url)
    let nextUrl = button.getAttribute('data-next-url') || 
                  button.getAttribute('data-next-next-url') || 
                  button.getAttribute('data-os-next-url') || undefined;
    
    // Fallback to meta tags if no URL on button
    if (!nextUrl) {
      if (action === 'add' || action === 'accept') {
        const acceptMeta = document.querySelector('meta[name="next-upsell-accept-url"]');
        nextUrl = acceptMeta?.getAttribute('content') || undefined;
      } else if (action === 'skip' || action === 'decline') {
        const declineMeta = document.querySelector('meta[name="next-upsell-decline-url"]');
        nextUrl = declineMeta?.getAttribute('content') || undefined;
      }
      
      if (nextUrl) {
        this.logger.debug('Using fallback URL from meta tag:', nextUrl);
      }
    }
    
    this.logger.debug('Upsell action clicked:', { action, nextUrl });
    
    switch (action) {
      case 'add':
      case 'accept':
        await this.addUpsellToOrder(nextUrl);
        break;
      case 'skip':
      case 'decline':
        this.skipUpsell(nextUrl);
        break;
      default:
        this.logger.warn(`Unknown upsell action: ${action}`);
    }
  }

  private getCurrency(): string {
    const campaignState = useCampaignStore.getState();
    if (campaignState?.data?.currency) {
      return campaignState.data.currency;
    }
    const configStore = useConfigStore.getState();
    return configStore?.selectedCurrency || configStore?.detectedCurrency || 'USD';
  }

  private async addUpsellToOrder(nextUrl: string | null | undefined): Promise<void> {
    const orderStore = useOrderStore.getState();
    
    // Debug logging
    this.logger.debug('Order state check:', {
      hasOrder: !!orderStore.order,
      supportsUpsells: orderStore.order?.supports_post_purchase_upsells,
      isProcessingUpsell: orderStore.isProcessingUpsell,
      canAddUpsells: orderStore.canAddUpsells()
    });
    
    // Check if order supports upsells
    if (!orderStore.canAddUpsells()) {
      this.logger.warn('Order does not support upsells or is currently processing');
      
      // If stuck in processing, try to reset it
      if (orderStore.isProcessingUpsell && orderStore.order?.supports_post_purchase_upsells) {
        this.logger.warn('Processing flag stuck, resetting...');
        orderStore.setProcessingUpsell(false);
        // Try again after reset
        if (orderStore.canAddUpsells()) {
          this.logger.info('Reset successful, continuing with upsell...');
        } else {
          this.showError('Unable to add upsell at this time');
          // Navigate to next page anyway if URL is provided
          if (nextUrl) {
            this.logger.info('Navigating to next page despite error');
            setTimeout(() => this.navigateToUrl(nextUrl), 1000);
          }
          return;
        }
      } else {
        this.showError('Unable to add upsell at this time');
        // Navigate to next page anyway if URL is provided
        if (nextUrl) {
          this.logger.info('Navigating to next page despite error');
          setTimeout(() => this.navigateToUrl(nextUrl), 1000);
        }
        return;
      }
    }
    
    // Determine which package to add
    // If we have a selector but no selected package, fall back to the direct package ID
    const packageToAdd = this.isSelector ? (this.selectedPackageId || this.packageId) : this.packageId;
    
    // Check if this upsell has already been accepted
    if (packageToAdd && this.checkIfUpsellAlreadyAccepted(packageToAdd)) {
      // Show confirmation dialog
      const shouldProceed = await this.showDuplicateUpsellDialog();
      
      if (!shouldProceed) {
        // User declined to add duplicate - skip to next page if URL provided
        if (nextUrl) {
          this.navigateToUrl(nextUrl);
        }
        return;
      }
    }
    
    this.logger.debug('Package selection:', {
      isSelector: this.isSelector,
      packageId: this.packageId,
      selectedPackageId: this.selectedPackageId,
      packageToAdd: packageToAdd
    });
    
    if (!packageToAdd) {
      this.logger.warn('No package selected for upsell');
      this.showError('Please select an option first');
      return;
    }
    
    
    try {
      this.isProcessing = true;
      this.setProcessingState(true);
      this.loadingOverlay.show(); // Show loading overlay
      this.emit('upsell:adding', { packageId: packageToAdd });
      
      // Get the appropriate quantity
      let quantityToUse = this.quantity;
      if (this.selectorId && this.quantityBySelectorId.has(this.selectorId)) {
        quantityToUse = this.quantityBySelectorId.get(this.selectorId)!;
      } else if (this.currentQuantitySelectorId && this.quantityBySelectorId.has(this.currentQuantitySelectorId)) {
        // Also check if a specific quantity selector was recently used
        quantityToUse = this.quantityBySelectorId.get(this.currentQuantitySelectorId)!;
      }
      
      // Build upsell data
      const upsellData: AddUpsellLine = {
        lines: [{
          package_id: packageToAdd,
          quantity: quantityToUse
        }],
        currency: this.getCurrency()
      };
      
      this.logger.info('Adding upsell to order:', upsellData);
      
      // Add the upsell
      const updatedOrder = await orderStore.addUpsell(upsellData, this.apiClient);
      
      if (updatedOrder) {
        this.logger.info('Upsell added successfully');
        this.showSuccess();
        
        // Calculate the value of the added upsell
        let upsellValue = 0;
        
        // First try to find the newly added upsell line
        const previousLineIds = orderStore.order?.lines?.map((line: any) => line.id) || [];
        const addedLine = updatedOrder.lines?.find((line: any) => 
          line.is_upsell && !previousLineIds.includes(line.id)
        );
        
        if (addedLine?.price_incl_tax) {
          upsellValue = parseFloat(addedLine.price_incl_tax);
        }
        
        // Get package data for name and fallback price
        const packageData = useCampaignStore.getState().getPackage(packageToAdd);
        if (packageData) {
          if (!upsellValue && packageData.price) {
            upsellValue = parseFloat(packageData.price) * this.quantity;
          }
        }
        
        this.emit('upsell:added', { 
          packageId: packageToAdd,
          quantity: quantityToUse,
          order: updatedOrder,
          value: upsellValue,
          willRedirect: !!nextUrl
        });
        
        // Navigate to next URL if provided
        if (nextUrl) {
          // Give analytics time to fire before navigation
          setTimeout(() => {
            this.navigateToUrl(nextUrl, updatedOrder.ref_id);
          }, 100);  // 100ms delay to ensure events are queued
        } else {
          // Hide overlay after 3 seconds if no navigation
          this.loadingOverlay.hide();
        }
      } else {
        throw new Error('Failed to add upsell - no updated order returned');
      }
      
    } catch (error) {
      this.logger.error('Failed to add upsell:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to add upsell');
      this.emit('upsell:error', { 
        packageId: this.packageId || 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.loadingOverlay.hide(true); // Hide immediately on error
      
      // Navigate to next page anyway if URL is provided
      if (nextUrl) {
        this.logger.info('Navigating to next page despite API error');
        setTimeout(() => this.navigateToUrl(nextUrl), 1000);
      }
    } finally {
      this.isProcessing = false;
      this.setProcessingState(false);
    }
  }

  private skipUpsell(nextUrl: string | null | undefined): void {
    this.logger.info('Upsell skipped by user');
    this.addClass('next-skipped');
    this.disableActions();
    
    // Mark in order store journey
    if (this.packageId) {
      const orderStore = useOrderStore.getState();
      orderStore.markUpsellSkipped(this.packageId.toString(), this.currentPagePath);
    }
    
    const orderStore = useOrderStore.getState();
    const eventData: { packageId?: number; orderId?: string } = {};
    if (this.packageId !== undefined) {
      eventData.packageId = this.packageId;
    }
    if (orderStore.order?.ref_id !== undefined) {
      eventData.orderId = orderStore.order.ref_id;
    }
    this.emit('upsell:skipped', eventData);
    
    // Navigate to next URL if provided
    if (nextUrl) {
      this.navigateToUrl(nextUrl);
    }
  }
  
  /**
   * Navigate to a URL, preserving ref_id and debug parameters
   * @param url - The URL to navigate to
   * @param refId - Optional ref_id to preserve (defaults to current order ref_id)
   */
  private navigateToUrl(url: string, refId?: string): void {
    if (!url) {
      this.logger.warn('No URL provided for navigation');
      return;
    }
    
    try {
      const targetUrl = new URL(url, window.location.origin);
      const orderStore = useOrderStore.getState();
      
      // Use provided ref_id or get from current order
      const orderRefId = refId || orderStore.order?.ref_id;
      
      // Append the order reference ID if not already in the URL
      if (orderRefId && !targetUrl.searchParams.has('ref_id')) {
        targetUrl.searchParams.append('ref_id', orderRefId);
      }
      
      // Preserve debug and other important parameters
      const finalUrl = preserveQueryParams(targetUrl.href, ['debug', 'debugger', 'test']);
      this.logger.info(`Navigating to ${finalUrl}`);
      window.location.href = finalUrl;
      
    } catch (error) {
      this.logger.error('Invalid URL for navigation:', url, error);
      // Fallback: preserve params even for direct navigation
      const fallbackUrl = preserveQueryParams(url);
      window.location.href = fallbackUrl;
    }
  }

  private handleOrderUpdate(orderState: any): void {
    this.updateUpsellDisplay();
    
    // Handle upsell processing state
    if (orderState.isProcessingUpsell) {
      this.setProcessingState(true);
    } else {
      this.setProcessingState(false);
    }
    
    // Handle upsell errors
    if (orderState.upsellError) {
      this.showError(orderState.upsellError);
    }
  }


  private updateUpsellDisplay(): void {
    const orderStore = useOrderStore.getState();
    
    // Check if upsells are supported
    if (!orderStore.canAddUpsells()) {
      this.hideUpsellOffer();
      return;
    }
    
    // Show the upsell offer
    this.showUpsellOffer();
  }


  private setProcessingState(processing: boolean): void {
    if (processing) {
      this.addClass('next-processing');
      this.disableActions();
    } else {
      this.removeClass('next-processing');
      this.enableActions();
    }
  }

  private disableActions(): void {
    this.actionButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = true;
      }
      button.classList.add('next-disabled');
    });
  }

  private enableActions(): void {
    this.actionButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = false;
      }
      button.classList.remove('next-disabled');
    });
  }

  private showUpsellOffer(): void {
    this.removeClass('next-hidden');
    this.removeClass('next-error');
    this.addClass('next-available');
  }

  private hideUpsellOffer(): void {
    this.addClass('next-hidden');
    this.removeClass('next-available');
  }


  private showSuccess(): void {
    this.addClass('next-success');
    
    // Show success message temporarily
    setTimeout(() => {
      this.removeClass('next-success');
    }, 3000);
  }

  private showError(message: string): void {
    this.addClass('next-error');
    this.removeClass('next-processing');
    
    this.logger.error('Upsell error:', message);
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      this.removeClass('next-error');
    }, 5000);
  }

  private checkIfUpsellAlreadyAccepted(packageId: number): boolean {
    const orderStore = useOrderStore.getState();
    
    // Check in completed upsells
    if (orderStore.completedUpsells.includes(packageId.toString())) {
      return true;
    }
    
    // Also check in upsell journey for accepted items
    const acceptedInJourney = orderStore.upsellJourney.some(
      entry => entry.packageId === packageId.toString() && entry.action === 'accepted'
    );
    
    return acceptedInJourney;
  }

  private async showDuplicateUpsellDialog(): Promise<boolean> {
    const result = await GeneralModal.showDuplicateUpsell();
    this.logger.info(result ? 'User confirmed to add duplicate upsell' : 'User declined to add duplicate upsell');
    return result;
  }

  public update(): void {
    // Re-scan for new elements if DOM has changed
    this.scanUpsellElements();
    this.updateUpsellDisplay();
  }

  protected override cleanupEventListeners(): void {
    if (this.clickHandler) {
      this.actionButtons.forEach(button => {
        button.removeEventListener('click', this.clickHandler!);
      });
    }
    
    if (this.keydownHandler) {
      this.element.removeEventListener('keydown', this.keydownHandler, true);
    }
  }

  public override destroy(): void {
    // Remove pageshow listener
    if (this.pageShowHandler) {
      window.removeEventListener('pageshow', this.pageShowHandler);
    }
    
    this.actionButtons = [];
    super.destroy();
  }
}