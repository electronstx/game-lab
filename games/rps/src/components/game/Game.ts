import { Application, Rectangle } from 'pixi.js';
import RpsScene from './view/rps-scene.js';
import RpsGameData from './data/rps-game-data.js';
import RpsGameflow from './flow/rps-gameflow.js';
import { RpsGameSettings } from './types.js';
import { ScaleManager } from "./utils/scale.js";
import { GameStates } from '@parity-games/core';
import { getAssets } from './assets-manifest.js';

export class Game {
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
				resizeTo: parent
			});

			await getAssets();

			this.#scaleManager = new ScaleManager(this.#app, parent, 1280, 768, 'contain');

			parent.appendChild(this.#app.canvas);

			this.#gameScene = new RpsScene(this.#app, this.#scaleManager.scale);
			await this.#gameScene.create();
			this.#app.stage.addChild(this.#gameScene);

			const gameSettings: RpsGameSettings = { bestOf: 5};
			this.#gameData = new RpsGameData(gameSettings, GameStates.INIT);

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
			if (this.#app.canvas && this.#app.canvas.parentNode) {
				this.#app.canvas.parentNode.removeChild(this.#app.canvas);
			}
			
			if (this.#gameflow) {
				this.#gameflow.cleanupEventHandlers();
			}
			
			if (this.#scaleManager) {
				this.#scaleManager.cleanup();
			}
			
			this.#app.destroy(true);
			this.#app = null as any;
		}
		
		this.#gameScene = null as any;
		this.#gameData = null as any;
		this.#gameflow = null as any;
		this.#scaleManager = null as any;
	}
}