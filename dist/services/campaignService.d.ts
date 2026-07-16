export declare function dispatchCampaign(tenantId: string, campaignId: string, dispatchedBy: string): Promise<{
    sentCount: number;
    failedCount: number;
}>;
export declare function scheduleCampaign(tenantId: string, campaignId: string, scheduledAt: Date, scheduledBy: string): Promise<void>;
export declare function cancelCampaign(tenantId: string, campaignId: string, cancelledBy: string): Promise<void>;
export declare function retryCampaign(tenantId: string, campaignId: string, retriedBy: string): Promise<{
    sentCount: number;
    failedCount: number;
}>;
//# sourceMappingURL=campaignService.d.ts.map