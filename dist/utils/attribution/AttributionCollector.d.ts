import { AttributionState } from '../../stores/attributionStore';
export declare class AttributionCollector {
    collect(): Promise<AttributionState>;
    private collectMetadata;
    private limitSubaffiliateLength;
    private getStoredValue;
    private getCookie;
    private getDeviceType;
    private getFunnelName;
    private handleEverflowClickId;
    private collectTrackingTags;
    private getFacebookPixelId;
    private getFirstVisitTimestamp;
}
//# sourceMappingURL=AttributionCollector.d.ts.map