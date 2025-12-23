import type { Scene } from '@game-lab/core';
import type { ScoreboardData } from '../data/types';

export interface IBowlingScene extends Scene {
    updateScoreboard(data: ScoreboardData): void;
    launchBall(angle: number): void;
    startGameLoop(): void;
    stopGameLoop(): void;
    onBallLaunched(): void;
    onBallStopped(): void;
}

export type Pin = {
    id: number;
    x: number;
    y: number;
    knockedDown: boolean;
    velocityX: number;
    velocityY: number;
};
