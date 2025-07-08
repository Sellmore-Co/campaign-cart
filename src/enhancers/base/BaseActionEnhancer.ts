import { BaseEnhancer } from './BaseEnhancer';

export abstract class BaseActionEnhancer extends BaseEnhancer {
  protected isProcessing = false;
  
  /**
   * Execute an async action with proper state management
   * Handles loading states and prevents concurrent executions
   * 
   * @param action The async action to execute
   * @param options Configuration options
   * @returns Promise resolving to the action result
   */
  protected async executeAction<T>(
    action: () => Promise<T>,
    options?: { 
      showLoading?: boolean;
      disableOnProcess?: boolean;
    }
  ): Promise<T> {
    // Prevent concurrent executions
    if (this.isProcessing) {
      return Promise.reject(new Error('Already processing'));
    }
    
    this.isProcessing = true;
    
    // Apply loading state if requested
    if (options?.showLoading) {
      this.setLoadingState(true);
    }
    
    // Disable element if requested
    if (options?.disableOnProcess) {
      this.element.setAttribute('disabled', 'true');
    }
    
    try {
      // Execute the action
      const result = await action();
      
      // Emit success event
      this.emit('action:success', {
        action: this.constructor.name,
        data: { element: this.element }
      });
      
      return result;
    } catch (error) {
      // Handle error
      this.handleError(error, 'executeAction');
      
      // Emit failure event
      this.emit('action:failed', {
        action: this.constructor.name,
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    } finally {
      // Reset states
      this.isProcessing = false;
      
      if (options?.showLoading) {
        this.setLoadingState(false);
      }
      
      if (options?.disableOnProcess) {
        this.element.removeAttribute('disabled');
      }
    }
  }
  
  /**
   * Set loading state on element
   * Adds/removes loading class and toggles disabled state
   */
  protected setLoadingState(loading: boolean): void {
    this.toggleClass('loading', loading);
    this.toggleClass('next-loading', loading);
    
    // Update aria-busy for accessibility
    this.setAttribute('aria-busy', loading.toString());
    
    // Disable/enable based on element type
    if (this.element instanceof HTMLButtonElement || 
        this.element instanceof HTMLInputElement ||
        this.element instanceof HTMLSelectElement) {
      this.element.disabled = loading;
    }
  }
  
  /**
   * Check if action is currently processing
   */
  protected isActionProcessing(): boolean {
    return this.isProcessing;
  }
  
  /**
   * Set custom loading content
   * Useful for showing loading spinners or text
   */
  protected setLoadingContent(content: string | null): void {
    if (content !== null) {
      this.setAttribute('data-loading-text', content);
    } else {
      this.removeAttribute('data-loading-text');
    }
  }
  
  /**
   * Debounce an action to prevent rapid repeated calls
   */
  protected debounceAction<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      
      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          try {
            const result = func(...args);
            if (result instanceof Promise) {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    }) as T;
  }
  
  /**
   * Throttle an action to limit execution frequency
   */
  protected throttleAction<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean;
    let lastResult: any;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
        
        lastResult = func(...args);
      }
      
      return lastResult;
    }) as T;
  }
}