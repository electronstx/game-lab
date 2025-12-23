import * as PIXI from 'pixi.js';
import { GameObject, Scene } from '@game-lab/core';

export class GuideLine implements GameObject {
    #sprite: PIXI.Graphics;
    #angle: number = 0;
    #isRotating: boolean = false;
    #rotationSpeed: number = 0.02;
    #rotationDirection: number = 1;

    constructor(scene: Scene) {
        this.#sprite = new PIXI.Graphics();
        scene.addChild(this.#sprite);
    }

    create(width: number, height: number, scale: number): void {
        const startX = width * 0.15;
        const startY = height * 0.5;
        const length = 250 * scale;

        this.#sprite.clear();
        this.#sprite.moveTo(0, 0);
        this.#sprite.lineTo(length, 0);
        this.#sprite.stroke({ color: 0x00ff00, width: 3 });
        this.#sprite.position.set(startX, startY);

        this.hide();
    }

    startRotation(): void {
        this.#isRotating = true;
    }

    stopRotation(): void {
        this.#isRotating = false;
    }

    update(): void {
        if (!this.#isRotating) return;

        this.#angle += this.#rotationSpeed * this.#rotationDirection;
        
        if (this.#angle >= Math.PI * 0.2) {
            this.#angle = Math.PI * 0.2;
            this.#rotationDirection = -1;
        } else if (this.#angle <= -Math.PI * 0.2) {
            this.#angle = -Math.PI * 0.2;
            this.#rotationDirection = 1;
        }

        this.#sprite.rotation = this.#angle;
    }

    getAngle(): number {
        return this.#angle;
    }

    show(): void {
        this.#sprite.visible = true;
    }
    
    hide(): void {
        this.#sprite.visible = false;
    }
    
    destroy(): void {
        this.#sprite.destroy();
    }
}