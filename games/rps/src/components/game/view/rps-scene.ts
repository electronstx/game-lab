import { GameEvents, Scene } from '@parity-games/core';
import * as PIXI from 'pixi.js';

export default class RpsScene extends Scene {
    #bg?: PIXI.Sprite;

    constructor(app: PIXI.Application, scale: number) {
        super(app, scale);
    }

    public override async create(): Promise<void> {
        this.app.renderer.background.color = 0x181818;

        /*this.#bg = PIXI.Sprite.from('bg');
        this.#bg.anchor.set(0.5);
		this.#bg.scale.set(this.gameScale);
        this.addChild(this.#bg);*/

        //ToDo Создать анимации и компоненты для HUD и добавить их
        this.hud.create(this.gameScale);

        this.onResize(this.gameScale, this.app.renderer.width, this.app.renderer.height);

        this.eventMode = 'passive';
    }

    public override onResize(scale: number, width: number, height: number): void {}
    public override showStartScreen(): void {
        console.log('Showing start screen!');

        setTimeout(() => {
            this.app.stage.emit(GameEvents.GAME_STARTED);
        }, 5000);
    }
    public override initHUD(...args: any[]): void {
        console.log('HUD was initialized!');
    }

    public override showStartGame(timescale?: number): void {
        console.log('Showing start animations!');

        setTimeout(() => {
            this.app.stage.emit(GameEvents.ROUND_STARTED);
        }, 5000);
    }

    public override showRound(roundNumber: number, timescale?: number, ...args: any[]): void {
        console.log('Showing round!');

        setTimeout(() => {
            this.app.stage.emit(GameEvents.ROUND_COMPLETED);
        }, 5000);
    }

    public override showRoundResult(...args: any[]): void {
        console.log('Showing round result!');

        setTimeout(() => {
            this.app.stage.emit(GameEvents.GAME_END);
        }, 5000);
    }

    public override showEndGame(result: any, timescale?: number): void {
        console.log('Showing end game!');
    }

    public override restartGame(): void {
        console.log('Restarting game!');
    }
}