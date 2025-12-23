import { handleError, RenderingError } from '@game-lab/errors';
import React, { Component, type ReactNode } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types.js';
import './ErrorBoundary.css';
import { safeCall } from '../../utils/safe-call.js';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const renderingError = new RenderingError(`Component render error: ${error.message}`, {
            component: errorInfo.componentStack || 'Unknown',
            method: 'render',
            originalError: error,
            errorInfo: {
                componentStack: errorInfo.componentStack,
            },
        });

        handleError(renderingError);

        this.props.onError?.(renderingError);
    }

    componentDidMount() {
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    componentWillUnmount() {
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        event.preventDefault();
        const renderingError = new RenderingError(
            `Unhandled promise rejection: ${String(event.reason)}`,
            {
                component: 'ErrorBoundary',
                method: 'handleUnhandledRejection',
                originalError: event.reason,
            },
        );
        handleError(renderingError);
        this.setState({
            hasError: true,
            error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        });
    };

    handleReset = () => {
        safeCall(
            () => {
                this.setState({
                    hasError: false,
                    error: null,
                });
                this.props.onReset?.();
            },
            { component: 'ErrorBoundary', method: 'handleReset' },
            true,
        );
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.handleReset);
            }

            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <h2 className="error-boundary-title">
                            {this.props.title || 'Something went wrong'}
                        </h2>
                        <p className="error-boundary-message">
                            {this.props.message ||
                                'An error occurred while rendering the component'}
                        </p>
                        {this.props.showDetails && this.state.error && (
                            <details className="error-boundary-details">
                                <summary>Error details</summary>
                                <pre className="error-boundary-stack">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        {this.props.showReset && (
                            <button className="error-boundary-reset" onClick={this.handleReset}>
                                Try again
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
