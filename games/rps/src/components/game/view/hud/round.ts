import { HUDComponent } from "@game-lab/core";
import RpsScene from "../rps-scene";
import * as PIXI from 'pixi.js';

export class Round implements HUDComponent {
    #scene: RpsScene;
    #roundText?: PIXI.Text;

    constructor(scene: RpsScene) {
        this.#scene = scene;
    }

    create(scale: number): void {
		const textStyle = new PIXI.TextStyle({
			fontFamily: 'Arial',
			fontSize: 50 * scale,
			fill: 'white',
			align: 'center',
			stroke: {
                color: '#050b2c',
                width: 4
            }
		});

        this.#roundText = new PIXI.Text({ text: 'ROUND 1', style: textStyle });
        this.#roundText.anchor.set(0.5);
        this.#roundText.position.set(this.#scene.app.renderer.width / 2, this.#scene.app.renderer.height - 50 * scale);
        this.#roundText.visible = false;
        this.#scene.addChild(this.#roundText);
    }

    show(): void {
        this.#roundText && (this.#roundText.visible = true);
    }

    hide(): void {
        this.#roundText && (this.#roundText.visible = false);
    }

    setRound(roundNumber: number): void {
        this.#roundText && (this.#roundText.text = `ROUND ${roundNumber}`);
    }
}