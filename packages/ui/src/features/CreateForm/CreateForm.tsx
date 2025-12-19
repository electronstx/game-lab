import { ErrorBoundary } from '../../shared/ErrorBoundary/ErrorBoundary';
import './CreateForm.css';
import { CreateFormProps } from './types.js';

export const CreateForm = (props: CreateFormProps) => {
    return (
        <ErrorBoundary>
            <div className="create-form">
                <div className="create-form-container">
                    {props.children}
                </div>
            </div>
        </ErrorBoundary>
    );
}