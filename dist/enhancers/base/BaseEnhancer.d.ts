import { Logger } from '../../utils/logger';
import { EventBus } from '../../utils/events';
import { EventMap } from '../../types/global';
export declare abstract class BaseEnhancer {
    protected logger: Logger;
    protected eventBus: EventBus;
    protected element: HTMLElement;
    private subscriptions;
    constructor(element: HTMLElement);
    abstract initialize(): Promise<void> | void;
    abstract update(data?: any): Promise<void> | void;
    destroy(): void;
    protected emit<K extends keyof EventMap>(event: K, detail: EventMap[K]): void;
    protected on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void;
    protected subscribe<T>(store: {
        subscribe: (listener: (state: T) => void) => () => void;
    }, listener: (state: T) => void): void;
    protected getAttribute(name: string): string | null;
    protected getRequiredAttribute(name: string): string;
    protected hasAttribute(name: string): boolean;
    protected setAttribute(name: string, value: string): void;
    protected removeAttribute(name: string): void;
    protected addClass(className: string): void;
    protected removeClass(className: string): void;
    protected hasClass(className: string): boolean;
    protected toggleClass(className: string, force?: boolean): void;
    protected updateTextContent(content: string): void;
    protected updateInnerHTML(html: string): void;
    protected cleanupEventListeners(): void;
    protected validateElement(): void;
    protected handleError(error: unknown, context: string): void;
}
//# sourceMappingURL=BaseEnhancer.d.ts.map