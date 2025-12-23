import { useEffect, useState } from 'react';
import './ButtonGroup.css';
import { safeCall } from '../../utils/safe-call';
import type { ButtonGroupProps, Option } from './types.js';

export const ButtonGroup = ({
    name,
    value,
    defaultValue,
    options = [],
    disabled = false,
    onChange,
}: ButtonGroupProps) => {
    const isControlled = value !== undefined;
    const initialValue = value ?? defaultValue;
    const [currentValue, setCurrentValue] = useState<Option['value'] | undefined>(initialValue);

    useEffect(() => {
        if (isControlled) {
            safeCall(
                () => setCurrentValue(value),
                { component: 'ButtonGroup', method: 'useEffect' },
                true,
            );
        }
    }, [value, isControlled]);

    const handleChange = (option: Option) => () => {
        if (disabled) return;

        const activeValue = isControlled ? value : currentValue;
        if (activeValue?.toString() === option.value.toString()) return;

        if (!isControlled) {
            safeCall(
                () => setCurrentValue(option.value),
                { component: 'ButtonGroup', method: 'setCurrentValue' },
                true,
            );
        }

        safeCall(() => onChange?.(option), { component: 'ButtonGroup', method: 'onChange' }, false);
    };

    const activeValue = isControlled ? value : currentValue;
    const currentOption = options.find((opt) => {
        const optValue = opt.value?.toString();
        const activeValueStr = activeValue?.toString();
        return optValue === activeValueStr;
    });

    return (
        <div className="game-button-group">
            {options.map((option) => {
                const optionValue = option.value?.toString();
                const currentOptionValue = currentOption?.value?.toString();
                const isActive = optionValue === currentOptionValue;
                return (
                    <button
                        key={option.value}
                        className={`game-button ${isActive ? 'active' : ''}`}
                        type="button"
                        disabled={disabled}
                        onClick={handleChange(option)}
                    >
                        {option.label ?? option.value}
                    </button>
                );
            })}
        </div>
    );
};
