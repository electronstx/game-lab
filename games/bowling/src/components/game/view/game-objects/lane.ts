import * as PIXI from 'pixi.js';
import { GameObject, Scene } from '@game-lab/core';

export class Lane implements GameObject {
    #container: PIXI.Container;
    #background: PIXI.Graphics;
    #lane: PIXI.Graphics;

    constructor(scene: Scene) {
        this.#container = new PIXI.Container();
        this.#background = new PIXI.Graphics();
        this.#lane = new PIXI.Graphics();
        
        this.#container.addChild(this.#background);
        this.#container.addChild(this.#lane);
        scene.addChild(this.#container);
    }

    create(width: number, height: number): void {
        this.#background.clear();
        this.#background.rect(0, 0, width, height)
            .fill({ color: 0x1a1a1a });
        
        this.#lane.clear();
        const laneHeight = height * 0.4;
        const laneY = height * 0.3;
        this.#lane.rect(0, laneY, width, laneHeight)
            .fill({ color: 0x3a3a3a });

        this.hide();
    }

    show(): void {
        this.#container.visible = true;
    }
    
    hide(): void {
        this.#container.visible = false;
    }
    
    destroy(): void {
        this.#container.destroy();
    }
}