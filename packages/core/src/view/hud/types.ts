export type HUDComponent = {
	create(scale: number): void;
	show(): void;
	hide(): void;
}