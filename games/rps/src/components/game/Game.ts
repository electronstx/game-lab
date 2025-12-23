import { GameEvents, GameStates, type SoundService } from '@game-lab/core';
import { Application } from 'pixi.js';
import { getAssets } from './assets-manifest.js';
import RpsGameData from './data/rps-game-data.js';
import RpsGameflow from './flow/rps-gameflow.js';
import { initGameSounds } from './sounds.js';
import type { Game, RpsGameSettings } from './types.js';
import { ScaleManager } from './utils/scale.js';
import RpsScene from './view/rps-scene.js';

export class RpsGame implements Game {
    #app: Application | null = null;
    #gameScene: RpsScene | null = null;
    #gameData: RpsGameData | null = null;
    #gameflow: RpsGameflow | null = null;
    #sceneReady: Promise<RpsScene | null> | null = null;
    #scaleManager: ScaleManager | null = null;
    #abortController: AbortController | null = null;
    #soundService: SoundService;

    constructor(soundService: SoundService) {
        this.#soundService = soundService;
    }

    async init(parent: HTMLDivElement) {
        this.#abortController = new AbortController();
        const signal = this.#abortController.signal;

        this.#app = new Application();

        this.#sceneReady = (async () => {
            try {
                if (!this.#app) return null;

                await this.#app.init({
                    backgroundColor: 0x000000,
                    resolution: window.devicePixelRatio || 1,
                    autoDensity: true,
                    preference: 'webgl',
                    resizeTo: parent,
                    autoStart: false,
                });

                if (signal.aborted) return null;

                await getAssets();

                if (signal.aborted) return null;

                initGameSounds(this.#soundService);

                if (!this.#app.canvas) return null;
                parent.appendChild(this.#app.canvas);

                this.#scaleManager = new ScaleManager(this.#app, parent, 1280, 768, 'contain');

                this.#gameScene = new RpsScene(
                    this.#app,
                    this.#soundService,
                    this.#scaleManager.scale,
                );
                this.#app.stage.addChild(this.#gameScene);
                await this.#gameScene.create();

                if (!signal.aborted) {
                    this.#app.ticker.start();
                    this.#gameData = new RpsGameData(GameStates.INIT);
                    this.#gameflow = new RpsGameflow(this.#gameData, this.#gameScene);
                }

                if (this.#scaleManager) {
                    this.#scaleManager.onResize((scale, w, h) => {
                        if (!signal.aborted && this.#gameScene) {
                            this.#gameScene.onResize(scale, w, h);
                        }
                    });
                }

                return this.#gameScene;
            } catch (error) {
                if (signal.aborted) {
                    return null;
                }
                throw error;
            }
        })();

        return this;
    }

    get scene(): RpsScene {
        if (!this.#gameScene) {
            throw new Error('Scene not initialized');
        }
        return this.#gameScene;
    }

    get whenReady(): Promise<RpsScene | null> {
        if (!this.#sceneReady) {
            throw new Error('Game not initialized');
        }
        return this.#sceneReady;
    }

    async setGameSettings(settings: RpsGameSettings): Promise<void> {
        await this.whenReady;
        if (!this.#gameflow) {
            throw new Error('Gameflow not initialized');
        }
        this.#gameflow.setGameSettings(settings);
    }

    async startGame(): Promise<void> {
        await this.emit(GameEvents.GAME_STARTED);
    }

    async emit(event: string, payload?: unknown) {
        const scene = await this.whenReady;
        if (scene) {
            scene.getEventEmitter().emit(event, payload);
        }
    }

    async on(event: string, listener: (event: unknown) => void): Promise<void> {
        const scene = await this.whenReady;
        if (scene) {
            scene.getEventEmitter().on(event, listener);
        }
    }

    async once(event: string, listener: (event: unknown) => void): Promise<void> {
        const scene = await this.whenReady;
        if (scene) {
            scene.getEventEmitter().once(event, listener);
        }
    }

    async off(event: string, listener: (event: unknown) => void): Promise<void> {
        const scene = await this.whenReady;
        if (scene) {
            scene.getEventEmitter().off(event, listener);
        }
    }

    destroy() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }

        if (this.#app) {
            if (this.#app.ticker) {
                this.#app.ticker.stop();
            }

            if (this.#gameflow) {
                this.#gameflow.destroy();
                this.#gameflow = null;
            }

            if (this.#gameScene) {
                this.#gameScene.destroy();
                this.#gameScene = null;
            }

            if (this.#app.renderer && this.#app.canvas && this.#app.canvas.parentNode) {
                this.#app.canvas.parentNode.removeChild(this.#app.canvas);
            }

            if (this.#scaleManager) {
                this.#scaleManager.cleanup();
                this.#scaleManager = null;
            }

            if (this.#app.stage) {
                this.#app.stage.removeAllListeners();
            }

            if (this.#app.renderer) {
                this.#app.destroy(true);
            }
            this.#app = null;
        }

        this.#sceneReady = null;
        this.#gameData = null;
    }
}
