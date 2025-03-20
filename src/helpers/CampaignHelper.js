/**
 * CampaignHelper - Utility class for working with campaign data
 * 
 * This class provides helper methods for accessing and using campaign data
 * that was retrieved during initialization.
 */

export class CampaignHelper {
  #app;
  #logger;
  #viewItemListFired = false;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('CAMPAIGN');
  }

  getCampaignData() {
    const campaignData = this.#app.campaignData;
    
    // If we have campaign data and the view_item_list event hasn't been fired yet,
    // trigger it now (but only if we have the EventManager initialized)
    if (campaignData && !this.#viewItemListFired && this.#app.events?.viewItemList) {
      this.#logger.debug('Triggering view_item_list event from getCampaignData');
      console.log('🔍 Triggering view_item_list from getCampaignData', campaignData);
      
      // Add a small delay to ensure everything is initialized
      setTimeout(() => {
        this.#app.events.viewItemList(campaignData);
        this.#viewItemListFired = true;
        console.log('✅ view_item_list triggered from getCampaignData');
      }, 500);
    }
    
    return campaignData;
  }

  getCampaignName() {
    return this.#app.campaignData?.name ?? '';
  }

  getCampaignId() {
    return this.#app.campaignData?.id ?? '';
  }

  getProducts() {
    const products = this.#app.campaignData?.products ?? [];
    
    // If we have products and the view_item_list event hasn't been fired yet,
    // trigger it now (but only if we have the EventManager initialized)
    if (products.length > 0 && !this.#viewItemListFired && this.#app.events?.viewItemList) {
      this.#logger.debug('Triggering view_item_list event from getProducts');
      console.log('🔍 Triggering view_item_list from getProducts', this.#app.campaignData);
      
      // Add a small delay to ensure everything is initialized
      setTimeout(() => {
        this.#app.events.viewItemList(this.#app.campaignData);
        this.#viewItemListFired = true;
        console.log('✅ view_item_list triggered from getProducts');
      }, 500);
    }
    
    return products;
  }

  getProductById(productId) {
    return this.getProducts().find(product => product.id === productId);
  }

  getCurrency() {
    return this.#app.campaignData?.currency ?? 'USD';
  }

  getLocale() {
    return this.#app.campaignData?.locale ?? 'en-US';
  }

  formatPrice(price) {
    if (typeof price !== 'number') return '';

    try {
      return new Intl.NumberFormat(this.getLocale(), {
        style: 'currency',
        currency: this.getCurrency()
      }).format(price);
    } catch (error) {
      this.#logger.error('Error formatting price:', error);
      return price.toString();
    }
  }
  
  /**
   * Manually trigger the view_item_list event
   */
  triggerViewItemList() {
    if (!this.#app.campaignData) {
      this.#logger.warn('Cannot trigger view_item_list: No campaign data available');
      return;
    }
    
    if (!this.#app.events?.viewItemList) {
      this.#logger.warn('Cannot trigger view_item_list: EventManager not initialized');
      return;
    }
    
    this.#logger.debug('Manually triggering view_item_list event');
    this.#app.events.viewItemList(this.#app.campaignData);
    this.#viewItemListFired = true;
  }
}