import { ErrorSeverity, ErrorCategory, ErrorContext } from './types.js';

export class GameError extends Error {
    readonly severity: ErrorSeverity;
    readonly category: ErrorCategory;
    readonly context?: ErrorContext;
    readonly recoverable: boolean;
    readonly timestamp: number;

    constructor(
        message: string,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        category: ErrorCategory = ErrorCategory.UNKNOWN,
        context?: ErrorContext,
        recoverable: boolean = true
    ) {
        super(message);
        this.name = 'GameError';
        this.severity = severity;
        this.category = category;
        this.context = context;
        this.recoverable = recoverable;
        this.timestamp = Date.now();
    }

    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            severity: this.severity,
            category: this.category,
            context: this.context,
            recoverable: this.recoverable,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

export class InitializationError extends GameError {
    constructor(message: string, context?: ErrorContext) {
        super(message, ErrorSeverity.HIGH, ErrorCategory.INITIALIZATION, context, false);
        this.name = 'InitializationError';
    }
}

export class ResourceLoadingError extends GameError {
    constructor(message: string, resource?: string, context?: ErrorContext) {
        super(
            message,
            ErrorSeverity.MEDIUM,
            ErrorCategory.RESOURCE_LOADING,
            { ...context, resource },
            true
        );
        this.name = 'ResourceLoadingError';
    }
}

export class AudioError extends GameError {
    constructor(message: string, soundKey?: string, context?: ErrorContext) {
        super(
            message,
            ErrorSeverity.LOW,
            ErrorCategory.AUDIO,
            { ...context, soundKey },
            true
        );
        this.name = 'AudioError';
    }
}

export class StorageError extends GameError {
    constructor(message: string, context?: ErrorContext) {
        super(message, ErrorSeverity.LOW, ErrorCategory.STORAGE, context, true);
        this.name = 'StorageError';
    }
}

export class StateError extends GameError {
    constructor(message: string, state?: string, context?: ErrorContext) {
        super(
            message,
            ErrorSeverity.HIGH,
            ErrorCategory.STATE_MANAGEMENT,
            { ...context, state },
            false
        );
        this.name = 'StateError';
    }
}

export class ValidationError extends GameError {
    constructor(message: string, context?: ErrorContext) {
        super(message, ErrorSeverity.MEDIUM, ErrorCategory.VALIDATION, context, true);
        this.name = 'ValidationError';
    }
}

export class CleanupError extends GameError {
    constructor(message: string, target?: string, context?: ErrorContext) {
        super(
            message,
            ErrorSeverity.LOW,
            ErrorCategory.CLEANUP,
            { ...context, cleanupTarget: target },
            true
        );
        this.name = 'CleanupError';
    }
}

export class RenderingError extends GameError {
    constructor(message: string, context?: ErrorContext) {
        super(
            message,
            ErrorSeverity.HIGH,
            ErrorCategory.RENDERING,
            context,
            true
        );
        this.name = 'RenderingError';
    }
}