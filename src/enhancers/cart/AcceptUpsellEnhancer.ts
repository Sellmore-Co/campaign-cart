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
import { useCampaignStore } from '@/stores/campaignStore';
import { ApiClient } from '@/api/client';
import { preserveQueryParams } from '@/utils/url-utils';
import { GeneralModal } from '@/components/modals/GeneralModal';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import type { AddUpsellLine } from '@/types/api';
import type { SelectorItem } from '@/types/global';

export class AcceptUpsellEnhancer extends BaseActionEnhancer {
  private packageId?: number;
  private quantity: number = 1;
  private selectorId?: string;
  private nextUrl?: string;
  private apiClient?: ApiClient;
  private selectedItem?: SelectorItem | null;
  private clickHandler?: (event: Event) => void;
  private loadingOverlay: LoadingOverlay;
  private pageShowHandler?: (event: PageTransitionEvent) => void;

  constructor(element: HTMLElement) {
    super(element);
    this.loadingOverlay = new LoadingOverlay();
  }

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Handle browser back button - hide loading overlay when page is shown from bfcache
    this.pageShowHandler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        this.loadingOverlay.hide(true); // Hide immediately
        this.setEnabled(true); // Re-enable the button
      }
    };
    window.addEventListener('pageshow', this.pageShowHandler);
    
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
        await this.acceptUpsell();
      },
      { showLoading: false, disableOnProcess: true } // Use our own loading overlay
    );
  }

  /**
   * Public method to trigger upsell acceptance programmatically
   * This can be called from external code (like window.next.addUpsell)
   */
  public async triggerAcceptUpsell(): Promise<void> {
    await this.executeAction(
      async () => {
        await this.acceptUpsell();
      },
      { showLoading: false, disableOnProcess: true } // Use our own loading overlay
    );
  }

  private getCurrency(): string {
    const campaignState = useCampaignStore.getState();
    if (campaignState?.data?.currency) {
      return campaignState.data.currency;
    }
    const configStore = useConfigStore.getState();
    return configStore?.selectedCurrency || configStore?.detectedCurrency || 'USD';
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
        let declineUrl = this.nextUrl;
        
        // Fallback to decline meta tag if no URL provided
        if (!declineUrl) {
          const declineMeta = document.querySelector('meta[name="next-upsell-decline-url"]');
          declineUrl = declineMeta?.getAttribute('content') || undefined;
          
          if (declineUrl) {
            this.logger.debug('Using fallback decline URL from meta tag:', declineUrl);
          }
        }
        
        if (declineUrl) {
          const redirectUrl = preserveQueryParams(declineUrl);
          window.location.href = redirectUrl;
        }
        return;
      }
    }
    
    try {
      // Show loading overlay
      this.loadingOverlay.show();
      
      const upsellData: AddUpsellLine = {
        lines: [{
          package_id: packageIdToAdd,
          quantity: quantityToAdd
        }],
        currency: this.getCurrency()
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
      let redirectUrl = this.nextUrl;
      
      // Fallback to meta tag if no URL provided
      if (!redirectUrl) {
        const acceptMeta = document.querySelector('meta[name="next-upsell-accept-url"]');
        redirectUrl = acceptMeta?.getAttribute('content') || undefined;
        
        if (redirectUrl) {
          this.logger.debug('Using fallback accept URL from meta tag:', redirectUrl);
        }
      }
      
      if (redirectUrl) {
        const finalUrl = preserveQueryParams(redirectUrl);
        // LoadingOverlay will hide after 3 seconds on success before navigation
        window.location.href = finalUrl;
      } else {
        // Hide overlay after 3 seconds if no navigation
        this.loadingOverlay.hide();
      }
    } catch (error) {
      this.logger.error('Failed to accept upsell:', error);
      this.loadingOverlay.hide(true); // Hide immediately on error
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
    const result = await GeneralModal.showDuplicateUpsell();
    this.logger.info(result ? 'User confirmed to add duplicate upsell' : 'User declined to add duplicate upsell');
    return result;
  }

  public update(_data?: any): void {
    // No-op for action enhancers
  }

  public override destroy(): void {
    if (this.clickHandler) {
      this.element.removeEventListener('click', this.clickHandler);
    }
    
    // Remove pageshow listener
    if (this.pageShowHandler) {
      window.removeEventListener('pageshow', this.pageShowHandler);
    }
    
    if (this.selectorId) {
      this.eventBus.off('upsell-selector:item-selected', this.handleSelectorChange.bind(this));
      this.eventBus.off('selector:item-selected', this.handleSelectorChange.bind(this));
      this.eventBus.off('selector:selection-changed', this.handleSelectorChange.bind(this));
    }
    
    super.destroy();
  }
}