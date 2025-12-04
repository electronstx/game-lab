import type { HUDComponent } from './types.js';

export class HUD {
	#components: Array<HUDComponent>;

	constructor() {
        this.#components = [];
    }

    addComponent(component: HUDComponent): void {
        this.#components.push(component);
    }

	create(scale: number): void {
		this.#components.forEach((component) => component.create(scale));
	}

	show(): void {
		this.#components.forEach((component) => component.show());
	}

	hide(): void {
		this.#components.forEach((component) => component.hide());
	}

	destroy(): void {
		this.#components.forEach((component) => {
			if (component.destroy) {
				component.destroy();
			}
		});
	}
}