import { useRef, useEffect, useState } from 'react';
import type { Game, GameContainerProps } from './types.js';
import './GameContainer.css';

export const GameContainer = (props: GameContainerProps) => {
    const gameRef = useRef<Game | null>(null);
    if (gameRef.current === null) {
        gameRef.current = props.createGame();
    }

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
    
        const game = gameRef.current;
        if (!game) return;
    
        let isMounted = true;
    
        game.init(container)
            .then(() => {
                if (isMounted) {
                    setIsInitialized(true);
                }
            })
            .catch((error) => {
                console.error('Failed to initialize game:', error);
                props.onError?.(error);
            });
    
        return () => {
            isMounted = false;
            if (game) {
                game.destroy();
            }
            setIsInitialized(false);
        };
    }, []);

    return (
        <div className={`game-container`}>
            <div 
                ref={containerRef} 
                className="game-canvas"
            />
        </div>
    );
};