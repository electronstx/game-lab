import { Application } from 'pixi.js';

export type ScaleMode = 'contain' | 'cover' | 'fixed-width' | 'fixed-height';
type ScaleListener = (scale: number, width: number, height: number) => void;

export class ScaleManager {
    #app: Application;
    #parent: HTMLElement;
    #baseWidth: number;
    #baseHeight: number;
    #mode: ScaleMode;
    #scale = 1;
    #listeners: ScaleListener[] = [];
    #resizeHandler = () => this.#resize();

    constructor(app: Application, parent: HTMLElement, baseWidth = 1280, baseHeight = 768, mode: ScaleMode = 'contain') {
        this.#app = app;
        this.#parent = parent;
        this.#baseWidth = baseWidth;
        this.#baseHeight = baseHeight;
        this.#mode = mode;

        window.addEventListener('resize', this.#resizeHandler);
        this.#resize();
    }

    get scale(): number {
        return this.#scale;
    }

    onResize(listener: ScaleListener) {
        this.#listeners.push(listener);
    }

    #resize() {
        const width = this.#parent.clientWidth;
        const height = this.#parent.clientHeight;

        this.#app.renderer.resize(width, height);

        const scaleX = width / this.#baseWidth;
        const scaleY = height / this.#baseHeight;

        switch (this.#mode) {
            case 'contain':
                this.#scale = Math.min(scaleX, scaleY);
                break;
            case 'cover':
                this.#scale = Math.max(scaleX, scaleY);
                break;
            case 'fixed-width':
                this.#scale = scaleX;
                break;
            case 'fixed-height':
                this.#scale = scaleY;
                break;
        }

        this.#listeners.forEach(cb => {
            cb(this.#scale, width, height);
        });
    }

    cleanup(): void {
        window.removeEventListener('resize', this.#resizeHandler);
        this.#listeners = [];
    }
}