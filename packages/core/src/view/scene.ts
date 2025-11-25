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

    public abstract create(): void;
    public abstract onResize(scale: number, width: number, height: number): void;
    public abstract showStartScreen(): void;
    public abstract initHUD(...args: any[]): void;
    public abstract showStartGame(timescale?: number): void;
    public abstract showRound(roundNumber: number, timescale?: number, ...args: any[]): void;
    public abstract showRoundResult(...args: any[]): void;
    public abstract showEndGame(result: any, timescale?: number): void;
    public abstract restartGame(): void;
}