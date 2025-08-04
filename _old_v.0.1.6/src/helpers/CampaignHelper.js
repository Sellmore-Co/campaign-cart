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
    
    if (!this.#app.eventManager) {
      this.#logger.warn('Cannot trigger view_item_list: EventManager not found');
      return;
    }
    
    // Use the new viewVisibleItemList method if available, otherwise fall back to the old method
    if (typeof this.#app.eventManager.viewVisibleItemList === 'function') {
      this.#logger.debug('Manually triggering viewVisibleItemList event');
      this.#app.eventManager.viewVisibleItemList();
    } else if (this.#app.events?.viewItemList) {
      this.#logger.debug('Falling back to events.viewItemList method');
      this.#app.events.viewItemList(this.#app.campaignData);
    } else {
      this.#logger.warn('No suitable method found to trigger view_item_list event');
    }
    
    this.#viewItemListFired = true;
  }
}