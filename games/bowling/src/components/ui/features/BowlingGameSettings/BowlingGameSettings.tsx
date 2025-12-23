import { Button } from '@game-lab/ui';
import { useState } from 'react';
import './BowlingGameSettings.css';
import type { BowlingGameSettingsProps } from './types';

export const BowlingGameSettings = ({ onStart, disabled }: BowlingGameSettingsProps) => {
    const framesOptions = [
        { label: '3', value: 3 },
        { label: '5', value: 5 },
        { label: '10', value: 10 },
    ];

    const [numberOfFrames, setNumberOfFrames] = useState(3);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onStart({ numberOfFrames: numberOfFrames });
    };

    return (
        <form className="bowling-game-settings" onSubmit={handleSubmit}>
            <label>
                <span>Number of frames</span>
                <select
                    className="bowling-frames-select"
                    name="numberOfFrames"
                    value={numberOfFrames}
                    disabled={disabled}
                    onChange={(e) => setNumberOfFrames(Number(e.target.value))}
                >
                    {framesOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
            <Button type="submit" block color="primary" disabled={disabled}>
                Start Game
            </Button>
        </form>
    );
};
