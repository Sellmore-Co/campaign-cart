import { B as BaseEnhancer } from "./index-VH7rirSE.js";
import { a as computePosition, o as offset, f as flip, b as shift, e as arrow } from "./vendor-B2NPMtAQ.js";
const _TooltipEnhancer = class _TooltipEnhancer extends BaseEnhancer {
  constructor(element) {
    super(element);
    this.tooltip = null;
    this.arrow = null;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.isVisible = false;
    this.handleMouseEnter = () => {
      this.scheduleShow();
    };
    this.handleMouseLeave = () => {
      this.scheduleHide();
    };
    this.handleFocus = () => {
      this.scheduleShow();
    };
    this.handleBlur = () => {
      this.scheduleHide();
    };
    this.handleTouchStart = () => {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    };
    this.handleKeydown = (e) => {
      if (e.key === "Escape" && this.isVisible) {
        this.hide();
      }
    };
    this.config = this.parseConfig();
    this.injectStyles();
  }
  async initialize() {
    try {
      this.validateElement();
      this.setupEventListeners();
      this.logger.debug("Tooltip enhancer initialized");
    } catch (error) {
      this.handleError(error, "initialize");
    }
  }
  update() {
    this.config = this.parseConfig();
    if (this.isVisible && this.tooltip) {
      this.updateTooltipContent();
    }
  }
  destroy() {
    this.hide();
    this.cleanupTimeouts();
    super.destroy();
  }
  parseConfig() {
    return {
      placement: this.getAttribute("data-next-tooltip-placement") || "top",
      offset: parseInt(this.getAttribute("data-next-tooltip-offset") || "8"),
      delay: parseInt(this.getAttribute("data-next-tooltip-delay") || "500"),
      maxWidth: this.getAttribute("data-next-tooltip-max-width") || "200px",
      className: this.getAttribute("data-next-tooltip-class") || ""
    };
  }
  injectStyles() {
    if (_TooltipEnhancer.stylesInjected) return;
    const styleId = "next-tooltip-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .next-tooltip {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 99999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
        transform: scale(0.95);
        pointer-events: none;
      }

      .next-tooltip--visible {
        opacity: 1;
        visibility: visible;
        transform: scale(1);
        pointer-events: auto;
      }

      .next-tooltip__content {
        background: #333;
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.4;
        font-weight: 400;
        text-align: center;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        white-space: nowrap;
        max-width: 200px;
        white-space: normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .next-tooltip__arrow {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #333;
        transform: rotate(45deg);
      }

      .next-tooltip[data-placement^="top"] .next-tooltip__arrow {
        border-top: none;
        border-left: none;
      }

      .next-tooltip[data-placement^="bottom"] .next-tooltip__arrow {
        border-bottom: none;
        border-right: none;
      }

      .next-tooltip[data-placement^="left"] .next-tooltip__arrow {
        border-left: none;
        border-bottom: none;
      }

      .next-tooltip[data-placement^="right"] .next-tooltip__arrow {
        border-right: none;
        border-top: none;
      }

      .next-tooltip--light .next-tooltip__content {
        background: #fff;
        color: #333;
        border: 1px solid #ddd;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .next-tooltip--light .next-tooltip__arrow {
        background: #fff;
        border: 1px solid #ddd;
      }

      .next-tooltip--error .next-tooltip__content {
        background: #dc3545;
        color: #fff;
      }

      .next-tooltip--error .next-tooltip__arrow {
        background: #dc3545;
      }

      .next-tooltip--success .next-tooltip__content {
        background: #28a745;
        color: #fff;
      }

      .next-tooltip--success .next-tooltip__arrow {
        background: #28a745;
      }

      .next-tooltip--warning .next-tooltip__content {
        background: #ffc107;
        color: #333;
      }

      .next-tooltip--warning .next-tooltip__arrow {
        background: #ffc107;
      }

      .next-tooltip--large .next-tooltip__content {
        padding: 12px 16px;
        font-size: 14px;
        max-width: 300px;
      }

      .next-tooltip--small .next-tooltip__content {
        padding: 4px 8px;
        font-size: 12px;
        max-width: 150px;
      }

      @media (hover: none) {
        .next-tooltip {
          transition-duration: 0.15s;
        }
      }

      @media (prefers-contrast: high) {
        .next-tooltip__content {
          border: 2px solid currentColor;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .next-tooltip {
          transition: opacity 0.1s ease, visibility 0.1s ease;
          transform: none;
        }
        
        .next-tooltip--visible {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
    _TooltipEnhancer.stylesInjected = true;
    this.logger.debug("Tooltip styles injected into document head");
  }
  setupEventListeners() {
    this.element.addEventListener("mouseenter", this.handleMouseEnter);
    this.element.addEventListener("mouseleave", this.handleMouseLeave);
    this.element.addEventListener("focus", this.handleFocus);
    this.element.addEventListener("blur", this.handleBlur);
    this.element.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("keydown", this.handleKeydown);
  }
  cleanupEventListeners() {
    this.element.removeEventListener("mouseenter", this.handleMouseEnter);
    this.element.removeEventListener("mouseleave", this.handleMouseLeave);
    this.element.removeEventListener("focus", this.handleFocus);
    this.element.removeEventListener("blur", this.handleBlur);
    this.element.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("keydown", this.handleKeydown);
  }
  scheduleShow() {
    this.cleanupTimeouts();
    this.showTimeout = window.setTimeout(() => {
      this.show();
    }, this.config.delay);
  }
  scheduleHide() {
    this.cleanupTimeouts();
    this.hideTimeout = window.setTimeout(() => {
      this.hide();
    }, 150);
  }
  cleanupTimeouts() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
  async show() {
    if (this.isVisible) return;
    const content = this.getTooltipContent();
    if (!content) return;
    try {
      this.createTooltip(content);
      if (!this.tooltip) return;
      this.isVisible = true;
      document.body.appendChild(this.tooltip);
      const rect = this.element.getBoundingClientRect();
      this.logger.debug("Element position", {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        scrollY: window.scrollY,
        scrollX: window.scrollX
      });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await this.positionTooltip();
      requestAnimationFrame(() => {
        if (this.tooltip) {
          this.tooltip.classList.add("next-tooltip--visible");
        }
      });
      this.element.setAttribute("aria-describedby", this.tooltip.id);
      this.logger.debug("Tooltip shown");
    } catch (error) {
      this.handleError(error, "show tooltip");
    }
  }
  hide() {
    if (!this.isVisible || !this.tooltip) return;
    this.isVisible = false;
    this.tooltip.classList.remove("next-tooltip--visible");
    setTimeout(() => {
      if (this.tooltip && this.tooltip.parentNode) {
        this.tooltip.parentNode.removeChild(this.tooltip);
      }
      this.tooltip = null;
      this.arrow = null;
    }, 200);
    this.element.removeAttribute("aria-describedby");
    this.logger.debug("Tooltip hidden");
  }
  getTooltipContent() {
    return this.getAttribute("data-next-tooltip") || "";
  }
  updateTooltipContent() {
    if (!this.tooltip) return;
    const content = this.getTooltipContent();
    const contentEl = this.tooltip.querySelector(".next-tooltip__content");
    if (contentEl) {
      contentEl.textContent = content;
    }
  }
  createTooltip(content) {
    this.tooltip = document.createElement("div");
    this.tooltip.className = `next-tooltip ${this.config.className || ""}`.trim();
    this.tooltip.id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    this.tooltip.role = "tooltip";
    this.tooltip.style.maxWidth = this.config.maxWidth || "200px";
    const contentEl = document.createElement("div");
    contentEl.className = "next-tooltip__content";
    contentEl.textContent = content;
    this.arrow = document.createElement("div");
    this.arrow.className = "next-tooltip__arrow";
    this.tooltip.appendChild(contentEl);
    this.tooltip.appendChild(this.arrow);
    this.tooltip.addEventListener("mouseenter", () => {
      this.cleanupTimeouts();
    });
    this.tooltip.addEventListener("mouseleave", () => {
      this.scheduleHide();
    });
  }
  async positionTooltip() {
    if (!this.tooltip || !this.arrow) return;
    try {
      const { x, y, placement, middlewareData } = await computePosition(
        this.element,
        this.tooltip,
        {
          placement: this.config.placement || "top",
          middleware: [
            offset(this.config.offset || 8),
            flip(),
            shift({ padding: 5 }),
            arrow({ element: this.arrow })
          ],
          strategy: "fixed"
        }
      );
      Object.assign(this.tooltip.style, {
        left: `${x}px`,
        top: `${y}px`
      });
      if (middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right"
        }[placement.split("-")[0]];
        Object.assign(this.arrow.style, {
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
          right: "",
          bottom: "",
          [staticSide]: "-4px"
        });
      }
      this.tooltip.setAttribute("data-placement", placement);
      this.logger.debug("Tooltip positioned", { x, y, placement });
    } catch (error) {
      this.handleError(error, "position tooltip");
    }
  }
};
_TooltipEnhancer.stylesInjected = false;
let TooltipEnhancer = _TooltipEnhancer;
export {
  TooltipEnhancer
};
