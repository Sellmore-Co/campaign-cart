import { Logger } from '../../../utils/logger';
import { OrderManager } from '../managers/OrderManager';
import { CartItem } from '../../../types/global';

export declare class ExpressCheckoutProcessor {
    private logger;
    private addClassCallback;
    private removeClassCallback;
    private emitCallback;
    private orderManager;
    constructor(logger: Logger, addClassCallback: (className: string) => void, removeClassCallback: (className: string) => void, emitCallback: (event: string, data: any) => void, orderManager: OrderManager);
    handleExpressCheckout(method: string, cartItems: CartItem[], isCartEmpty: boolean, resetCart: () => void): Promise<void>;
}
//# sourceMappingURL=ExpressCheckoutProcessor.d.ts.map