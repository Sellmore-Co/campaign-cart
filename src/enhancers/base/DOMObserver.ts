/**
 * DOM Observer
 * Performance-optimized MutationObserver for dynamic content and attribute changes
 */

import { Logger, createLogger } from '@/utils/logger';

export interface DOMObserverConfig {
  childList?: boolean;
  subtree?: boolean;
  attributes?: boolean;
  attributeFilter?: string[];
  attributeOldValue?: boolean;
  characterData?: boolean;
  characterDataOldValue?: boolean;
}

export interface DOMChangeEvent {
  type: 'added' | 'removed' | 'attributeChanged';
  element: HTMLElement;
  attributeName?: string | undefined;
  oldValue?: string | undefined;
  newValue?: string | undefined;
}

export type DOMChangeHandler = (event: DOMChangeEvent) => void;

export class DOMObserver {
  private logger: Logger;
  private observer: MutationObserver;
  private handlers = new Set<DOMChangeHandler>();
  private isObserving = false;
  private config: DOMObserverConfig;
  private throttleTimeout: number | undefined;
  private pendingChanges = new Set<HTMLElement>();

  constructor(config: DOMObserverConfig = {}) {
    this.logger = createLogger('DOMObserver');
    this.config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-next-display',
        'data-next-toggle',
        'data-next-timer',
        'data-next-show',
        'data-next-hide',
        'data-next-checkout',
        'data-next-validate',
        'data-next-express-checkout'
      ],
      ...config
    };

    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }

  /**
   * Add a change handler
   */
  public addHandler(handler: DOMChangeHandler): void {
    this.handlers.add(handler);
    this.logger.debug(`Added handler, total: ${this.handlers.size}`);
  }

  /**
   * Remove a change handler
   */
  public removeHandler(handler: DOMChangeHandler): void {
    this.handlers.delete(handler);
    this.logger.debug(`Removed handler, total: ${this.handlers.size}`);
  }

  /**
   * Start observing DOM changes
   */
  public start(target: Element = document.body): void {
    if (this.isObserving) {
      this.logger.warn('Already observing, ignoring start request');
      return;
    }

    try {
      this.observer.observe(target, this.config);
      this.isObserving = true;
      this.logger.debug('Started observing DOM changes', { target: target.tagName });
    } catch (error) {
      this.logger.error('Failed to start DOM observation:', error);
    }
  }

  /**
   * Stop observing DOM changes
   */
  public stop(): void {
    if (!this.isObserving) {
      return;
    }

    this.observer.disconnect();
    this.isObserving = false;
    this.clearThrottle();
    this.pendingChanges.clear();
    this.logger.debug('Stopped observing DOM changes');
  }

  /**
   * Temporarily pause observation
   */
  public pause(): void {
    if (this.isObserving) {
      this.observer.disconnect();
      this.isObserving = false;
      this.logger.debug('Paused DOM observation');
    }
  }

  /**
   * Resume observation after pause
   */
  public resume(target: Element = document.body): void {
    if (!this.isObserving) {
      this.start(target);
      this.logger.debug('Resumed DOM observation');
    }
  }

  /**
   * Check if currently observing
   */
  public isActive(): boolean {
    return this.isObserving;
  }

  /**
   * Handle mutation records from MutationObserver
   */
  private handleMutations(mutations: MutationRecord[]): void {
    const relevantMutations = mutations.filter(mutation => this.isRelevantMutation(mutation));
    
    if (relevantMutations.length === 0) {
      return;
    }

    this.logger.debug(`Processing ${relevantMutations.length} relevant mutations`);

    // Collect all changed elements
    for (const mutation of relevantMutations) {
      this.processMutation(mutation);
    }

    // Throttle notifications to avoid excessive processing
    this.throttleNotifications();
  }

  /**
   * Check if a mutation is relevant to our data attributes
   */
  private isRelevantMutation(mutation: MutationRecord): boolean {
    switch (mutation.type) {
      case 'childList':
        // Check if added/removed nodes have our attributes or contain elements with them
        return this.hasRelevantNodes(mutation.addedNodes) || 
               this.hasRelevantNodes(mutation.removedNodes);
      
      case 'attributes':
        // Check if the attribute change is for one of our data attributes
        const attrName = mutation.attributeName;
        return attrName !== null && 
               this.config.attributeFilter?.includes(attrName) === true;
      
      default:
        return false;
    }
  }

  /**
   * Check if a NodeList contains relevant elements
   */
  private hasRelevantNodes(nodeList: NodeList): boolean {
    for (const node of nodeList) {
      if (node instanceof HTMLElement) {
        if (this.hasRelevantAttributes(node) || this.hasRelevantDescendants(node)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if an element has relevant data attributes
   */
  private hasRelevantAttributes(element: HTMLElement): boolean {
    return this.config.attributeFilter?.some(attr => element.hasAttribute(attr)) === true;
  }

  /**
   * Check if an element has descendants with relevant attributes
   */
  private hasRelevantDescendants(element: HTMLElement): boolean {
    if (!this.config.attributeFilter) return false;
    
    const selector = this.config.attributeFilter.map(attr => `[${attr}]`).join(',');
    return element.querySelector(selector) !== null;
  }

  /**
   * Process a single mutation record
   */
  private processMutation(mutation: MutationRecord): void {
    switch (mutation.type) {
      case 'childList':
        this.processChildListMutation(mutation);
        break;
      
      case 'attributes':
        this.processAttributeMutation(mutation);
        break;
    }
  }

  /**
   * Process child list mutations (added/removed nodes)
   */
  private processChildListMutation(mutation: MutationRecord): void {
    // Handle added nodes
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLElement) {
        this.addElementForProcessing(node, 'added');
        
        // Also check descendants
        if (this.config.attributeFilter) {
          const selector = this.config.attributeFilter.map(attr => `[${attr}]`).join(',');
          const descendants = node.querySelectorAll(selector);
          descendants.forEach(desc => {
            if (desc instanceof HTMLElement) {
              this.addElementForProcessing(desc, 'added');
            }
          });
        }
      }
    }

    // Handle removed nodes
    for (const node of mutation.removedNodes) {
      if (node instanceof HTMLElement) {
        this.addElementForProcessing(node, 'removed');
      }
    }
  }

  /**
   * Process attribute mutations
   */
  private processAttributeMutation(mutation: MutationRecord): void {
    if (mutation.target instanceof HTMLElement && mutation.attributeName) {
      const element = mutation.target;
      const attributeName = mutation.attributeName;
      const oldValue = mutation.oldValue;
      const newValue = element.getAttribute(attributeName);
      
      this.notifyHandlers({
        type: 'attributeChanged',
        element,
        attributeName,
        oldValue: oldValue || undefined,
        newValue: newValue || undefined
      });
    }
  }

  /**
   * Add an element to the pending changes queue
   */
  private addElementForProcessing(element: HTMLElement, type: 'added' | 'removed'): void {
    if (this.hasRelevantAttributes(element)) {
      this.pendingChanges.add(element);
      
      // Immediately notify for removed elements since they're about to be gone
      if (type === 'removed') {
        this.notifyHandlers({
          type: 'removed',
          element,
          attributeName: undefined,
          oldValue: undefined,
          newValue: undefined
        });
      }
    }
  }

  /**
   * Throttle notifications to avoid excessive processing
   */
  private throttleNotifications(): void {
    if (this.throttleTimeout) {
      return;
    }

    this.throttleTimeout = window.setTimeout(() => {
      this.processePendingChanges();
      this.throttleTimeout = undefined;
    }, 16); // ~60fps
  }

  /**
   * Process all pending changes
   */
  private processePendingChanges(): void {
    if (this.pendingChanges.size === 0) {
      return;
    }

    this.logger.debug(`Processing ${this.pendingChanges.size} pending changes`);

    for (const element of this.pendingChanges) {
      this.notifyHandlers({
        type: 'added',
        element,
        attributeName: undefined,
        oldValue: undefined,
        newValue: undefined
      });
    }

    this.pendingChanges.clear();
  }

  /**
   * Notify all handlers of a change
   */
  private notifyHandlers(event: DOMChangeEvent): void {
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error) {
        this.logger.error('Handler error:', error);
      }
    }
  }

  /**
   * Clear throttle timeout
   */
  private clearThrottle(): void {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = undefined;
    }
  }

  /**
   * Cleanup and destroy observer
   */
  public destroy(): void {
    this.stop();
    this.handlers.clear();
    this.logger.debug('DOM observer destroyed');
  }

  /**
   * Get current configuration
   */
  public getConfig(): DOMObserverConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (requires restart)
   */
  public updateConfig(newConfig: Partial<DOMObserverConfig>): void {
    const wasObserving = this.isObserving;
    let target: Element | undefined;

    if (wasObserving) {
      target = document.body; // Default target
      this.stop();
    }

    this.config = { ...this.config, ...newConfig };

    if (wasObserving && target) {
      this.start(target);
    }

    this.logger.debug('Updated configuration', this.config);
  }
}