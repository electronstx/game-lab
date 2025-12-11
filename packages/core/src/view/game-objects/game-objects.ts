import type { GameObject } from "./types";

export class GameObjects {
    #objects: Array<GameObject> = [];

    addObject(object: GameObject): void {
        if (!object) return;
        
        this.#objects.push(object);
    }

    create(...args: unknown[]): void {
        if (this.#objects.length === 0) return;
        
        this.#objects.forEach(obj => {
            if (obj?.create) {
                obj.create(...args);
            }
        });
    }

    show(): void {
        if (this.#objects.length === 0) return;

        this.#objects.forEach(obj => {
            if (obj?.show) {
                obj.show();
            }
        });
    }

    hide(): void {
        if (this.#objects.length === 0) return;

        this.#objects.forEach(obj => {
            if (obj?.hide) {
                obj.hide();
            }
        });
    }

    update(): void {
        if (this.#objects.length === 0) return;

        this.#objects.forEach(obj => {
            if (obj?.update) {
                obj.update();
            }
        });
    }

    reset(): void {
        if (this.#objects.length === 0) return;

        this.#objects.forEach(obj => {
            if (obj?.reset) {
                obj.reset();
            }
        });
    }

    destroy(): void {
        if (this.#objects.length === 0) return;
        
        this.#objects.forEach(obj => {
            if (obj?.destroy) {
                obj.destroy();
            }
        });
        this.#objects = [];
    }
}