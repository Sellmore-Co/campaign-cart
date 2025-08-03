import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class TimerEnhancer extends BaseEnhancer {
    private duration;
    private persistenceId;
    private format;
    private interval?;
    private startTime;
    initialize(): Promise<void>;
    update(): void;
    private loadStartTime;
    private startTimer;
    private updateDisplay;
    private formatTime;
    private handleTimerExpired;
    destroy(): void;
}
//# sourceMappingURL=TimerEnhancer.d.ts.map