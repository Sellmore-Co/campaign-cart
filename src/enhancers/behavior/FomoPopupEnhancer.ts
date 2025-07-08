/**
 * FOMO Popup Enhancer
 * Shows social proof popups with recent purchases
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCampaignStore } from '@/stores/campaignStore';
import type { Package } from '@/types/campaign';

interface FomoItem {
  text: string;
  image: string;
}

interface FomoConfig {
  items?: FomoItem[];
  customers?: { [country: string]: string[] } | undefined;
  maxMobileShows?: number;
  displayDuration?: number;
  delayBetween?: number;
  initialDelay?: number;
  country?: string;
}

export class FomoPopupEnhancer extends BaseEnhancer {
  private config: FomoConfig;
  private isActive = false;
  private showCount = 0;
  private popupElement: HTMLElement | null = null;
  private timeoutIds: number[] = [];
  
  // Default items will be populated from campaign data
  private defaultItems: FomoItem[] = [];

  private defaultCustomers = {
    AU: ["Jessica from Sydney", "Emma from Melbourne", "Olivia from Brisbane", "Sophia from Perth"],
    GB: ["Jane from London", "Olivia from Manchester", "Amelia from Birmingham", "Isabella from Leeds"],
    CA: ["Lily from Toronto", "Emma from Vancouver", "Ava from Montreal", "Sophia from Calgary"],
    US: ["Grace from New York", "Hailey from Sacramento", "Phoebe from Las Vegas", "Jenny from Scottsdale"]
  };

  constructor() {
    super(document.body);
    this.loadItemsFromCampaign();
    this.config = {
      items: this.defaultItems,
      customers: this.defaultCustomers,
      maxMobileShows: 2,
      displayDuration: 5000,
      delayBetween: 12000,
      initialDelay: 0,
      country: 'US'
    };
  }

  // Implement abstract update method
  public async update(data?: any): Promise<void> {
    // Update configuration if data is provided
    if (data) {
      this.setup(data);
    }
  }
  
  private loadItemsFromCampaign(): void {
    const campaignState = useCampaignStore.getState();
    
    if (campaignState.data?.packages) {
      // Create FOMO items from campaign packages
      this.defaultItems = campaignState.data.packages
        .slice(0, 5) // Take first 5 packages
        .map((pkg: Package) => ({
          text: pkg.name,
          image: pkg.image || ''
        }))
        .filter(item => item.image); // Only include items with images
    }
    
    // If no items from campaign, use generic placeholders
    if (this.defaultItems.length === 0) {
      this.defaultItems = [
        { 
          text: "Popular Package", 
          image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EProduct%3C/text%3E%3C/svg%3E" 
        }
      ];
    }
  }

  public async initialize(): Promise<void> {
    if (document.readyState === 'loading') {
      await new Promise<void>(resolve => {
        document.addEventListener('DOMContentLoaded', () => resolve());
      });
    }
    this.injectStyles();
  }

  public setup(config: FomoConfig = {}): void {
    // If no items provided, refresh from campaign
    if (!config.items) {
      this.loadItemsFromCampaign();
    }
    
    // Merge config with defaults
    this.config = {
      ...this.config,
      ...config,
      items: config.items || this.defaultItems,
      customers: config.customers !== undefined ? config.customers : this.config.customers
    };
    
    // Auto-detect country if not provided
    if (!config.country) {
      this.config.country = this.detectCountry();
    }
    
    this.logger.debug('FOMO popup configured:', this.config);
  }

  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.createPopupElement();
    
    // Start after initial delay
    const timeoutId = window.setTimeout(() => {
      this.showNextPopup();
    }, this.config.initialDelay || 0);
    
    this.timeoutIds.push(timeoutId);
  }

  public stop(): void {
    this.isActive = false;
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
    this.hidePopup();
    this.showCount = 0;
  }

  private showNextPopup(): void {
    if (!this.isActive) return;
    
    // Check mobile limit
    const isMobile = window.innerWidth <= 768;
    if (isMobile && this.showCount >= (this.config.maxMobileShows || 2)) {
      this.stop();
      return;
    }
    
    // Get random item and customer
    const item = this.getRandomItem();
    const customer = this.getRandomCustomer();
    
    // Update popup content
    this.updatePopupContent(item, customer);
    
    // Show popup
    this.showPopup();
    
    // Schedule hide and next show
    const hideTimeout = window.setTimeout(() => {
      this.hidePopup();
      
      const nextTimeout = window.setTimeout(() => {
        this.showNextPopup();
      }, this.config.delayBetween || 12000);
      
      this.timeoutIds.push(nextTimeout);
    }, this.config.displayDuration || 5000);
    
    this.timeoutIds.push(hideTimeout);
    this.showCount++;
  }

  private getRandomItem(): FomoItem {
    const items = this.config.items || [];
    if (items.length === 0) {
      // Return a default item if no items available
      return {
        text: "Popular Package",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EProduct%3C/text%3E%3C/svg%3E"
      };
    }
    return items[Math.floor(Math.random() * items.length)]!;
  }

  private getRandomCustomer(): string {
    const country = this.config.country || 'US';
    const customers = this.config.customers?.[country] || this.config.customers?.['US'] || [];
    return customers[Math.floor(Math.random() * customers.length)] || 'Someone';
  }

  private detectCountry(): string {
    // Simple country detection based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Australia')) return 'AU';
    if (timezone.includes('London') || timezone.includes('Dublin')) return 'GB';
    if (timezone.includes('Toronto') || timezone.includes('Vancouver')) return 'CA';
    return 'US';
  }

  private createPopupElement(): void {
    if (this.popupElement) return;
    
    this.popupElement = document.createElement('div');
    this.popupElement.className = 'next-fomo-wrapper';
    this.popupElement.innerHTML = `
      <div class="next-fomo-inner">
        <div class="next-fomo-item">
          <div class="next-fomo-thumb">
            <img class="next-fomo-image" alt="Product">
          </div>
          <div class="next-fomo-desc">
            <p>
              <span class="next-fomo-customer"></span><br>
              Just purchased:<br>
              <span class="next-fomo-product"></span><br>
              <span class="next-fomo-time">JUST NOW</span>
            </p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.popupElement);
  }

  private updatePopupContent(item: FomoItem, customer: string): void {
    if (!this.popupElement) return;
    
    const image = this.popupElement.querySelector('.next-fomo-image') as HTMLImageElement;
    const customerEl = this.popupElement.querySelector('.next-fomo-customer');
    const productEl = this.popupElement.querySelector('.next-fomo-product');
    
    if (image) image.src = item.image;
    if (customerEl) customerEl.textContent = customer;
    if (productEl) productEl.textContent = item.text;
    
    this.emit('fomo:shown', { 
      customer, 
      product: item.text, 
      image: item.image 
    });
  }

  private showPopup(): void {
    if (!this.popupElement) return;
    
    // Trigger reflow to restart animation
    this.popupElement.style.display = 'none';
    void this.popupElement.offsetHeight;
    this.popupElement.style.display = '';
    
    requestAnimationFrame(() => {
      if (this.popupElement) {
        this.popupElement.classList.add('next-fomo-show');
      }
    });
  }

  private hidePopup(): void {
    if (!this.popupElement) return;
    this.popupElement.classList.remove('next-fomo-show');
  }

  private injectStyles(): void {
    if (document.getElementById('next-fomo-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'next-fomo-styles';
    style.textContent = `
      .next-fomo-wrapper {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 320px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transform: translateY(120%);
        transition: transform 0.8s ease;
        z-index: 999998;
      }
      
      .next-fomo-wrapper.next-fomo-show {
        transform: translateY(0);
      }
      
      @media (max-width: 768px) {
        .next-fomo-wrapper {
          width: calc(100% - 40px);
          max-width: 320px;
        }
      }
      
      .next-fomo-item {
        display: flex;
        padding: 15px;
        align-items: center;
      }
      
      .next-fomo-thumb {
        flex-shrink: 0;
        margin-right: 15px;
      }
      
      .next-fomo-thumb img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
      }
      
      .next-fomo-desc {
        flex: 1;
      }
      
      .next-fomo-desc p {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        color: #333;
      }
      
      .next-fomo-customer {
        font-weight: 600;
        color: #000;
      }
      
      .next-fomo-product {
        font-weight: 600;
        color: #000;
      }
      
      .next-fomo-time {
        font-size: 11px;
        color: #999;
        text-transform: uppercase;
      }
    `;
    
    document.head.appendChild(style);
  }

  protected override cleanupEventListeners(): void {
    this.stop();
    if (this.popupElement) {
      this.popupElement.remove();
      this.popupElement = null;
    }
  }

  public override destroy(): void {
    this.cleanupEventListeners();
    super.destroy();
  }
}