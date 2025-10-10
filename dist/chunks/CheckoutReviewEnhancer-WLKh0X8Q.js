import { B as BaseEnhancer } from "./index-BFFLKz5B.js";
import { d as useCheckoutStore } from "./utils-DVUxWczj.js";
class CheckoutReviewEnhancer extends BaseEnhancer {
  constructor(element) {
    super(element);
    this.configs = [];
  }
  async initialize() {
    await this.enhance();
  }
  update() {
    const checkoutStore = useCheckoutStore.getState();
    this.updateDisplay(checkoutStore.formData);
  }
  async enhance() {
    this.logger.info("CheckoutReviewEnhancer initializing", {
      element: this.element.tagName,
      className: this.element.className
    });
    const reviewElements = this.element.querySelectorAll("[data-next-checkout-review]");
    this.logger.info("Found review elements:", {
      count: reviewElements.length,
      elements: Array.from(reviewElements).map((el) => ({
        tag: el.tagName,
        field: el.getAttribute("data-next-checkout-review"),
        format: el.getAttribute("data-next-format")
      }))
    });
    reviewElements.forEach((el) => {
      const field = el.getAttribute("data-next-checkout-review");
      const format = el.getAttribute("data-next-format") || "text";
      const fallback = el.getAttribute("data-next-fallback") || "";
      if (field && el instanceof HTMLElement) {
        this.configs.push({
          element: el,
          field,
          format,
          fallback
        });
      }
    });
    this.logger.debug("Found review elements:", {
      count: this.configs.length,
      fields: this.configs.map((c) => c.field)
    });
    this.unsubscribe = useCheckoutStore.subscribe((state) => {
      this.updateDisplay(state.formData);
    }) || void 0;
    const checkoutStore = useCheckoutStore.getState();
    this.updateDisplay(checkoutStore.formData);
  }
  updateDisplay(formData) {
    const checkoutStore = useCheckoutStore.getState();
    this.configs.forEach((config) => {
      const value = this.getFieldValue(config.field, formData, checkoutStore);
      const formattedValue = this.formatValue(value, config.format, formData);
      if (formattedValue) {
        config.element.textContent = formattedValue;
        config.element.classList.remove("next-review-empty");
      } else {
        config.element.textContent = config.fallback || "";
        config.element.classList.add("next-review-empty");
      }
    });
  }
  getFieldValue(field, formData, checkoutStore) {
    if (field.includes(".")) {
      const parts = field.split(".");
      const firstPart = parts[0];
      if (checkoutStore && ["shippingMethod", "billingAddress", "paymentMethod"].includes(firstPart)) {
        let value2 = checkoutStore;
        for (const part of parts) {
          value2 = value2?.[part];
          if (value2 === void 0) break;
        }
        return value2;
      }
      let value = formData;
      for (const part of parts) {
        value = value?.[part];
        if (value === void 0) break;
      }
      return value;
    }
    return formData[field];
  }
  formatValue(value, format, formData) {
    if (!value && format !== "address" && format !== "name") {
      return "";
    }
    switch (format) {
      case "address":
        return this.formatAddress(formData);
      case "name":
        return this.formatName(formData);
      case "phone":
        return this.formatPhone(value);
      case "currency":
        return this.formatCurrency(value);
      case "text":
      default:
        return String(value || "");
    }
  }
  formatCurrency(value) {
    if (value === null || value === void 0) return "";
    const numValue = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numValue)) return String(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  }
  formatAddress(formData) {
    const parts = [];
    if (formData.address1) {
      parts.push(formData.address1);
    }
    if (formData.address2) {
      parts.push(formData.address2);
    }
    const cityLine = [];
    if (formData.city) cityLine.push(formData.city);
    if (formData.province) cityLine.push(formData.province);
    if (formData.postal) cityLine.push(formData.postal);
    if (cityLine.length > 0) {
      parts.push(cityLine.join(" "));
    }
    if (formData.country) {
      const countryName = this.getCountryName(formData.country);
      parts.push(countryName);
    }
    return parts.join(", ");
  }
  formatName(formData) {
    const parts = [];
    if (formData.fname) parts.push(formData.fname);
    if (formData.lname) parts.push(formData.lname);
    return parts.join(" ");
  }
  formatPhone(value) {
    if (!value) return "";
    if (value.startsWith("+")) {
      return value;
    }
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return value;
  }
  getCountryName(countryCode) {
    const countryMap = {
      US: "United States",
      CA: "Canada",
      GB: "United Kingdom",
      AU: "Australia",
      NZ: "New Zealand",
      IE: "Ireland",
      DE: "Germany",
      FR: "France",
      ES: "Spain",
      IT: "Italy",
      NL: "Netherlands",
      BE: "Belgium",
      CH: "Switzerland",
      AT: "Austria",
      DK: "Denmark",
      SE: "Sweden",
      NO: "Norway",
      FI: "Finland",
      BR: "Brazil",
      MX: "Mexico",
      AR: "Argentina",
      CL: "Chile",
      CO: "Colombia",
      PE: "Peru",
      JP: "Japan",
      CN: "China",
      KR: "South Korea",
      IN: "India",
      SG: "Singapore",
      MY: "Malaysia",
      TH: "Thailand",
      PH: "Philippines",
      ID: "Indonesia",
      VN: "Vietnam",
      ZA: "South Africa",
      EG: "Egypt",
      NG: "Nigeria",
      KE: "Kenya",
      IL: "Israel",
      AE: "United Arab Emirates",
      SA: "Saudi Arabia",
      TR: "Turkey",
      RU: "Russia",
      UA: "Ukraine",
      PL: "Poland",
      CZ: "Czech Republic",
      HU: "Hungary",
      RO: "Romania",
      GR: "Greece",
      PT: "Portugal"
    };
    return countryMap[countryCode] || countryCode;
  }
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    super.destroy();
  }
}
export {
  CheckoutReviewEnhancer
};
