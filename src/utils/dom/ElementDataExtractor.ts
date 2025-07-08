import { parseValidPrice } from '@/utils/typeGuards';

export class ElementDataExtractor {
  private static readonly PRICE_SELECTORS = [
    '.pb-quantity__price.pb--current',
    '.price',
    '[data-next-display*="price"]',
    '.next-price',
    '.product-price',
    '.item-price'
  ];

  private static readonly NAME_SELECTORS = [
    '.card-title',
    'h1, h2, h3, h4, h5, h6',
    '.title',
    '.name',
    '[data-next-display*="name"]',
    '.product-name',
    '.item-name'
  ];

  /**
   * Extract price from an element using common price selectors
   */
  static extractPrice(element: HTMLElement): number | undefined {
    for (const selector of this.PRICE_SELECTORS) {
      const priceEl = element.querySelector(selector);
      if (priceEl?.textContent) {
        const price = parseValidPrice(priceEl.textContent.trim());
        if (price !== undefined) return price;
      }
    }
    return undefined;
  }

  /**
   * Extract name/title from an element using common selectors
   */
  static extractName(element: HTMLElement): string | undefined {
    for (const selector of this.NAME_SELECTORS) {
      const nameEl = element.querySelector(selector);
      const name = nameEl?.textContent?.trim();
      if (name) return name;
    }
    return undefined;
  }

  /**
   * Extract quantity from element attributes
   */
  static extractQuantity(element: HTMLElement): number {
    const qtyAttr = element.getAttribute('data-next-quantity') || 
                    element.getAttribute('data-quantity') ||
                    element.getAttribute('data-qty');
    return qtyAttr ? parseInt(qtyAttr, 10) || 1 : 1;
  }
}