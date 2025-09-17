import { c as createLogger, t as trackAPICall } from "./utils-zDRSnh-1.js";
class ApiClient {
  constructor(apiKey) {
    this.baseURL = "https://campaigns.apps.29next.com";
    this.apiKey = apiKey;
    this.logger = createLogger("ApiClient");
  }
  // Campaign endpoints
  async getCampaigns(currency) {
    const queryString = currency ? `?currency=${currency}` : "";
    return this.request(`/api/v1/campaigns/${queryString}`);
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
  // Get request type from endpoint
  getRequestType(endpoint) {
    if (endpoint.includes("/campaigns")) return "campaign";
    if (endpoint.includes("/upsells")) return "upsell";
    if (endpoint.includes("/orders")) return "order";
    if (endpoint.includes("/prospect-carts")) return "prospect_cart";
    if (endpoint.includes("/carts")) return "cart";
    return "campaign";
  }
  // Get error type from status code
  getErrorType(status) {
    if (status === 0) return "network";
    if (status === 429) return "rate_limit";
    if (status === 401 || status === 403) return "auth";
    if (status >= 500) return "server_error";
    if (status >= 400) return "client_error";
    return "network";
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
    const startTime = performance.now();
    let statusCode = 0;
    let errorMessage;
    let errorType;
    let retryAfter;
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      const duration = performance.now() - startTime;
      statusCode = response.status;
      if (response.status === 429) {
        retryAfter = parseInt(response.headers.get("Retry-After") || "60");
        errorMessage = `Rate limited. Retry after ${retryAfter} seconds`;
        errorType = "rate_limit";
        this.logger.warn(errorMessage);
        queueMicrotask(() => {
          const trackData = {
            endpoint,
            method,
            statusCode,
            responseTime: duration,
            requestType: this.getRequestType(endpoint),
            success: false
          };
          if (errorMessage) trackData.errorMessage = errorMessage;
          if (errorType) trackData.errorType = errorType;
          if (retryAfter) trackData.retryAfter = retryAfter;
          trackAPICall(trackData);
        });
        throw new Error(errorMessage);
      }
      if (!response.ok) {
        errorMessage = `API Error: ${response.status} ${response.statusText}`;
        errorType = this.getErrorType(response.status);
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
        queueMicrotask(() => {
          const trackData = {
            endpoint,
            method,
            statusCode,
            responseTime: duration,
            requestType: this.getRequestType(endpoint),
            success: false
          };
          if (errorMessage) trackData.errorMessage = errorMessage;
          if (errorType) trackData.errorType = errorType;
          trackAPICall(trackData);
        });
        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        error.responseData = errorData;
        throw error;
      }
      const data = await response.json();
      this.logger.debug(`API Response: ${response.status}`, data);
      queueMicrotask(() => {
        trackAPICall({
          endpoint,
          method,
          statusCode,
          responseTime: duration,
          requestType: this.getRequestType(endpoint),
          success: true
        });
      });
      return data;
    } catch (error) {
      if (statusCode === 0) {
        const duration = performance.now() - startTime;
        queueMicrotask(() => {
          trackAPICall({
            endpoint,
            method,
            statusCode: 0,
            responseTime: duration,
            requestType: this.getRequestType(endpoint),
            success: false,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorType: "network"
          });
        });
      }
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
