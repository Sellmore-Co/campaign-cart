/**
 * API Client for 29Next Campaigns API
 */

import type { Campaign, Cart, Order, CartBase, CreateOrder, AddUpsellLine } from '@/types/api';
import { Logger, createLogger } from '@/utils/logger';

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

    try {
      // const startTime = performance.now();
      const response = await fetch(url, {
        ...options,
        headers,
      });
      // const duration = performance.now() - startTime;

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const message = `Rate limited. Retry after ${retryAfter} seconds`;
        this.logger.warn(message);
        throw new Error(message);
      }

      // Handle other errors
      if (!response.ok) {
        const errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
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
        
        // Create enhanced error with response data
        const error = new Error(errorMessage) as any;
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