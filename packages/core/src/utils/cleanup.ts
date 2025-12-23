import { CleanupError, handleErrorSilently } from "@game-lab/errors";

export function safeCleanup(
    name: string,
    fn: () => void,
    component: string,
    method: string = 'destroy'
): void {
    try {
        fn();
    } catch (error) {
        const cleanupError = new CleanupError(
            `Failed to cleanup ${name}`,
            name,
            { component, method, originalError: error }
        );
        handleErrorSilently(cleanupError);
    }
}