export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum ErrorCategory {
    INITIALIZATION = 'initialization',
    STATE_MANAGEMENT = 'state_management',
    RESOURCE_LOADING = 'resource_loading',
    AUDIO = 'audio',
    STORAGE = 'storage',
    RENDERING = 'rendering',
    EVENT = 'event',
    VALIDATION = 'validation',
    CLEANUP = 'cleanup',
    UNKNOWN = 'unknown',
}

export type ErrorContext = {
    [key: string]: unknown;
    component?: string;
    method?: string;
    state?: string;
    timestamp?: number;
};

export type ErrorReport = {
    error: Error;
    severity: ErrorSeverity;
    category: ErrorCategory;
    context?: ErrorContext;
    recoverable: boolean;
    timestamp: number;
};
