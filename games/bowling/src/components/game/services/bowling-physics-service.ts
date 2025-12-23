import type { Ball } from '../view/game-objects/ball.js';
import type { GuideLine } from '../view/game-objects/guide-line.js';
import type { PinManager } from '../view/game-objects/pin-manager.js';
import type { IBowlingScene } from '../view/types.js';

export class BowlingPhysicsService {
    #scene: IBowlingScene;
    #ball: Ball;
    #pinManager: PinManager;
    #guideLine: GuideLine;
    #ballVelocityLoss: number = 0.05;
    #pinsSettlingDelay: number = 1500;
    #pinsSettlingTimer: ReturnType<typeof setTimeout> | null = null;
    #isActive: boolean = false;
    #pinsBeforeThrow: number = 0;

    constructor(scene: IBowlingScene, ball: Ball, pinManager: PinManager, guideLine: GuideLine) {
        this.#scene = scene;
        this.#ball = ball;
        this.#pinManager = pinManager;
        this.#guideLine = guideLine;
    }

    startGameLoop(): void {
        this.#isActive = true;
    }

    stopGameLoop(): void {
        this.#isActive = false;
        this.#cancelPinsSettlingTimer();
    }

    updateGameLoop(): void {
        if (!this.#isActive) return;

        this.#guideLine.update();

        const wasMoving = this.#ball.isMoving();
        this.#ball.update();
        const ballStillMoving = this.#ball.isMoving();

        if (ballStillMoving) {
            const ballPosition = this.#ball.getPosition();
            const ballVelocity = this.#ball.getVelocity();
            const ballRadius = this.#ball.getRadius();

            const originalVelocity = { ...ballVelocity };

            this.#pinManager.checkBallCollision(ballPosition, ballRadius, ballVelocity);

            const ballSpeed = Math.sqrt(ballVelocity.x ** 2 + ballVelocity.y ** 2);
            const originalSpeed = Math.sqrt(originalVelocity.x ** 2 + originalVelocity.y ** 2);

            if (ballSpeed < originalSpeed) {
                const newVelocity = {
                    x: ballVelocity.x * (1 - this.#ballVelocityLoss),
                    y: ballVelocity.y * (1 - this.#ballVelocityLoss),
                };
                this.#ball.setVelocity(newVelocity);
            }

            this.#pinManager.update();
        } else if (wasMoving) {
            this.#scene.getEventEmitter().emit('BALL_STOPPED');
        }

        if (!ballStillMoving) {
            this.#pinManager.update();
        }
    }

    onBallLaunched(): void {
        this.#scene.getEventEmitter().emit('BALL_LAUNCHED');
    }

    onBallStopped(): void {
        if (this.#pinsSettlingTimer === null) {
            this.#pinsSettlingTimer = window.setTimeout(() => {
                const currentPinsKnockedDown = this.#pinManager.getKnockedDownCount();
                const pinsKnockedDown = currentPinsKnockedDown - this.#pinsBeforeThrow;

                this.#scene.getEventEmitter().emit('PINS_SETTLED', {
                    pinsKnockedDown: pinsKnockedDown,
                    totalKnockedDown: currentPinsKnockedDown,
                });

                this.#pinsSettlingTimer = null;
            }, this.#pinsSettlingDelay);
        }
    }

    setPinsBeforeThrow(count: number): void {
        this.#pinsBeforeThrow = count;
    }

    #cancelPinsSettlingTimer(): void {
        if (this.#pinsSettlingTimer !== null) {
            clearTimeout(this.#pinsSettlingTimer);
            this.#pinsSettlingTimer = null;
        }
    }

    cancelBallStoppedHandler(): void {
        this.#cancelPinsSettlingTimer();
    }

    destroy(): void {
        this.stopGameLoop();
    }
}
