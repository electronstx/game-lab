import { ErrorSeverity, type GameError } from './index.js';

export function handleError(error: GameError): void {
    switch (error.severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
            console.error(`[${error.name}] ${error.message}`, error);
            break;
        case ErrorSeverity.MEDIUM:
            console.warn(`[${error.name}] ${error.message}`, error);
            break;
        case ErrorSeverity.LOW:
        default:
            console.info(`[${error.name}] ${error.message}`, error);
            break;
    }

    if (!error.recoverable) {
        throw error;
    }
}

export function handleErrorSilently(error: GameError): void {
    switch (error.severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
            console.error(`[${error.name}] ${error.message}`, error);
            break;
        case ErrorSeverity.MEDIUM:
            console.warn(`[${error.name}] ${error.message}`, error);
            break;
        case ErrorSeverity.LOW:
        default:
            console.info(`[${error.name}] ${error.message}`, error);
            break;
    }
}
