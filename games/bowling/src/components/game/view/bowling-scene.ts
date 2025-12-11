import { GameEvents, Scene, SoundService } from '@parity-games/core';
import * as PIXI from 'pixi.js';
import { Scoreboard } from './hud/scoreboard.js';
import { Lane } from './game-objects/lane.js';
import { GuideLine } from './game-objects/guide-line.js';
import { Ball } from './game-objects/ball.js';
import { PinManager } from './game-objects/pin-manager.js';
import { StartScreenAnimation } from './animations/start-screen-animation.js';
import { IBowlingScene } from './types.js';
import { ScoreboardData } from '../data/types.js';
import { EndGameAnimation } from './animations/end-game-animation.js';
import { BowlingPhysicsService } from '../services/bowling-physics-service.js';

export default class BowlingScene extends Scene implements IBowlingScene {
    #scoreboard: Scoreboard;
    #lane: Lane;
    #guideLine: GuideLine;
    #ball: Ball;
    #pinManager: PinManager;
    #startScreenAnimation: StartScreenAnimation;
    #endGameAnimation: EndGameAnimation;
    #physicsService!: BowlingPhysicsService;
    #gameLoopTicker: (() => void) | null = null;

    constructor(app: PIXI.Application, soundService: SoundService, scale: number) {
        super(app, soundService, scale);
        this.#scoreboard = new Scoreboard(this);
        this.hud.addComponent(this.#scoreboard);

        this.#lane = new Lane(this);
        this.#guideLine = new GuideLine(this);
        this.#ball = new Ball(this);
        this.#pinManager = new PinManager(this);

        this.gameObjects.addObject(this.#lane);
        this.gameObjects.addObject(this.#guideLine);
        this.gameObjects.addObject(this.#ball);
        this.gameObjects.addObject(this.#pinManager);

        this.#startScreenAnimation = new StartScreenAnimation(this);
        this.#endGameAnimation = new EndGameAnimation(this);

        this.animationManager.registerAnimation(this.#startScreenAnimation);
        this.animationManager.registerAnimation(this.#endGameAnimation);
    }

    override async create(): Promise<void> {
        this.app.renderer.background.color = 0x2a2a2a;

        const width = this.app.renderer.width;
        const height = this.app.renderer.height;

        this.gameObjects.create(width, height, this.gameScale);

        this.#startScreenAnimation.create(this.gameScale);
        this.#endGameAnimation.create(this.gameScale);

        this.#physicsService = new BowlingPhysicsService(
            this,
            this.#ball,
            this.#pinManager,
            this.#guideLine
        );

        this.#setupGameLoop();

        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
        this.app.stage.on('pointerdown', this.#onPointerDown, this);
    }

    #setupGameLoop(): void {
        const updateLoop = () => {
            this.#physicsService.updateGameLoop();
        };

        this.#gameLoopTicker = updateLoop;

        this.app.ticker.add(updateLoop);
    }

    #onPointerDown(): void {
        this.getEventEmitter().emit('USER_INPUT_BALL_LAUNCH', {
            angle: this.#guideLine.getAngle()
        });
    }

    override onResize(scale: number, width: number, height: number): void {
        
    }

    override showStartScreen(): void {
        this.animationManager.show(this.#startScreenAnimation, 'Choose number of frames\n and start the game!');
    }

    override initHUD(numberOfFrames: number, playerScore: number, opponentScore: number): void {
        this.#scoreboard.create(this.gameScale, numberOfFrames);
        this.#scoreboard.setScore(playerScore, opponentScore);
        this.#scoreboard.show();
    }

    override showStartGame(): void {
        this.animationManager.reset();
        this.gameObjects.show();
        this.startGameLoop();
        this.getEventEmitter().emit(GameEvents.ROUND_STARTED);
    }

    override showRound(roundNumber?: number, currentPlayer?: number, shouldResetAllPins: boolean = true): void {
        this.#guideLine.startRotation();
        this.#ball.reset();
        
        if (shouldResetAllPins) {
            this.#pinManager.reset();
        } else {
            this.#pinManager.resetStandingPins();
        }

        const pinsBeforeThrow = this.#pinManager.getKnockedDownCount();
        this.#physicsService.setPinsBeforeThrow(pinsBeforeThrow);

        this.startGameLoop();
    }

    override showRoundResult(...args: any[]): void {
        const resultData = args[0];
    
        if (resultData) {
            // Визуализация результата раунда
            if (resultData.isStrike) {
                // Показать анимацию strike
            } else if (resultData.isSpare) {
                // Показать анимацию spare
            }
        }
    }

    override showEndGame(result: any, timescale?: number): void {
        this.stopGameLoop();
        this.#guideLine.stopRotation();
        this.#ball.reset();
        this.hud.hide();
        this.gameObjects.hide();
        this.animationManager.show(this.#endGameAnimation, result);
    }

    override restartGame(): void {
        this.stopGameLoop();
        this.getEventEmitter().emit(GameEvents.GAME_INIT);
    }

    startGameLoop(): void {
        this.#physicsService.startGameLoop();
    }

    stopGameLoop(): void {
        this.#physicsService.stopGameLoop();
    }

    onBallLaunched(): void {
        this.#physicsService.onBallLaunched();
    }

    onBallStopped(): void {
        this.#physicsService.onBallStopped();
    }

    override destroy(): void {
        this.stopGameLoop();

        if (this.#gameLoopTicker) {
            this.app.ticker.remove(this.#gameLoopTicker);
            this.#gameLoopTicker = null;
        }

        if (this.#physicsService) {
            this.#physicsService.destroy();
        }

        this.app.stage.off('pointerdown', this.#onPointerDown, this);
        
        this.gameObjects.destroy();
        
        super.destroy();
    }

    updateScoreboard(data: ScoreboardData): void {
        this.#scoreboard.updateScoreboard(data);
    }

    launchBall(angle: number): void {
        this.#guideLine.stopRotation();
        this.#ball.launch(angle);
        this.onBallLaunched();
    }
}