/**
 * Simple Exit Intent Enhancer
 * One method, handles everything internally
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';

export class ExitIntentEnhancer extends BaseEnhancer {
  private isEnabled = false;
  private triggerCount = 0;
  private lastTriggerTime = 0;
  private maxTriggers = 1; // Default to 1 trigger
  private cooldownPeriod = 30000; // 30 seconds
  private imageUrl = '';
  private templateName = ''; // Name for template (e.g., 'exit-intent')
  private templateElement: HTMLTemplateElement | null = null; // Reference to template element
  private action: (() => void | Promise<void>) | null = null;
  private popupElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private mouseLeaveHandler: ((e: MouseEvent) => void) | null = null;
  private scrollHandler: ((e: Event) => void) | null = null;
  private disableOnMobile = true; // Default to desktop-only like the reference code
  private mobileScrollTrigger = false; // Explicitly enable mobile scroll trigger
  private sessionStorageKey = 'exit-intent-dismissed';
  private useSessionStorage = true; // Enable session storage by default
  private overlayClosable = true; // Allow overlay click to close
  private showCloseButton = false; // Show close button on modal
  private imageClickable = true; // Make image clickable (default true for backward compat)
  private actionButtonText = ''; // Text for action button

  constructor() {
    super(document.body);
  }

  public async initialize(): Promise<void> {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise<void>(resolve => {
        document.addEventListener('DOMContentLoaded', () => resolve());
      });
    }
    
    // Load trigger count from session storage if available
    if (this.useSessionStorage && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const storedData = sessionStorage.getItem(this.sessionStorageKey);
        if (storedData) {
          const data = JSON.parse(storedData);
          this.triggerCount = data.triggerCount || 0;
          this.lastTriggerTime = data.lastTriggerTime || 0;
        }
      } catch (error) {
        this.logger.debug('Failed to load session storage data:', error);
      }
    }
  }

  // Implement abstract update method
  public async update(data?: any): Promise<void> {
    // Update configuration if data is provided
    if (data && typeof data === 'object') {
      if (data.image) {
        this.setup(data);
      }
    }
  }

  public setup(options: {
    image?: string; // Now optional - use either image or template
    template?: string; // Name of the template to use (e.g., 'exit-intent')
    action?: () => void | Promise<void>;
    disableOnMobile?: boolean;
    mobileScrollTrigger?: boolean; // Enable scroll trigger on mobile
    maxTriggers?: number; // Configure max triggers
    useSessionStorage?: boolean; // Enable/disable session storage
    sessionStorageKey?: string; // Custom session storage key
    overlayClosable?: boolean; // Allow overlay click to close
    showCloseButton?: boolean; // Show close button on modal
    imageClickable?: boolean; // Make image clickable to trigger action (default: true for backward compat)
    actionButtonText?: string; // Text for action button (if provided, shows button instead of clickable image)
  }): void {
    // Validate that either image or template is provided
    if (!options.image && !options.template) {
      this.logger.error('Exit intent requires either an image URL or a template name');
      return;
    }
    
    this.imageUrl = options.image || '';
    this.templateName = options.template || '';
    this.action = options.action || null;
    this.disableOnMobile = options.disableOnMobile !== undefined ? options.disableOnMobile : true; // Default true
    this.mobileScrollTrigger = options.mobileScrollTrigger || false;
    this.maxTriggers = options.maxTriggers !== undefined ? options.maxTriggers : 1; // Default to 1
    this.useSessionStorage = options.useSessionStorage !== undefined ? options.useSessionStorage : true;
    this.overlayClosable = options.overlayClosable !== undefined ? options.overlayClosable : true;
    this.showCloseButton = options.showCloseButton || false;
    this.imageClickable = options.imageClickable !== undefined ? options.imageClickable : true;
    this.actionButtonText = options.actionButtonText || '';
    if (options.sessionStorageKey) {
      this.sessionStorageKey = options.sessionStorageKey;
    }
    
    // Find template element if template name is provided
    if (this.templateName) {
      // Look for <template data-template="name">
      this.templateElement = document.querySelector(`template[data-template="${this.templateName}"]`) as HTMLTemplateElement;
      if (!this.templateElement) {
        this.logger.error(`Exit intent template not found: <template data-template="${this.templateName}">`);
        return;
      }
    }
    
    // Check if we should enable based on device
    if (this.disableOnMobile && this.isMobileDevice()) {
      this.logger.debug('Exit intent disabled on mobile device');
      return;
    }
    
    this.isEnabled = true;
    this.setupEventListeners();
    this.logger.debug('Simple exit intent setup complete');
  }

  public disable(): void {
    this.isEnabled = false;
    this.cleanupEventListeners();
    this.hidePopup();
  }
  
  public reset(): void {
    // Reset the trigger count and clear session storage
    this.triggerCount = 0;
    this.lastTriggerTime = 0;
    
    if (this.useSessionStorage && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem(this.sessionStorageKey);
      } catch (error) {
        this.logger.debug('Failed to clear session storage:', error);
      }
    }
  }

  private setupEventListeners(): void {
    // Desktop: mouse leave detection (always enabled on desktop)
    if (!this.isMobileDevice()) {
      this.mouseLeaveHandler = (e: MouseEvent) => {
        if (this.shouldTrigger() && e.clientY <= 10) {
          this.triggerExitIntent();
        }
      };
      document.addEventListener('mouseleave', this.mouseLeaveHandler);
    }

    // Mobile: scroll detection (only if explicitly enabled)
    if (this.isMobileDevice() && this.mobileScrollTrigger) {
      this.scrollHandler = () => {
        if (this.shouldTrigger()) {
          const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrollPercent >= 50) {
            this.triggerExitIntent();
          }
        }
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }
  }

  private isMobileDevice(): boolean {
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check viewport width (mobile typically < 768px)
    const isMobileWidth = window.innerWidth < 768;
    
    // Check user agent for mobile devices
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileUA = mobileRegex.test(navigator.userAgent);
    
    // Consider it mobile if it has touch AND (mobile width OR mobile UA)
    return hasTouch && (isMobileWidth || isMobileUA);
  }

  private shouldTrigger(): boolean {
    if (!this.isEnabled) return false;
    if (this.popupElement) return false; // Already showing
    if (this.triggerCount >= this.maxTriggers) return false;
    if (Date.now() - this.lastTriggerTime < this.cooldownPeriod) return false;
    
    // Additional check for mobile even if not disabled globally
    if (this.disableOnMobile && this.isMobileDevice()) return false;
    
    return true;
  }

  private triggerExitIntent(): void {
    this.triggerCount++;
    this.lastTriggerTime = Date.now();
    
    // Save to session storage
    this.saveToSessionStorage();
    
    this.showPopup();
  }
  
  private saveToSessionStorage(): void {
    if (this.useSessionStorage && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const data = {
          triggerCount: this.triggerCount,
          lastTriggerTime: this.lastTriggerTime,
          timestamp: Date.now()
        };
        sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(data));
      } catch (error) {
        this.logger.debug('Failed to save to session storage:', error);
      }
    }
  }

  private showPopup(): void {
    if (this.templateElement) {
      this.createTemplatePopup();
    } else {
      this.createImagePopup();
    }
    this.emit('exit-intent:shown', { 
      imageUrl: this.imageUrl,
      template: this.templateName
    });
  }

  private createTemplatePopup(): void {
    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'exit-intent-overlay';
    this.overlayElement.setAttribute('data-exit-intent', 'overlay');
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 999999;
      cursor: ${this.overlayClosable ? 'pointer' : 'default'};
    `;

    // Create popup container
    this.popupElement = document.createElement('div');
    this.popupElement.className = 'exit-intent-popup exit-intent-template-popup';
    this.popupElement.setAttribute('data-exit-intent', 'popup');
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

    // Clone and show the template content
    if (this.templateElement) {
      // Use the template's content property to get a document fragment
      const templateContent = this.templateElement.content.cloneNode(true) as DocumentFragment;
      
      // Append the cloned content to the popup
      this.popupElement.appendChild(templateContent);
      
      // Process any data-next attributes in the popup element
      this.processTemplateActions(this.popupElement);
    }

    // Add close button if enabled
    if (this.showCloseButton) {
      const closeButton = document.createElement('button');
      closeButton.className = 'exit-intent-close';
      closeButton.setAttribute('data-exit-intent', 'close');
      closeButton.innerHTML = '&times;';
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
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hidePopup();
        this.emit('exit-intent:closed', { imageUrl: this.imageUrl, template: this.templateName });
      });
      this.popupElement.appendChild(closeButton);
    }

    // Click handlers
    if (this.overlayClosable) {
      this.overlayElement.addEventListener('click', () => {
        this.hidePopup();
        this.emit('exit-intent:dismissed', { imageUrl: this.imageUrl, template: this.templateName });
        this.saveToSessionStorage();
      });
    }

    // Prevent popup clicks from closing when clicking inside
    this.popupElement.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Escape key
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hidePopup();
        this.emit('exit-intent:dismissed', { imageUrl: this.imageUrl, template: this.templateName });
        this.saveToSessionStorage();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);

    // Add to DOM with animation
    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.popupElement);

    requestAnimationFrame(() => {
      if (this.overlayElement) this.overlayElement.style.opacity = '1';
      if (this.popupElement) {
        this.popupElement.style.opacity = '0';
        this.popupElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        this.popupElement.style.transition = 'all 0.3s ease';
        requestAnimationFrame(() => {
          if (this.popupElement) {
            this.popupElement.style.opacity = '1';
            this.popupElement.style.transform = 'translate(-50%, -50%) scale(1)';
          }
        });
      }
    });
  }

  private processTemplateActions(templateElement: HTMLElement): void {
    // Find elements with data-exit-intent-action attributes
    const actionElements = templateElement.querySelectorAll('[data-exit-intent-action]');
    
    actionElements.forEach(element => {
      const actionType = element.getAttribute('data-exit-intent-action');
      
      switch(actionType) {
        case 'close':
          element.addEventListener('click', () => {
            this.hidePopup();
            this.emit('exit-intent:action', { action: 'close' });
          });
          break;
        
        case 'apply-coupon':
          const couponCode = element.getAttribute('data-coupon-code');
          if (couponCode) {
            element.addEventListener('click', async () => {
              this.emit('exit-intent:action', { action: 'apply-coupon', couponCode });
              // Apply the coupon through cart store
              const { useCartStore } = await import('@/stores/cartStore');
              const cartStore = useCartStore.getState();
              await cartStore.applyCoupon(couponCode);
              this.hidePopup();
            });
          }
          break;
        
        case 'custom':
          element.addEventListener('click', async () => {
            if (this.action) {
              await this.action();
            }
            this.emit('exit-intent:action', { action: 'custom' });
            this.hidePopup();
          });
          break;
      }
    });
  }

  private createImagePopup(): void {
    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'exit-intent-overlay';
    this.overlayElement.setAttribute('data-exit-intent', 'overlay');
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

    // Create popup
    this.popupElement = document.createElement('div');
    this.popupElement.className = 'exit-intent-popup';
    this.popupElement.setAttribute('data-exit-intent', 'popup');
    this.popupElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000000;
      cursor: ${this.imageClickable && !this.actionButtonText ? 'pointer' : 'default'};
      max-width: 90vw;
      max-height: ${this.actionButtonText ? '60vh' : '50vh'};
    `;

    // Create image
    const image = document.createElement('img');
    image.className = 'exit-intent-image';
    image.setAttribute('data-exit-intent', 'image');
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
      this.logger.error('Failed to load exit intent image:', this.imageUrl);
      this.hidePopup();
    };

    this.popupElement.appendChild(image);

    // Add action button if specified
    if (this.actionButtonText) {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        text-align: center;
        margin-top: 20px;
      `;

      const actionButton = document.createElement('button');
      actionButton.className = 'exit-intent-action-button';
      actionButton.setAttribute('data-exit-intent', 'action');
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

      actionButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        this.emit('exit-intent:clicked', { imageUrl: this.imageUrl });

        // Execute action if provided
        if (this.action) {
          try {
            await this.action();
          } catch (error) {
            this.logger.error('Exit intent action failed:', error);
          }
        }

        // Mark as clicked in session storage
        this.saveToSessionStorage();
        this.hidePopup();
      });

      buttonContainer.appendChild(actionButton);
      this.popupElement.appendChild(buttonContainer);
    }

    // Add close button
    if (this.showCloseButton) {
      const closeButton = document.createElement('button');
      closeButton.className = 'exit-intent-close';
      closeButton.setAttribute('data-exit-intent', 'close');
      closeButton.innerHTML = '&times;';
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
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hidePopup();
        this.emit('exit-intent:closed', { imageUrl: this.imageUrl });
      });
      this.popupElement.appendChild(closeButton);
    }

    // Click handlers
    this.overlayElement.addEventListener('click', () => {
      this.hidePopup();
      this.emit('exit-intent:dismissed', { imageUrl: this.imageUrl });
      // Mark as dismissed in session storage
      this.saveToSessionStorage();
    });

    // Only make the popup clickable if imageClickable is true and no action button
    if (this.imageClickable && !this.actionButtonText) {
      this.popupElement.addEventListener('click', async (e) => {
        e.stopPropagation();
        this.emit('exit-intent:clicked', { imageUrl: this.imageUrl });

        // Execute action if provided
        if (this.action) {
          try {
            await this.action();
          } catch (error) {
            this.logger.error('Exit intent action failed:', error);
          }
        }

        // Mark as clicked in session storage
        this.saveToSessionStorage();
        this.hidePopup();
      });
    } else {
      // Prevent popup clicks from closing when clicking inside
      this.popupElement.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Escape key
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hidePopup();
        this.emit('exit-intent:dismissed', { imageUrl: this.imageUrl });
        // Mark as dismissed in session storage
        this.saveToSessionStorage();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);

    // Add to DOM with animation
    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.popupElement);

    requestAnimationFrame(() => {
      if (this.overlayElement) this.overlayElement.style.opacity = '1';
      if (this.popupElement) {
        this.popupElement.style.opacity = '0';
        this.popupElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        this.popupElement.style.transition = 'all 0.3s ease';
        requestAnimationFrame(() => {
          if (this.popupElement) {
            this.popupElement.style.opacity = '1';
            this.popupElement.style.transform = 'translate(-50%, -50%) scale(1)';
          }
        });
      }
    });
  }

  public hidePopup(): void {
    if (this.popupElement) {
      this.popupElement.style.transition = 'all 0.2s ease';
      this.popupElement.style.opacity = '0';
      this.popupElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
      
      setTimeout(() => {
        if (this.popupElement) {
          this.popupElement.remove();
          this.popupElement = null;
        }
      }, 200);
    }

    if (this.overlayElement) {
      this.overlayElement.style.transition = 'opacity 0.2s ease';
      this.overlayElement.style.opacity = '0';
      
      setTimeout(() => {
        if (this.overlayElement) {
          this.overlayElement.remove();
          this.overlayElement = null;
        }
      }, 200);
    }
  }

  protected override cleanupEventListeners(): void {
    if (this.mouseLeaveHandler) {
      document.removeEventListener('mouseleave', this.mouseLeaveHandler);
      this.mouseLeaveHandler = null;
    }

    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }

    this.hidePopup();
  }

  public override destroy(): void {
    this.cleanupEventListeners();
    super.destroy();
  }
}