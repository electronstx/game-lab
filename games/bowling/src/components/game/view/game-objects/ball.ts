import * as PIXI from 'pixi.js';
import { GameObject, Scene } from '@game-lab/core';

export class Ball implements GameObject {
    #sprite: PIXI.Graphics;
    #position: { x: number; y: number } = { x: 0, y: 0 };
    #velocity: { x: number; y: number } = { x: 0, y: 0 };
    #radius: number = 35;
    #speed: number = 18;
    #isMoving: boolean = false;
    #startX: number = 0;
    #startY: number = 0;
    #width: number = 0;
    #height: number = 0;

    constructor(scene: Scene) {
        this.#sprite = new PIXI.Graphics();
        scene.addChild(this.#sprite);
    }

    create(width: number, height: number): void {
        this.#width = width;
        this.#height = height;
        this.#startX = width * 0.15;
        this.#startY = height * 0.5;

        this.#sprite.clear();
        this.#sprite.circle(0, 0, this.#radius);
        this.#sprite.fill({ color: 0xffffff });
        this.#position = { x: this.#startX, y: this.#startY };
        this.#sprite.position.set(this.#position.x, this.#position.y);

        this.hide();
    }

    launch(angle: number): void {
        if (this.#isMoving) return;

        if (!Number.isFinite(angle) || Math.abs(angle) > Math.PI) return;

        this.#isMoving = true;
        this.#velocity = {
            x: Math.cos(angle) * this.#speed,
            y: Math.sin(angle) * this.#speed
        };
    }

    update(): void {
        if (!this.#isMoving) return;

        this.#position.x += this.#velocity.x;
        this.#position.y += this.#velocity.y;

        this.#velocity.x *= 0.99;
        this.#velocity.y *= 0.99;

        this.#sprite.position.set(this.#position.x, this.#position.y);

        if (this.#position.x < 0 || this.#position.x > this.#width ||
            this.#position.y < 0 || this.#position.y > this.#height) {
            this.reset();
            return;
        }

        const speed = Math.sqrt(this.#velocity.x ** 2 + this.#velocity.y ** 2);
        if (speed < 0.1) {
            this.reset();
            return;
        }
    }

    reset(): void {
        this.#isMoving = false;
        this.#velocity = { x: 0, y: 0 };
        this.#position = { x: this.#startX, y: this.#startY };
        this.#sprite.position.set(this.#position.x, this.#position.y);
    }

    getPosition(): { x: number; y: number } {
        return { ...this.#position };
    }

    getVelocity(): { x: number; y: number } {
        return { ...this.#velocity };
    }

    setVelocity(velocity: { x: number; y: number }): void {
        this.#velocity = velocity;
    }

    getRadius(): number {
        return this.#radius;
    }

    isMoving(): boolean {
        return this.#isMoving;
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