import * as PIXI from 'pixi.js';
import { HUD } from './hud/hud.js';
import { AnimationManager } from './animations/animation-manager.js';

export default abstract class Scene extends PIXI.Container {
    app: PIXI.Application;
    gameScale: number;

    protected animationManager: AnimationManager;
    protected hud: HUD;

    constructor(app: PIXI.Application, scale: number) {
        super();
        this.app = app;
        this.gameScale = scale;
        this.animationManager = new AnimationManager();
        this.hud = new HUD();
    }

    abstract create(): void;
    abstract onResize(scale: number, width: number, height: number): void;
    abstract showStartScreen(): void;
    abstract initHUD(...args: any[]): void;
    abstract showStartGame(timescale?: number): void;
    abstract showRound(roundNumber: number, timescale?: number, ...args: any[]): void;
    abstract showRoundResult(...args: any[]): void;
    abstract showEndGame(result: any, timescale?: number): void;
    abstract restartGame(): void;

    destroy(): void {
        this.animationManager.destroy();
        this.hud.destroy();
    }
}