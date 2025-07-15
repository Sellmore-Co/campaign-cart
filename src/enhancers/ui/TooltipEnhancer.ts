/**
 * Tooltip Enhancer
 * Creates tooltips for elements with data-next-tooltip attribute using Floating UI
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

export interface TooltipConfig {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  delay?: number;
  maxWidth?: string;
  className?: string;
}

export class TooltipEnhancer extends BaseEnhancer {
  private tooltip: HTMLElement | null = null;
  private arrow: HTMLElement | null = null;
  private showTimeout: number | null = null;
  private hideTimeout: number | null = null;
  private config: TooltipConfig;
  private isVisible = false;
  private static stylesInjected = false;

  constructor(element: HTMLElement) {
    super(element);
    this.config = this.parseConfig();
    this.injectStyles();
  }

  public async initialize(): Promise<void> {
    try {
      this.validateElement();
      this.setupEventListeners();
      this.logger.debug('Tooltip enhancer initialized');
    } catch (error) {
      this.handleError(error, 'initialize');
    }
  }

  public update(): void {
    // Re-parse config in case attributes changed
    this.config = this.parseConfig();
    
    // Update tooltip content if it's currently visible
    if (this.isVisible && this.tooltip) {
      this.updateTooltipContent();
    }
  }

  public override destroy(): void {
    this.hide();
    this.cleanupTimeouts();
    super.destroy();
  }

  private parseConfig(): TooltipConfig {
    return {
      placement: (this.getAttribute('data-next-tooltip-placement') as any) || 'top',
      offset: parseInt(this.getAttribute('data-next-tooltip-offset') || '8'),
      delay: parseInt(this.getAttribute('data-next-tooltip-delay') || '500'),
      maxWidth: this.getAttribute('data-next-tooltip-max-width') || '200px',
      className: this.getAttribute('data-next-tooltip-class') || ''
    };
  }

  private injectStyles(): void {
    if (TooltipEnhancer.stylesInjected) return;
    
    const styleId = 'next-tooltip-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
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
    TooltipEnhancer.stylesInjected = true;
    
    this.logger.debug('Tooltip styles injected into document head');
  }

  private setupEventListeners(): void {
    // Mouse events
    this.element.addEventListener('mouseenter', this.handleMouseEnter);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Focus events for accessibility
    this.element.addEventListener('focus', this.handleFocus);
    this.element.addEventListener('blur', this.handleBlur);
    
    // Touch events for mobile
    this.element.addEventListener('touchstart', this.handleTouchStart);
    
    // Escape key to hide tooltip
    document.addEventListener('keydown', this.handleKeydown);
  }

  protected override cleanupEventListeners(): void {
    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    this.element.removeEventListener('focus', this.handleFocus);
    this.element.removeEventListener('blur', this.handleBlur);
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleMouseEnter = (): void => {
    this.scheduleShow();
  };

  private handleMouseLeave = (): void => {
    // Only hide if we're not moving to the tooltip itself
    this.scheduleHide();
  };

  private handleFocus = (): void => {
    this.scheduleShow();
  };

  private handleBlur = (): void => {
    this.scheduleHide();
  };

  private handleTouchStart = (): void => {
    // On touch devices, toggle tooltip
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  };

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  };

  private scheduleShow(): void {
    this.cleanupTimeouts();
    this.showTimeout = window.setTimeout(() => {
      this.show();
    }, this.config.delay);
  }

  private scheduleHide(): void {
    this.cleanupTimeouts();
    this.hideTimeout = window.setTimeout(() => {
      this.hide();
    }, 150); // Slightly longer delay to prevent flicker
  }

  private cleanupTimeouts(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private async show(): Promise<void> {
    if (this.isVisible) return;

    const content = this.getTooltipContent();
    if (!content) return;

    try {
      this.createTooltip(content);
      if (!this.tooltip) return;

      this.isVisible = true;
      document.body.appendChild(this.tooltip);

      // Debug: Log element position
      const rect = this.element.getBoundingClientRect();
      this.logger.debug('Element position', { 
        top: rect.top, 
        left: rect.left, 
        width: rect.width, 
        height: rect.height,
        scrollY: window.scrollY,
        scrollX: window.scrollX
      });

      // Give browser a chance to render before positioning
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Position the tooltip using Floating UI
      await this.positionTooltip();

      // Add show class for animation
      requestAnimationFrame(() => {
        if (this.tooltip) {
          this.tooltip.classList.add('next-tooltip--visible');
        }
      });

      // Set ARIA attributes for accessibility
      this.element.setAttribute('aria-describedby', this.tooltip.id);

      this.logger.debug('Tooltip shown');
    } catch (error) {
      this.handleError(error, 'show tooltip');
    }
  }

  private hide(): void {
    if (!this.isVisible || !this.tooltip) return;

    this.isVisible = false;
    this.tooltip.classList.remove('next-tooltip--visible');

    // Remove after animation
    setTimeout(() => {
      if (this.tooltip && this.tooltip.parentNode) {
        this.tooltip.parentNode.removeChild(this.tooltip);
      }
      this.tooltip = null;
      this.arrow = null;
    }, 200);

    // Remove ARIA attributes
    this.element.removeAttribute('aria-describedby');

    this.logger.debug('Tooltip hidden');
  }

  private getTooltipContent(): string {
    return this.getAttribute('data-next-tooltip') || '';
  }

  private updateTooltipContent(): void {
    if (!this.tooltip) return;
    
    const content = this.getTooltipContent();
    const contentEl = this.tooltip.querySelector('.next-tooltip__content');
    if (contentEl) {
      contentEl.textContent = content;
    }
  }

  private createTooltip(content: string): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = `next-tooltip ${this.config.className || ''}`.trim();
    this.tooltip.id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    this.tooltip.role = 'tooltip';
    this.tooltip.style.maxWidth = this.config.maxWidth || '200px';

    // Create content element
    const contentEl = document.createElement('div');
    contentEl.className = 'next-tooltip__content';
    contentEl.textContent = content;

    // Create arrow element
    this.arrow = document.createElement('div');
    this.arrow.className = 'next-tooltip__arrow';

    this.tooltip.appendChild(contentEl);
    this.tooltip.appendChild(this.arrow);

    // Add hover listeners to tooltip to prevent hiding when hovering over it
    this.tooltip.addEventListener('mouseenter', () => {
      this.cleanupTimeouts();
    });

    this.tooltip.addEventListener('mouseleave', () => {
      this.scheduleHide();
    });
  }

  private async positionTooltip(): Promise<void> {
    if (!this.tooltip || !this.arrow) return;

    try {
      const { x, y, placement, middlewareData } = await computePosition(
        this.element,
        this.tooltip,
        {
          placement: this.config.placement || 'top',
          middleware: [
            offset(this.config.offset || 8),
            flip(),
            shift({ padding: 5 }),
            arrow({ element: this.arrow })
          ],
          strategy: 'fixed'
        }
      );

      // Position tooltip
      Object.assign(this.tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Position arrow
      if (middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left'];

        Object.assign(this.arrow.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide as string]: '-4px',
        });
      }

      // Update tooltip placement class for styling
      this.tooltip.setAttribute('data-placement', placement);

      this.logger.debug('Tooltip positioned', { x, y, placement });

    } catch (error) {
      this.handleError(error, 'position tooltip');
    }
  }
}