/**
 * API Client for 29Next Campaigns API
 */

import type { Campaign, Cart, Order, CartBase, CreateOrder, AddUpsellLine } from '@/types/api';
import { Logger, createLogger } from '@/utils/logger';
import { trackAPICall } from '@/utils/analytics/amplitude';

export class ApiClient {
  private baseURL = 'https://campaigns.apps.29next.com';
  private apiKey: string;
  private logger: Logger;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.logger = createLogger('ApiClient');
  }

  // Campaign endpoints
  public async getCampaigns(currency?: string): Promise<Campaign> {
    const queryString = currency ? `?currency=${currency}` : '';
    return this.request<Campaign>(`/api/v1/campaigns/${queryString}`);
  }

  // Cart endpoints
  public async createCart(data: CartBase & { currency?: string }): Promise<Cart> {
    return this.request<Cart>('/api/v1/carts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order endpoints
  public async createOrder(data: CreateOrder & { currency?: string }): Promise<Order> {
    return this.request<Order>('/api/v1/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getOrder(refId: string): Promise<Order> {
    return this.request<Order>(`/api/v1/orders/${refId}/`);
  }

  public async addUpsell(refId: string, data: AddUpsellLine): Promise<Order> {
    return this.request<Order>(`/api/v1/orders/${refId}/upsells/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Prospect Cart endpoints
  public async createProspectCart(data: any): Promise<any> {
    return this.request('/api/v1/prospect-carts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateProspectCart(cartId: string, data: any): Promise<any> {
    return this.request(`/api/v1/prospect-carts/${cartId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getProspectCart(cartId: string): Promise<any> {
    return this.request(`/api/v1/prospect-carts/${cartId}/`);
  }

  public async abandonProspectCart(cartId: string): Promise<any> {
    return this.request(`/api/v1/prospect-carts/${cartId}/abandon/`, {
      method: 'POST',
    });
  }

  public async convertProspectCart(cartId: string): Promise<any> {
    return this.request(`/api/v1/prospect-carts/${cartId}/convert/`, {
      method: 'POST',
    });
  }

  // Get request type from endpoint
  private getRequestType(endpoint: string): 'campaign' | 'cart' | 'order' | 'upsell' | 'prospect_cart' {
    if (endpoint.includes('/campaigns')) return 'campaign';
    if (endpoint.includes('/upsells')) return 'upsell';
    if (endpoint.includes('/orders')) return 'order';
    if (endpoint.includes('/prospect-carts')) return 'prospect_cart';
    if (endpoint.includes('/carts')) return 'cart';
    return 'campaign'; // default
  }

  // Get error type from status code
  private getErrorType(status: number): 'network' | 'rate_limit' | 'auth' | 'server_error' | 'client_error' {
    if (status === 0) return 'network';
    if (status === 429) return 'rate_limit';
    if (status === 401 || status === 403) return 'auth';
    if (status >= 500) return 'server_error';
    if (status >= 400) return 'client_error';
    return 'network';
  }

  // Generic request handler with error handling and rate limiting
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const method = options?.method || 'GET';
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    };
    
    this.logger.debug(`API Request: ${method} ${url}`);

    const startTime = performance.now();
    let statusCode = 0;
    let errorMessage: string | undefined;
    let errorType: 'network' | 'rate_limit' | 'auth' | 'server_error' | 'client_error' | undefined;
    let retryAfter: number | undefined;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      const duration = performance.now() - startTime;
      statusCode = response.status;

      // Handle rate limiting
      if (response.status === 429) {
        retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        errorMessage = `Rate limited. Retry after ${retryAfter} seconds`;
        errorType = 'rate_limit';
        this.logger.warn(errorMessage);
        
        // Track API call failure
        queueMicrotask(() => {
          const trackData: any = {
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

      // Handle other errors
      if (!response.ok) {
        errorMessage = `API Error: ${response.status} ${response.statusText}`;
        errorType = this.getErrorType(response.status);
        
        // Try to parse error response body
        let errorData: any = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          this.logger.warn('Failed to parse error response body');
        }
        
        this.logger.error(errorMessage, errorData);
        
        // Track API call failure
        queueMicrotask(() => {
          const trackData: any = {
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
        
        // Create enhanced error with response data
        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.statusText = response.statusText;
        error.responseData = errorData;
        throw error;
      }

      const data = await response.json();
      
      this.logger.debug(`API Response: ${response.status}`, data);
      
      // Track successful API call
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
      // Track network errors if not already tracked
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
            errorType: 'network'
          });
        });
      }
      
      if (error instanceof Error) {
        this.logger.error('API request failed:', error.message);
      } else {
        this.logger.error('API request failed:', String(error));
      }
      
      throw error;
    }
  }

  // Update API key
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // Get current API key
  public getApiKey(): string {
    return this.apiKey;
  }
}