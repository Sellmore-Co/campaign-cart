import { BaseCartEnhancer } from '../base/BaseCartEnhancer';
import { CartState } from '../../types/global';
export declare class QuantityControlEnhancer extends BaseCartEnhancer {
    private action;
    private packageId;
    private step;
    private min;
    private max;
    initialize(): Promise<void>;
    update(data?: any): void;
    private setupEventListeners;
    private handleClick;
    private handleQuantityChange;
    private handleNumberInput;
    private updateQuantity;
    protected handleCartUpdate(_cartState: CartState): void;
    private updateButtonState;
    private updateButtonContent;
    private emitQuantityChangeEvent;
    getCurrentQuantity(): number;
    setQuantity(quantity: number): Promise<void>;
    getConstraints(): {
        min: number;
        max: number;
        step: number;
    };
}
//# sourceMappingURL=QuantityControlEnhancer.d.ts.map