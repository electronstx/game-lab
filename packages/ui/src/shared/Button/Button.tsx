import { safeCall } from '../../utils/safe-call';
import './Button.css';
import type { ButtonProps } from './types.js';

export const Button = ({
    size,
    color,
    loading = false,
    block = false,
    icon,
    children,
    className,
    disabled,
    onClick,
    ...restProps
}: ButtonProps) => {
    const classes = [
        'game-button',
        size,
        color,
        block && 'block',
        loading && 'loading',
        !children && icon && 'icon',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            safeCall(() => onClick(event), { component: 'Button', method: 'onClick' }, false);
        }
    };

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            onClick={handleClick}
            {...restProps}
        >
            {loading ? (
                <span className="game-button-loader"></span>
            ) : icon ? (
                <span className="game-button-icon-snippet">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};
