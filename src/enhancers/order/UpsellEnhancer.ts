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
import type { AddUpsellLine } from '@/types/api';

export class UpsellEnhancer extends BaseEnhancer {
  private static pageViewTracked = false;
  private static currentPagePath: string | null = null;
  private apiClient!: ApiClient;
  private packageId?: number; // Optional for selector mode
  private quantity: number = 1;
  private actionButtons: HTMLElement[] = [];
  private clickHandler?: (event: Event) => void;
  
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
    
    // Find all option elements
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
    // Update visual state for card options
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
    
    // Emit selection event
    this.eventBus.emit('upsell-selector:item-selected', {
      selectorId: this.selectorId || '',
      packageId: packageId
    });
    
    // Store on element for external access
    (this.element as any)._selectedPackageId = packageId;
    
    this.logger.debug('Upsell option selected:', { packageId, selectorId: this.selectorId });
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
          this.quantityBySelectorId.set(quantitySelectorId, Math.min(10, currentQty + 1));
          this.currentQuantitySelectorId = quantitySelectorId;
        } else {
          this.quantity = Math.min(10, this.quantity + 1);
        }
        this.updateQuantityDisplay();
      });
    }
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        if (quantitySelectorId) {
          const currentQty = this.quantityBySelectorId.get(quantitySelectorId) || 1;
          this.quantityBySelectorId.set(quantitySelectorId, Math.max(1, currentQty - 1));
          this.currentQuantitySelectorId = quantitySelectorId;
        } else {
          this.quantity = Math.max(1, this.quantity - 1);
        }
        this.updateQuantityDisplay();
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
        });
        
        // Set initial state
        if (qty === this.quantity) {
          toggle.classList.add('next-selected');
        }
      }
    });
  }
  
  private updateQuantityDisplay(): void {
    const display = this.element.querySelector('[data-next-upsell-quantity="display"]');
    if (display) {
      // Get the selector ID for this display
      const displaySelectorId = display.getAttribute('data-next-quantity-selector-id') || 
                               this.currentQuantitySelectorId || 
                               this.selectorId;
      
      if (displaySelectorId && this.quantityBySelectorId.has(displaySelectorId)) {
        display.textContent = this.quantityBySelectorId.get(displaySelectorId)!.toString();
      } else {
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

  private setupEventHandlers(): void {
    this.clickHandler = this.handleActionClick.bind(this);
    
    this.actionButtons.forEach(button => {
      button.addEventListener('click', this.clickHandler!);
    });
  }

  private async handleActionClick(event: Event): Promise<void> {
    event.preventDefault();
    
    const button = event.currentTarget as HTMLElement;
    const action = button.getAttribute('data-next-upsell-action') || '';
    
    // Get next URL for navigation after action (support legacy data-os-next-url)
    const nextUrl = button.getAttribute('data-next-url') || 
                   button.getAttribute('data-next-next-url') || 
                   button.getAttribute('data-os-next-url') || undefined;
    
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
          return;
        }
      } else {
        this.showError('Unable to add upsell at this time');
        return;
      }
    }
    
    // Determine which package to add
    const packageToAdd = this.isSelector ? this.selectedPackageId : this.packageId;
    
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
      this.setProcessingState(true);
      this.emit('upsell:adding', { packageId: packageToAdd });
      
      // Get the appropriate quantity
      let quantityToUse = this.quantity;
      if (this.selectorId && this.quantityBySelectorId.has(this.selectorId)) {
        quantityToUse = this.quantityBySelectorId.get(this.selectorId)!;
      }
      
      // Build upsell data
      const upsellData: AddUpsellLine = {
        lines: [{
          package_id: packageToAdd,
          quantity: quantityToUse
        }]
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
        } else {
          // Fallback: get price from campaign store
          const packageData = useCampaignStore.getState().getPackage(packageToAdd);
          if (packageData?.price) {
            upsellValue = parseFloat(packageData.price) * this.quantity;
          }
        }
        
        this.emit('upsell:added', { 
          packageId: packageToAdd,
          quantity: quantityToUse,
          order: updatedOrder,
          value: upsellValue
        });
        
        // Navigate to next URL if provided
        if (nextUrl) {
          this.navigateToUrl(nextUrl, updatedOrder.ref_id);
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
    } finally {
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
    return new Promise((resolve) => {
      // Create modal backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'next-modal-backdrop';
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease-out;
      `;
      
      // Create modal content
      const modal = document.createElement('div');
      modal.className = 'next-modal';
      modal.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
        animation: slideIn 0.3s ease-out;
      `;
      
      modal.innerHTML = `
        <div style="text-align: center;">
          <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a202c;">
            Already Added!
          </h3>
          <p style="margin: 0 0 24px 0; color: #4a5568; line-height: 1.5;">
            You've already added this item to your order. Would you like to add it again?
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="next-modal-cancel" style="
              padding: 10px 20px;
              border: 1px solid #e2e8f0;
              background: white;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              color: #4a5568;
              transition: all 0.2s;
            ">Skip to Next</button>
            <button class="next-modal-confirm" style="
              padding: 10px 20px;
              border: none;
              background: #3182ce;
              color: white;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            ">Yes, Add Again</button>
          </div>
        </div>
      `;
      
      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .next-modal-cancel:hover {
          border-color: #cbd5e0 !important;
          background: #f7fafc !important;
        }
        .next-modal-confirm:hover {
          background: #2c5282 !important;
        }
      `;
      document.head.appendChild(style);
      
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
      
      // Handle button clicks
      const cancelBtn = modal.querySelector('.next-modal-cancel') as HTMLButtonElement;
      const confirmBtn = modal.querySelector('.next-modal-confirm') as HTMLButtonElement;
      
      const cleanup = () => {
        backdrop.remove();
        style.remove();
      };
      
      cancelBtn.addEventListener('click', () => {
        cleanup();
        this.logger.info('User declined to add duplicate upsell');
        resolve(false);
      });
      
      confirmBtn.addEventListener('click', () => {
        cleanup();
        this.logger.info('User confirmed to add duplicate upsell');
        resolve(true);
      });
      
      // Also close on backdrop click
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          cleanup();
          resolve(false);
        }
      });
    });
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
  }

  public override destroy(): void {
    this.actionButtons = [];
    super.destroy();
  }
}