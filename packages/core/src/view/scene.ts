import {
    ErrorCategory,
    ErrorSeverity,
    GameError,
    handleError,
    handleErrorSilently,
    InitializationError,
} from '@game-lab/errors';
import * as PIXI from 'pixi.js';
import type { EventEmitter } from '../data/events.js';
import type { SoundService } from '../services/sound/sound-service.js';
import { safeCleanup } from '../utils/cleanup.js';
import { AnimationManager } from './animations/animation-manager.js';
import { GameObjects } from './game-objects/game-objects.js';
import { HUD } from './hud/hud.js';

export default abstract class Scene extends PIXI.Container {
    app: PIXI.Application;
    gameScale: number;

    #soundService: SoundService;
    #eventEmitterAdapter: EventEmitter | null = null;
    protected animationManager: AnimationManager;
    protected hud: HUD;
    protected gameObjects: GameObjects;

    constructor(app: PIXI.Application, soundService: SoundService, scale: number) {
        super();
        this.app = app;
        this.gameScale = scale;
        this.#soundService = soundService;
        this.animationManager = new AnimationManager();
        this.hud = new HUD();
        this.gameObjects = new GameObjects();
    }

    getEventEmitter(): EventEmitter {
        if (this.#eventEmitterAdapter) {
            return this.#eventEmitterAdapter;
        }

        const stage = this.app.stage;

        if (
            typeof stage.on === 'function' &&
            typeof stage.off === 'function' &&
            typeof stage.emit === 'function'
        ) {
            this.#eventEmitterAdapter = {
                on: (event: string, handler: (...args: unknown[]) => void) => {
                    stage.on(event, handler);
                },
                off: (event: string, handler: (...args: unknown[]) => void) => {
                    stage.off(event, handler);
                },
                emit: (event: string, ...args: unknown[]) => {
                    stage.emit(event, ...args);
                },
                once: (event: string, handler: (...args: unknown[]) => void) => {
                    if (typeof stage.once === 'function') {
                        stage.once(event, handler);
                    } else {
                        const onceHandler = (...args: unknown[]) => {
                            try {
                                handler(...args);
                                stage.off(event, onceHandler);
                            } catch (error) {
                                const gameError = new GameError(
                                    `Error in once event handler for "${event}"`,
                                    ErrorSeverity.MEDIUM,
                                    ErrorCategory.EVENT,
                                    {
                                        component: 'Scene',
                                        method: 'getEventEmitter.once',
                                        event,
                                        originalError: error,
                                    },
                                    true,
                                );
                                handleErrorSilently(gameError);
                            }
                        };
                        stage.on(event, onceHandler);
                    }
                },
            };

            return this.#eventEmitterAdapter;
        }

        const error = new InitializationError(
            'PIXI.Application stage does not implement EventEmitter interface',
            { component: 'Scene', method: 'getEventEmitter' },
        );
        handleError(error);

        throw error;
    }

    get soundService(): SoundService {
        return this.#soundService;
    }

    abstract create(): void;
    abstract onResize(scale: number, width: number, height: number): void;
    abstract showStartScreen(): void;
    abstract initHUD(...args: unknown[]): void;
    abstract showStartGame(timescale?: number): void;
    abstract showRound(roundNumber?: number, timescale?: number, ...args: unknown[]): void;
    abstract showRoundResult(...args: unknown[]): void;
    abstract showEndGame(result: unknown, timescale?: number): void;
    abstract restartGame(): void;

    destroy(): void {
        safeCleanup('animation manager', () => this.animationManager.destroy(), 'Scene', 'destroy');
        safeCleanup('HUD', () => this.hud.destroy(), 'Scene', 'destroy');
        safeCleanup('game objects', () => this.gameObjects.destroy(), 'Scene', 'destroy');
        safeCleanup('PIXI container', () => super.destroy(), 'Scene', 'destroy');

        if (this.#eventEmitterAdapter) {
            this.#eventEmitterAdapter = null;
        }
        this.#soundService = null as unknown as SoundService;
    }
}
