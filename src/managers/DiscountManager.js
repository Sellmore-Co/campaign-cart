/**
 * DiscountManager - Manages discount calculations for vouchers/coupons
 * 
 * This class handles different types of discounts (percentage, fixed amount)
 * and provides methods to calculate discount amounts.
 */

export class DiscountManager {
  #app;
  #logger;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('DISCOUNT');
    this.#logger.info('DiscountManager initialized');
  }

  /**
   * Calculate discount amount based on coupon details and subtotal
   * @param {Object} couponDetails - Coupon details object
   * @param {number} subtotal - Cart subtotal before discount
   * @returns {number} Calculated discount amount
   */
  calculateDiscount(couponDetails, subtotal) {
    if (!couponDetails || !couponDetails.code) {
      return 0;
    }

    let discountAmount = 0;
    
    switch (couponDetails.type) {
      case 'percentage':
        // Calculate percentage discount
        discountAmount = subtotal * (couponDetails.value / 100);
        this.#logger.debug(`Applied ${couponDetails.value}% discount: -${discountAmount}`);
        break;
      case 'fixed':
        // Fixed amount discount (can't exceed subtotal)
        discountAmount = Math.min(subtotal, couponDetails.value);
        this.#logger.debug(`Applied fixed discount: -${discountAmount}`);
        break;
      case 'free_shipping':
        // Free shipping discount is handled separately in shipping calculations
        this.#logger.debug('Applied free shipping discount');
        break;
      default:
        this.#logger.warn(`Unknown discount type: ${couponDetails.type}`);
        break;
    }
    
    return discountAmount;
  }

  /**
   * Validates if a coupon can be applied to the cart
   * @param {string} couponCode - Coupon code to validate
   * @param {Object} cart - Cart object
   * @returns {boolean} Whether the coupon is valid
   */
  validateCoupon(couponCode, cart) {
    // This would typically call an API to validate the coupon
    // For now, we'll assume all coupons are valid
    return true;
  }

  /**
   * Get display text for a coupon
   * @param {Object} couponDetails - Coupon details
   * @returns {string} Display text for the coupon
   */
  getCouponDisplayText(couponDetails) {
    if (!couponDetails || !couponDetails.code) {
      return '';
    }

    switch (couponDetails.type) {
      case 'percentage':
        return `${couponDetails.code} (${couponDetails.value}% off)`;
      case 'fixed':
        return `${couponDetails.code} ($${couponDetails.value} off)`;
      case 'free_shipping':
        return `${couponDetails.code} (Free shipping)`;
      default:
        return couponDetails.code;
    }
  }
} 