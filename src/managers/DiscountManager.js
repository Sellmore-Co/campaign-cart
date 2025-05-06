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
   * @param {Array} cartItems - Array of cart items
   * @returns {number} Calculated discount amount
   */
  calculateDiscount(couponDetails, subtotal, cartItems = []) {
    if (!couponDetails || !couponDetails.code) {
      this.#logger.debug('No coupon details or code provided.');
      return 0;
    }

    let discountableSubtotal = subtotal;
    let itemEligibilityMessage = '';

    // Check for product-specific restrictions
    if (couponDetails.applicable_product_ids && Array.isArray(couponDetails.applicable_product_ids) && couponDetails.applicable_product_ids.length > 0) {
      this.#logger.debug(`Coupon "${couponDetails.code}" is product-specific. Applicable IDs: ${couponDetails.applicable_product_ids.join(', ')}`);
      const applicableItems = cartItems.filter(item => 
        couponDetails.applicable_product_ids.includes(item.package_id?.toString()) || // Prefer package_id
        couponDetails.applicable_product_ids.includes(item.id?.toString()) // Fallback to id if package_id isn't there
      );

      if (applicableItems.length === 0) {
        this.#logger.info(`Coupon "${couponDetails.code}" requires specific products not found in the cart. No discount applied.`);
        // Optionally, you might want to inform the user the coupon isn't valid for their cart items.
        // This could involve setting a message in the state or an event.
        return 0; // No discount if none of the required products are in the cart
      }

      // Calculate subtotal of only the applicable items
      discountableSubtotal = applicableItems.reduce((acc, item) => 
        acc + (item.price_total ?? (item.price * (item.quantity || 1))), 0);
      itemEligibilityMessage = ` on applicable items (subtotal: ${discountableSubtotal.toFixed(2)})`;
      this.#logger.debug(`Subtotal of applicable items for coupon "${couponDetails.code}": ${discountableSubtotal}`);
    } else {
      this.#logger.debug(`Coupon "${couponDetails.code}" is not product-specific or no cartItems provided for check.`);
    }

    let discountAmount = 0;
    
    switch (couponDetails.type) {
      case 'percentage':
        discountAmount = discountableSubtotal * (couponDetails.value / 100);
        this.#logger.debug(`Applied ${couponDetails.value}% discount${itemEligibilityMessage}: -${discountAmount.toFixed(2)}`);
        break;
      case 'fixed':
        discountAmount = Math.min(discountableSubtotal, couponDetails.value); // Ensure discount doesn't exceed the discountable subtotal
        this.#logger.debug(`Applied fixed discount${itemEligibilityMessage}: -${discountAmount.toFixed(2)}`);
        break;
      case 'free_shipping':
        this.#logger.debug('Applied free shipping discount (handled in shipping calculation)');
        // Free shipping doesn't usually return a monetary amount here unless it represents saved shipping cost.
        // If it should reduce the main discountAmount, logic would be needed here.
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