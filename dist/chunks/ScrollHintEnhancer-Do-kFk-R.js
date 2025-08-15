import { B as BaseEnhancer } from "./BaseEnhancer-prjikhcQ.js";
class ScrollHintEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.scrollThreshold = 5;
    this.activeClass = "cart-items__scroll-hint--active";
  }
  async initialize() {
    this.validateElement();
    this.scrollThreshold = parseInt(this.getAttribute("data-next-scroll-threshold") || "5", 10);
    const targetSelector = this.getAttribute("data-next-scroll-target");
    if (targetSelector) {
      this.scrollTarget = document.querySelector(targetSelector);
    } else {
      const target = this.findScrollTarget();
      if (target) {
        this.scrollTarget = target;
      }
    }
    if (!this.scrollTarget) {
      this.logger.warn("No scroll target found for scroll hint");
      return;
    }
    this.scrollHandler = this.throttle(this.updateScrollHint.bind(this), 16);
    this.resizeHandler = this.debounce(this.updateScrollHint.bind(this), 100);
    this.scrollTarget.addEventListener("scroll", this.scrollHandler);
    window.addEventListener("resize", this.resizeHandler);
    this.observeContentChanges();
    this.updateScrollHint();
    this.logger.debug("ScrollHintEnhancer initialized", {
      scrollTarget: this.scrollTarget,
      threshold: this.scrollThreshold
    });
  }
  findScrollTarget() {
    const patterns = [
      ".cart-items__list",
      "[data-next-cart-items]",
      "[data-next-order-items]",
      ".order-items__list",
      ".scrollable-content"
    ];
    const parent = this.element.parentElement;
    if (parent) {
      for (const pattern of patterns) {
        const target = parent.querySelector(pattern);
        if (target) return target;
      }
    }
    const container = this.element.closest(".order-summary, .cart-items, .modal-content");
    if (container) {
      for (const pattern of patterns) {
        const target = container.querySelector(pattern);
        if (target) return target;
      }
    }
    return null;
  }
  observeContentChanges() {
    if (!this.scrollTarget) return;
    this.mutationObserver = new MutationObserver(() => {
      this.scheduleUpdate();
    });
    this.mutationObserver.observe(this.scrollTarget, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  scheduleUpdate() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(() => {
      this.updateScrollHint();
    });
  }
  hasScrollableContent() {
    if (!this.scrollTarget) return false;
    return this.scrollTarget.scrollHeight > this.scrollTarget.clientHeight;
  }
  updateScrollHint() {
    if (!this.scrollTarget) return;
    if (!this.hasScrollableContent()) {
      this.removeClass(this.activeClass);
      this.setAttribute("aria-hidden", "true");
      return;
    }
    const isAtTop = this.scrollTarget.scrollTop <= this.scrollThreshold;
    if (isAtTop) {
      this.addClass(this.activeClass);
      this.setAttribute("aria-hidden", "false");
    } else {
      this.removeClass(this.activeClass);
      this.setAttribute("aria-hidden", "true");
    }
    this.eventBus.emit("scroll-hint:updated", {
      isVisible: isAtTop && this.hasScrollableContent(),
      scrollTop: this.scrollTarget.scrollTop,
      scrollHeight: this.scrollTarget.scrollHeight,
      clientHeight: this.scrollTarget.clientHeight
    });
  }
  throttle(func, limit) {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }
  update() {
    this.updateScrollHint();
  }
  destroy() {
    if (this.scrollTarget && this.scrollHandler) {
      this.scrollTarget.removeEventListener("scroll", this.scrollHandler);
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    super.destroy();
  }
}
export {
  ScrollHintEnhancer
};
