import { Application } from 'pixi.js';
import RpsScene from './view/rps-scene.js';
import RpsGameData from './data/rps-game-data.js';
import RpsGameflow from './flow/rps-gameflow.js';
import { ScaleManager } from "./utils/scale.js";
import { GameEvents, GameStates, soundService } from '@parity-games/core';
import { getAssets } from './assets-manifest.js';
import { initGameSounds } from './sounds.js';
import { Game } from '@parity-games/ui';
import { RpsGameSettings } from './types.js';

export class RpsGame implements Game {
	#app!: Application;
	#gameScene!: RpsScene;
	#gameData!: RpsGameData;
	#gameflow!: RpsGameflow;
	#sceneReady!: Promise<RpsScene>;
	#scaleManager!: ScaleManager;

	async init(parent: HTMLDivElement) {
		if (this.#app) {
			this.destroy();
		}

		this.#app = new Application();

		this.#sceneReady = (async () => {
			await this.#app.init({
				backgroundColor: 0x000000,
				resolution: window.devicePixelRatio || 1,
				autoDensity: true,
				preference: 'webgl',
				resizeTo: parent,
				autoStart: false
			});

			await getAssets();

			initGameSounds();

			parent.appendChild(this.#app.canvas);

			this.#scaleManager = new ScaleManager(this.#app, parent, 1280, 768, 'contain');

			this.#gameScene = new RpsScene(this.#app, this.#scaleManager.scale);
			this.#app.stage.addChild(this.#gameScene);
			await this.#gameScene.create();

			if (this.#app.ticker && !this.#app.ticker.started) {
				this.#app.ticker.start();
			}

			this.#gameData = new RpsGameData(GameStates.INIT);

			if (this.#gameflow) {
				this.#gameflow.cleanupEventHandlers();
				this.#gameflow = null as any;
			}

			this.#gameflow = new RpsGameflow(this.#gameData, this.#gameScene);

			this.#scaleManager.onResize((scale, w, h) => {
				this.#gameScene.onResize(scale, w, h);
			});

			return this.#gameScene;
		})();

		await this.#sceneReady;
		return this;
	}

	get scene(): RpsScene {
		return this.#gameScene;
	}

	get whenReady(): Promise<RpsScene> {
		return this.#sceneReady;
	}

	async setGameSettings(settings: RpsGameSettings): Promise<void> {
		await this.whenReady;
		this.#gameflow.setGameSettings(settings);
	}
	
	async startGame(): Promise<void> {
		await this.emit(GameEvents.GAME_STARTED);
	}

	async emit(event: string, payload?: unknown) {
		const scene = await this.whenReady;
		if (scene?.app) {
			scene.app.stage.emit(event, payload);
		}
	}

	async on(event: string, listener: (event: unknown) => void): Promise<void> {
		const scene = await this.whenReady;
		if (scene?.app) {
			scene.app.stage.on(event, listener);
		}
	}

	async once(event: string, listener: (event: unknown) => void): Promise<void> {
		const scene = await this.whenReady;
		if (scene?.app) {
			scene.app.stage.once(event, listener);
		}
	}

	async off(event: string, listener: (event: unknown) => void): Promise<void> {
		const scene = await this.whenReady;
		if (scene?.app) {
			scene.app.stage.off(event, listener);
		}
	}

	destroy() {
		if (this.#app) {
			if (this.#app.stage) {
				this.#app.stage.removeAllListeners();
			}

			if (this.#app.renderer && this.#app.canvas && this.#app.canvas.parentNode) {
				this.#app.canvas.parentNode.removeChild(this.#app.canvas);
			}

			if (this.#gameScene) {
				this.#gameScene.destroy();
			}
			
			if (this.#gameflow) {
				this.#gameflow.cleanupEventHandlers();
			}
			
			if (this.#scaleManager) {
				this.#scaleManager.cleanup();
			}
			
			soundService.cleanup();

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