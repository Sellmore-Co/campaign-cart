import { B as BaseEnhancer } from "./BaseEnhancer-B4sx_W7g.js";
import { a as useCampaignStore } from "./utils-Bgh0TU7j.js";
class FomoPopupEnhancer extends BaseEnhancer {
  constructor() {
    super(document.body);
    this.isActive = false;
    this.showCount = 0;
    this.popupElement = null;
    this.timeoutIds = [];
    this.defaultItems = [];
    this.defaultCustomers = {
      AU: ["Jessica from Sydney", "Emma from Melbourne", "Olivia from Brisbane", "Sophia from Perth"],
      GB: ["Jane from London", "Olivia from Manchester", "Amelia from Birmingham", "Isabella from Leeds"],
      CA: ["Lily from Toronto", "Emma from Vancouver", "Ava from Montreal", "Sophia from Calgary"],
      US: ["Grace from New York", "Hailey from Sacramento", "Phoebe from Las Vegas", "Jenny from Scottsdale"]
    };
    this.loadItemsFromCampaign();
    this.config = {
      items: this.defaultItems,
      customers: this.defaultCustomers,
      maxMobileShows: 2,
      displayDuration: 5e3,
      delayBetween: 12e3,
      initialDelay: 0,
      country: "US"
    };
  }
  // Implement abstract update method
  async update(data) {
    if (data) {
      this.setup(data);
    }
  }
  loadItemsFromCampaign() {
    const campaignState = useCampaignStore.getState();
    if (campaignState.data?.packages) {
      this.defaultItems = campaignState.data.packages.slice(0, 5).map((pkg) => ({
        text: pkg.name,
        image: pkg.image || ""
      })).filter((item) => item.image);
    }
    if (this.defaultItems.length === 0) {
      this.defaultItems = [
        {
          text: "Popular Package",
          image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EProduct%3C/text%3E%3C/svg%3E"
        }
      ];
    }
  }
  async initialize() {
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", () => resolve());
      });
    }
    this.injectStyles();
  }
  setup(config = {}) {
    if (!config.items) {
      this.loadItemsFromCampaign();
    }
    this.config = {
      ...this.config,
      ...config,
      items: config.items || this.defaultItems,
      customers: config.customers !== void 0 ? config.customers : this.config.customers
    };
    if (!config.country) {
      this.config.country = this.detectCountry();
    }
    this.logger.debug("FOMO popup configured:", this.config);
  }
  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.createPopupElement();
    const timeoutId = window.setTimeout(() => {
      this.showNextPopup();
    }, this.config.initialDelay || 0);
    this.timeoutIds.push(timeoutId);
  }
  stop() {
    this.isActive = false;
    this.timeoutIds.forEach((id) => clearTimeout(id));
    this.timeoutIds = [];
    this.hidePopup();
    this.showCount = 0;
  }
  showNextPopup() {
    if (!this.isActive) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile && this.showCount >= (this.config.maxMobileShows || 2)) {
      this.stop();
      return;
    }
    const item = this.getRandomItem();
    const customer = this.getRandomCustomer();
    this.updatePopupContent(item, customer);
    this.showPopup();
    const hideTimeout = window.setTimeout(() => {
      this.hidePopup();
      const nextTimeout = window.setTimeout(() => {
        this.showNextPopup();
      }, this.config.delayBetween || 12e3);
      this.timeoutIds.push(nextTimeout);
    }, this.config.displayDuration || 5e3);
    this.timeoutIds.push(hideTimeout);
    this.showCount++;
  }
  getRandomItem() {
    const items = this.config.items || [];
    if (items.length === 0) {
      return {
        text: "Popular Package",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EProduct%3C/text%3E%3C/svg%3E"
      };
    }
    return items[Math.floor(Math.random() * items.length)];
  }
  getRandomCustomer() {
    const country = this.config.country || "US";
    const customers = this.config.customers?.[country] || this.config.customers?.["US"] || [];
    return customers[Math.floor(Math.random() * customers.length)] || "Someone";
  }
  detectCountry() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes("Australia")) return "AU";
    if (timezone.includes("London") || timezone.includes("Dublin")) return "GB";
    if (timezone.includes("Toronto") || timezone.includes("Vancouver")) return "CA";
    return "US";
  }
  createPopupElement() {
    if (this.popupElement) return;
    this.popupElement = document.createElement("div");
    this.popupElement.className = "next-fomo-wrapper";
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
  updatePopupContent(item, customer) {
    if (!this.popupElement) return;
    const image = this.popupElement.querySelector(".next-fomo-image");
    const customerEl = this.popupElement.querySelector(".next-fomo-customer");
    const productEl = this.popupElement.querySelector(".next-fomo-product");
    if (image) image.src = item.image;
    if (customerEl) customerEl.textContent = customer;
    if (productEl) productEl.textContent = item.text;
    this.emit("fomo:shown", {
      customer,
      product: item.text,
      image: item.image
    });
  }
  showPopup() {
    if (!this.popupElement) return;
    this.popupElement.style.display = "none";
    this.popupElement.style.display = "";
    requestAnimationFrame(() => {
      if (this.popupElement) {
        this.popupElement.classList.add("next-fomo-show");
      }
    });
  }
  hidePopup() {
    if (!this.popupElement) return;
    this.popupElement.classList.remove("next-fomo-show");
  }
  injectStyles() {
    if (document.getElementById("next-fomo-styles")) return;
    const style = document.createElement("style");
    style.id = "next-fomo-styles";
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
  cleanupEventListeners() {
    this.stop();
    if (this.popupElement) {
      this.popupElement.remove();
      this.popupElement = null;
    }
  }
  destroy() {
    this.cleanupEventListeners();
    super.destroy();
  }
}
export {
  FomoPopupEnhancer
};
