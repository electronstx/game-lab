import { GameAnimation } from "@parity-games/core";
import RpsScene from "../rps-scene";
import * as PIXI from 'pixi.js';
import { isRoundResultData, isRpsMove } from "../../utils/guards";
import { RoundResultData } from "../../data/types";

export class RoundAnimation implements GameAnimation {
    #scene: RpsScene;
    #scale?: number;
    #playerCard?: PIXI.Sprite;
    #opponentCard?: PIXI.Sprite;

    constructor(scene: RpsScene) {
        this.#scene = scene;
    }

    create(scale: number): void {
        this.#scale = scale;

        const halfH = this.#scene.app.renderer.height / 2;
        const offsetX = 200 * scale;

        this.#playerCard = PIXI.Sprite.from('cardBack');
        this.#playerCard.anchor.set(0.5);
        this.#playerCard.scale.set(0.5 * scale);
        this.#playerCard.position.set(offsetX, halfH);
        this.#playerCard.visible = false;
        this.#scene.addChild(this.#playerCard);

        this.#opponentCard = PIXI.Sprite.from('cardBack');
        this.#opponentCard.anchor.set(0.5);
        this.#opponentCard.scale.set(0.5 * scale);
        this.#opponentCard.position.set(this.#scene.app.renderer.width - offsetX, halfH);
        this.#opponentCard.visible = false;
        this.#scene.addChild(this.#opponentCard);
    }

    display(): void {
        this.#playerCard && (this.#playerCard.visible = true);
        this.#opponentCard && (this.#opponentCard.visible = true);
    }

    reset(): void {
        if (!this.#playerCard || !this.#opponentCard) return;
        if (!this.#scale) return;

        this.#playerCard.texture = PIXI.Texture.from('cardBack');
        this.#opponentCard.texture = PIXI.Texture.from('cardBack');
            
        this.#playerCard.scale.set(0.5 * this.#scale);
        this.#opponentCard.scale.set(0.5 * this.#scale);  

        this.#playerCard.visible = false;
        this.#opponentCard.visible = false;
    }

    show(roundResultData: RoundResultData): void {
        this.reset();
        this.display();

        if (!isRoundResultData(roundResultData)) return;

        setTimeout(() => {
            if (!this.#playerCard || !this.#opponentCard) return;

            this.#playerCard.texture = PIXI.Texture.from(roundResultData.playerMove);
            this.#opponentCard.texture = PIXI.Texture.from(roundResultData.opponentMove);

            if (!this.#scale) return; 
            
            this.#playerCard.scale.set(0.8 * this.#scale);
            this.#opponentCard.scale.set(0.8 * this.#scale);           
        }, 5000);

        setTimeout(() => {
            this.#scene.app.stage.emit('ANIMATION_COMPLETED', roundResultData);
            this.reset();
        }, 6000);
    }
}