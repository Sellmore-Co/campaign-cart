import { B as BaseEnhancer } from "./index-BvJA8yfi.js";
class ExitIntentEnhancer extends BaseEnhancer {
  // Text for action button
  constructor() {
    super(document.body);
    this.isEnabled = false;
    this.triggerCount = 0;
    this.lastTriggerTime = 0;
    this.maxTriggers = 1;
    this.cooldownPeriod = 3e4;
    this.imageUrl = "";
    this.templateName = "";
    this.templateElement = null;
    this.action = null;
    this.popupElement = null;
    this.overlayElement = null;
    this.mouseLeaveHandler = null;
    this.scrollHandler = null;
    this.disableOnMobile = true;
    this.mobileScrollTrigger = false;
    this.sessionStorageKey = "exit-intent-dismissed";
    this.useSessionStorage = true;
    this.overlayClosable = true;
    this.showCloseButton = false;
    this.imageClickable = true;
    this.actionButtonText = "";
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
    if (!options.image && !options.template) {
      this.logger.error("Exit intent requires either an image URL or a template name");
      return;
    }
    this.imageUrl = options.image || "";
    this.templateName = options.template || "";
    this.action = options.action || null;
    this.disableOnMobile = options.disableOnMobile !== void 0 ? options.disableOnMobile : true;
    this.mobileScrollTrigger = options.mobileScrollTrigger || false;
    this.maxTriggers = options.maxTriggers !== void 0 ? options.maxTriggers : 1;
    this.useSessionStorage = options.useSessionStorage !== void 0 ? options.useSessionStorage : true;
    this.overlayClosable = options.overlayClosable !== void 0 ? options.overlayClosable : true;
    this.showCloseButton = options.showCloseButton || false;
    this.imageClickable = options.imageClickable !== void 0 ? options.imageClickable : true;
    this.actionButtonText = options.actionButtonText || "";
    if (options.sessionStorageKey) {
      this.sessionStorageKey = options.sessionStorageKey;
    }
    if (this.templateName) {
      this.templateElement = document.querySelector(`template[data-template="${this.templateName}"]`);
      if (!this.templateElement) {
        this.logger.error(`Exit intent template not found: <template data-template="${this.templateName}">`);
        return;
      }
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
    if (this.templateElement) {
      this.createTemplatePopup();
    } else {
      this.createImagePopup();
    }
    this.emit("exit-intent:shown", {
      imageUrl: this.imageUrl,
      template: this.templateName
    });
  }
  createTemplatePopup() {
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
      cursor: ${this.overlayClosable ? "pointer" : "default"};
    `;
    this.popupElement = document.createElement("div");
    this.popupElement.className = "exit-intent-popup exit-intent-template-popup";
    this.popupElement.setAttribute("data-exit-intent", "popup");
    this.popupElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000000;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    `;
    if (this.templateElement) {
      const templateContent = this.templateElement.content.cloneNode(true);
      this.popupElement.appendChild(templateContent);
      this.processTemplateActions(this.popupElement);
    }
    if (this.showCloseButton) {
      const closeButton = document.createElement("button");
      closeButton.className = "exit-intent-close";
      closeButton.setAttribute("data-exit-intent", "close");
      closeButton.innerHTML = "&times;";
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: transparent;
        border: none;
        font-size: 30px;
        cursor: pointer;
        z-index: 1000001;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        line-height: 1;
      `;
      closeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hidePopup();
        this.emit("exit-intent:closed", { imageUrl: this.imageUrl, template: this.templateName });
      });
      this.popupElement.appendChild(closeButton);
    }
    if (this.overlayClosable) {
      this.overlayElement.addEventListener("click", () => {
        this.hidePopup();
        this.emit("exit-intent:dismissed", { imageUrl: this.imageUrl, template: this.templateName });
        this.saveToSessionStorage();
      });
    }
    this.popupElement.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        this.hidePopup();
        this.emit("exit-intent:dismissed", { imageUrl: this.imageUrl, template: this.templateName });
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
  processTemplateActions(templateElement) {
    const actionElements = templateElement.querySelectorAll("[data-exit-intent-action]");
    actionElements.forEach((element) => {
      const actionType = element.getAttribute("data-exit-intent-action");
      switch (actionType) {
        case "close":
          element.addEventListener("click", () => {
            this.hidePopup();
            this.emit("exit-intent:action", { action: "close" });
          });
          break;
        case "apply-coupon":
          const couponCode = element.getAttribute("data-coupon-code");
          if (couponCode) {
            element.addEventListener("click", async () => {
              this.emit("exit-intent:action", { action: "apply-coupon", couponCode });
              const { useCartStore } = await import("./utils-BMhjDSF3.js").then((n) => n._);
              const cartStore = useCartStore.getState();
              await cartStore.applyCoupon(couponCode);
              this.hidePopup();
            });
          }
          break;
        case "custom":
          element.addEventListener("click", async () => {
            if (this.action) {
              await this.action();
            }
            this.emit("exit-intent:action", { action: "custom" });
            this.hidePopup();
          });
          break;
      }
    });
  }
  createImagePopup() {
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
      cursor: ${this.imageClickable && !this.actionButtonText ? "pointer" : "default"};
      max-width: 90vw;
      max-height: ${this.actionButtonText ? "60vh" : "50vh"};
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
    if (this.actionButtonText) {
      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = `
        text-align: center;
        margin-top: 20px;
      `;
      const actionButton = document.createElement("button");
      actionButton.className = "exit-intent-action-button";
      actionButton.setAttribute("data-exit-intent", "action");
      actionButton.textContent = this.actionButtonText;
      actionButton.style.cssText = `
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 12px 30px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      `;
      actionButton.addEventListener("click", async (e) => {
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
      buttonContainer.appendChild(actionButton);
      this.popupElement.appendChild(buttonContainer);
    }
    if (this.showCloseButton) {
      const closeButton = document.createElement("button");
      closeButton.className = "exit-intent-close";
      closeButton.setAttribute("data-exit-intent", "close");
      closeButton.innerHTML = "&times;";
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: transparent;
        border: none;
        font-size: 30px;
        cursor: pointer;
        z-index: 1000001;
        color: #fff;
        text-shadow: 0 0 3px rgba(0,0,0,0.5);
        padding: 0;
        width: 30px;
        height: 30px;
        line-height: 1;
      `;
      closeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hidePopup();
        this.emit("exit-intent:closed", { imageUrl: this.imageUrl });
      });
      this.popupElement.appendChild(closeButton);
    }
    this.overlayElement.addEventListener("click", () => {
      this.hidePopup();
      this.emit("exit-intent:dismissed", { imageUrl: this.imageUrl });
      this.saveToSessionStorage();
    });
    if (this.imageClickable && !this.actionButtonText) {
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
    } else {
      this.popupElement.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
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
