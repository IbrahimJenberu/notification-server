export declare const healthRouter: import("express-serve-static-core").Router;
declare const metrics: {
    dispatched: number;
    scheduled: number;
    cancelled: number;
    retried: number;
    totalSent: number;
    totalFailed: number;
};
export declare function incrementMetric(key: keyof typeof metrics, by?: number): void;
export {};
//# sourceMappingURL=health.d.ts.map