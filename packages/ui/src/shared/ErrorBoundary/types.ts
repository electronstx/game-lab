import type { GameError } from '@game-lab/errors';
import type { ReactNode } from 'react';

export type ErrorBoundaryProps = {
    children: ReactNode;
    fallback?: (error: Error | null, reset: () => void) => ReactNode;
    onError?: (error: GameError) => void;
    onReset?: () => void;
    title?: string;
    message?: string;
    showDetails?: boolean;
    showReset?: boolean;
};

export type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};
