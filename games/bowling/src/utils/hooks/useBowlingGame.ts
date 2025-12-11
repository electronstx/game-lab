import { useCallback, useRef, useState, useEffect } from 'react';
import { BowlingGame } from '../../components/game/index.js';
import { BowlingGameSettings } from '../../components/game/types.js';
import { GameEvents, SoundService } from '@parity-games/core';

export const useBowlingGame = (soundService: SoundService) => {
    const gameRef = useRef<BowlingGame | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    
    const createGame = useCallback(() => {
        if (!gameRef.current) {
            gameRef.current = new BowlingGame(soundService);
        }
        return gameRef.current;
    }, []);

    const startGame = useCallback(async (settings: BowlingGameSettings) => {
        const game = gameRef.current;
        if (!game) return;

        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }    

        const handleGameInit = () => {
            setIsGameStarted(false);
        };

        const handleGameStarted = () => {
            setIsGameStarted(true);
        };

        game.on(GameEvents.GAME_INIT, handleGameInit);
        game.on(GameEvents.GAME_STARTED, handleGameStarted);

        cleanupRef.current = () => {
            game.off(GameEvents.GAME_INIT, handleGameInit);
            game.off(GameEvents.GAME_STARTED, handleGameStarted);
        };

        await game.setGameSettings(settings);
        await game.startGame();
    }, []);

    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    return {
        createGame,
        startGame,
        isGameStarted
    };
};