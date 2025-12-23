import { Button, ButtonGroup } from '@game-lab/ui';
import { useState } from 'react';
import './RpsGameSettings.css';
import type { RpsGameSettingsProps } from './types';

export const RpsGameSettings = ({ onStart, disabled }: RpsGameSettingsProps) => {
    const roundOptions = [
        { label: '1', value: 1 },
        { label: '3', value: 3 },
        { label: '5', value: 5 },
    ];

    const [numberOfRounds, setNumberOfRounds] = useState(3);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onStart({ bestOf: numberOfRounds });
    };

    return (
        <form className="rps-game-settings" onSubmit={handleSubmit}>
            <label>
                <span>Number of rounds</span>
                <ButtonGroup
                    disabled={disabled}
                    name="numberOfRounds"
                    value={numberOfRounds}
                    options={roundOptions}
                    onChange={(option) => setNumberOfRounds(Number(option.value))}
                />
            </label>
            <Button type="submit" block color="primary" disabled={disabled}>
                Start Game
            </Button>
        </form>
    );
};
