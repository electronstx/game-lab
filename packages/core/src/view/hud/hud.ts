import type { HUDComponent } from './types.js';

export class HUD {
	#components: Array<HUDComponent> = [];

    addComponent(component: HUDComponent): void {
        if (!component) return;

        this.#components.push(component);
    }

	create(scale: number): void {
		if (this.#components.length === 0) return;

		this.#components.forEach((component) => {
            if (component?.create) {
                component.create(scale);
            }
        });
	}

	show(): void {
		if (this.#components.length === 0) return;

		this.#components.forEach((component) => {
            if (component?.show) {
                component.show();
            }
        });
	}

	hide(): void {
		if (this.#components.length === 0) return;

		this.#components.forEach((component) => {
            if (component?.hide) {
                component.hide();
            }
        });
	}

	destroy(): void {
		if (this.#components.length === 0) return;

		this.#components.forEach((component) => {
            if (component?.destroy) {
                component.destroy();
            }
        });
        this.#components = [];
	}
}