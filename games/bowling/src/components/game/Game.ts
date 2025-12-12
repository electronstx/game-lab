import { Application } from 'pixi.js';
import BowlingScene from './view/bowling-scene.js';
import { IBowlingScene } from './view/types.js';
import BowlingGameData from './data/bowling-game-data.js';
import BowlingGameflow from './flow/bowling-gameflow.js';
import { ScaleManager } from "./utils/scale.js";
import { GameEvents, GameStates, SoundService } from '@parity-games/core';
import { Game } from '@parity-games/ui';
import { BowlingGameSettings } from './types.js';

export class BowlingGame implements Game {
    #app!: Application;
    #gameScene!: BowlingScene;
    #gameData!: BowlingGameData;
    #gameflow!: BowlingGameflow;
    #sceneReady!: Promise<BowlingScene>;
    #scaleManager!: ScaleManager;
    #isInitializing: boolean = false;
    #abortController: AbortController | null = null;
    #soundService: SoundService;

	constructor(soundService: SoundService) {
		this.#soundService = soundService;
	}

    async init(parent: HTMLDivElement) {
        if (this.#app && this.#gameScene && this.#app.renderer) {
            return this;
        }
    
        if (this.#isInitializing) {
            try {
                await this.#sceneReady;
                return this;
            } catch { }
        }
    
        if (this.#app) {
            this.destroy();
        }
    
        this.#isInitializing = true;
        this.#abortController = new AbortController();
        const signal = this.#abortController.signal;
    
        this.#app = new Application();
    
        this.#sceneReady = (async () => {
            try {
                await this.#app.init({
                    backgroundColor: 0x000000,
                    resolution: window.devicePixelRatio || 1,
                    autoDensity: true,
                    preference: 'webgl',
                    resizeTo: parent,
                    autoStart: false
                });
    
                if (signal.aborted || !this.#app) {
                    return null as any;
                }
    
                await this.#waitForRenderer(signal);
    
                if (signal.aborted || !this.#app) {
                    return null as any;
                }
    
                parent.appendChild(this.#app.renderer.canvas);
    
                this.#scaleManager = new ScaleManager(this.#app, parent, 1280, 768, 'contain');
    
                this.#gameScene = new BowlingScene(this.#app, this.#soundService, this.#scaleManager.scale);
                this.#app.stage.addChild(this.#gameScene);
                await this.#gameScene.create();
    
                if (this.#app.ticker && !this.#app.ticker.started) {
                    this.#app.ticker.start();
                }
    
                this.#gameData = new BowlingGameData(GameStates.INIT);
    
                if (this.#gameflow) {
                    this.#gameflow.cleanupEventHandlers();
                    this.#gameflow = null as any;
                }
    
                this.#gameflow = new BowlingGameflow(this.#gameData, this.#gameScene as IBowlingScene);
    
                this.#scaleManager.onResize((scale, w, h) => {
                    this.#gameScene.onResize(scale, w, h);
                });
    
                this.#isInitializing = false;
                this.#abortController = null;

                return this.#gameScene;
            } catch (error) {
                this.#isInitializing = false;
                this.#abortController = null;

                if (signal.aborted) {
                    return null as any;
                }

                throw error;
            }
        })();
    
        try {
            await this.#sceneReady;
            if (!this.#app || !this.#gameScene) {
                return this;
            }
        } catch (error) {
            if (!signal.aborted) {
                throw error;
            }
        }
        
        return this;
    }

    #waitForRenderer(signal?: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            const checkRenderer = () => {
                if (signal?.aborted || !this.#app) {
                    resolve();
                    return;
                }
    
                if (this.#app.renderer && this.#app.renderer.canvas) {
                    resolve();
                } else {
                    requestAnimationFrame(checkRenderer);
                }
            };
            checkRenderer();
        });
    }

    get scene(): IBowlingScene {
        return this.#gameScene as IBowlingScene;
    }

    get whenReady(): Promise<BowlingScene> {
        return this.#sceneReady;
    }

    async setGameSettings(settings: BowlingGameSettings): Promise<void> {
        await this.whenReady;
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
        
        this.#isInitializing = false;
        
        if (this.#app) {
			if (this.#gameflow) {
				this.#gameflow.destroy();
			}

			if (this.#gameScene) {
				this.#gameScene.destroy();
			}

			if (this.#app.renderer && this.#app.canvas && this.#app.canvas.parentNode) {
				this.#app.canvas.parentNode.removeChild(this.#app.canvas);
			}

			if (this.#scaleManager) {
				this.#scaleManager.cleanup();
			}
			
			this.#soundService.cleanup();

			if (this.#app.stage) {
				this.#app.stage.removeAllListeners();
			}

			if (this.#app.renderer) {
				this.#app.destroy(true);
			}
			this.#app = null as any;
		}
        
        this.#gameScene = null as any;
        this.#gameData = null as any;
        this.#gameflow = null as any;
        this.#scaleManager = null as any;
    }
}