import { B as BaseEnhancer } from "./BaseEnhancer-D0NtPg2R.js";
const _AccordionEnhancer = class _AccordionEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.accordions = /* @__PURE__ */ new Map();
  }
  // Use protected eventBus from BaseEnhancer
  async initialize() {
    this.enhance();
  }
  enhance() {
    const accordionId = this.element.getAttribute("data-next-accordion");
    if (!accordionId) {
      this.logger.warn("No accordion ID found on element");
      return;
    }
    const config = this.parseConfig(this.element);
    const instance = new AccordionInstance(accordionId, this.element, config);
    this.accordions.set(accordionId, instance);
    this.setupEventListeners(instance);
    this.logger.debug(`Accordion enhanced: ${accordionId}`);
  }
  // Required by BaseEnhancer but not used for accordions
  update(_data) {
  }
  parseConfig(element) {
    return {
      openText: element.getAttribute("data-open-text") || "Hide",
      closeText: element.getAttribute("data-close-text") || "Show",
      toggleClass: element.getAttribute("data-toggle-class") || "next-expanded",
      initialState: element.getAttribute("data-initial-state") || "closed",
      animationDuration: parseInt(element.getAttribute("data-animation-duration") || "300")
    };
  }
  setupEventListeners(instance) {
    instance.triggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleAccordion(instance);
      });
    });
    instance.triggers.forEach((trigger) => {
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.toggleAccordion(instance);
        }
      });
      if (!trigger.hasAttribute("tabindex")) {
        trigger.setAttribute("tabindex", "0");
      }
      trigger.setAttribute("aria-expanded", instance.isOpen.toString());
      trigger.setAttribute("aria-controls", instance.id);
    });
    instance.panels.forEach((panel) => {
      panel.setAttribute("aria-labelledby", instance.id);
      panel.setAttribute("id", `${instance.id}-content`);
    });
  }
  toggleAccordion(instance) {
    const wasOpen = instance.isOpen;
    if (wasOpen) {
      this.closeAccordion(instance);
    } else {
      this.openAccordion(instance);
    }
    this.eventBus.emit("accordion:toggled", {
      id: instance.id,
      isOpen: !wasOpen,
      element: instance.element
    });
  }
  openAccordion(instance) {
    instance.isOpen = true;
    instance.panels.forEach((panel) => {
      const currentHeight = panel.offsetHeight;
      panel.style.height = currentHeight + "px";
      panel.style.height = "auto";
      const autoHeight = panel.offsetHeight;
      panel.style.height = currentHeight + "px";
      requestAnimationFrame(() => {
        panel.style.height = autoHeight + "px";
        panel.classList.add(instance.config.toggleClass);
        setTimeout(() => {
          if (instance.isOpen) {
            panel.style.height = "auto";
          }
        }, (instance.config.animationDuration || 300) + 50);
      });
    });
    instance.element.classList.add(instance.config.toggleClass);
    instance.textElements.forEach((textEl) => {
      if (instance.config.openText) {
        textEl.textContent = instance.config.openText;
      }
    });
    instance.triggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "true");
    });
    this.logger.debug(`Accordion opened: ${instance.id}`);
    this.eventBus.emit("accordion:opened", {
      id: instance.id,
      element: instance.element
    });
  }
  closeAccordion(instance) {
    instance.isOpen = false;
    instance.panels.forEach((panel) => {
      const currentHeight = panel.offsetHeight;
      panel.style.height = currentHeight + "px";
      panel.style.height = "0px";
      setTimeout(() => {
        panel.classList.remove(instance.config.toggleClass);
      }, instance.config.animationDuration || 300);
    });
    instance.element.classList.remove(instance.config.toggleClass);
    instance.textElements.forEach((textEl) => {
      if (instance.config.closeText) {
        textEl.textContent = instance.config.closeText;
      }
    });
    instance.triggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });
    this.logger.debug(`Accordion closed: ${instance.id}`);
    this.eventBus.emit("accordion:closed", {
      id: instance.id,
      element: instance.element
    });
  }
  // Public API methods
  openAccordionById(id) {
    const instance = this.accordions.get(id);
    if (instance && !instance.isOpen) {
      this.openAccordion(instance);
    }
  }
  closeAccordionById(id) {
    const instance = this.accordions.get(id);
    if (instance && instance.isOpen) {
      this.closeAccordion(instance);
    }
  }
  toggleAccordionById(id) {
    const instance = this.accordions.get(id);
    if (instance) {
      this.toggleAccordion(instance);
    }
  }
  getAccordionState(id) {
    const instance = this.accordions.get(id);
    return instance ? instance.isOpen : null;
  }
  getAllAccordions() {
    return Array.from(this.accordions.keys());
  }
  destroy() {
    this.accordions.clear();
    super.destroy();
  }
};
_AccordionEnhancer.selector = "[data-next-accordion]";
let AccordionEnhancer = _AccordionEnhancer;
class AccordionInstance {
  constructor(id, element, config) {
    this.id = id;
    this.element = element;
    this.config = config;
    this.triggers = [];
    this.panels = [];
    this.textElements = [];
    this.findComponents();
    this.isOpen = this.detectInitialState();
    this.initializeState();
  }
  detectInitialState() {
    const toggleClass = this.config.toggleClass;
    const hasExpandedPanel = this.panels.some((panel) => panel.classList.contains(toggleClass));
    const hasExpandedContainer = this.element.classList.contains(toggleClass);
    if (hasExpandedPanel || hasExpandedContainer) {
      return true;
    }
    return this.config.initialState === "open";
  }
  findComponents() {
    const triggers = this.element.querySelectorAll(`[data-next-accordion-trigger="${this.id}"]`);
    this.triggers = Array.from(triggers);
    const panels = this.element.querySelectorAll(`[data-next-accordion-panel="${this.id}"]`);
    this.panels = Array.from(panels);
    const textElements = this.element.querySelectorAll(`[data-next-accordion-text="${this.id}"]`);
    this.textElements = Array.from(textElements);
    if (this.triggers.length === 0) {
      console.warn(`[AccordionEnhancer] No triggers found for accordion "${this.id}". Make sure you have elements with data-next-accordion-trigger="${this.id}"`);
    }
    if (this.panels.length === 0) {
      console.warn(`[AccordionEnhancer] No panels found for accordion "${this.id}". Make sure you have elements with data-next-accordion-panel="${this.id}"`);
    }
  }
  initializeState() {
    const toggleClass = this.config.toggleClass;
    if (this.isOpen) {
      this.element.classList.add(toggleClass);
      this.panels.forEach((panel) => {
        panel.classList.add(toggleClass);
        panel.style.height = "auto";
      });
      this.textElements.forEach((textEl) => {
        if (this.config.openText) {
          textEl.textContent = this.config.openText;
        }
      });
    } else {
      this.element.classList.remove(toggleClass);
      this.panels.forEach((panel) => {
        panel.classList.remove(toggleClass);
        panel.style.height = "0px";
      });
      this.textElements.forEach((textEl) => {
        if (this.config.closeText) {
          textEl.textContent = this.config.closeText;
        }
      });
    }
  }
}
export {
  AccordionEnhancer
};
