/**
 * API Client for 29Next Campaigns API
 */

import type { Campaign, Cart, Order, CartBase, CreateOrder, AddUpsellLine } from '@/types/api';
import { Logger, createLogger } from '@/utils/logger';
import { sentryManager } from '@/utils/monitoring/SentryManager';

export class ApiClient {
  private baseURL = 'https://campaigns.apps.29next.com';
  private apiKey: string;
  private logger: Logger;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.logger = createLogger('ApiClient');
  }

  // Campaign endpoints
  public async getCampaigns(): Promise<Campaign> {
    return this.request<Campaign>('/api/v1/campaigns/');
  }

  // Cart endpoints
  public async createCart(data: CartBase): Promise<Cart> {
    return this.request<Cart>('/api/v1/carts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order endpoints
  public async createOrder(data: CreateOrder): Promise<Order> {
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
    
    // Use Sentry.startSpan as per error-rules.md
    return sentryManager.startSpan(
      {
        op: 'http.client',
        name: `${method} ${endpoint}`,
        attributes: {
          'http.method': method,
          'http.url': url,
          'api.key_prefix': this.apiKey.slice(0, 8)
        }
      },
      async (span) => {
        const headers = {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
          ...options?.headers,
        };
        
        this.logger.debug(`API Request: ${method} ${url}`);
        
        // Add request body size if present
        if (options?.body && typeof options.body === 'string') {
          span?.setAttribute('http.request.body.size', options.body.length);
        }

        try {
          const startTime = performance.now();
          const response = await fetch(url, {
            ...options,
            headers,
          });
          const duration = performance.now() - startTime;
          
          // Add response attributes
          span?.setAttribute('http.status_code', response.status);
          span?.setAttribute('http.response.duration', duration);

          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            span?.setAttribute('rate_limit.retry_after', retryAfter);
            const message = `Rate limited. Retry after ${retryAfter} seconds`;
            this.logger.warn(message);
            throw new Error(message);
          }

          // Handle other errors
          if (!response.ok) {
            const errorMessage = `API Error: ${response.status} ${response.statusText}`;
            span?.setAttribute('error', true);
            span?.setAttribute('error.message', errorMessage);
            
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
          
          // Add response size
          const responseSize = JSON.stringify(data).length;
          span?.setAttribute('http.response.body.size', responseSize);
          
          this.logger.debug(`API Response: ${response.status}`, data);
          
          return data;
        } catch (error) {
          // Mark span as errored
          span?.setAttribute('error', true);
          
          if (error instanceof Error) {
            span?.setAttribute('error.type', error.name);
            span?.setAttribute('error.message', error.message);
            this.logger.error('API request failed:', error.message);
          } else {
            span?.setAttribute('error.type', 'unknown');
            span?.setAttribute('error.message', String(error));
            this.logger.error('API request failed:', String(error));
          }
          
          throw error;
        }
      }
    );
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