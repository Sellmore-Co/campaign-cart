/**
 * Simple Exit Intent Enhancer
 * One method, handles everything internally
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';

export class ExitIntentEnhancer extends BaseEnhancer {
  private isEnabled = false;
  private triggerCount = 0;
  private lastTriggerTime = 0;
  private maxTriggers = 3;
  private cooldownPeriod = 30000; // 30 seconds
  private imageUrl = '';
  private action: (() => void | Promise<void>) | null = null;
  private popupElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private mouseLeaveHandler: ((e: MouseEvent) => void) | null = null;
  private scrollHandler: ((e: Event) => void) | null = null;

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

  public setup(options: { image: string; action?: () => void | Promise<void> }): void {
    this.imageUrl = options.image;
    this.action = options.action || null;
    this.isEnabled = true;
    this.setupEventListeners();
    this.logger.debug('Simple exit intent setup complete');
  }

  public disable(): void {
    this.isEnabled = false;
    this.cleanupEventListeners();
    this.hidePopup();
  }

  private setupEventListeners(): void {
    // Desktop: mouse leave detection
    this.mouseLeaveHandler = (e: MouseEvent) => {
      if (this.shouldTrigger() && e.clientY <= 10) {
        this.triggerExitIntent();
      }
    };
    document.addEventListener('mouseleave', this.mouseLeaveHandler);

    // Mobile: scroll detection  
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

  private shouldTrigger(): boolean {
    if (!this.isEnabled) return false;
    if (this.popupElement) return false; // Already showing
    if (this.triggerCount >= this.maxTriggers) return false;
    if (Date.now() - this.lastTriggerTime < this.cooldownPeriod) return false;
    return true;
  }

  private triggerExitIntent(): void {
    this.triggerCount++;
    this.lastTriggerTime = Date.now();
    this.showPopup();
  }

  private showPopup(): void {
    this.createPopupElements();
    this.emit('exit-intent:shown', { imageUrl: this.imageUrl });
  }

  private createPopupElements(): void {
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
      cursor: pointer;
      max-width: 90vw;
      max-height: 50vh;
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

    // Click handlers
    this.overlayElement.addEventListener('click', () => {
      this.hidePopup();
      this.emit('exit-intent:dismissed', { imageUrl: this.imageUrl });
    });

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
      
      this.hidePopup();
    });

    // Escape key
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hidePopup();
        this.emit('exit-intent:dismissed', { imageUrl: this.imageUrl });
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