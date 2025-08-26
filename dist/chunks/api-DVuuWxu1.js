import { c as createLogger } from "./utils-65_XgUQi.js";
class ApiClient {
  constructor(apiKey) {
    this.baseURL = "https://campaigns.apps.29next.com";
    this.apiKey = apiKey;
    this.logger = createLogger("ApiClient");
  }
  // Campaign endpoints
  async getCampaigns() {
    return this.request("/api/v1/campaigns/");
  }
  // Cart endpoints
  async createCart(data) {
    return this.request("/api/v1/carts/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  // Order endpoints
  async createOrder(data) {
    return this.request("/api/v1/orders/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async getOrder(refId) {
    return this.request(`/api/v1/orders/${refId}/`);
  }
  async addUpsell(refId, data) {
    return this.request(`/api/v1/orders/${refId}/upsells/`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  // Prospect Cart endpoints
  async createProspectCart(data) {
    return this.request("/api/v1/prospect-carts/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async updateProspectCart(cartId, data) {
    return this.request(`/api/v1/prospect-carts/${cartId}/`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }
  async getProspectCart(cartId) {
    return this.request(`/api/v1/prospect-carts/${cartId}/`);
  }
  async abandonProspectCart(cartId) {
    return this.request(`/api/v1/prospect-carts/${cartId}/abandon/`, {
      method: "POST"
    });
  }
  async convertProspectCart(cartId) {
    return this.request(`/api/v1/prospect-carts/${cartId}/convert/`, {
      method: "POST"
    });
  }
  // Generic request handler with error handling and rate limiting
  async request(endpoint, options) {
    const method = options?.method || "GET";
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Authorization": this.apiKey,
      "Content-Type": "application/json",
      ...options?.headers
    };
    this.logger.debug(`API Request: ${method} ${url}`);
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const message = `Rate limited. Retry after ${retryAfter} seconds`;
        this.logger.warn(message);
        throw new Error(message);
      }
      if (!response.ok) {
        const errorMessage = `API Error: ${response.status} ${response.statusText}`;
        let errorData = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          this.logger.warn("Failed to parse error response body");
        }
        this.logger.error(errorMessage, errorData);
        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        error.responseData = errorData;
        throw error;
      }
      const data = await response.json();
      this.logger.debug(`API Response: ${response.status}`, data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error("API request failed:", error.message);
      } else {
        this.logger.error("API request failed:", String(error));
      }
      throw error;
    }
  }
  // Update API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  // Get current API key
  getApiKey() {
    return this.apiKey;
  }
}
export {
  ApiClient
};
