/**
 * Accept Upsell Enhancer
 * Handles buttons that accept upsell offers after order completion
 * 
 * Attributes:
 * - data-next-action="accept-upsell" (required)
 * - data-next-package-id: Direct package ID to add as upsell
 * - data-next-selector-id: ID of selector to get package from
 * - data-next-quantity: Quantity to add (default: 1)
 * - data-next-url: URL to redirect to after accepting
 */

import { BaseActionEnhancer } from '@/enhancers/base/BaseActionEnhancer';
import { useOrderStore } from '@/stores/orderStore';
import { useConfigStore } from '@/stores/configStore';
import { ApiClient } from '@/api/client';
import { preserveQueryParams } from '@/utils/url-utils';
import type { AddUpsellLine } from '@/types/api';
import type { SelectorItem } from '@/types/global';
import { sentryManager } from '@/utils/monitoring/SentryManager';

export class AcceptUpsellEnhancer extends BaseActionEnhancer {
  private packageId?: number;
  private quantity: number = 1;
  private selectorId?: string;
  private nextUrl?: string;
  private apiClient?: ApiClient;
  private selectedItem?: SelectorItem | null;
  private clickHandler?: (event: Event) => void;

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
    
    const nextUrlAttr = this.getAttribute('data-next-url');
    if (nextUrlAttr) {
      this.nextUrl = nextUrlAttr;
    }
    
    // Initialize API client
    const config = useConfigStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    
    // Set up click handler
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener('click', this.clickHandler);
    
    // Listen to selector events if we have a selector ID
    if (this.selectorId) {
      this.setupSelectorListener();
    }
    
    // Subscribe to order store changes
    this.subscribe(useOrderStore, () => this.updateButtonState());
    
    // Initial state
    this.updateButtonState();
    
    this.logger.debug('AcceptUpsellEnhancer initialized', {
      packageId: this.packageId,
      selectorId: this.selectorId,
      quantity: this.quantity,
      nextUrl: this.nextUrl
    });
  }

  private setupSelectorListener(): void {
    // Add small delay to ensure selector is initialized first
    setTimeout(() => {
      const selectorElement = this.findSelectorElement();
      
      if (!selectorElement) {
        this.logger.warn(`Selector with id "${this.selectorId}" not found. Button may not work properly.`);
      } else {
        // Get initial selected item
        this.selectedItem = this.getSelectedItemFromElement(selectorElement);
        this.updateButtonState();
      }
    }, 100);
    
    // Listen to upsell selector events
    this.eventBus.on('upsell-selector:item-selected', this.handleSelectorChange.bind(this));
    this.eventBus.on('selector:item-selected', this.handleSelectorChange.bind(this));
    this.eventBus.on('selector:selection-changed', this.handleSelectorChange.bind(this));
  }

  private findSelectorElement(): HTMLElement | null {
    return document.querySelector(
      `[data-next-upsell-selector][data-next-selector-id="${this.selectorId}"], ` +
      `[data-next-upsell-select="${this.selectorId}"], ` +
      `[data-next-upsell][data-next-selector-id="${this.selectorId}"]`
    );
  }

  private getSelectedItemFromElement(element: HTMLElement): SelectorItem | null {
    // Try getter methods first (more reliable)
    const getSelectedPackageId = (element as any)._getSelectedPackageId;
    if (typeof getSelectedPackageId === 'function') {
      const packageId = getSelectedPackageId();
      if (packageId) {
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
    
    // Fallback to direct property access
    const selectedPackageId = (element as any)._selectedPackageId;
    if (selectedPackageId) {
      return {
        packageId: selectedPackageId,
        quantity: 1,
        element: null as any,
        price: undefined,
        name: undefined,
        isPreSelected: false,
        shippingId: undefined
      };
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
    const orderStore = useOrderStore.getState();
    
    // Enable if order supports upsells
    const canAddUpsells = orderStore.canAddUpsells();
    
    // Also need to have either direct package or selection
    const hasPackage = !!(this.packageId || this.selectedItem);
    
    this.setEnabled(canAddUpsells && hasPackage);
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
    
    await this.executeAction(
      async () => {
        await sentryManager.startSpan(
          {
            op: 'ui.click',
            name: 'Accept Upsell Button Click',
            attributes: {
              'button.package_id': this.packageId,
              'button.selector_id': this.selectorId,
              'button.quantity': this.quantity
            }
          },
          async () => {
            await this.acceptUpsell();
          }
        );
      },
      { showLoading: true, disableOnProcess: true }
    );
  }

  private async acceptUpsell(): Promise<void> {
    const orderStore = useOrderStore.getState();
    
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
      this.logger.warn('No package ID available for accept-upsell action');
      return;
    }
    
    if (!orderStore.order || !this.apiClient) {
      this.logger.error('No order loaded or API client not initialized');
      return;
    }
    
    // Check if this upsell has already been accepted
    const isAlreadyAccepted = this.checkIfUpsellAlreadyAccepted(packageIdToAdd);
    
    if (isAlreadyAccepted) {
      // Show confirmation dialog
      const shouldProceed = await this.showDuplicateUpsellDialog();
      
      if (!shouldProceed) {
        // User declined to add duplicate - skip to next page if URL provided
        if (this.nextUrl) {
          const redirectUrl = preserveQueryParams(this.nextUrl);
          window.location.href = redirectUrl;
        }
        return;
      }
    }
    
    try {
      const upsellData: AddUpsellLine = {
        lines: [{
          package_id: packageIdToAdd,
          quantity: quantityToAdd
        }]
      };
      
      // Store previous order lines before update
      const previousLineIds = orderStore.order.lines?.map((line: any) => line.id) || [];
      
      // Call addUpsell method on orderStore
      const updatedOrder = await orderStore.addUpsell(upsellData, this.apiClient!);
      
      if (!updatedOrder) {
        throw new Error('Failed to add upsell');
      }
      
      // Calculate the value of the upsell from the response
      // Find the newly added upsell line (it should have is_upsell: true)
      const addedLine = updatedOrder.lines?.find((line: any) => 
        line.is_upsell && !previousLineIds.includes(line.id)
      );
      
      // Use price_incl_tax and convert from string to number
      const upsellValue = addedLine?.price_incl_tax ? parseFloat(addedLine.price_incl_tax) : 0;
      
      // Emit success event
      this.eventBus.emit('upsell:accepted', {
        packageId: packageIdToAdd,
        quantity: quantityToAdd,
        orderId: orderStore.order.ref_id,
        value: upsellValue
      });
      
      // Redirect if URL provided
      if (this.nextUrl) {
        const redirectUrl = preserveQueryParams(this.nextUrl);
        window.location.href = redirectUrl;
      }
    } catch (error) {
      this.logger.error('Failed to accept upsell:', error);
      throw error;
    }
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

  public update(_data?: any): void {
    // No-op for action enhancers
  }

  public override destroy(): void {
    if (this.clickHandler) {
      this.element.removeEventListener('click', this.clickHandler);
    }
    
    
    if (this.selectorId) {
      this.eventBus.off('upsell-selector:item-selected', this.handleSelectorChange.bind(this));
      this.eventBus.off('selector:item-selected', this.handleSelectorChange.bind(this));
      this.eventBus.off('selector:selection-changed', this.handleSelectorChange.bind(this));
    }
    
    super.destroy();
  }
}