import { B as BaseActionEnhancer } from "./BaseActionEnhancer-DhA4DO-W.js";
import { u as useCartStore } from "./utils-D3MhrmeJ.js";
class CouponEnhancer extends BaseActionEnhancer {
  constructor() {
    super(...arguments);
    this.input = null;
    this.button = null;
    this.display = null;
    this.template = null;
    this.unsubscribe = null;
  }
  async initialize() {
    this.logger.debug("Enhancing coupon element:", this.element);
    this.input = this.element.querySelector('input[os-checkout-field="coupon"]') || this.element.querySelector('input[data-next-coupon="input"]') || this.element.querySelector('input[type="text"]') || this.element.querySelector("input");
    this.button = this.element.querySelector("button") || this.element.querySelector('[data-next-coupon="apply"]');
    this.display = this.element.querySelector('[data-next-coupon="display"]') || this.element.querySelector('[pb-checkout="coupon-display"]') || this.element.parentElement?.querySelector('[data-next-coupon="display"]') || document.querySelector('[data-next-coupon="display"]');
    this.template = this.display?.querySelector('[pb-checkout="coupon-card"]') || null;
    if (!this.input || !this.button) {
      this.logger.warn("Required coupon elements not found", { input: !!this.input, button: !!this.button });
      return;
    }
    this.setupInputListener();
    this.setupButtonListener();
    this.updateButtonState();
    this.renderAppliedCoupons();
    this.unsubscribe = useCartStore.subscribe(
      (state) => state.appliedCoupons,
      () => this.renderAppliedCoupons()
    );
    this.logger.info("Coupon enhancer initialized successfully");
  }
  setupInputListener() {
    if (!this.input) return;
    this.input.addEventListener("input", () => {
      this.updateButtonState();
    });
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.applyCoupon();
      }
    });
  }
  setupButtonListener() {
    if (!this.button) return;
    this.button.addEventListener("click", (e) => {
      e.preventDefault();
      this.applyCoupon();
    });
  }
  updateButtonState() {
    if (!this.input || !this.button) return;
    const hasValue = this.input.value.trim().length > 0;
    if (hasValue) {
      this.button.classList.remove("next-disabled");
      this.button.disabled = false;
    } else {
      this.button.classList.add("next-disabled");
      this.button.disabled = true;
    }
  }
  async applyCoupon() {
    if (!this.input || !this.button) return;
    const code = this.input.value.trim();
    if (!code) return;
    await this.executeAction(
      async () => {
        this.logger.debug("Applying coupon:", code);
        const result = await useCartStore.getState().applyCoupon(code);
        if (result.success) {
          if (this.input) {
            this.input.value = "";
          }
          this.updateButtonState();
          this.showMessage(result.message, "success");
          this.logger.info("Coupon applied successfully:", code);
          this.eventBus.emit("coupon:applied", { code });
        } else {
          this.showMessage(result.message, "error");
          this.logger.warn("Coupon application failed:", result.message);
          this.eventBus.emit("coupon:validation-failed", { code, message: result.message });
        }
      },
      { showLoading: true, disableOnProcess: true }
    );
  }
  renderAppliedCoupons() {
    if (!this.display || !this.template) {
      this.logger.debug("No display area or template found for coupons");
      return;
    }
    const coupons = useCartStore.getState().getCoupons();
    const existingCoupons = this.display.querySelectorAll('[pb-checkout="coupon-card"]:not([data-template])');
    existingCoupons.forEach((el) => el.remove());
    this.template.style.display = "none";
    this.template.setAttribute("data-template", "true");
    coupons.forEach((coupon) => {
      const couponEl = this.template.cloneNode(true);
      couponEl.removeAttribute("data-template");
      couponEl.style.display = "";
      const titleEl = couponEl.querySelector('[pb-checkout="coupon-title"]');
      if (titleEl) {
        titleEl.textContent = coupon.code;
      }
      const descEl = couponEl.querySelector('[pb-checkout="coupon-description"]');
      if (descEl && coupon.definition.description) {
        descEl.textContent = coupon.definition.description;
      }
      const discountEl = couponEl.querySelector('[pb-checkout="coupon-discount"]');
      if (discountEl) {
        const { formatCurrency } = require("@/utils/currencyFormatter");
        const formatted = formatCurrency(coupon.discount);
        discountEl.textContent = `-${formatted}`;
      }
      const removeBtn = couponEl.querySelector('[pb-checkout="coupon-remove"]');
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          this.removeCoupon(coupon.code);
        });
      }
      this.display.appendChild(couponEl);
    });
    this.logger.debug("Rendered applied coupons:", coupons.length);
  }
  removeCoupon(code) {
    this.logger.debug("Removing coupon:", code);
    useCartStore.getState().removeCoupon(code);
    this.eventBus.emit("coupon:removed", { code });
    this.showMessage(`Coupon ${code} removed`, "info");
  }
  showMessage(message, type) {
    this.logger.debug(`Showing message [${type}]:`, message);
    const messageContainer = document.querySelector('[data-next-coupon="messages"]') || document.querySelector(".coupon-messages") || this.element?.querySelector(".messages");
    if (messageContainer) {
      messageContainer.innerHTML = "";
      const messageEl = document.createElement("div");
      messageEl.className = `coupon-message coupon-message--${type}`;
      messageEl.textContent = message;
      messageContainer.appendChild(messageEl);
      setTimeout(() => {
        messageEl.remove();
      }, 5e3);
    } else {
      console.log(`[Coupon ${type.toUpperCase()}] ${message}`);
    }
  }
  // emitEvent method removed - unused
  async update() {
    this.renderAppliedCoupons();
  }
  destroy() {
    this.logger.debug("Destroying coupon enhancer");
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    super.destroy();
    this.input = null;
    this.button = null;
    this.display = null;
    this.template = null;
    this.logger.debug("Coupon enhancer destroyed");
  }
}
export {
  CouponEnhancer
};
