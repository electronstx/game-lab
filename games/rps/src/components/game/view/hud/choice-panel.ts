import { ChoiceConfig } from './types';
import { GameEvents, HUDComponent } from "@parity-games/core";
import RpsScene from "../rps-scene";
import * as PIXI from 'pixi.js';
import { playClickSound, playHoverSound } from '../../sounds';

export class ChoicePanel implements HUDComponent {
    #scene: RpsScene;
    #choicePanelBack?: PIXI.Graphics;
    #choicePanel?: PIXI.Container;
    #choiceConfigs: ChoiceConfig[] = [
        { name: 'rock', offsetX: -408 },
        { name: 'paper', offsetX: 0 },
        { name: 'scissors', offsetX: 408 }
    ];

    constructor(scene: RpsScene) {
        this.#scene = scene;
    }

    create(scale: number): void {
        this.#choicePanelBack = new PIXI.Graphics();
        this.#choicePanelBack.rect(0, 0, this.#scene.app.renderer.width, this.#scene.app.renderer.height)
            .fill({ color: 0x000000, alpha: 0.8 });
        this.#choicePanelBack.visible = false;
        this.#choicePanelBack.eventMode = 'passive';
        this.#scene.addChild(this.#choicePanelBack);

        this.#choicePanel = new PIXI.Container();
        this.#choicePanel.eventMode = 'static';

        this.#choiceConfigs.forEach((config) => {
            const choice = PIXI.Sprite.from(`${config.name}Button`);
            choice.anchor.set(0.5);
            choice.x = config.offsetX * scale;
            choice.scale.set(0.8 * scale);
            choice.tint = 0xEEEEEE;

            choice.eventMode = 'static';
            choice.cursor = 'pointer';
            choice.on('pointerdown', () => {
                this.hide();
                playClickSound(this.#scene.soundService);
                this.#scene.getEventEmitter().emit(GameEvents.ROUND_COMPLETED, config.name);
            });
            choice.on('pointerenter', () => {
                playHoverSound(this.#scene.soundService);
                choice.tint = 0xFFFFFF;
            });
            choice.on('pointerleave', () => {
                choice.tint = 0xEEEEEE;
            });

            this.#choicePanel?.addChild(choice);
        });
        
        this.#choicePanel.position.set(this.#scene.app.renderer.width / 2, this.#scene.app.renderer.height / 2);
        this.#choicePanel.visible = false;

        this.#scene.addChild(this.#choicePanel);
    }

    show(): void {
        this.#choicePanelBack && (this.#choicePanelBack.visible = true);
        this.#choicePanel && (this.#choicePanel.visible = true);
    }

    hide(): void {
        this.#choicePanelBack && (this.#choicePanelBack.visible = false);
        this.#choicePanel && (this.#choicePanel.visible = false);
    }
}