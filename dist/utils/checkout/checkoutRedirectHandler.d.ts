import { Logger } from '../logger';
export declare class CheckoutRedirectHandler {
    private logger;
    constructor(logger: Logger);
    handleOrderRedirect(order: any): void;
    private getNextPageUrlFromMeta;
    getSuccessUrl(): string;
    getFailureUrl(): string;
}
//# sourceMappingURL=checkoutRedirectHandler.d.ts.map