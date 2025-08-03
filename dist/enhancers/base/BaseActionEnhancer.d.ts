import { BaseEnhancer } from './BaseEnhancer';
export declare abstract class BaseActionEnhancer extends BaseEnhancer {
    protected isProcessing: boolean;
    /**
     * Execute an async action with proper state management
     * Handles loading states and prevents concurrent executions
     *
     * @param action The async action to execute
     * @param options Configuration options
     * @returns Promise resolving to the action result
     */
    protected executeAction<T>(action: () => Promise<T>, options?: {
        showLoading?: boolean;
        disableOnProcess?: boolean;
    }): Promise<T>;
    /**
     * Set loading state on element
     * Adds/removes loading class and toggles disabled state
     */
    protected setLoadingState(loading: boolean): void;
    /**
     * Check if action is currently processing
     */
    protected isActionProcessing(): boolean;
    /**
     * Set custom loading content
     * Useful for showing loading spinners or text
     */
    protected setLoadingContent(content: string | null): void;
    /**
     * Debounce an action to prevent rapid repeated calls
     */
    protected debounceAction<T extends (...args: any[]) => any>(func: T, delay: number): T;
    /**
     * Throttle an action to limit execution frequency
     */
    protected throttleAction<T extends (...args: any[]) => any>(func: T, limit: number): T;
}
//# sourceMappingURL=BaseActionEnhancer.d.ts.map