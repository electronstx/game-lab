import { GameEvents, type SoundService } from '@game-lab/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BowlingGame } from '../../components/game/index.js';
import type { BowlingGameSettings } from '../../components/game/types.js';

export const useBowlingGame = (soundService: SoundService) => {
    const game = useMemo(() => new BowlingGame(soundService), [soundService]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isGameStarted, setIsGameStarted] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isDestroyed = false;

        const handleInit = () => !isDestroyed && setIsGameStarted(false);
        const handleStarted = () => !isDestroyed && setIsGameStarted(true);
        const removeHandlers = async () => {
            try {
                await Promise.all([
                    game.off(GameEvents.GAME_INIT, handleInit),
                    game.off(GameEvents.GAME_STARTED, handleStarted),
                ]);
            } catch (error) {
                if (!isDestroyed) {
                    console.error('Error removing handlers:', error);
                }
            }
        };

        const setup = async () => {
            try {
                await game.init(container);
                if (isDestroyed) return;

                await game.on(GameEvents.GAME_INIT, handleInit);
                await game.on(GameEvents.GAME_STARTED, handleStarted);

                if (isDestroyed) {
                    await removeHandlers();
                    game.destroy();
                }
            } catch (error) {
                console.error('Error initializing game:', error);
            }
        };

        setup();

        return () => {
            isDestroyed = true;

            removeHandlers().catch(() => {});

            try {
                game.destroy();
            } catch (error) {
                console.error('Error destroying game:', error);
            }
        };
    }, [game]);

    const startGame = useCallback(
        async (settings: BowlingGameSettings) => {
            try {
                await game.whenReady;
                await game.setGameSettings(settings);
                await game.startGame();
            } catch (error) {
                console.error('Error starting game:', error);
            }
        },
        [game],
    );

    return {
        containerRef,
        startGame,
        isGameStarted,
    };
};
