/**
 * General Modal Component
 * A reusable modal dialog with customizable content and actions
 */

export interface ModalButton {
  text: string;
  className?: string;
  style?: string;
  action: 'confirm' | 'cancel' | 'custom';
  href?: string;
  target?: string;
}

export interface ModalOptions {
  title: string;
  content: string;
  buttons: ModalButton[];
  className?: string;
  backdropDismiss?: boolean;
}

export class GeneralModal {
  private backdrop: HTMLDivElement | undefined;
  private modal: HTMLDivElement | undefined;
  private style: HTMLStyleElement | undefined;
  private resolve: ((action: string) => void) | undefined;
  private options: ModalOptions;

  constructor(options: ModalOptions) {
    this.options = {
      backdropDismiss: true,
      ...options
    };
  }

  /**
   * Shows the modal dialog
   * @returns Promise that resolves to the action taken ('confirm', 'cancel', 'custom', or 'backdrop')
   */
  public async show(): Promise<string> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.createModal();
    });
  }

  private createModal(): void {
    // Create modal backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = `next-modal-backdrop ${this.options.className ? this.options.className + '-backdrop' : ''}`;
    this.backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    `;
    
    // Create modal content
    this.modal = document.createElement('div');
    this.modal.className = `next-modal ${this.options.className || ''}`;
    this.modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
      animation: slideIn 0.3s ease-out;
    `;
    
    // Build modal HTML
    const buttonsHtml = this.options.buttons.map((button, index) => {
      const defaultStyles = this.getDefaultButtonStyles(button.action);
      const style = button.style || defaultStyles;
      const className = button.className || `next-modal-${button.action}`;
      
      if (button.href) {
        return `<a 
          href="${button.href}" 
          target="${button.target || '_self'}"
          class="${className}" 
          data-action="${button.action}"
          data-index="${index}"
          style="${style}"
        >${button.text}</a>`;
      }
      
      return `<button 
        class="${className}" 
        data-action="${button.action}"
        data-index="${index}"
        style="${style}"
      >${button.text}</button>`;
    }).join('');
    
    this.modal.innerHTML = `
      <div class="next-modal-header" style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #1a202c;">
          ${this.options.title}
        </h3>
        <button class="next-modal-close" data-action="cancel" style="
          background: none;
          border: none;
          font-size: 24px;
          color: #718096;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        ">&times;</button>
      </div>
      <div class="next-modal-body" style="padding: 24px; max-height: 60vh; overflow-y: auto;">
        <div style="color: #4a5568; line-height: 1.6;">
          ${this.options.content}
        </div>
      </div>
      <div class="next-modal-footer" style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; justify-content: flex-end;">
        ${buttonsHtml}
      </div>
    `;
    
    // Add CSS animations
    this.style = document.createElement('style');
    this.style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { 
          opacity: 0;
          transform: translateY(-20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      .next-modal-close:hover {
        background: #f7fafc !important;
      }
      .next-modal-cancel:hover {
        border-color: #cbd5e0 !important;
        background: #f7fafc !important;
      }
      .next-modal-confirm:hover {
        background: var(--brand--color--primary, #3182ce) !important;
        filter: brightness(0.9);
      }
      .next-modal a {
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(this.style);
    
    this.backdrop.appendChild(this.modal);
    document.body.appendChild(this.backdrop);
    
    // Handle button clicks
    const actionElements = this.modal.querySelectorAll('[data-action]');
    actionElements.forEach(element => {
      if (element.tagName !== 'A') {
        element.addEventListener('click', (e) => this.handleAction(e));
      } else {
        // For links, we still want to track the action before navigation
        element.addEventListener('click', (e) => {
          const action = (e.currentTarget as HTMLElement).getAttribute('data-action') || 'custom';
          
          // Store resolve before cleanup
          const resolveFunc = this.resolve;
          this.cleanup();
          
          // Call resolve after cleanup
          if (resolveFunc) {
            resolveFunc(action);
          }
        });
      }
    });
    
    // Handle backdrop click
    if (this.options.backdropDismiss) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.handleDismiss();
        }
      });
    }

    // Handle escape key
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  private getDefaultButtonStyles(action: string): string {
    switch (action) {
      case 'confirm':
        return `
          padding: 10px 20px;
          border: none;
          background: var(--brand--color--primary, #3182ce);
          color: white;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        `;
      case 'cancel':
        return `
          padding: 10px 20px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          color: #4a5568;
          transition: all 0.2s;
        `;
      default:
        return `
          padding: 10px 20px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          color: #4a5568;
          transition: all 0.2s;
        `;
    }
  }

  private handleEscapeKey(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.options.backdropDismiss) {
      this.handleDismiss();
    }
  }

  private handleAction(e: Event): void {
    const action = (e.currentTarget as HTMLElement).getAttribute('data-action') || 'custom';
    console.log('[GeneralModal] Button clicked with action:', action);
    
    // Store resolve before cleanup
    const resolveFunc = this.resolve;
    this.cleanup();
    
    // Call resolve after cleanup
    if (resolveFunc) {
      resolveFunc(action);
    }
  }

  private handleDismiss(): void {
    // Store resolve before cleanup
    const resolveFunc = this.resolve;
    this.cleanup();
    
    // Call resolve after cleanup
    if (resolveFunc) {
      resolveFunc('backdrop');
    }
  }

  private cleanup(): void {
    if (this.backdrop) {
      this.backdrop.remove();
    }
    if (this.style) {
      this.style.remove();
    }
    document.removeEventListener('keydown', this.handleEscapeKey);
    this.backdrop = undefined;
    this.modal = undefined;
    this.style = undefined;
    this.resolve = undefined;
  }

  /**
   * Static method for convenience - creates and shows a modal in one call
   */
  public static async show(options: ModalOptions): Promise<string> {
    const modal = new GeneralModal(options);
    return modal.show();
  }

  /**
   * Static convenience method for duplicate upsell modal
   */
  public static async showDuplicateUpsell(): Promise<boolean> {
    const action = await GeneralModal.show({
      title: 'Already Added!',
      content: "You've already added this item to your order. Would you like to add it again?",
      buttons: [
        { text: 'Yes, Add Again', action: 'cancel' },
        { text: 'Skip to Next', action: 'confirm' }
      ]
    });
    return action === 'cancel';
  }

  /**
   * Static convenience method for recent purchase warning
   */
  public static async showRecentPurchaseWarning(): Promise<string> {
    const action = await GeneralModal.show({
      title: 'Attention',
      content: `Your initial order has been successfully processed. Please check your email for the order confirmation. Entering your payment details again will result in a secondary purchase.`,
      buttons: [
        { text: 'Close', action: 'cancel' },
        { text: 'Back', action: 'confirm' }
      ]
    });
    return action;
  }
}