import {
    ErrorCategory,
    ErrorSeverity,
    GameError,
    handleError,
    handleErrorSilently,
} from '@game-lab/errors';

export function safeCall<T>(
    fn: () => T,
    context: { component: string; method: string },
    silent: boolean = false,
): T | undefined {
    try {
        return fn();
    } catch (error) {
        const gameError =
            error instanceof GameError
                ? error
                : new GameError(
                      `Error in ${context.component}.${context.method}`,
                      ErrorSeverity.MEDIUM,
                      ErrorCategory.UNKNOWN,
                      { ...context, originalError: error },
                      true,
                  );

        silent ? handleErrorSilently(gameError) : handleError(gameError);

        return undefined;
    }
}

export function safeCallAsync<T>(
    fn: () => Promise<T>,
    context: { component: string; method: string },
    silent: boolean = false,
): Promise<T | undefined> {
    return fn().catch((error) => {
        const gameError =
            error instanceof GameError
                ? error
                : new GameError(
                      `Async error in ${context.component}.${context.method}`,
                      ErrorSeverity.HIGH,
                      ErrorCategory.UNKNOWN,
                      { ...context, originalError: error },
                      true,
                  );

        silent ? handleErrorSilently(gameError) : handleError(gameError);

        return undefined;
    });
}
