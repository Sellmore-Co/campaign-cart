import { B as BaseEnhancer } from "./BaseEnhancer-ZOlDxxLI.js";
class ExitIntentEnhancer extends BaseEnhancer {
  constructor() {
    super(document.body);
    this.isEnabled = false;
    this.triggerCount = 0;
    this.lastTriggerTime = 0;
    this.maxTriggers = 3;
    this.cooldownPeriod = 3e4;
    this.imageUrl = "";
    this.action = null;
    this.popupElement = null;
    this.overlayElement = null;
    this.mouseLeaveHandler = null;
    this.scrollHandler = null;
  }
  async initialize() {
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", () => resolve());
      });
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
    this.isEnabled = true;
    this.setupEventListeners();
    this.logger.debug("Simple exit intent setup complete");
  }
  disable() {
    this.isEnabled = false;
    this.cleanupEventListeners();
    this.hidePopup();
  }
  setupEventListeners() {
    this.mouseLeaveHandler = (e) => {
      if (this.shouldTrigger() && e.clientY <= 10) {
        this.triggerExitIntent();
      }
    };
    document.addEventListener("mouseleave", this.mouseLeaveHandler);
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
  shouldTrigger() {
    if (!this.isEnabled) return false;
    if (this.popupElement) return false;
    if (this.triggerCount >= this.maxTriggers) return false;
    if (Date.now() - this.lastTriggerTime < this.cooldownPeriod) return false;
    return true;
  }
  triggerExitIntent() {
    this.triggerCount++;
    this.lastTriggerTime = Date.now();
    this.showPopup();
  }
  showPopup() {
    this.createPopupElements();
    this.emit("exit-intent:shown", { imageUrl: this.imageUrl });
  }
  createPopupElements() {
    this.overlayElement = document.createElement("div");
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
    this.popupElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000000;
      cursor: pointer;
      max-width: 90vw;
      max-height: 90vh;
    `;
    const image = document.createElement("img");
    image.src = this.imageUrl;
    image.style.cssText = `
      max-width: 100%;
      height: auto;
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
      this.hidePopup();
    });
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        this.hidePopup();
        this.emit("exit-intent:dismissed", { imageUrl: this.imageUrl });
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
