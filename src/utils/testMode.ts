/**
 * Test Mode Utilities
 * Handles test mode features including Konami code and test card numbers
 */

export interface TestCard {
  number: string;
  name: string;
  cvv: string;
  expiry: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
}

export class TestModeManager {
  private static instance: TestModeManager;
  private isTestMode = false;
  private konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  private keySequence: string[] = [];
  private konamiCallback?: () => void;

  private testCards: TestCard[] = [
    {
      number: '4111111111111111',
      name: 'Visa Test Card',
      cvv: '123',
      expiry: '12/25',
      type: 'visa'
    },
    {
      number: '5555555555554444',
      name: 'Mastercard Test Card',
      cvv: '123',
      expiry: '12/25',
      type: 'mastercard'
    },
    {
      number: '378282246310005',
      name: 'American Express Test Card',
      cvv: '1234',
      expiry: '12/25',
      type: 'amex'
    },
    {
      number: '6011111111111117',
      name: 'Discover Test Card',
      cvv: '123',
      expiry: '12/25',
      type: 'discover'
    }
  ];

  public static getInstance(): TestModeManager {
    if (!TestModeManager.instance) {
      TestModeManager.instance = new TestModeManager();
    }
    return TestModeManager.instance;
  }

  private constructor() {
    this.initializeKonamiCode();
    this.checkUrlTestMode();
  }

  private initializeKonamiCode(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keySequence.push(event.code);
    
    // Keep only the last 10 keys
    if (this.keySequence.length > this.konamiSequence.length) {
      this.keySequence.shift();
    }
    
    // Check if sequence matches
    if (this.keySequence.length === this.konamiSequence.length) {
      const isMatch = this.keySequence.every((key, index) => 
        key === this.konamiSequence[index]
      );
      
      if (isMatch) {
        this.activateKonamiCode();
        this.keySequence = []; // Reset sequence
      }
    }
  }

  private checkUrlTestMode(): void {
    const params = new URLSearchParams(window.location.search);
    const debugMode = params.get('debugger') === 'true';
    const testMode = params.get('test') === 'true';
    
    if (debugMode || testMode) {
      this.isTestMode = true;
    }
  }

  private activateKonamiCode(): void {
    console.log('🎮 Konami Code activated!');
    
    this.isTestMode = true;
    this.showKonamiMessage();
    
    // Add URL parameter to maintain test mode
    const url = new URL(window.location.href);
    url.searchParams.set('test', 'true');
    window.history.replaceState({}, '', url.toString());
    
    // Call callback if registered
    if (this.konamiCallback) {
      setTimeout(() => {
        this.konamiCallback?.();
      }, 2000);
    }
    
    // Emit event
    document.dispatchEvent(new CustomEvent('next:test-mode-activated', {
      detail: { method: 'konami' }
    }));
  }

  private showKonamiMessage(): void {
    const message = document.createElement('div');
    message.className = 'konami-activation-message';
    message.innerHTML = `
      <div class="konami-content">
        <h3>🎮 Konami Code Activated!</h3>
        <p>Test mode enabled. You can now use test payment methods.</p>
        <div class="konami-progress">
          <div class="konami-progress-bar"></div>
        </div>
      </div>
    `;
    
    // Add styles
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      text-align: center;
      min-width: 300px;
    `;
    
    const progressBar = message.querySelector('.konami-progress-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 1rem;
      `;
      
      progressBar.innerHTML = '<div style="width: 0; height: 100%; background: white; transition: width 2s ease-in-out;"></div>';
    }
    
    document.body.appendChild(message);
    
    // Animate progress bar
    setTimeout(() => {
      const bar = progressBar?.querySelector('div') as HTMLElement;
      if (bar) {
        bar.style.width = '100%';
      }
    }, 100);
    
    // Remove message after animation
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 2500);
  }

  public setTestMode(enabled: boolean): void {
    this.isTestMode = enabled;
    
    if (enabled) {
      const url = new URL(window.location.href);
      url.searchParams.set('test', 'true');
      window.history.replaceState({}, '', url.toString());
    }
  }

  public isActive(): boolean {
    return this.isTestMode;
  }

  public onKonamiCode(callback: () => void): void {
    this.konamiCallback = callback;
  }

  public getTestCards(): TestCard[] {
    return [...this.testCards];
  }

  public getTestCard(type?: string): TestCard {
    if (type) {
      const card = this.testCards.find(c => c.type === type);
      if (card) return card;
    }
    const defaultCard = this.testCards[0];
    if (!defaultCard) {
      throw new Error('No test cards available');
    }
    return defaultCard;
  }

  public fillTestCardData(cardType: string = 'visa'): void {
    if (!this.isTestMode) return;
    
    const testCard = this.getTestCard(cardType);
    
    // Find and fill card number field
    const numberField = document.querySelector('input[data-spreedly="number"], input[name*="card_number"], input[name*="cardNumber"]') as HTMLInputElement;
    if (numberField) {
      numberField.value = testCard.number;
      numberField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Find and fill CVV field
    const cvvField = document.querySelector('input[data-spreedly="cvv"], input[name*="cvv"], input[name*="security"]') as HTMLInputElement;
    if (cvvField) {
      cvvField.value = testCard.cvv;
      cvvField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Find and fill expiry fields
    const expiryField = document.querySelector('input[name*="expiry"], input[name*="exp"]') as HTMLInputElement;
    if (expiryField) {
      expiryField.value = testCard.expiry;
      expiryField.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // Try separate month/year fields
      const monthField = document.querySelector('select[name*="month"], input[name*="month"]') as HTMLInputElement | HTMLSelectElement;
      const yearField = document.querySelector('select[name*="year"], input[name*="year"]') as HTMLInputElement | HTMLSelectElement;
      
      if (monthField && yearField) {
        const [month, year] = testCard.expiry.split('/');
        if (month && year) {
          monthField.value = month;
          yearField.value = `20${year}`;
          monthField.dispatchEvent(new Event('change', { bubbles: true }));
          yearField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
    
    // Find and fill cardholder name
    const nameField = document.querySelector('input[name*="cardholder"], input[name*="card_name"]') as HTMLInputElement;
    if (nameField) {
      nameField.value = 'Test Cardholder';
      nameField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    console.log(`Filled test card data: ${testCard.name}`);
  }

  public showTestCardMenu(): void {
    if (!this.isTestMode) return;
    
    const menu = document.createElement('div');
    menu.className = 'test-card-menu';
    menu.innerHTML = `
      <div class="test-card-content">
        <h4>Test Card Numbers</h4>
        <div class="test-card-options">
          ${this.testCards.map(card => `
            <button class="test-card-option" data-card-type="${card.type}">
              <div class="card-name">${card.name}</div>
              <div class="card-number">${card.number}</div>
            </button>
          `).join('')}
        </div>
        <button class="test-card-close">Close</button>
      </div>
    `;
    
    menu.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      min-width: 250px;
    `;
    
    // Add click handlers
    menu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('test-card-option') || target.closest('.test-card-option')) {
        const button = target.closest('.test-card-option') as HTMLElement;
        const cardType = button.getAttribute('data-card-type');
        if (cardType) {
          this.fillTestCardData(cardType);
          menu.remove();
        }
      } else if (target.classList.contains('test-card-close')) {
        menu.remove();
      }
    });
    
    document.body.appendChild(menu);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (menu.parentNode) {
        menu.remove();
      }
    }, 30000);
  }
}

// Global instance
export const testModeManager = TestModeManager.getInstance();