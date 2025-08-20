/**
 * Accordion Enhancer - Handles accordion toggle functionality
 * 
 * Usage:
 * <div data-next-accordion="order-summary" 
 *      data-open-text="Hide Order Summary" 
 *      data-close-text="Show Order Summary">
 *   
 *   <div data-next-accordion-trigger="order-summary" class="accordion__trigger">
 *     <span data-next-accordion-text="order-summary">Show Order Summary</span>
 *   </div>
 *   
 *   <div data-next-accordion-panel="order-summary" class="accordion__panel">
 *     Content here
 *   </div>
 * </div>
 */

import { BaseEnhancer } from '../base/BaseEnhancer';
// import { EventBus } from '@/utils/events'; - removed unused import

interface AccordionConfig {
  openText?: string;
  closeText?: string;
  toggleClass?: string;
  initialState?: 'open' | 'closed';
  animationDuration?: number;
}

export class AccordionEnhancer extends BaseEnhancer {
  static selector = '[data-next-accordion]';
  
  private accordions = new Map<string, AccordionInstance>();
  // Use protected eventBus from BaseEnhancer

  override async initialize(): Promise<void> {
    this.enhance();
  }

  enhance(): void {
    // Work with the single element passed to this enhancer
    const accordionId = this.element.getAttribute('data-next-accordion');
    if (!accordionId) {
      this.logger.warn('No accordion ID found on element');
      return;
    }
    
    const config = this.parseConfig(this.element);
    const instance = new AccordionInstance(accordionId, this.element, config);
    
    this.accordions.set(accordionId, instance);
    this.setupEventListeners(instance);
    
    this.logger.debug(`Accordion enhanced: ${accordionId}`);
  }

  // Required by BaseEnhancer but not used for accordions
  update(_data?: any): void {
    // Accordions don't need to update based on external data changes
  }

  private parseConfig(element: HTMLElement): AccordionConfig {
    return {
      openText: element.getAttribute('data-open-text') || 'Hide',
      closeText: element.getAttribute('data-close-text') || 'Show',
      toggleClass: element.getAttribute('data-toggle-class') || 'next-expanded',
      initialState: (element.getAttribute('data-initial-state') as 'open' | 'closed') || 'closed',
      animationDuration: parseInt(element.getAttribute('data-animation-duration') || '300')
    };
  }

  private setupEventListeners(instance: AccordionInstance): void {
    // Set up trigger click listeners
    instance.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleAccordion(instance);
      });
    });

    // Set up keyboard accessibility
    instance.triggers.forEach(trigger => {
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleAccordion(instance);
        }
      });
      
      // Make triggers focusable if not already
      if (!trigger.hasAttribute('tabindex')) {
        trigger.setAttribute('tabindex', '0');
      }
      
      // Add ARIA attributes
      trigger.setAttribute('aria-expanded', instance.isOpen.toString());
      trigger.setAttribute('aria-controls', instance.id);
    });

    // Set up panel ARIA attributes
    instance.panels.forEach(panel => {
      panel.setAttribute('aria-labelledby', instance.id);
      panel.setAttribute('id', `${instance.id}-content`);
    });
  }

  private toggleAccordion(instance: AccordionInstance): void {
    const wasOpen = instance.isOpen;
    
    if (wasOpen) {
      this.closeAccordion(instance);
    } else {
      this.openAccordion(instance);
    }

    // Emit event
    this.eventBus.emit('accordion:toggled', {
      id: instance.id,
      isOpen: !wasOpen,
      element: instance.element
    });
  }

  private openAccordion(instance: AccordionInstance): void {
    instance.isOpen = true;
    
    // Handle smooth height animation for panels
    instance.panels.forEach(panel => {
      // First, ensure we're starting from the current height (likely 0px)
      const currentHeight = panel.offsetHeight;
      panel.style.height = currentHeight + 'px';
      
      // Calculate the target height
      panel.style.height = 'auto';
      const autoHeight = panel.offsetHeight;
      panel.style.height = currentHeight + 'px';
      
      // Force a reflow to ensure the browser registers the starting height
      void panel.offsetHeight;
      
      // Use requestAnimationFrame to ensure the browser has painted the initial state
      requestAnimationFrame(() => {
        // Now animate to the target height
        panel.style.height = autoHeight + 'px';
        
        // Add expanded class
        panel.classList.add(instance.config.toggleClass!);
        
        // Set height to auto after transition completes for responsive behavior
        setTimeout(() => {
          if (instance.isOpen) { // Check if still open
            panel.style.height = 'auto';
          }
        }, (instance.config.animationDuration || 300) + 50); // Add buffer to ensure transition completes
      });
    });
    
    // Update container class immediately
    instance.element.classList.add(instance.config.toggleClass!);
    
    // Update text
    instance.textElements.forEach(textEl => {
      if (instance.config.openText) {
        textEl.textContent = instance.config.openText;
      }
    });
    
    // Update ARIA
    instance.triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'true');
    });

    this.logger.debug(`Accordion opened: ${instance.id}`);
    
    // Emit specific event
    this.eventBus.emit('accordion:opened', {
      id: instance.id,
      element: instance.element
    });
  }

  private closeAccordion(instance: AccordionInstance): void {
    instance.isOpen = false;
    
    // Handle smooth height animation for panels
    instance.panels.forEach(panel => {
      // Get current height and set it explicitly
      const currentHeight = panel.offsetHeight;
      panel.style.height = currentHeight + 'px';
      
      // Force a reflow
      panel.offsetHeight;
      
      // Animate to 0 height
      panel.style.height = '0px';
      
      // Remove expanded class after animation completes
      setTimeout(() => {
        panel.classList.remove(instance.config.toggleClass!);
      }, instance.config.animationDuration || 300);
    });
    
    // Update container class immediately
    instance.element.classList.remove(instance.config.toggleClass!);
    
    // Update text
    instance.textElements.forEach(textEl => {
      if (instance.config.closeText) {
        textEl.textContent = instance.config.closeText;
      }
    });
    
    // Update ARIA
    instance.triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    this.logger.debug(`Accordion closed: ${instance.id}`);
    
    // Emit specific event
    this.eventBus.emit('accordion:closed', {
      id: instance.id,
      element: instance.element
    });
  }

  // Public API methods
  public openAccordionById(id: string): void {
    const instance = this.accordions.get(id);
    if (instance && !instance.isOpen) {
      this.openAccordion(instance);
    }
  }

  public closeAccordionById(id: string): void {
    const instance = this.accordions.get(id);
    if (instance && instance.isOpen) {
      this.closeAccordion(instance);
    }
  }

  public toggleAccordionById(id: string): void {
    const instance = this.accordions.get(id);
    if (instance) {
      this.toggleAccordion(instance);
    }
  }

  public getAccordionState(id: string): boolean | null {
    const instance = this.accordions.get(id);
    return instance ? instance.isOpen : null;
  }

  public getAllAccordions(): string[] {
    return Array.from(this.accordions.keys());
  }

  override destroy(): void {
    this.accordions.clear();
    super.destroy();
  }
}

class AccordionInstance {
  public isOpen: boolean;
  public triggers: HTMLElement[] = [];
  public panels: HTMLElement[] = [];
  public textElements: HTMLElement[] = [];

  constructor(
    public id: string,
    public element: HTMLElement,
    public config: AccordionConfig
  ) {
    this.findComponents();
    // Detect initial state from actual DOM state
    this.isOpen = this.detectInitialState();
    this.initializeState();
  }

  private detectInitialState(): boolean {
    const toggleClass = this.config.toggleClass!;
    
    // Check if any panel has the expanded class
    const hasExpandedPanel = this.panels.some(panel => panel.classList.contains(toggleClass));
    
    // Check if container has the expanded class
    const hasExpandedContainer = this.element.classList.contains(toggleClass);
    
    // If either has the class, consider it open
    if (hasExpandedPanel || hasExpandedContainer) {
      return true;
    }
    
    // Otherwise, use the configured initial state
    return this.config.initialState === 'open';
  }

  private findComponents(): void {
    // Find triggers
    const triggers = this.element.querySelectorAll(`[data-next-accordion-trigger="${this.id}"]`);
    this.triggers = Array.from(triggers) as HTMLElement[];

    // Find panels
    const panels = this.element.querySelectorAll(`[data-next-accordion-panel="${this.id}"]`);
    this.panels = Array.from(panels) as HTMLElement[];

    // Find text elements
    const textElements = this.element.querySelectorAll(`[data-next-accordion-text="${this.id}"]`);
    this.textElements = Array.from(textElements) as HTMLElement[];

    // Log warnings if components are missing
    if (this.triggers.length === 0) {
      console.warn(`[AccordionEnhancer] No triggers found for accordion "${this.id}". Make sure you have elements with data-next-accordion-trigger="${this.id}"`);
    }
    if (this.panels.length === 0) {
      console.warn(`[AccordionEnhancer] No panels found for accordion "${this.id}". Make sure you have elements with data-next-accordion-panel="${this.id}"`);
    }
  }

  private initializeState(): void {
    const toggleClass = this.config.toggleClass!;
    
    if (this.isOpen) {
      this.element.classList.add(toggleClass);
      this.panels.forEach(panel => {
        panel.classList.add(toggleClass);
        panel.style.height = 'auto'; // Open panels start with auto height
      });
      this.textElements.forEach(textEl => {
        if (this.config.openText) {
          textEl.textContent = this.config.openText;
        }
      });
    } else {
      this.element.classList.remove(toggleClass);
      this.panels.forEach(panel => {
        panel.classList.remove(toggleClass);
        panel.style.height = '0px'; // Closed panels start with 0 height
      });
      this.textElements.forEach(textEl => {
        if (this.config.closeText) {
          textEl.textContent = this.config.closeText;
        }
      });
    }
  }
}