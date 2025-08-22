import { B as BaseEnhancer } from "./BaseEnhancer-CjYmv-nR.js";
class ExitIntentEnhancer extends BaseEnhancer {
  // Enable session storage by default
  constructor() {
    super(document.body);
    this.isEnabled = false;
    this.triggerCount = 0;
    this.lastTriggerTime = 0;
    this.maxTriggers = 1;
    this.cooldownPeriod = 3e4;
    this.imageUrl = "";
    this.action = null;
    this.popupElement = null;
    this.overlayElement = null;
    this.mouseLeaveHandler = null;
    this.scrollHandler = null;
    this.disableOnMobile = true;
    this.mobileScrollTrigger = false;
    this.sessionStorageKey = "exit-intent-dismissed";
    this.useSessionStorage = true;
  }
  async initialize() {
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", () => resolve());
      });
    }
    if (this.useSessionStorage && typeof window !== "undefined" && window.sessionStorage) {
      try {
        const storedData = sessionStorage.getItem(this.sessionStorageKey);
        if (storedData) {
          const data = JSON.parse(storedData);
          this.triggerCount = data.triggerCount || 0;
          this.lastTriggerTime = data.lastTriggerTime || 0;
        }
      } catch (error) {
        this.logger.debug("Failed to load session storage data:", error);
      }
    }
  }
  // Implement abstract update method
  async update(data) {
    if (data && typeof data === "object") {
      if (data.image) {
        this.setup(data);
      }
    }
  }
  setup(options) {
    this.imageUrl = options.image;
    this.action = options.action || null;
    this.disableOnMobile = options.disableOnMobile !== void 0 ? options.disableOnMobile : true;
    this.mobileScrollTrigger = options.mobileScrollTrigger || false;
    this.maxTriggers = options.maxTriggers !== void 0 ? options.maxTriggers : 1;
    this.useSessionStorage = options.useSessionStorage !== void 0 ? options.useSessionStorage : true;
    if (options.sessionStorageKey) {
      this.sessionStorageKey = options.sessionStorageKey;
    }
    if (this.disableOnMobile && this.isMobileDevice()) {
      this.logger.debug("Exit intent disabled on mobile device");
      return;
    }
    this.isEnabled = true;
    this.setupEventListeners();
    this.logger.debug("Simple exit intent setup complete");
  }
  disable() {
    this.isEnabled = false;
    this.cleanupEventListeners();
    this.hidePopup();
  }
  reset() {
    this.triggerCount = 0;
    this.lastTriggerTime = 0;
    if (this.useSessionStorage && typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.removeItem(this.sessionStorageKey);
      } catch (error) {
        this.logger.debug("Failed to clear session storage:", error);
      }
    }
  }
  setupEventListeners() {
    if (!this.isMobileDevice()) {
      this.mouseLeaveHandler = (e) => {
        if (this.shouldTrigger() && e.clientY <= 10) {
          this.triggerExitIntent();
        }
      };
      document.addEventListener("mouseleave", this.mouseLeaveHandler);
    }
    if (this.isMobileDevice() && this.mobileScrollTrigger) {
      this.scrollHandler = () => {
        if (this.shouldTrigger()) {
          const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
          if (scrollPercent >= 50) {
            this.triggerExitIntent();
          }
        }
      };
      window.addEventListener("scroll", this.scrollHandler, { passive: true });
    }
  }
  isMobileDevice() {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isMobileWidth = window.innerWidth < 768;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileUA = mobileRegex.test(navigator.userAgent);
    return hasTouch && (isMobileWidth || isMobileUA);
  }
  shouldTrigger() {
    if (!this.isEnabled) return false;
    if (this.popupElement) return false;
    if (this.triggerCount >= this.maxTriggers) return false;
    if (Date.now() - this.lastTriggerTime < this.cooldownPeriod) return false;
    if (this.disableOnMobile && this.isMobileDevice()) return false;
    return true;
  }
  triggerExitIntent() {
    this.triggerCount++;
    this.lastTriggerTime = Date.now();
    this.saveToSessionStorage();
    this.showPopup();
  }
  saveToSessionStorage() {
    if (this.useSessionStorage && typeof window !== "undefined" && window.sessionStorage) {
      try {
        const data = {
          triggerCount: this.triggerCount,
          lastTriggerTime: this.lastTriggerTime,
          timestamp: Date.now()
        };
        sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(data));
      } catch (error) {
        this.logger.debug("Failed to save to session storage:", error);
      }
    }
  }
  showPopup() {
    this.createPopupElements();
    this.emit("exit-intent:shown", { imageUrl: this.imageUrl });
  }
  createPopupElements() {
    this.overlayElement = document.createElement("div");
    this.overlayElement.className = "exit-intent-overlay";
    this.overlayElement.setAttribute("data-exit-intent", "overlay");
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 999999;
      cursor: pointer;
    `;
    this.popupElement = document.createElement("div");
    this.popupElement.className = "exit-intent-popup";
    this.popupElement.setAttribute("data-exit-intent", "popup");
    this.popupElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000000;
      cursor: pointer;
      max-width: 90vw;
      max-height: 50vh;
    `;
    const image = document.createElement("img");
    image.className = "exit-intent-image";
    image.setAttribute("data-exit-intent", "image");
    image.src = this.imageUrl;
    image.style.cssText = `
      max-width: 100%;
      max-height: 50vh;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    image.onerror = () => {
      this.logger.error("Failed to load exit intent image:", this.imageUrl);
      this.hidePopup();
    };
    this.popupElement.appendChild(image);
    this.overlayElement.addEventListener("click", () => {
      this.hidePopup();
      this.emit("exit-intent:dismissed", { imageUrl: this.imageUrl });
      this.saveToSessionStorage();
    });
    this.popupElement.addEventListener("click", async (e) => {
      e.stopPropagation();
      this.emit("exit-intent:clicked", { imageUrl: this.imageUrl });
      if (this.action) {
        try {
          await this.action();
        } catch (error) {
          this.logger.error("Exit intent action failed:", error);
        }
      }
      this.saveToSessionStorage();
      this.hidePopup();
    });
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        this.hidePopup();
        this.emit("exit-intent:dismissed", { imageUrl: this.imageUrl });
        this.saveToSessionStorage();
        document.removeEventListener("keydown", keyHandler);
      }
    };
    document.addEventListener("keydown", keyHandler);
    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.popupElement);
    requestAnimationFrame(() => {
      if (this.overlayElement) this.overlayElement.style.opacity = "1";
      if (this.popupElement) {
        this.popupElement.style.opacity = "0";
        this.popupElement.style.transform = "translate(-50%, -50%) scale(0.8)";
        this.popupElement.style.transition = "all 0.3s ease";
        requestAnimationFrame(() => {
          if (this.popupElement) {
            this.popupElement.style.opacity = "1";
            this.popupElement.style.transform = "translate(-50%, -50%) scale(1)";
          }
        });
      }
    });
  }
  hidePopup() {
    if (this.popupElement) {
      this.popupElement.style.transition = "all 0.2s ease";
      this.popupElement.style.opacity = "0";
      this.popupElement.style.transform = "translate(-50%, -50%) scale(0.8)";
      setTimeout(() => {
        if (this.popupElement) {
          this.popupElement.remove();
          this.popupElement = null;
        }
      }, 200);
    }
    if (this.overlayElement) {
      this.overlayElement.style.transition = "opacity 0.2s ease";
      this.overlayElement.style.opacity = "0";
      setTimeout(() => {
        if (this.overlayElement) {
          this.overlayElement.remove();
          this.overlayElement = null;
        }
      }, 200);
    }
  }
  cleanupEventListeners() {
    if (this.mouseLeaveHandler) {
      document.removeEventListener("mouseleave", this.mouseLeaveHandler);
      this.mouseLeaveHandler = null;
    }
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
    this.hidePopup();
  }
  destroy() {
    this.cleanupEventListeners();
    super.destroy();
  }
}
export {
  ExitIntentEnhancer
};
