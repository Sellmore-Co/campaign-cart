import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class ProfileSwitcherEnhancer extends BaseEnhancer {
    private profileId?;
    private clearCart;
    private preserveQuantities;
    private clickHandler?;
    private profileManager;
    initialize(): Promise<void>;
    private handleClick;
    private updateActiveState;
    update(_data?: any): void;
    destroy(): void;
}
export declare class ProfileSelectorEnhancer extends BaseEnhancer {
    private selectElement?;
    private changeHandler?;
    private profileManager;
    private clearCart;
    private preserveQuantities;
    initialize(): Promise<void>;
    private populateOptions;
    private handleChange;
    private updateSelectedValue;
    update(_data?: any): void;
    destroy(): void;
}
//# sourceMappingURL=ProfileSwitcherEnhancer.d.ts.map