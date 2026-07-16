export interface SendPayload {
    title: string;
    body: string;
    imageUrl?: string | null;
    data?: Record<string, string>;
    sound?: 'default' | null;
    badge?: number;
    channelId?: string;
    categoryId?: string;
    ttl?: number;
    priority?: 'default' | 'normal' | 'high';
}
export interface SendResult {
    sentCount: number;
    failedCount: number;
    invalidTokens: string[];
    ticketIds: string[];
}
/**
 * Sends push notifications to all provided tokens, respecting Expo chunk size
 * (100 per request), concurrency limits, and retry-with-backoff on transient
 * failures.
 *
 * After sending, schedules receipt processing for 15 minutes later (Expo
 * receipts take ~5–15 min to populate).
 */
export declare function sendToTokens(tokens: string[], payload: SendPayload, tenantId: string, campaignId: string): Promise<SendResult>;
//# sourceMappingURL=expoSender.d.ts.map