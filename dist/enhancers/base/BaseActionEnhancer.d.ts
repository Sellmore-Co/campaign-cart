import { BaseEnhancer } from './BaseEnhancer';
export declare abstract class BaseActionEnhancer extends BaseEnhancer {
    protected isProcessing: boolean;
    protected executeAction<T>(action: () => Promise<T>, options?: {
        showLoading?: boolean;
        disableOnProcess?: boolean;
    }): Promise<T>;
    protected setLoadingState(loading: boolean): void;
    protected isActionProcessing(): boolean;
    protected setLoadingContent(content: string | null): void;
    protected debounceAction<T extends (...args: any[]) => any>(func: T, delay: number): T;
    protected throttleAction<T extends (...args: any[]) => any>(func: T, limit: number): T;
}
//# sourceMappingURL=BaseActionEnhancer.d.ts.map